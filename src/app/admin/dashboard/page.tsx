'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, DashboardStats } from '@/lib/api';
import { errorUtils } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  CreditCard, 
  TrendingUp, 
  UserPlus, 
  Home, 
  Clock, 
  Activity 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await adminApi.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        const errorMessage = errorUtils.getErrorMessage(error);
        toast.error(`Failed to load dashboard stats: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Here's an overview of your platform.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(stats?.newUsersThisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>

        {/* Total Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalProperties || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(stats?.newPropertiesThisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatNumber(stats?.totalPayments || 0)} payments
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.activeUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Properties
            </CardTitle>
            <CardDescription>
              Properties waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{formatNumber(stats?.pendingProperties || 0)}</div>
              <Badge variant={stats?.pendingProperties ? "destructive" : "secondary"}>
                {stats?.pendingProperties ? "Action Required" : "All Clear"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* New Users This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              New Users
            </CardTitle>
            <CardDescription>
              Users registered this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats?.newUsersThisMonth || 0)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Growth trend this month
            </p>
          </CardContent>
        </Card>

        {/* New Properties This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              New Properties
            </CardTitle>
            <CardDescription>
              Properties added this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats?.newPropertiesThisMonth || 0)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Listing activity this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Review Properties</h3>
              <p className="text-sm text-muted-foreground">Approve or reject property listings</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Payment Reports</h3>
              <p className="text-sm text-muted-foreground">View payment and revenue reports</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-muted-foreground">View detailed analytics and insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
