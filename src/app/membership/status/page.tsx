'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  CreditCard,
  Settings,
  TrendingUp,
  Users,
  Star,
  Home,
  Camera,
  BarChart3,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { membershipApi } from '@/lib/api';

interface MembershipStatus {
  id: number;
  planName: string;
  planType: 'Basic' | 'Professional' | 'Enterprise';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  daysRemaining: number;
  autoRenew: boolean;
  maxProperties: number;
  usedProperties: number;
  maxImages: number;
  usedImages: number;
  features: string[];
}

export default function MembershipStatusPage() {
  const { user } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data for demo
  const mockMembershipStatus: MembershipStatus = {
    id: 1,
    planName: 'Professional Plan',
    planType: 'Professional',
    status: 'ACTIVE',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-15T00:00:00Z',
    daysRemaining: 18,
    autoRenew: true,
    maxProperties: 15,
    usedProperties: 7,
    maxImages: 20,
    usedImages: 45,
    features: [
      'List up to 15 properties',
      'Premium property photos (20 per property)',
      'Priority listing placement',
      'Priority email & chat support',
      'Advanced analytics & insights',
      'Featured property badges',
      'Social media integration'
    ]
  };

  useEffect(() => {
    fetchMembershipStatus();
  }, []);

  const fetchMembershipStatus = async () => {
    try {
      setIsLoading(true);
      // Try to fetch from API
      const status = await membershipApi.getUserMembership();
      setMembershipStatus(status);
    } catch (error) {
      console.log('API not available, using mock data');
      // Use mock data for demo
      setMembershipStatus(mockMembershipStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'Basic':
        return <Users className="h-6 w-6" />;
      case 'Professional':
        return <Star className="h-6 w-6" />;
      case 'Enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const handleAutoRenewToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      // API call would go here
      console.log('Updating auto-renew to:', enabled);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembershipStatus(prev => prev ? { ...prev, autoRenew: enabled } : null);
      toast.success(`Auto-renewal ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update auto-renewal setting');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRenewNow = () => {
    // Redirect to membership plans with current plan pre-selected
    window.location.href = '/membership?renew=true';
  };

  const handleUpgrade = () => {
    // Redirect to membership plans
    window.location.href = '/membership';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!membershipStatus) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Membership</h1>
              <p className="text-gray-600 mb-6">
                You don't have an active membership. Choose a plan to get started.
              </p>
              <Button asChild>
                <Link href="/membership">Choose Membership Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const propertyUsagePercentage = (membershipStatus.usedProperties / membershipStatus.maxProperties) * 100;
  const imageUsagePercentage = membershipStatus.maxImages > 0 
    ? (membershipStatus.usedImages / (membershipStatus.maxProperties * membershipStatus.maxImages)) * 100 
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Status</h1>
            <p className="text-gray-600">
              Manage your membership and track your usage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getPlanIcon(membershipStatus.planType)}
                    <span className="ml-2">Current Plan</span>
                    <Badge className={`ml-auto ${getStatusColor(membershipStatus.status)}`}>
                      {membershipStatus.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{membershipStatus.planName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <span className="ml-2 font-medium">{formatDate(membershipStatus.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <span className="ml-2 font-medium">{formatDate(membershipStatus.endDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Days Remaining:</span>
                        <span className={`ml-2 font-medium ${
                          membershipStatus.daysRemaining <= 7 ? 'text-red-600' : 
                          membershipStatus.daysRemaining <= 14 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {membershipStatus.daysRemaining} days
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Auto-Renewal:</span>
                        <span className={`ml-2 font-medium ${membershipStatus.autoRenew ? 'text-green-600' : 'text-gray-600'}`}>
                          {membershipStatus.autoRenew ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {membershipStatus.daysRemaining <= 7 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="font-medium text-red-800">Membership Expiring Soon</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        Your membership will expire in {membershipStatus.daysRemaining} days. 
                        Renew now to avoid service interruption.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Property Listings</span>
                      <span className="text-sm text-gray-600">
                        {membershipStatus.usedProperties} / {membershipStatus.maxProperties}
                      </span>
                    </div>
                    <Progress value={propertyUsagePercentage} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      {membershipStatus.maxProperties - membershipStatus.usedProperties} listings remaining
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Images Used</span>
                      <span className="text-sm text-gray-600">
                        {membershipStatus.usedImages} / {membershipStatus.maxProperties * membershipStatus.maxImages}
                      </span>
                    </div>
                    <Progress value={imageUsagePercentage} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      {membershipStatus.maxImages} images per property allowed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                  <CardDescription>
                    Features included in your current plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {membershipStatus.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={handleRenewNow}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Membership
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={handleUpgrade}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/membership/payments">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment History
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Auto-Renewal Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Renewal</CardTitle>
                  <CardDescription>
                    Automatically renew your membership
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-renew" className="text-sm font-medium">
                      Enable Auto-Renewal
                    </Label>
                    <Switch
                      id="auto-renew"
                      checked={membershipStatus.autoRenew}
                      onCheckedChange={handleAutoRenewToggle}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    {membershipStatus.autoRenew 
                      ? 'Your membership will automatically renew before expiration'
                      : 'You will need to manually renew your membership'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Headphones className="h-5 w-5 mr-2" />
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Need help with your membership?
                  </p>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/help">Help Center</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
