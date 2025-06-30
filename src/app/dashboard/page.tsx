'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, User, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Real Estate Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.firstName || user?.username}</span>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Welcome to your Dashboard
                </CardTitle>
                <CardDescription>
                  Manage your properties and account from here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Username:</strong> {user?.username}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/properties">View Properties</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/properties/add">Add Property</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/membership/status">Membership Status</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Properties:</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inquiries:</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">No recent activity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
