'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicApi, Property } from '@/lib/api';
import { errorUtils } from '@/lib/auth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  User,
  Phone,
  Mail,
  Heart,
  Share2,
  ArrowLeft,
  Building,
  Car,
  Wifi,
  Shield,
  Zap,
  Droplets
} from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const propertyId = params.id as string;

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      const propertyData = await publicApi.getProperty(parseInt(propertyId));
      setProperty(propertyData);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to load property: ${errorMessage}`);
      router.push('/properties');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apartment':
        return 'bg-blue-100 text-blue-800';
      case 'house':
        return 'bg-green-100 text-green-800';
      case 'villa':
        return 'bg-purple-100 text-purple-800';
      case 'office':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sale':
        return 'bg-red-100 text-red-800';
      case 'rent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleContact = () => {
    toast.info('Contact feature will be implemented soon');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
            <Button onClick={() => router.push('/properties')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/properties')}
            className="p-0 h-auto"
          >
            Properties
          </Button>
          <span>/</span>
          <span className="text-gray-900">{property.title}</span>
        </div>

        {/* Property Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{property.address}, {property.district}, {property.city}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getPropertyTypeColor(property.propertyType)}>
                {property.propertyType}
              </Badge>
              <Badge className={getListingTypeColor(property.listingType)}>
                For {property.listingType}
              </Badge>
              <Badge variant="outline">
                ID: {property.id}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
                  <Building className="h-24 w-24 text-blue-400" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600">
                    Image gallery will be implemented in the next phase
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <Bed className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <Bath className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <Square className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{property.propertyArea}</p>
                    <p className="text-sm text-gray-600">m²</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">2023</p>
                    <p className="text-sm text-gray-600">Year Built</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description || 'No description available for this property.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: Car, label: 'Parking' },
                    { icon: Wifi, label: 'Internet' },
                    { icon: Shield, label: 'Security' },
                    { icon: Zap, label: 'Electricity' },
                    { icon: Droplets, label: 'Water' },
                    { icon: Building, label: 'Elevator' },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Price */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </span>
                </CardTitle>
                <CardDescription className="text-center">
                  {property.listingType === 'rent' ? 'per month' : 'total price'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-3" onClick={handleContact}>
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Owner
                </Button>
                <Button variant="outline" className="w-full" onClick={handleContact}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listing Type:</span>
                  <span className="font-medium">{property.listingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={property.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed:</span>
                  <span className="font-medium">{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{formatDate(property.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Property Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Property Owner</h3>
                  <p className="text-sm text-gray-600 mb-4">Real Estate Agent</p>
                  <Button variant="outline" className="w-full" onClick={handleContact}>
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
