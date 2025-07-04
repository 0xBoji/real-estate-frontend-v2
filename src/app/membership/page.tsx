'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { membershipApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Star,
  Crown,
  Zap,
  Shield,
  Users,
  BarChart3,
  Headphones,
  Camera,
  Home
} from 'lucide-react';
import { MembershipPlan } from '@/types/membership';

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
    maxProperties: -1, // unlimited
    maxImages: -1, // unlimited
    priority: true,
    analytics: true,
    support: 'premium',
    color: 'purple'
  }
];

export default function MembershipPage() {
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>(membershipPlans);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      setIsLoading(true);
      const backendPlans = await membershipApi.getPlans();

      if (backendPlans && backendPlans.length > 0) {
        setPlans(backendPlans);
      } else {
        // Fallback to static plans if backend has no data
        setPlans(membershipPlans);
      }
    } catch (error) {
      console.log('Backend not available, using static plans');
      setPlans(membershipPlans);
    } finally {
      setIsLoading(false);
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
        return <Home className="h-6 w-6" />;
    }
  };

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleSelectPlan = (planId: number) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = `/auth/login?redirect=/membership/register?plan=${planId}`;
      return;
    }

    // Redirect to registration form
    window.location.href = `/membership/register?plan=${planId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Crown className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Membership Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of our real estate platform. List more properties,
            get better visibility, and access premium features.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Increased Visibility</h3>
            <p className="text-gray-600">Get your properties seen by more potential buyers and renters</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Track performance and optimize your listings with detailed insights</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
            <p className="text-gray-600">Get faster response times and dedicated assistance</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Pricing Plans */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
                  } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getPlanColor(plan.color)} text-white rounded-full mb-4 mx-auto`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600 ml-2">/ month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {isAuthenticated ? 'Choose Plan' : 'Sign Up & Choose Plan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Feature Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Property Listings
                  </td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.maxProperties === -1 ? 'Unlimited' : plan.maxProperties}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Photos per Property
                  </td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.maxImages === -1 ? 'Unlimited' : plan.maxImages}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Priority Placement
                  </td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.priority ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Analytics
                  </td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.analytics ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Support Level
                  </td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center capitalize">
                      {plan.support}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-gray-600 mb-8">
            Have questions? We're here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards, VNPay, and bank transfers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">New users get a 7-day free trial with the Professional plan features.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No long-term commitments.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-green-700 to-green-300 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">
            Ready to Get Started?
          </h3>
          <p className="mb-6">
            Join thousands of successful real estate professionals using our platform.
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Button asChild variant="secondary">
                <Link href="/auth/register">Be a Member</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
