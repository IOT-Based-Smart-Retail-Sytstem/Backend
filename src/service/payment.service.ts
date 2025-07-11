import Stripe from 'stripe';
import { CustomError } from '../utils/custom.error';
import { Code } from '../utils/httpStatus';
import { getUserCart, clearCart } from './cart.service';
import { getProductById, updateProduct } from './product.service';
import { createOrder } from './order.service';
import { io } from '../app';
import { sendPaymentSuccessNotification, sendPaymentFailedNotification } from './notification-integration.service';
import { cartNamespace } from '../app';

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
    const { userId, cartQrcode } = paymentIntent.metadata || {};
    console.log(userId, cartQrcode)
    if (!userId || !cartQrcode) {
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
      cart.totalPrice,
      paymentIntent.id,
      'SMART MART'
    );

    // Clear the cart after successful payment
    // await clearCart(userId);

    // Send payment success notification
    await sendPaymentSuccessNotification(userId, order._id.toString());

    // send payment success event to socket
    cartNamespace.to(userId).emit('payment_success', { orderId: order._id });
    
    // TODO: update product stock quantity
    for (const item of order.items) {
      const product = await getProductById(item.product._id.toString());
      await updateProduct(product._id.toString(), { stock: product.stock - item.quantity });
    }

    console.log(`Order created successfully: ${order._id}`);
    console.log(`Cart cleared successfully: ${userId}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);
  try {
    const { userId, orderId, socketId } = paymentIntent.metadata || {};

    if (userId) {
      // Send payment failed notification
      await sendPaymentFailedNotification(userId, orderId.toString());

      // send payment failed event to socket
      io.to(socketId).emit('payment_failed', { orderId: orderId });
    }

    // Add any additional logic for failed payments
    console.log(`Payment failed notification sent for user: ${userId}`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
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