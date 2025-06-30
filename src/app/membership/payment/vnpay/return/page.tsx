'use client';

import React, { useEffect, useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { vnpayService, VNPayReturnData } from '@/lib/vnpay';
import { membershipApi } from '@/lib/api';

interface PaymentResult {
  success: boolean;
  message: string;
  transactionId: string;
  amount: number;
  orderInfo: string;
  payDate: string;
}

export default function VNPayReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processPaymentReturn();
  }, [searchParams]);

  const processPaymentReturn = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Extract VNPay return parameters
      const returnData: VNPayReturnData = {
        vnp_Amount: searchParams.get('vnp_Amount') || '',
        vnp_BankCode: searchParams.get('vnp_BankCode') || '',
        vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || '',
        vnp_CardType: searchParams.get('vnp_CardType') || '',
        vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || '',
        vnp_PayDate: searchParams.get('vnp_PayDate') || '',
        vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || '',
        vnp_TmnCode: searchParams.get('vnp_TmnCode') || '',
        vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || '',
        vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || '',
        vnp_TxnRef: searchParams.get('vnp_TxnRef') || '',
        vnp_SecureHash: searchParams.get('vnp_SecureHash') || ''
      };

      console.log('VNPay return data:', returnData);

      // Verify payment with VNPay service
      const result = vnpayService.getPaymentStatus(returnData);
      setPaymentResult(result);

      if (result.success) {
        try {
          // Try to verify payment with backend
          await membershipApi.verifyPayment(result.transactionId);
          toast.success('Payment verified successfully!');

          // Store successful payment info
          localStorage.setItem('completed_payment', JSON.stringify({
            transactionId: result.transactionId,
            amount: result.amount,
            paymentMethod: 'vnpay',
            status: 'completed',
            verified: true,
            timestamp: Date.now()
          }));

        } catch (backendError) {
          console.log('Backend verification failed, but payment was successful');
          toast.success('Payment completed successfully!');

          // Store payment info without backend verification
          localStorage.setItem('completed_payment', JSON.stringify({
            transactionId: result.transactionId,
            amount: result.amount,
            paymentMethod: 'vnpay',
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
        toast.error(result.message);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      setError('Failed to process payment return. Please contact support.');
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.length !== 14) return 'N/A';
    
    // VNPay date format: YYYYMMDDHHmmss
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);
    
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    return date.toLocaleString('vi-VN');
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
              Please wait while we verify your payment with VNPay...
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
                <RefreshCw className="h-4 w-4 mr-2" />
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

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Payment Data
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              No payment information was found.
            </p>
            <Button onClick={() => router.push('/membership')}>
              Back to Membership
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Status Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            paymentResult.success ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {paymentResult.success ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${
            paymentResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {paymentResult.success 
              ? 'Your payment has been processed successfully through VNPay.'
              : 'Your payment could not be processed. Please try again.'
            }
          </p>
        </div>

        {/* Payment Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Transaction information from VNPay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <span className="ml-2 font-medium">{paymentResult.transactionId}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-medium">{formatAmount(paymentResult.amount)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Payment Date:</span>
                <span className="ml-2 font-medium">{formatDate(paymentResult.payDate)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 font-medium ${
                  paymentResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {paymentResult.success ? 'Completed' : 'Failed'}
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Order Info:</span>
              <span className="ml-2 font-medium">{paymentResult.orderInfo}</span>
            </div>
            
            <div>
              <span className="text-gray-600">Message:</span>
              <span className="ml-2 font-medium">{paymentResult.message}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {paymentResult.success ? (
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
                <RefreshCw className="h-5 w-5 mr-2" />
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
            Payment Processed by VNPay
          </h3>
          <p className="text-blue-700">
            This transaction was processed securely through VNPay, Vietnam's leading payment gateway. 
            Your payment information is protected with bank-level security.
          </p>
        </div>
      </div>
    </div>
  );
}
