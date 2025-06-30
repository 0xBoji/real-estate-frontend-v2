import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key', {
  apiVersion: '2024-06-20',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });

    // Return session details
    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      payment_intent: session.payment_intent,
      customer: session.customer,
      created: session.created,
    });

  } catch (error: any) {
    console.error('Stripe session retrieval error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve session',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
