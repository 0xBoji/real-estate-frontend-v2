import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      description,
      customerEmail,
      customerName,
      metadata
    } = body;

    // Validate required fields
    if (!amount || !currency || !description || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            source: 'real_estate_platform',
            ...metadata,
          },
        });
      }
    } catch (customerError) {
      console.error('Customer creation error:', customerError);
      // Continue without customer if creation fails
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      description,
      customer: customer?.id,
      metadata: {
        customerEmail,
        customerName,
        description,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
