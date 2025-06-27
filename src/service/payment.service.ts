import Stripe from 'stripe';
import { CustomError } from '../utils/custom.error';
import { Code } from '../utils/httpStatus';
import { getUserCart, clearCartById } from './cart.service';
import { createOrder } from './order.service';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});


export interface CheckoutRequest {
  userId: string;
  cartId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  success: boolean;
  sessionId: string;
  sessionUrl: string;
  message: string;
}

export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutResponse> {
  try {
    // Get user's cart
    const cart = await getUserCart(userId);
    
    if (!cart || cart.items.length === 0) {
      throw new CustomError('Cart is empty', Code.BadRequest);
    }

    // Prepare line items for Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: (item.product as any).title,
          description: (item.product as any).description,
          images: (item.product as any).images || [],
        },
        unit_amount: Math.round((item.product as any).price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: (cart.user as any)?.email,
      metadata: {
        userId: userId,
        cartId: cart._id.toString(),
        totalAmount: cart.totalPrice.toString(),
      },
      // Enable test mode features
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    return {
      success: true,
      sessionId: session.id,
      sessionUrl: session.url || '',
      message: 'Checkout session created successfully'
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    console.error('Stripe checkout error:', error);
    throw new CustomError('Failed to create checkout session', Code.InternalServerError);
  }
}

export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { userId, cartId, totalAmount } = session.metadata || {};
    
    if (!userId || !cartId) {
      throw new Error('Missing metadata in checkout session');
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
      session.payment_intent as string,
      'Main Store'
    );

    // Clear the cart after successful payment
    await clearCartById(cartId);

    console.log(`Order created successfully: ${order._id}`);
    console.log(`Cart cleared successfully: ${cartId}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  // Add any additional logic for successful payments
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
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new CustomError('Invalid webhook signature', Code.Unauthorized);
  }
} 