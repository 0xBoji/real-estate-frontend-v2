import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe Configuration
const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret'
};

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

export interface StripePaymentRequest {
  amount: number; // in cents
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}

export interface StripePaymentResponse {
  sessionId: string;
  paymentUrl: string;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

class StripeService {
  private stripe: Stripe | null = null;

  async initialize(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await getStripe();
    }
    return this.stripe;
  }

  // Create Checkout Session (for hosted checkout)
  async createCheckoutSession(paymentData: StripePaymentRequest): Promise<StripePaymentResponse> {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const session = await response.json();

      return {
        sessionId: session.id,
        paymentUrl: session.url
      };
    } catch (error) {
      console.error('Stripe checkout session error:', error);
      throw error;
    }
  }

  // Create Payment Intent (for custom checkout)
  async createPaymentIntent(paymentData: Omit<StripePaymentRequest, 'successUrl' | 'cancelUrl'>): Promise<StripePaymentIntent> {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw error;
    }
  }

  // Confirm Payment with Card Element
  async confirmCardPayment(clientSecret: string, cardElement: any, billingDetails: any): Promise<any> {
    const stripe = await this.initialize();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    return await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      }
    });
  }

  // Redirect to Checkout
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.initialize();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (error) {
      throw error;
    }
  }

  // Retrieve Checkout Session
  async retrieveCheckoutSession(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`/api/stripe/checkout-session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Stripe session retrieval error:', error);
      throw error;
    }
  }

  // Format amount for display
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  }

  // Convert VND to USD for Stripe (since Stripe doesn't support VND directly)
  convertVNDToUSD(amountVND: number): number {
    // Approximate exchange rate: 1 USD = 24,000 VND
    // In production, you should use a real-time exchange rate API
    const exchangeRate = 24000;
    return Math.round((amountVND / exchangeRate) * 100); // Convert to cents
  }

  // Get supported currencies
  getSupportedCurrencies(): string[] {
    return ['usd', 'eur', 'gbp', 'aud', 'cad', 'jpy', 'sgd', 'hkd'];
  }

  // Validate card number (basic validation)
  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's all digits and has valid length
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Get card type from number
  getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  }
}

export const stripeService = new StripeService();
