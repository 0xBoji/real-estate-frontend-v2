'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, Shield, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled in the updateUser function
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarFallback className="text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600">@{user?.username}</p>
                    <div className="mt-4">
                      <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Account Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Properties Listed:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profile Views:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium">
                        {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSave}
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="Enter your first name"
                            />
                          ) : (
                            <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{user?.firstName || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Enter your last name"
                            />
                          ) : (
                            <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{user?.lastName || 'Not provided'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{user?.email}</span>
                            <Badge variant="outline" className="ml-auto">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed. Contact support if needed.
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          {isEditing ? (
                            <Input
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{user?.phoneNumber || 'Not provided'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Username</Label>
                          <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{user?.username}</span>
                          </div>
                        </div>

                        <div>
                          <Label>Account Role</Label>
                          <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                            <Shield className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{user?.role}</span>
                          </div>
                        </div>

                        <div>
                          <Label>Member Since</Label>
                          <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span>
                              {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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
