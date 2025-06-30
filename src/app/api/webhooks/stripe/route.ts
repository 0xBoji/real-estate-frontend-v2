import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key', {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Stripe webhook received:', event.type);

    // Handle the event
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
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Checkout session completed:', session.id);
    
    // Extract membership information from metadata
    const { customerName, planId, userId } = session.metadata || {};
    
    if (!userId || !planId) {
      console.error('Missing required metadata in checkout session');
      return;
    }

    // Update membership status in database
    const membershipData = {
      userId: parseInt(userId),
      planId: parseInt(planId),
      transactionId: session.payment_intent as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      paymentMethod: 'STRIPE',
      paymentGateway: 'STRIPE',
      status: 'COMPLETED',
      paymentDate: new Date().toISOString(),
      customerEmail: session.customer_email,
      customerName,
      sessionId: session.id
    };

    console.log('Updating membership with data:', membershipData);
    
    // In a real implementation, you would:
    // 1. Update user's membership in database
    // 2. Send confirmation email
    // 3. Log the transaction
    // 4. Activate premium features
    
    // For now, we'll just log the successful payment
    console.log('Stripe checkout session completed successfully');

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment intent succeeded:', paymentIntent.id);
    
    // Extract information from metadata
    const { customerEmail, customerName, planId, userId } = paymentIntent.metadata || {};
    
    const paymentData = {
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: 'STRIPE',
      status: 'COMPLETED',
      customerEmail,
      customerName,
      planId,
      userId
    };

    console.log('Payment intent succeeded with data:', paymentData);
    
    // Update database with successful payment
    // This is typically used for direct payment intents (not checkout sessions)

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment intent failed:', paymentIntent.id);
    
    const failureData = {
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: 'STRIPE',
      status: 'FAILED',
      failureReason: paymentIntent.last_payment_error?.message,
      customerEmail: paymentIntent.metadata?.customerEmail,
      customerName: paymentIntent.metadata?.customerName
    };

    console.log('Payment intent failed with data:', failureData);
    
    // Log failed payment for investigation
    // Optionally send notification to user about failed payment

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id);
    
    // Handle subscription invoice payments
    if (invoice.subscription) {
      console.log('Subscription invoice paid:', invoice.subscription);
      
      // Update subscription status in database
      // This is for recurring payments
    }

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id);
    
    // Handle new subscription creation
    // This would be used if implementing recurring memberships

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription updated:', subscription.id);
    
    // Handle subscription changes (plan upgrades, etc.)

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);
    
    // Handle subscription cancellation
    // Update user's membership status to expired

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}
