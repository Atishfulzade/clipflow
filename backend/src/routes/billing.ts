import { Router } from 'express';
import { getUserSubscription, createCheckoutSession, confirmMockCheckout } from '../controllers/billing';

const router = Router();

router.get('/', getUserSubscription);
router.post('/checkout', createCheckoutSession);
router.post('/confirm', confirmMockCheckout);

export default router;
