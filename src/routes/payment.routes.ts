import express from 'express';
import { 
  handleWebhookHandler, 
  getStripeConfigHandler,
  createPaymentIntentHandler
} from '../controllers/payment.controller';

const router = express.Router();

// Stripe webhook endpoint (no auth required)
router.post(
    "/api/payment/webhook",
    express.raw({ type: 'application/json' }), // Raw body for webhook signature verification
    handleWebhookHandler
);

// Get Stripe configuration (public key, etc.)
router.get(
    "/api/payment/config",
    getStripeConfigHandler
);

router.post(
  '/api/payment/create-payment-intent',
  express.json(), // Parse JSON body for this route
  createPaymentIntentHandler
);

export default router; 