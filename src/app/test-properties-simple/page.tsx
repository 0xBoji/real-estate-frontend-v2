'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicApi } from '@/lib/api';
import { Property } from '@/lib/api';

export default function TestPropertiesSimplePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await publicApi.getProperties();
      setProperties(response.content);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Properties Simple
        </h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={property.listingType === 'SALE' ? 'default' : 'secondary'}>
                      {property.listingType === 'SALE' ? 'Bán' : 'Cho thuê'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded">
                      <span className="font-bold">{formatPrice(property.price)}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 overflow-hidden">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="text-sm overflow-hidden">
                      {property.address}, {property.district}, {property.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {property.bedrooms > 0 && (
                      <span>{property.bedrooms} phòng ngủ</span>
                    )}
                    {property.bathrooms > 0 && (
                      <span>{property.bathrooms} phòng tắm</span>
                    )}
                    <span>{property.propertyArea}m²</span>
                  </div>

                  <p className="text-sm text-gray-600 overflow-hidden">
                    {property.description}
                  </p>
                  
                  <div className="mt-4">
                    <Button className="w-full" size="sm">
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy bất động sản
            </h3>
            <p className="text-gray-600">
              Hiện tại không có bất động sản nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
