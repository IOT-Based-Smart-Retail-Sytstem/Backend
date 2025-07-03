import Stripe from 'stripe';
import { CustomError } from '../utils/custom.error';
import { Code } from '../utils/httpStatus';
import { getUserCart, clearCartById } from './cart.service';
import { getProductById, updateProduct } from './product.service';
import { createOrder } from './order.service';
import { io } from '../app';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});


export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook event handling error:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  try {
    const { userId, cartId, totalAmount, socketId } = paymentIntent.metadata || {};

    if (!userId || !cartId) {
      throw new Error('Missing metadata in payment intent');
    }

    // Get the cart
    const cart = await getUserCart(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Create order
    const order = await createOrder(
      userId,
      cart.items,
      parseFloat(totalAmount || '0'),
      paymentIntent.id,
      'SMART MART'
    );

    // Clear the cart after successful payment
    await clearCartById(cartId);

    // send payment success event to socket
    io.to(socketId).emit('payment_success', { orderId: order._id });
    
    // TODO: update product stock quantity
    for (const item of order.items) {
      const product = await getProductById(item.product._id.toString());
      await updateProduct(product._id.toString(), { stock: product.stock - item.quantity });
    }


    console.log(`Order created successfully: ${order._id}`);
    console.log(`Cart cleared successfully: ${cartId}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);
  // Add any additional logic for failed payments
}

// Get Stripe public key for client-side
export function getStripePublicKey(): string {
  return process.env.STRIPE_PUBLIC_KEY || '';
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: Buffer | string,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    // Convert Buffer to string if needed
    const payloadString = Buffer.isBuffer(payload) ? payload.toString() : payload;
    return stripe.webhooks.constructEvent(payloadString, signature, secret);
  } catch (error) {
    throw new CustomError('Invalid webhook signature', Code.Unauthorized);
  }
} 