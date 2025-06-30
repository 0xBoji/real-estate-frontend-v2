'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Crown, 
  Calendar, 
  CreditCard, 
  Download,
  ArrowRight,
  Home,
  Plus
} from 'lucide-react';

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    // Get payment info from localStorage
    const pendingPayment = localStorage.getItem('pending_payment');
    const completedPayment = localStorage.getItem('completed_payment');

    if (completedPayment) {
      try {
        const paymentData = JSON.parse(completedPayment);
        setPaymentInfo(paymentData);
        // Clear the completed payment data
        localStorage.removeItem('completed_payment');
      } catch (error) {
        console.error('Error parsing completed payment data:', error);
      }
    } else if (pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment);
        setPaymentInfo(paymentData);
        // Clear the pending payment data
        localStorage.removeItem('pending_payment');
      } catch (error) {
        console.error('Error parsing pending payment data:', error);
      }
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const today = new Date();
  const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Congratulations! Your membership has been activated successfully. 
            You can now enjoy all the premium features.
          </p>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Membership Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-purple-600" />
                Membership Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan</span>
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 mr-2">Professional</Badge>
                  <span className="font-medium">Professional Plan</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">30 days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Start Date</span>
                <span className="font-medium">{formatDate(today)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expiry Date</span>
                <span className="font-medium">{formatDate(expiryDate)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan Price</span>
                <span className="font-medium">
                  {paymentInfo ? formatPrice(paymentInfo.amount / 1.1) : '299,000 VND'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tax (VAT 10%)</span>
                <span className="font-medium">
                  {paymentInfo ? formatPrice(paymentInfo.amount * 0.1 / 1.1) : '29,900 VND'}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Paid</span>
                  <span className="text-lg font-bold text-green-600">
                    {paymentInfo ? formatPrice(paymentInfo.amount) : '328,900 VND'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium">
                  {paymentInfo?.paymentMethod === 'vnpay' ? 'VNPay' :
                   paymentInfo?.paymentMethod === 'credit_card' ? 'Credit Card' : 'VNPay'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium text-sm">
                  {paymentInfo?.txnRef || paymentInfo?.sessionId || `TXN-${Date.now()}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Date</span>
                <span className="font-medium">{formatDate(today)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Here's what you can do now with your Professional membership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Add Properties</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start listing your properties with premium features
                </p>
                <Button asChild size="sm">
                  <Link href="/properties/add">Add Property</Link>
                </Button>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Manage Listings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  View and manage all your property listings
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Download Invoice</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get your payment receipt for records
                </p>
                <Button variant="outline" size="sm">
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Premium Features</CardTitle>
            <CardDescription>
              You now have access to these Professional plan features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'List up to 15 properties',
                'Premium property photos (20 per property)',
                'Priority listing placement',
                'Priority email & chat support',
                'Advanced analytics & insights',
                'Featured property badges',
                'Social media integration',
                'Enhanced search visibility'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/properties/add">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Property
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <Link href="/dashboard">
                <ArrowRight className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            Need help getting started? Check out our{' '}
            <Link href="/help" className="text-blue-600 hover:underline">
              help center
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contact support
            </Link>
          </p>
        </div>

        {/* Email Confirmation */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
          <h3 className="font-semibold text-blue-900 mb-2">
            Confirmation Email Sent
          </h3>
          <p className="text-blue-700">
            We've sent a confirmation email to <strong>{user?.email}</strong> with your 
            membership details and receipt. Please check your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}
