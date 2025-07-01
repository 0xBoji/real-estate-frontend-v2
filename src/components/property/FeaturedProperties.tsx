'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  ArrowRight, 
  TrendingUp,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';
import { Property } from '@/types/property';

interface FeaturedPropertiesProps {
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  className?: string;
}

export default function FeaturedProperties({
  limit = 6,
  showHeader = true,
  showViewAll = true,
  className = ''
}: FeaturedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProperties();
  }, [limit]);

  const loadFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicApi.getFeaturedProperties(limit);
      setProperties(data);
    } catch (error) {
      console.error('Failed to load featured properties:', error);
      setError('Không thể tải bất động sản nổi bật');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (property: Property) => {
    toast.success(`Liên hệ cho bất động sản: ${property.title}`);
    // Implement contact logic
  };

  const handleFavorite = (property: Property) => {
    toast.success(`Đã thêm vào yêu thích: ${property.title}`);
    // Implement favorite logic
  };

  const handleShare = (property: Property) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: `${window.location.origin}/properties/${property.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`);
      toast.success('Đã sao chép link chia sẻ');
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: limit }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bất động sản nổi bật
            </h2>
            <p className="text-gray-600">
              Khám phá những bất động sản được quan tâm nhất
            </p>
          </div>
        )}
        
        <div className="text-center py-12">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadFeaturedProperties} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bất động sản nổi bật
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá những bất động sản được quan tâm nhất, có vị trí đẹp và giá cả hợp lý
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onContact={handleContact}
                onFavorite={handleFavorite}
                onShare={handleShare}
              />
            ))}
          </div>

          {/* View All Button */}
          {showViewAll && (
            <div className="text-center">
              <Button asChild size="lg" className="min-w-[200px]">
                <Link href="/properties" className="flex items-center gap-2">
                  Xem tất cả bất động sản
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có bất động sản nổi bật
          </h3>
          <p className="text-gray-600 mb-4">
            Hiện tại chưa có bất động sản nào được đánh dấu là nổi bật.
          </p>
          <Button asChild variant="outline">
            <Link href="/properties">
              Xem tất cả bất động sản
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Section */}
      {!loading && properties.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {properties.length}+
              </div>
              <div className="text-gray-600">Bất động sản nổi bật</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {properties.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Lượt xem</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(properties.reduce((sum, p) => sum + p.viewCount, 0) / properties.length).toLocaleString()}
              </div>
              <div className="text-gray-600">Lượt xem trung bình</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
