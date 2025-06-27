import express from 'express';
import { 
  createCheckoutSessionHandler, 
  handleWebhookHandler, 
  getStripeConfigHandler 
} from '../controllers/payment.controller';

const router = express.Router();

// Create checkout session
router.post(
    "/api/payment/checkout",
    createCheckoutSessionHandler
);

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

export default router; 