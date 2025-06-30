'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  HelpCircle,
  CreditCard
} from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your payment was cancelled and no charges were made to your account. 
            You can try again or choose a different payment method.
          </p>
        </div>

        {/* What Happened */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
            <CardDescription>
              Your payment process was interrupted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Payment was cancelled</p>
                  <p className="text-sm text-gray-600">
                    You cancelled the payment process or closed the payment window
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">No charges were made</p>
                  <p className="text-sm text-gray-600">
                    Your payment method was not charged and no membership was activated
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Your account is unchanged</p>
                  <p className="text-sm text-gray-600">
                    Your current membership status remains the same
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Would You Like to Do?</CardTitle>
            <CardDescription>
              Choose your next step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Try Again</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Go back and complete your membership purchase
                </p>
                <Button asChild>
                  <Link href="/membership">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Try Payment Again
                  </Link>
                </Button>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <ArrowLeft className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Browse Plans</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Review membership plans and choose a different one
                </p>
                <Button asChild variant="outline">
                  <Link href="/membership">
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Common Issues & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Payment window closed accidentally?</h4>
                <p className="text-gray-600 mb-2">
                  This can happen if you navigate away from the payment page or close the browser tab.
                </p>
                <p className="text-sm text-blue-600">
                  Solution: Simply start the payment process again from the membership page.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment method issues?</h4>
                <p className="text-gray-600 mb-2">
                  Sometimes payment methods may not work due to bank restrictions or insufficient funds.
                </p>
                <p className="text-sm text-blue-600">
                  Solution: Try a different payment method or contact your bank.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technical difficulties?</h4>
                <p className="text-gray-600 mb-2">
                  Network issues or browser problems can interrupt the payment process.
                </p>
                <p className="text-sm text-blue-600">
                  Solution: Check your internet connection and try using a different browser.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/membership">
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Payment Again
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            Still having trouble?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact our support team
            </Link>{' '}
            for assistance.
          </p>
        </div>

        {/* Support Info */}
        <div className="mt-12 p-6 bg-yellow-50 rounded-lg text-center">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Need Help?
          </h3>
          <p className="text-yellow-700">
            Our support team is available 24/7 to help you with any payment issues. 
            Contact us at{' '}
            <a href="mailto:support@realestate.com" className="font-medium underline">
              support@realestate.com
            </a>{' '}
            or call{' '}
            <a href="tel:+84123456789" className="font-medium underline">
              +84 123 456 789
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
