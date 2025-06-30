import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if we have valid Stripe credentials
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const hasValidCredentials = stripeSecretKey && stripeSecretKey.startsWith('sk_');

let stripe: Stripe | null = null;
if (hasValidCredentials) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      description,
      customerEmail,
      customerName,
      metadata,
      successUrl,
      cancelUrl
    } = body;

    // Validate required fields
    if (!amount || !currency || !description || !customerEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Stripe is properly configured
    if (!stripe || !hasValidCredentials) {
      return NextResponse.json(
        {
          error: 'Stripe not configured',
          details: 'Stripe credentials are missing or invalid'
        },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description,
              description: `Membership plan for ${customerName}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        customerName,
        ...metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      payment_intent_data: {
        metadata: {
          customerEmail,
          customerName,
          ...metadata,
        },
      },
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
