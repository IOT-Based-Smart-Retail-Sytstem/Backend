import { Request, Response } from "express";
import { 
  createCheckoutSession, 
  handleWebhookEvent, 
  getStripePublicKey,
  verifyWebhookSignature 
} from "../service/payment.service";
import { CustomError } from "../utils/custom.error";
import { Code, Status } from "../utils/httpStatus";

export async function createCheckoutSessionHandler(
  req: Request,
  res: Response
) {
  try {
    const { successUrl, cancelUrl } = req.body;
    const userId = res.locals.user?._id || req.body.userId; // Get from auth middleware or body

    if (!userId) {
      return res.status(Code.Unauthorized).json({
        status: Status.FAIL,
        message: "User authentication required"
      });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(Code.BadRequest).json({
        status: Status.FAIL,
        message: "Success URL and Cancel URL are required"
      });
    }

    const result = await createCheckoutSession(userId, successUrl, cancelUrl);

    return res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: result
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        status: Status.FAIL,
        message: error.message
      });
    }

    return res.status(Code.InternalServerError).json({
      status: Status.ERROR,
      message: "Failed to create checkout session"
    });
  }
}

export async function handleWebhookHandler(
  req: Request,
  res: Response
) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(Code.BadRequest).json({
        status: Status.FAIL,
        message: "Missing webhook signature or secret"
      });
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(
      JSON.stringify(req.body),
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