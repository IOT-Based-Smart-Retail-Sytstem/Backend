import { Request, Response } from "express";
import { 
  handleWebhookEvent, 
  getStripePublicKey, 
  verifyWebhookSignature
} from "../service/payment.service";
import { CustomError } from "../utils/custom.error";
import { Code, Status } from "../utils/httpStatus";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

export async function handleWebhookHandler(
  req: Request,
  res: Response
) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('🔍 Webhook Debug:');
    console.log('📝 Signature received:', signature);
    console.log('🔐 Webhook secret loaded:', webhookSecret ? 'YES' : 'NO');
    console.log('🔑 Secret value:', webhookSecret?.substring(0, 20) + '...');
    console.log('📦 Body type:', typeof req.body);
    console.log('📦 Body length:', req.body?.length);
    console.log('📦 Is Buffer:', req.body instanceof Buffer);
    console.log('📦 Body content (first 100 chars):', req.body?.toString().substring(0, 100));

    if (!signature || !webhookSecret) {
      return res.status(Code.BadRequest).json({
        status: Status.FAIL,
        message: "Missing webhook signature or secret"
      });
    }

    // Verify webhook signature using raw body (Buffer)
    const event = verifyWebhookSignature(
      req.body,
      signature,
      webhookSecret
    );

    // Handle the webhook event
    await handleWebhookEvent(event);

    return res.status(Code.OK).json({
      status: Status.SUCCESS,
      message: "Webhook processed successfully"
    });
  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        status: Status.FAIL,
        message: error.message
      });
    }

    return res.status(Code.InternalServerError).json({
      status: Status.ERROR,
      message: "Webhook processing failed"
    });
  }
}

export async function getStripeConfigHandler(
  req: Request,
  res: Response
) {
  try {
    const publicKey = getStripePublicKey();
    
    return res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: {
        publicKey,
        currency: 'usd'
      }
    });
  } catch (error) {
    return res.status(Code.InternalServerError).json({
      status: Status.ERROR,
      message: "Failed to get Stripe configuration"
    });
  }
}

export async function createPaymentIntentHandler(req: Request, res: Response) {
  try {
    const { amount, userId, cartId, socketId } = req.body;
    if (!amount || !userId || !cartId || !socketId) {
      return res.status(Code.BadRequest).json({
        status: Status.FAIL,
        message: 'Missing required payment information',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId,
        cartId,
        socketId,
      },
    });

    return res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(Code.InternalServerError).json({
      status: Status.ERROR,
      message: 'Failed to create payment intent',
    });
  }
}