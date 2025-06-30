'use client';

import React from 'react';
import { Property } from '@/types/chatbot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ExternalLink } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  if (compact) {
    return (
      <div className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm line-clamp-1">{property.title}</h4>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="text-xs line-clamp-1">{property.address}, {property.city}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
          <div className="flex items-center">
            <Bed className="h-3 w-3 mr-1" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-3 w-3 mr-1" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-3 w-3 mr-1" />
            <span>{property.propertyArea}m²</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Badge className={`text-xs ${getPropertyTypeColor(property.propertyType)}`}>
              {property.propertyType}
            </Badge>
            <Badge className={`text-xs ${getListingTypeColor(property.listingType)}`}>
              {property.listingType}
            </Badge>
          </div>
          <p className="font-bold text-blue-600 text-sm">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
        <Button size="sm" variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          View
        </Button>
      </div>
      
      <div className="flex items-center text-gray-600 mb-3">
        <MapPin className="h-4 w-4 mr-2" />
        <span className="text-sm">{property.address}, {property.city}</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <Bed className="h-4 w-4 mr-1" />
          <span>{property.bedrooms} beds</span>
        </div>
        <div className="flex items-center">
          <Bath className="h-4 w-4 mr-1" />
          <span>{property.bathrooms} baths</span>
        </div>
        <div className="flex items-center">
          <Square className="h-4 w-4 mr-1" />
          <span>{property.propertyArea}m²</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge className={getPropertyTypeColor(property.propertyType)}>
            {property.propertyType}
          </Badge>
          <Badge className={getListingTypeColor(property.listingType)}>
            {property.listingType}
          </Badge>
        </div>
        <p className="font-bold text-xl text-blue-600">
          {formatPrice(property.price)}
        </p>
      </div>

      {property.description && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {property.description}
        </p>
      )}
    </div>
  );
}
