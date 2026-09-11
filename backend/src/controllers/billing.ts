import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export const getUserSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Session not found' });
      return;
    }

    // Verify user exists, create one if not to prevent foreign key errors
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@clipflow.ai`,
          name: 'Alex Creator',
          isOnboarded: true,
        } as any,
      });
    }

    let subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      // Auto initialize FREE tier subscription
      subscription = await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: `free-sub-mock-${userId}`,
          plan: 'FREE',
          status: 'ACTIVE',
          priceId: 'price_free_mock',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
      console.log(`[Billing] Initialized FREE tier subscription for user: ${userId}`);
    }

    res.json(subscription);
  } catch (error: any) {
    console.error('[BillingController] Get subscription error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    const ownerId = (req as AuthenticatedRequest).user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: Session not found' });
      return;
    }

    if (!plan || !['CREATOR', 'PRO', 'AGENCY'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan selected' });
      return;
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.headers.origin || 'http://localhost:3000';

    // Map plans to mock/live Stripe price IDs
    const priceMap: Record<string, string> = {
      CREATOR: 'price_mock_creator_19',
      PRO: 'price_mock_pro_49',
      AGENCY: 'price_mock_agency_99',
    };

    const priceId = priceMap[plan];

    if (stripeSecretKey) {
      console.log(`[Billing] Stripe key found. Creating live checkout session for plan: ${plan}`);
      try {
        const user = await prisma.user.findUnique({ where: { id: ownerId } });
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
          cancel_url: `${origin}/dashboard/billing?canceled=true`,
          client_reference_id: ownerId,
          customer_email: user?.email || undefined,
          metadata: {
            userId: ownerId,
            plan,
          },
        });

        res.json({ checkoutUrl: session.url });
        return;
      } catch (stripeErr: any) {
        console.error('[Billing] Stripe checkout session creation failed, falling back to mock.', stripeErr);
      }
    }

    // Fallback: Mock Checkout Session Redirect Link
    console.log(`[Billing] Mocking checkout session redirect for plan: ${plan}`);
    const mockSessionId = `mock-session-id-${Date.now()}`;
    const checkoutUrl = `${origin}/dashboard/billing/checkout?session_id=${mockSessionId}&plan=${plan}`;
    
    res.json({ checkoutUrl });
  } catch (error: any) {
    console.error('[BillingController] Create checkout session error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const confirmMockCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, plan } = req.body;
    const ownerId = (req as AuthenticatedRequest).user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: Session not found' });
      return;
    }

    if (!sessionId || !plan) {
      res.status(400).json({ error: 'Session ID and plan are required' });
      return;
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isMockSession = sessionId.startsWith('mock-session-id-') && process.env.NODE_ENV !== 'production';
    let stripeSubscriptionId = `sub-mock-${Date.now()}`;
    let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    let finalPlan = plan;

    if (stripeSecretKey && !isMockSession) {
      console.log(`[Billing] Live Stripe Key found. Verifying session ${sessionId} strictly with Stripe...`);
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (!session) {
          res.status(404).json({ error: 'Stripe checkout session not found' });
          return;
        }

        if (session.payment_status !== 'paid') {
          res.status(400).json({ error: 'Stripe checkout session has not been paid' });
          return;
        }

        // Verify owner ID matches client reference or metadata
        const sessionUserId = session.client_reference_id || session.metadata?.userId;
        if (sessionUserId !== ownerId) {
          res.status(403).json({ error: 'Forbidden: Checkout session does not match your user ID' });
          return;
        }

        if (!session.subscription) {
          res.status(400).json({ error: 'No subscription ID found associated with this Stripe session' });
          return;
        }

        stripeSubscriptionId = session.subscription as string;
        finalPlan = (session.metadata?.plan || plan) as string;

        try {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId) as any;
          if (stripeSub && stripeSub.current_period_end) {
            currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
          }
        } catch (subErr) {
          console.error('[Billing] Failed to retrieve subscription details from Stripe:', subErr);
        }
      } catch (stripeErr: any) {
        console.error('[Billing] Stripe checkout session verification failed:', stripeErr);
        res.status(400).json({ error: `Stripe verification failed: ${stripeErr.message || stripeErr}` });
        return;
      }
    } else {
      console.log(`[Billing] Running in Mock Mode. Simulating database upgrade for mock session: ${sessionId}`);
    }

    // Find user's existing subscription to upgrade it
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: ownerId },
      orderBy: { createdAt: 'desc' },
    });

    let subscription;
    if (existingSub) {
      subscription = await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          stripeSubscriptionId,
          plan: finalPlan as any,
          status: 'ACTIVE',
          priceId: `price_${finalPlan.toLowerCase()}_mock`,
          currentPeriodEnd,
        },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId: ownerId,
          stripeSubscriptionId,
          plan: finalPlan as any,
          status: 'ACTIVE',
          priceId: `price_${finalPlan.toLowerCase()}_mock`,
          currentPeriodEnd,
        },
      });
    }

    console.log(`[Billing] Checkout confirmed. Upgraded user ${ownerId} subscription to plan: ${finalPlan}`);
    res.json(subscription);
  } catch (error: any) {
    console.error('[BillingController] Confirm mock checkout error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
