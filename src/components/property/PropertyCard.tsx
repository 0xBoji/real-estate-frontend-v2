'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Eye, 
  Phone, 
  Heart,
  Share2,
  Star
} from 'lucide-react';
import { Property, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from '@/types/property';
import { formatPrice, formatArea } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  showOwnerInfo?: boolean;
  showActions?: boolean;
  onContact?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  onShare?: (property: Property) => void;
  className?: string;
}

export default function PropertyCard({
  property,
  showOwnerInfo = false,
  showActions = true,
  onContact,
  onFavorite,
  onShare,
  className = ''
}: PropertyCardProps) {
  const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
  const imageUrl = primaryImage?.url || '/images/property-placeholder.jpg';

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContact?.(property);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(property);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(property);
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          {/* Property Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge 
                variant={property.listingType === 'SALE' ? 'default' : 'secondary'}
                className="text-xs font-medium"
              >
                {LISTING_TYPE_LABELS[property.listingType]}
              </Badge>
              
              {property.isFeatured && (
                <Badge variant="destructive" className="text-xs font-medium">
                  <Star className="h-3 w-3 mr-1" />
                  Nổi bật
                </Badge>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={handleFavorite}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Price */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/70 text-white px-3 py-1 rounded-md">
                <span className="text-lg font-bold">{formatPrice(property.price)}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm line-clamp-1">
                {property.address}, {property.district}, {property.city}
              </span>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {property.bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              
              {property.bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span>{formatArea(property.propertyArea)}</span>
              </div>
            </div>

            {/* Property Type */}
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs">
                {PROPERTY_TYPE_LABELS[property.propertyType]}
              </Badge>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{property.viewCount}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{property.contactCount}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {property.description}
            </p>

            {/* Owner Info */}
            {showOwnerInfo && property.ownerName && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{property.ownerName}</p>
                    {property.ownerPhone && (
                      <p className="text-xs text-gray-600">{property.ownerPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Link>

      {/* Footer Actions */}
      {showActions && (
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleContact}
            >
              <Phone className="h-4 w-4 mr-2" />
              Liên hệ
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link href={`/properties/${property.id}`}>
                Xem chi tiết
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
