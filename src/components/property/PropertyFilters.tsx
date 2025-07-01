'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, 
  X, 
  Search,
  MapPin,
  Home,
  DollarSign,
  Square
} from 'lucide-react';
import { 
  PropertySearchFilters, 
  PropertyType, 
  ListingType,
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  PRICE_RANGES,
  AREA_RANGES,
  Category
} from '@/types/property';

interface PropertyFiltersProps {
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  categories: Category[];
  loading?: boolean;
  className?: string;
}

export default function PropertyFilters({
  filters,
  onFiltersChange,
  categories,
  loading = false,
  className = ''
}: PropertyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof PropertySearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Bộ lọc tìm kiếm
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Keyword */}
        <div>
          <Label htmlFor="keyword" className="flex items-center mb-2">
            <Search className="h-4 w-4 mr-2" />
            Từ khóa
          </Label>
          <Input
            id="keyword"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={filters.keyword || ''}
            onChange={(e) => updateFilter('keyword', e.target.value)}
          />
        </div>

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Thành phố
            </Label>
            <Select value={filters.city || ''} onValueChange={(value) => updateFilter('city', value)}>
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
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="district" className="flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Quận/Huyện
            </Label>
            <Input
              id="district"
              placeholder="Nhập quận/huyện"
              value={filters.district || ''}
              onChange={(e) => updateFilter('district', e.target.value)}
            />
          </div>
        </div>

        {/* Property Type and Listing Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center mb-2">
              <Home className="h-4 w-4 mr-2" />
              Loại bất động sản
            </Label>
            <Select 
              value={filters.propertyType || ''} 
              onValueChange={(value) => updateFilter('propertyType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại BDS" />
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

          <div>
            <Label className="flex items-center mb-2">
              <DollarSign className="h-4 w-4 mr-2" />
              Hình thức
            </Label>
            <Select 
              value={filters.listingType || ''} 
              onValueChange={(value) => updateFilter('listingType', value)}
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
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Giá từ (VNĐ)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Giá đến (VNĐ)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Không giới hạn"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div>
              <Label className="mb-2 block">Khoảng giá phổ biến</Label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFilter('minPrice', range.min);
                      updateFilter('maxPrice', range.max === Infinity ? undefined : range.max);
                    }}
                    className={
                      filters.minPrice === range.min && 
                      (filters.maxPrice === range.max || (range.max === Infinity && !filters.maxPrice))
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : ''
                    }
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Area Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minArea" className="flex items-center mb-2">
                  <Square className="h-4 w-4 mr-2" />
                  Diện tích từ (m²)
                </Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="0"
                  value={filters.minArea || ''}
                  onChange={(e) => updateFilter('minArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="maxArea">Diện tích đến (m²)</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="Không giới hạn"
                  value={filters.maxArea || ''}
                  onChange={(e) => updateFilter('maxArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms">Số phòng ngủ</Label>
                <Select 
                  value={filters.bedrooms?.toString() || ''} 
                  onValueChange={(value) => updateFilter('bedrooms', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số phòng ngủ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không yêu cầu</SelectItem>
                    <SelectItem value="1">1 phòng ngủ</SelectItem>
                    <SelectItem value="2">2 phòng ngủ</SelectItem>
                    <SelectItem value="3">3 phòng ngủ</SelectItem>
                    <SelectItem value="4">4+ phòng ngủ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bathrooms">Số phòng tắm</Label>
                <Select 
                  value={filters.bathrooms?.toString() || ''} 
                  onValueChange={(value) => updateFilter('bathrooms', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số phòng tắm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không yêu cầu</SelectItem>
                    <SelectItem value="1">1 phòng tắm</SelectItem>
                    <SelectItem value="2">2 phòng tắm</SelectItem>
                    <SelectItem value="3">3+ phòng tắm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div>
                <Label>Danh mục</Label>
                <Select 
                  value={filters.categoryId?.toString() || ''} 
                  onValueChange={(value) => updateFilter('categoryId', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
