'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Check, 
  AlertCircle,
  Crown,
  Star,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { MembershipPlan } from '@/types/membership';
import { membershipApi } from '@/lib/api';
import { vnpayService } from '@/lib/vnpay';
import { stripeService } from '@/lib/stripe';
import { PaymentSecurity, PaymentLogger, PaymentError, PaymentErrorType, paymentRequestSchema } from '@/lib/paymentValidation';
import moment from 'moment';

const membershipPlans: MembershipPlan[] = [
  {
    id: 1,
    name: 'Basic',
    description: 'Perfect for individuals getting started',
    price: 99000,
    duration: 30,
    features: [
      'List up to 3 properties',
      'Basic property photos (5 per property)',
      'Standard listing visibility',
      'Email support',
      'Basic analytics'
    ],
    maxProperties: 3,
    maxImages: 5,
    priority: false,
    analytics: true,
    support: 'basic',
    color: 'blue'
  },
  {
    id: 2,
    name: 'Professional',
    description: 'Best for real estate professionals',
    price: 299000,
    duration: 30,
    features: [
      'List up to 15 properties',
      'Premium property photos (20 per property)',
      'Priority listing placement',
      'Priority email & chat support',
      'Advanced analytics & insights',
      'Featured property badges',
      'Social media integration'
    ],
    maxProperties: 15,
    maxImages: 20,
    priority: true,
    analytics: true,
    support: 'priority',
    popular: true,
    color: 'green'
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'For agencies and large-scale operations',
    price: 599000,
    duration: 30,
    features: [
      'Unlimited property listings',
      'Unlimited property photos',
      'Top priority placement',
      'Dedicated account manager',
      'Premium analytics dashboard',
      'Custom branding options',
      'API access',
      'White-label solutions',
      '24/7 phone support'
    ],
    maxProperties: -1,
    maxImages: -1,
    priority: true,
    analytics: true,
    support: 'premium',
    color: 'purple'
  }
];

interface RegistrationFormData {
  planId: string;
  paymentMethod: string;
  billingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  cardInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

export default function MembershipRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    planId: '',
    paymentMethod: 'vnpay',
    billingInfo: {
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    },
    cardInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      fetchPlanDetails(parseInt(planId));
    }
  }, [searchParams]);

  const fetchPlanDetails = async (planId: number) => {
    try {
      // Try to get plan from backend first
      const plans = await membershipApi.getPlans();
      const plan = plans.find((p: any) => p.id === planId);

      if (plan) {
        setSelectedPlan(plan);
      } else {
        // Fallback to static plans
        const staticPlan = membershipPlans.find(p => p.id === planId);
        if (staticPlan) {
          setSelectedPlan(staticPlan);
        }
      }

      setFormData(prev => ({ ...prev, planId: planId.toString() }));
    } catch (error) {
      console.log('Backend not available, using static plans');
      const staticPlan = membershipPlans.find(p => p.id === planId);
      if (staticPlan) {
        setSelectedPlan(staticPlan);
        setFormData(prev => ({ ...prev, planId: planId.toString() }));
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Users className="h-6 w-6" />;
      case 'professional':
        return <Star className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const handleInputChange = (section: 'billingInfo' | 'cardInfo', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      // Validate using Zod schema
      const validationData = {
        planId: selectedPlan?.id || 0,
        paymentMethod: formData.paymentMethod as 'vnpay' | 'credit_card',
        billingInfo: formData.billingInfo,
        ...(formData.paymentMethod === 'credit_card' && { cardInfo: formData.cardInfo })
      };

      paymentRequestSchema.parse(validationData);

      // Additional security validations
      if (!PaymentSecurity.validateEmail(formData.billingInfo.email)) {
        newErrors['billingInfo.email'] = 'Invalid email format';
      }

      if (!PaymentSecurity.validatePhone(formData.billingInfo.phone)) {
        newErrors['billingInfo.phone'] = 'Invalid phone number format';
      }

      // Credit card specific validations
      if (formData.paymentMethod === 'credit_card') {
        if (!PaymentSecurity.validateCardNumber(formData.cardInfo.cardNumber)) {
          newErrors['cardInfo.cardNumber'] = 'Invalid card number';
        }

        if (!PaymentSecurity.validateExpiryDate(formData.cardInfo.expiryDate)) {
          newErrors['cardInfo.expiryDate'] = 'Invalid or expired date';
        }

        const cardType = PaymentSecurity.getCardType(formData.cardInfo.cardNumber);
        if (!PaymentSecurity.validateCVV(formData.cardInfo.cvv, cardType)) {
          newErrors['cardInfo.cvv'] = 'Invalid CVV';
        }
      }

      // Check for suspicious activity
      const suspiciousWarnings = PaymentSecurity.detectSuspiciousActivity({
        email: formData.billingInfo.email,
        amount: selectedPlan?.price,
        cardNumber: formData.cardInfo.cardNumber
      });

      if (suspiciousWarnings.length > 0) {
        console.warn('Suspicious activity detected:', suspiciousWarnings);
        // In production, you might want to flag this for manual review
      }

    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast.error('Please select a membership plan');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    // Log payment attempt
    PaymentLogger.logPaymentAttempt({
      planId: selectedPlan.id,
      paymentMethod: formData.paymentMethod,
      amount: selectedPlan.price * 1.1,
      currency: 'VND',
      customerEmail: formData.billingInfo.email
    });

    try {
      if (formData.paymentMethod === 'vnpay') {
        // Process VNPay payment
        const amount = PaymentSecurity.sanitizeAmount(selectedPlan.price * 1.1);

        if (!PaymentSecurity.validateAmount(amount, 10000, 500000000)) {
          throw new PaymentError(
            PaymentErrorType.VALIDATION_ERROR,
            'Invalid payment amount'
          );
        }

        try {
          // Create payment request with backend
          const paymentRequest = {
            planId: selectedPlan.id,
            paymentMethod: 'VNPAY',
            amount,
            currency: 'VND',
            returnUrl: `${window.location.origin}/membership/payment/vnpay/return`,
            cancelUrl: `${window.location.origin}/membership/payment/cancel`,
            billingInfo: formData.billingInfo
          };

          const backendResponse = await membershipApi.createPayment(paymentRequest);

          if (backendResponse.paymentUrl) {
            // Backend provided VNPay URL
            localStorage.setItem('pending_payment', JSON.stringify({
              planId: selectedPlan.id,
              amount,
              txnRef: backendResponse.transactionId,
              billingInfo: formData.billingInfo,
              paymentMethod: 'vnpay',
              timestamp: Date.now()
            }));

            toast.success('Redirecting to VNPay payment gateway...');
            window.location.href = backendResponse.paymentUrl;
          } else {
            throw new Error('No payment URL received from backend');
          }

        } catch (backendError) {
          console.log('Backend not available, using direct VNPay integration');

          // Fallback to direct VNPay integration
          const vnpayData = {
            amount,
            orderInfo: `Membership ${selectedPlan.name} - ${PaymentSecurity.hashForLogging(user?.email || '')}`,
            orderType: 'membership',
            locale: 'vn',
            currCode: 'VND',
            clientIp: '127.0.0.1'
          };

          const vnpayResponse = vnpayService.createPaymentUrl(vnpayData);

          localStorage.setItem('pending_payment', JSON.stringify({
            planId: selectedPlan.id,
            amount,
            txnRef: vnpayResponse.vnp_TxnRef,
            billingInfo: formData.billingInfo,
            paymentMethod: 'vnpay',
            timestamp: Date.now(),
            fallback: true
          }));

          toast.success('Redirecting to VNPay payment gateway...');
          window.location.href = vnpayResponse.paymentUrl;
        }

      } else if (formData.paymentMethod === 'credit_card') {
        // Process Stripe payment
        const amount = PaymentSecurity.sanitizeAmount(selectedPlan.price * 1.1);

        try {
          // Create payment request with backend
          const paymentRequest = {
            planId: selectedPlan.id,
            paymentMethod: 'STRIPE',
            amount,
            currency: 'VND',
            successUrl: `${window.location.origin}/membership/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/membership/payment/cancel`,
            billingInfo: formData.billingInfo,
            cardInfo: formData.cardInfo
          };

          const backendResponse = await membershipApi.createPayment(paymentRequest);

          if (backendResponse.paymentUrl) {
            // Backend provided Stripe checkout URL
            localStorage.setItem('pending_payment', JSON.stringify({
              planId: selectedPlan.id,
              amount,
              sessionId: backendResponse.sessionId,
              billingInfo: formData.billingInfo,
              paymentMethod: 'credit_card',
              timestamp: Date.now()
            }));

            toast.success('Redirecting to Stripe payment...');
            window.location.href = backendResponse.paymentUrl;
          } else {
            throw new Error('No payment URL received from backend');
          }

        } catch (backendError) {
          console.log('Backend not available, using direct Stripe integration');

          // Fallback to direct Stripe integration
          const stripeAmount = stripeService.convertVNDToUSD(amount);

          if (!PaymentSecurity.validateAmount(stripeAmount, 50, 999999)) {
            throw new PaymentError(
              PaymentErrorType.VALIDATION_ERROR,
              'Invalid payment amount for international processing'
            );
          }

          const stripeData = {
            amount: stripeAmount,
            currency: 'usd',
            description: `Membership ${selectedPlan.name}`,
            customerEmail: formData.billingInfo.email,
            customerName: formData.billingInfo.fullName,
            metadata: {
              planId: selectedPlan.id.toString(),
              userId: user?.id?.toString() || '',
              planName: selectedPlan.name,
              originalAmount: amount.toString(),
              originalCurrency: 'VND',
              billingHash: PaymentSecurity.hashForLogging(JSON.stringify(formData.billingInfo))
            },
            successUrl: `${window.location.origin}/membership/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/membership/payment/cancel`
          };

          const stripeResponse = await stripeService.createCheckoutSession(stripeData);

          localStorage.setItem('pending_payment', JSON.stringify({
            planId: selectedPlan.id,
            amount,
            sessionId: stripeResponse.sessionId,
            billingInfo: {
              ...formData.billingInfo,
              cardNumber: PaymentSecurity.maskCardNumber(formData.cardInfo.cardNumber)
            },
            paymentMethod: 'credit_card',
            timestamp: Date.now(),
            fallback: true
          }));

          toast.success('Redirecting to Stripe payment...');
          window.location.href = stripeResponse.paymentUrl;
        }
      }

    } catch (error) {
      console.error('Payment error:', error);

      if (error instanceof PaymentError) {
        PaymentLogger.logPaymentFailure(error, {
          planId: selectedPlan.id,
          amount: selectedPlan.price * 1.1,
          paymentMethod: formData.paymentMethod
        });

        switch (error.type) {
          case PaymentErrorType.VALIDATION_ERROR:
            toast.error(`Validation error: ${error.message}`);
            break;
          case PaymentErrorType.GATEWAY_ERROR:
            toast.error('Payment gateway error. Please try again or use a different payment method.');
            break;
          case PaymentErrorType.NETWORK_ERROR:
            toast.error('Network error. Please check your connection and try again.');
            break;
          default:
            toast.error('Payment processing failed. Please try again.');
        }
      } else {
        const genericError = new PaymentError(
          PaymentErrorType.SYSTEM_ERROR,
          'Unknown payment error',
          'UNKNOWN_ERROR',
          error
        );
        PaymentLogger.logPaymentFailure(genericError);
        toast.error('Payment processing failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Plan Selected</h1>
              <p className="text-gray-600 mb-6">Please select a membership plan first.</p>
              <Button onClick={() => router.push('/membership')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Choose Plan
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/membership')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Membership Registration
            </h1>
            <p className="text-gray-600">
              You're just one step away from unlocking premium features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getPlanIcon(selectedPlan.name)}
                    <span className="ml-2">Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{selectedPlan.name} Plan</span>
                      {selectedPlan.popular && (
                        <Badge className="bg-green-100 text-green-800">Popular</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{selectedPlan.description}</p>
                    
                    <div className="space-y-2">
                      {selectedPlan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {selectedPlan.features.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{selectedPlan.features.length - 3} more features
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plan Price</span>
                      <span>{formatPrice(selectedPlan.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span>{selectedPlan.duration} days</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (VAT 10%)</span>
                      <span>{formatPrice(selectedPlan.price * 0.1)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(selectedPlan.price * 1.1)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mt-4">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Secure payment with 256-bit SSL encryption</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === 'vnpay' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'vnpay' }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">VNPay</h3>
                            <p className="text-sm text-gray-600">Vietnamese payment gateway</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.paymentMethod === 'vnpay' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'vnpay' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === 'credit_card' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit_card' }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Credit Card</h3>
                            <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.paymentMethod === 'credit_card' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'credit_card' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      This information will be used for your invoice
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.billingInfo.fullName}
                          onChange={(e) => handleInputChange('billingInfo', 'fullName', e.target.value)}
                          className={errors['billingInfo.fullName'] ? 'border-red-500' : ''}
                        />
                        {errors['billingInfo.fullName'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['billingInfo.fullName']}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.billingInfo.email}
                          onChange={(e) => handleInputChange('billingInfo', 'email', e.target.value)}
                          className={errors['billingInfo.email'] ? 'border-red-500' : ''}
                        />
                        {errors['billingInfo.email'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['billingInfo.email']}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.billingInfo.phone}
                          onChange={(e) => handleInputChange('billingInfo', 'phone', e.target.value)}
                          className={errors['billingInfo.phone'] ? 'border-red-500' : ''}
                        />
                        {errors['billingInfo.phone'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['billingInfo.phone']}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.billingInfo.city}
                          onChange={(e) => handleInputChange('billingInfo', 'city', e.target.value)}
                          className={errors['billingInfo.city'] ? 'border-red-500' : ''}
                        />
                        {errors['billingInfo.city'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['billingInfo.city']}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.billingInfo.address}
                        onChange={(e) => handleInputChange('billingInfo', 'address', e.target.value)}
                        className={errors['billingInfo.address'] ? 'border-red-500' : ''}
                      />
                      {errors['billingInfo.address'] && (
                        <p className="text-sm text-red-500 mt-1">{errors['billingInfo.address']}</p>
                      )}
                    </div>

                    <div className="w-full md:w-1/2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.billingInfo.postalCode}
                        onChange={(e) => handleInputChange('billingInfo', 'postalCode', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Card Information (only if credit card is selected) */}
                {formData.paymentMethod === 'credit_card' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Card Information</CardTitle>
                      <CardDescription>
                        Your payment information is secure and encrypted
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name *</Label>
                        <Input
                          id="cardholderName"
                          value={formData.cardInfo.cardholderName}
                          onChange={(e) => handleInputChange('cardInfo', 'cardholderName', e.target.value)}
                          className={errors['cardInfo.cardholderName'] ? 'border-red-500' : ''}
                        />
                        {errors['cardInfo.cardholderName'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['cardInfo.cardholderName']}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardInfo.cardNumber}
                          onChange={(e) => handleInputChange('cardInfo', 'cardNumber', e.target.value)}
                          className={errors['cardInfo.cardNumber'] ? 'border-red-500' : ''}
                        />
                        {errors['cardInfo.cardNumber'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['cardInfo.cardNumber']}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.cardInfo.expiryDate}
                            onChange={(e) => handleInputChange('cardInfo', 'expiryDate', e.target.value)}
                            className={errors['cardInfo.expiryDate'] ? 'border-red-500' : ''}
                          />
                          {errors['cardInfo.expiryDate'] && (
                            <p className="text-sm text-red-500 mt-1">{errors['cardInfo.expiryDate']}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cardInfo.cvv}
                            onChange={(e) => handleInputChange('cardInfo', 'cvv', e.target.value)}
                            className={errors['cardInfo.cvv'] ? 'border-red-500' : ''}
                          />
                          {errors['cardInfo.cvv'] && (
                            <p className="text-sm text-red-500 mt-1">{errors['cardInfo.cvv']}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/membership')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="min-w-[200px]"
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : (
                      `Pay ${formatPrice(selectedPlan.price * 1.1)}`
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
