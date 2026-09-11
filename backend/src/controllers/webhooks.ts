import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (webhookSecret && signature && (req as any).rawBody) {
    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
      res.status(400).send(`Webhook Error: Signature verification failed - ${err.message}`);
      return;
    }
  } else {
    // Local development/test fallback (signature bypass if keys are missing)
    console.warn('[Stripe Webhook] Warning: Webhook secret or signature missing. Bypassing signature verification (Local/Test mode).');
    event = req.body;
  }

  console.log(`[Stripe Webhook] Event triggered: ${event?.type}`);

  try {
    const type = event?.type;
    const dataObject = event?.data?.object;

    if (type === 'checkout.session.completed') {
      const subscriptionId = dataObject.subscription as string;
      const userId = dataObject.client_reference_id as string;
      const planName = (dataObject.metadata?.plan || 'PRO') as any;

      if (userId && subscriptionId) {
        let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        let status = 'ACTIVE';
        let priceId = 'price_default';

        try {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any;
          currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
          status = stripeSub.status === 'active' ? 'ACTIVE' : 'PAST_DUE';
          priceId = stripeSub.items?.data?.[0]?.price?.id || 'price_default';
        } catch (err) {
          console.error('[Stripe Webhook] Failed to retrieve subscription details from Stripe, using metadata fallbacks:', err);
        }

        // Check if there is an existing subscription to update, or create a new one
        const existingSub = await prisma.subscription.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              plan: planName,
              status: status as any,
              priceId,
              currentPeriodEnd,
            },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId,
              stripeSubscriptionId: subscriptionId,
              plan: planName,
              status: status as any,
              priceId,
              currentPeriodEnd,
            },
          });
        }
        console.log(`[Stripe Webhook] checkout.session.completed successfully processed for user ${userId}, subscription ${subscriptionId}`);
      }
    } else if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
      const stripeSubId = dataObject.id;
      const status = dataObject.status === 'active' ? 'ACTIVE' : 'PAST_DUE';
      const priceId = dataObject.items?.data?.[0]?.price?.id || 'price_default';
      const currentPeriodEnd = new Date((dataObject.current_period_end || Date.now() / 1000 + 30 * 24 * 3600) * 1000);

      let planName = 'PRO';
      if (priceId) {
        if (priceId.toLowerCase().includes('creator')) planName = 'CREATOR';
        else if (priceId.toLowerCase().includes('agency')) planName = 'AGENCY';
        else if (priceId.toLowerCase().includes('pro')) planName = 'PRO';
      }

      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubId },
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: status as any,
            priceId,
            currentPeriodEnd,
            plan: planName as any,
          },
        });
        console.log(`[Stripe Webhook] Updated subscription ${stripeSubId} to status ${status}`);
      } else {
        // Fallback: If subscription record doesn't exist yet but we have a customer
        // We look up the user by email or metadata if available, otherwise fallback
        const metadataUserId = dataObject.metadata?.userId;
        if (metadataUserId) {
          await prisma.subscription.create({
            data: {
              userId: metadataUserId,
              stripeSubscriptionId: stripeSubId,
              plan: planName as any,
              status: status as any,
              priceId,
              currentPeriodEnd,
            },
          });
          console.log(`[Stripe Webhook] Created new subscription ${stripeSubId} from updated event for user ${metadataUserId}`);
        } else {
          // Fallback to first user in db (for legacy or fallback events)
          const user = await prisma.user.findFirst();
          if (user) {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                stripeSubscriptionId: stripeSubId,
                plan: planName as any,
                status: status as any,
                priceId,
                currentPeriodEnd,
              },
            });
            console.log(`[Stripe Webhook] Created fallback subscription ${stripeSubId} for user ${user.email}`);
          }
        }
      }
    } else if (type === 'customer.subscription.deleted') {
      const stripeSubId = dataObject.id;
      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubId },
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: { status: 'CANCELED' },
        });
        console.log(`[Stripe Webhook] Cancelled subscription: ${stripeSubId}`);
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Processing error:', error);
    res.status(400).send(`Webhook Processing Error: ${error.message}`);
  }
};
