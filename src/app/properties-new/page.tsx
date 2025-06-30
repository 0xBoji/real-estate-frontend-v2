'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import PropertyList from '@/components/property/PropertyList';
import PropertyFilters from '@/components/property/PropertyFilters';
import { Button } from '@/components/ui/button';
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
  Grid3X3, 
  List, 
  SlidersHorizontal,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';
import { Property, PropertySearchFilters, Category } from '@/types/property';
import { PaginatedResponse } from '@/lib/api';
import { debounce } from '@/lib/utils';

export default function PropertiesNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<PropertySearchFilters>({});

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: PropertySearchFilters = {};
    
    searchParams.forEach((value, key) => {
      if (value) {
        switch (key) {
          case 'city':
          case 'district':
          case 'keyword':
            urlFilters[key] = value;
            break;
          case 'propertyType':
          case 'listingType':
            urlFilters[key] = value as any;
            break;
          case 'minPrice':
          case 'maxPrice':
          case 'categoryId':
          case 'bedrooms':
          case 'bathrooms':
          case 'minArea':
          case 'maxArea':
            urlFilters[key] = Number(value);
            break;
        }
      }
    });
    
    setFilters(urlFilters);
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await publicApi.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: PropertySearchFilters, page: number = 0) => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = {
          ...searchFilters,
          page,
          size: 12,
          sortBy,
          sortDir
        };

        const response: PaginatedResponse<Property> = await publicApi.searchProperties(searchParams);
        
        if (page === 0) {
          setProperties(response.content);
        } else {
          setProperties(prev => [...prev, ...response.content]);
        }
        
        setCurrentPage(response.number);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setHasMore(!response.last);
        
      } catch (error) {
        console.error('Search failed:', error);
        setError('Không thể tải danh sách bất động sản. Vui lòng thử lại.');
        toast.error('Có lỗi xảy ra khi tìm kiếm');
      } finally {
        setLoading(false);
      }
    }, 500),
    [sortBy, sortDir]
  );

  // Load properties when filters change
  useEffect(() => {
    debouncedSearch(filters, 0);
  }, [filters, debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    const newUrl = params.toString() ? `/properties-new?${params.toString()}` : '/properties-new';
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const handleFiltersChange = (newFilters: PropertySearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      debouncedSearch(filters, currentPage + 1);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(0);
  };

  const handleSortDirChange = (newSortDir: 'asc' | 'desc') => {
    setSortDir(newSortDir);
    setCurrentPage(0);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bất động sản
              </h1>
              <p className="text-gray-600">
                Tìm kiếm và khám phá các bất động sản phù hợp với nhu cầu của bạn
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Tìm thấy <strong>{totalElements.toLocaleString()}</strong> bất động sản
              </span>
              {filters.city && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {filters.city}
                </Badge>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sắp xếp:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Mới nhất</SelectItem>
                  <SelectItem value="price">Giá</SelectItem>
                  <SelectItem value="propertyArea">Diện tích</SelectItem>
                  <SelectItem value="viewCount">Lượt xem</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortDir} onValueChange={handleSortDirChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <PropertyFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                loading={loading}
              />
            </div>
          )}

          {/* Properties List */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <PropertyList
              properties={properties}
              loading={loading}
              error={error}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              onContact={handleContact}
              onFavorite={handleFavorite}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
