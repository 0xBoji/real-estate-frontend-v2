'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { publicApi } from '@/lib/api';
import { errorUtils } from '@/lib/auth';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Home, Upload, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  propertyType: string;
  listingType: string;
  bedrooms: string;
  bathrooms: string;
  propertyArea: string;
  categoryId: string;
}

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    propertyType: '',
    listingType: '',
    bedrooms: '',
    bathrooms: '',
    propertyArea: '',
    categoryId: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.ward.trim()) newErrors.ward = 'Ward is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.listingType) newErrors.listingType = 'Listing type is required';
    if (!formData.bedrooms.trim()) newErrors.bedrooms = 'Number of bedrooms is required';
    if (!formData.bathrooms.trim()) newErrors.bathrooms = 'Number of bathrooms is required';
    if (!formData.propertyArea.trim()) newErrors.propertyArea = 'Property area is required';

    // Numeric validation
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }
    if (formData.bedrooms && isNaN(Number(formData.bedrooms))) {
      newErrors.bedrooms = 'Bedrooms must be a valid number';
    }
    if (formData.bathrooms && isNaN(Number(formData.bathrooms))) {
      newErrors.bathrooms = 'Bathrooms must be a valid number';
    }
    if (formData.propertyArea && isNaN(Number(formData.propertyArea))) {
      newErrors.propertyArea = 'Property area must be a valid number';
    }

    // Range validation
    if (formData.bedrooms && Number(formData.bedrooms) < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative';
    }
    if (formData.bathrooms && Number(formData.bathrooms) < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative';
    }
    if (formData.propertyArea && Number(formData.propertyArea) <= 0) {
      newErrors.propertyArea = 'Property area must be greater than 0';
    }
    if (formData.price && Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        ward: formData.ward.trim(),
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        propertyArea: Number(formData.propertyArea),
        categoryId: Number(formData.categoryId),
      };

      // This will be implemented when we have the API endpoint
      console.log('Property data to submit:', propertyData);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Property added successfully! (Demo mode)');
      router.push('/properties');
      
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to add property: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
                <p className="text-gray-600">List your property for sale or rent</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide basic details about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Beautiful 2-bedroom apartment in District 1"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property in detail..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleSelectChange('propertyType', value)}>
                      <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="HOUSE">House</SelectItem>
                        <SelectItem value="VILLA">Villa</SelectItem>
                        <SelectItem value="OFFICE">Office</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.propertyType && (
                      <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="listingType">Listing Type *</Label>
                    <Select value={formData.listingType} onValueChange={(value) => handleSelectChange('listingType', value)}>
                      <SelectTrigger className={errors.listingType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALE">For Sale</SelectItem>
                        <SelectItem value="RENT">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.listingType && (
                      <p className="text-sm text-red-500 mt-1">{errors.listingType}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location
                </CardTitle>
                <CardDescription>
                  Specify the location of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Nguyen Hue Street"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="ward">Ward *</Label>
                    <Input
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      placeholder="e.g., Ben Nghe Ward"
                      className={errors.ward ? 'border-red-500' : ''}
                    />
                    {errors.ward && (
                      <p className="text-sm text-red-500 mt-1">{errors.ward}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="e.g., District 1"
                      className={errors.district ? 'border-red-500' : ''}
                    />
                    {errors.district && (
                      <p className="text-sm text-red-500 mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Ho Chi Minh City"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Provide specific details about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      className={errors.bedrooms ? 'border-red-500' : ''}
                    />
                    {errors.bedrooms && (
                      <p className="text-sm text-red-500 mt-1">{errors.bedrooms}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      className={errors.bathrooms ? 'border-red-500' : ''}
                    />
                    {errors.bathrooms && (
                      <p className="text-sm text-red-500 mt-1">{errors.bathrooms}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="propertyArea">Area (m²) *</Label>
                    <Input
                      id="propertyArea"
                      name="propertyArea"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.propertyArea}
                      onChange={handleInputChange}
                      placeholder="e.g., 85.5"
                      className={errors.propertyArea ? 'border-red-500' : ''}
                    />
                    {errors.propertyArea && (
                      <p className="text-sm text-red-500 mt-1">{errors.propertyArea}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing
                </CardTitle>
                <CardDescription>
                  Set the price for your property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="price">Price (VND) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 2500000000"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the price in Vietnamese Dong (VND)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding Property...' : 'Add Property'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
