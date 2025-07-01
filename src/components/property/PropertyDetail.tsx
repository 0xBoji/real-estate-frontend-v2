'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Eye,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Property, 
  PROPERTY_TYPE_LABELS, 
  LISTING_TYPE_LABELS,
  PROPERTY_STATUS_LABELS 
} from '@/types/property';
import { formatPrice, formatArea, formatDate, formatRelativeTime } from '@/lib/utils';

interface PropertyDetailProps {
  property: Property;
  onContact?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  onShare?: (property: Property) => void;
  onBack?: () => void;
  className?: string;
}

export default function PropertyDetail({
  property,
  onContact,
  onFavorite,
  onShare,
  onBack,
  className = ''
}: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = property.images || [];
  const hasImages = images.length > 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleContact = () => {
    onContact?.(property);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.(property);
  };

  const handleShare = () => {
    onShare?.(property);
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            className={isFavorite ? 'text-red-500 border-red-500' : ''}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              {hasImages ? (
                <div className="relative">
                  <div className="relative h-96 overflow-hidden rounded-t-lg">
                    <Image
                      src={images[currentImageIndex]?.url || '/images/property-placeholder.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                          onClick={handlePrevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                          onClick={handleNextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <Badge 
                        variant={property.listingType === 'SALE' ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        {LISTING_TYPE_LABELS[property.listingType]}
                      </Badge>
                      
                      {property.isFeatured && (
                        <Badge variant="destructive" className="text-sm">
                          <Star className="h-3 w-3 mr-1" />
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {images.length > 1 && (
                    <div className="p-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                              index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <Image
                              src={image.url}
                              alt={`${property.title} - ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Building className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{property.address}, {property.district}, {property.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(property.price)}
                  </div>
                  <Badge variant="outline">
                    {PROPERTY_TYPE_LABELS[property.propertyType]}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Phòng ngủ</div>
                    </div>
                  </div>
                )}

                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Phòng tắm</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{formatArea(property.propertyArea)}</div>
                    <div className="text-sm text-gray-600">Diện tích</div>
                  </div>
                </div>

                {property.floors && (
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{property.floors}</div>
                      <div className="text-sm text-gray-600">Tầng</div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>{property.viewCount}</strong> lượt xem
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>{property.contactCount}</strong> lượt liên hệ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Đăng {formatRelativeTime(property.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={property.status === 'APPROVED' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {PROPERTY_STATUS_LABELS[property.status]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Contact Card */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.ownerName && (
                <div>
                  <div className="font-medium text-lg">{property.ownerName}</div>
                  <div className="text-sm text-gray-600">Chủ sở hữu</div>
                </div>
              )}

              {property.ownerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{property.ownerPhone}</span>
                </div>
              )}

              {property.ownerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{property.ownerEmail}</span>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContact}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Liên hệ ngay
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite ? 'Đã yêu thích' : 'Thêm yêu thích'}
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Bằng cách liên hệ, bạn đồng ý với điều khoản sử dụng của chúng tôi
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
