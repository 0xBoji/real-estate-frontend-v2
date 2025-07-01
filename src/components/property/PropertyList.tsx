'use client';

import React from 'react';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Home } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyListProps {
  properties: Property[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showOwnerInfo?: boolean;
  showActions?: boolean;
  onContact?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  onShare?: (property: Property) => void;
  className?: string;
}

export default function PropertyList({
  properties,
  loading = false,
  error,
  onLoadMore,
  hasMore = false,
  showOwnerInfo = false,
  showActions = true,
  onContact,
  onFavorite,
  onShare,
  className = ''
}: PropertyListProps) {
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Có lỗi xảy ra
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  // Empty state
  if (!loading && properties.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy bất động sản
        </h3>
        <p className="text-gray-600 mb-4">
          Hiện tại không có bất động sản nào phù hợp với tiêu chí tìm kiếm của bạn.
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/properties'}>
          Xem tất cả bất động sản
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            showOwnerInfo={showOwnerInfo}
            showActions={showActions}
            onContact={onContact}
            onFavorite={onFavorite}
            onShare={onShare}
          />
        ))}
      </div>

      {/* Loading more items */}
      {loading && properties.length > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Initial loading */}
      {loading && properties.length === 0 && <LoadingSkeleton />}

      {/* Load More Button */}
      {!loading && hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={onLoadMore}
            variant="outline"
            size="lg"
          >
            Xem thêm bất động sản
          </Button>
        </div>
      )}

      {/* Results count */}
      {!loading && properties.length > 0 && (
        <div className="text-center mt-8 text-sm text-gray-600">
          Hiển thị {properties.length} bất động sản
        </div>
      )}
    </div>
  );
}
