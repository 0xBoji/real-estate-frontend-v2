'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Home, 
  DollarSign,
  Filter
} from 'lucide-react';
import { 
  PropertyType, 
  ListingType,
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  PRICE_RANGES
} from '@/types/property';

interface PropertySearchProps {
  onSearch?: (filters: any) => void;
  showAdvanced?: boolean;
  className?: string;
}

export default function PropertySearch({
  onSearch,
  showAdvanced = false,
  className = ''
}: PropertySearchProps) {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    keyword: '',
    city: '',
    district: '',
    propertyType: '',
    listingType: '',
    priceRange: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceRangeChange = (value: string) => {
    const range = PRICE_RANGES.find(r => r.label === value);
    if (range) {
      setSearchData(prev => ({
        ...prev,
        priceRange: value,
        minPrice: range.min.toString(),
        maxPrice: range.max === Infinity ? '' : range.max.toString()
      }));
    } else {
      setSearchData(prev => ({
        ...prev,
        priceRange: '',
        minPrice: '',
        maxPrice: ''
      }));
    }
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    Object.entries(searchData).forEach(([key, value]) => {
      if (value && key !== 'priceRange') {
        searchParams.set(key, value);
      }
    });

    // Navigate to properties page with search params
    const searchUrl = `/properties?${searchParams.toString()}`;
    
    if (onSearch) {
      onSearch(searchData);
    } else {
      router.push(searchUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, địa chỉ, khu vực..."
                  value={searchData.keyword}
                  onChange={(e) => handleInputChange('keyword', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch} 
              size="lg" 
              className="px-8 h-12"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Thành phố
              </label>
              <Select 
                value={searchData.city} 
                onValueChange={(value) => handleInputChange('city', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả thành phố</SelectItem>
                  <SelectItem value="Ho Chi Minh City">TP. Hồ Chí Minh</SelectItem>
                  <SelectItem value="Hanoi">Hà Nội</SelectItem>
                  <SelectItem value="Da Nang">Đà Nẵng</SelectItem>
                  <SelectItem value="Can Tho">Cần Thơ</SelectItem>
                  <SelectItem value="Hai Phong">Hải Phòng</SelectItem>
                  <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                  <SelectItem value="Hue">Huế</SelectItem>
                  <SelectItem value="Vung Tau">Vũng Tàu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Home className="h-4 w-4 inline mr-1" />
                Loại BDS
              </label>
              <Select 
                value={searchData.propertyType} 
                onValueChange={(value) => handleInputChange('propertyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả loại</SelectItem>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Hình thức
              </label>
              <Select 
                value={searchData.listingType} 
                onValueChange={(value) => handleInputChange('listingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả hình thức</SelectItem>
                  {Object.entries(LISTING_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Khoảng giá
              </label>
              <Select 
                value={searchData.priceRange} 
                onValueChange={handlePriceRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoảng giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả mức giá</SelectItem>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* District */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
                  <Input
                    placeholder="Nhập quận/huyện"
                    value={searchData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                {/* Custom Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Giá từ (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={searchData.minPrice}
                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Giá đến (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="Không giới hạn"
                    value={searchData.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 mb-2">Tìm kiếm phổ biến:</div>
            <div className="flex flex-wrap gap-2">
              {[
                'Chung cư Quận 1',
                'Nhà phố Thủ Đức',
                'Biệt thự Quận 2',
                'Đất nền Bình Dương',
                'Căn hộ cho thuê',
                'Nhà bán Gò Vấp'
              ].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchData(prev => ({ ...prev, keyword: term }));
                    setTimeout(handleSearch, 100);
                  }}
                  className="text-xs"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
