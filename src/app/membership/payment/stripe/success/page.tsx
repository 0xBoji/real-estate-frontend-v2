'use client';

import React, { useEffect, useState, Suspense } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  ArrowRight,
  Home,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { stripeService } from '@/lib/stripe';
import { membershipApi } from '@/lib/api';

interface StripeSessionData {
  id: string;
  payment_status: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  metadata: any;
  payment_intent: any;
  created: number;
}

function StripeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [sessionData, setSessionData] = useState<StripeSessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processStripeReturn();
  }, [searchParams]);

  const processStripeReturn = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found in URL');
        return;
      }

      console.log('Processing Stripe session:', sessionId);

      // Retrieve session from Stripe
      const session = await stripeService.retrieveCheckoutSession(sessionId);
      setSessionData(session);

      if (session.payment_status === 'paid') {
        try {
          // Try to verify payment with backend
          const transactionId = session.payment_intent?.id || session.id;
          await membershipApi.verifyPayment(transactionId);
          toast.success('Payment verified successfully!');

          // Store successful payment info
          localStorage.setItem('completed_payment', JSON.stringify({
            transactionId,
            amount: session.amount_total,
            currency: session.currency,
            paymentMethod: 'stripe',
            status: 'completed',
            verified: true,
            timestamp: Date.now()
          }));

        } catch (backendError) {
          console.log('Backend verification failed, but payment was successful');
          toast.success('Payment completed successfully!');

          // Store payment info without backend verification
          localStorage.setItem('completed_payment', JSON.stringify({
            transactionId: session.payment_intent?.id || session.id,
            amount: session.amount_total,
            currency: session.currency,
            paymentMethod: 'stripe',
            status: 'completed',
            verified: false,
            timestamp: Date.now()
          }));
        }

        // Redirect to success page after a short delay
        setTimeout(() => {
          router.push('/membership/payment/success');
        }, 2000);
      } else {
        toast.error('Payment was not completed successfully');
      }

    } catch (error) {
      console.error('Stripe processing error:', error);
      setError('Failed to process Stripe payment. Please contact support.');
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Processing Payment
            </h1>
            <p className="text-xl text-gray-600">
              Please wait while we verify your payment with Stripe...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Processing Error
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {error}
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.push('/membership')}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/contact')}>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Payment Data
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              No payment session was found.
            </p>
            <Button onClick={() => router.push('/membership')}>
              Back to Membership
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = sessionData.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Status Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isSuccess ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${
            isSuccess ? 'text-green-900' : 'text-red-900'
          }`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isSuccess 
              ? 'Your payment has been processed successfully through Stripe.'
              : 'Your payment could not be processed. Please try again.'
            }
          </p>
        </div>

        {/* Payment Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Transaction information from Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Session ID:</span>
                <span className="ml-2 font-medium font-mono text-sm">{sessionData.id}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <span className={`ml-2 font-medium capitalize ${
                  isSuccess ? 'text-green-600' : 'text-red-600'
                }`}>
                  {sessionData.payment_status}
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-medium">
                  {formatAmount(sessionData.amount_total, sessionData.currency)}
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Currency:</span>
                <span className="ml-2 font-medium uppercase">{sessionData.currency}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Customer Email:</span>
                <span className="ml-2 font-medium">{sessionData.customer_email}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Payment Date:</span>
                <span className="ml-2 font-medium">{formatDate(sessionData.created)}</span>
              </div>
            </div>
            
            {sessionData.payment_intent && (
              <div>
                <span className="text-gray-600">Payment Intent ID:</span>
                <span className="ml-2 font-medium font-mono text-sm">
                  {sessionData.payment_intent.id}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {isSuccess ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/membership/payment/success')}>
                <ArrowRight className="h-5 w-5 mr-2" />
                Continue to Dashboard
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/dashboard')}>
                <Home className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/membership')}>
                Try Payment Again
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/contact')}>
                Contact Support
              </Button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
          <h3 className="font-semibold text-blue-900 mb-2">
            Payment Processed by Stripe
          </h3>
          <p className="text-blue-700">
            This transaction was processed securely through Stripe, a leading international payment processor. 
            Your payment information is protected with industry-standard security measures.
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense
export default function StripeSuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing payment result...</p>
        </div>
      </div>
    }>
      <StripeSuccessPage />
    </Suspense>
  );
}
