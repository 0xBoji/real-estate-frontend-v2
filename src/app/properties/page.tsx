'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi, Property, PaginatedResponse } from '@/lib/api';
import { errorUtils } from '@/lib/auth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Bed,
  Bath,
  Square,
  ChevronLeft,
  ChevronRight,
  Building,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Heart,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PaginatedResponse<Property> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    propertyType: 'all',
    listingType: 'all',
    city: 'all',
    minPrice: '',
    maxPrice: '',
    bedrooms: 'all',
    bathrooms: 'all',
    minArea: '',
    maxArea: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProperties = async (page = 0) => {
    try {
      setIsLoading(true);
      const response = await publicApi.getProperties(page, pageSize);

      // Apply client-side filtering (in real app, this would be done on backend)
      let filteredProperties = response.content;

      // Search term filter
      if (searchTerm.trim()) {
        filteredProperties = filteredProperties.filter(p =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.district.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Property type filter
      if (filters.propertyType !== 'all') {
        filteredProperties = filteredProperties.filter(p =>
          p.propertyType.toLowerCase() === filters.propertyType.toLowerCase()
        );
      }

      // Listing type filter
      if (filters.listingType !== 'all') {
        filteredProperties = filteredProperties.filter(p =>
          p.listingType.toLowerCase() === filters.listingType.toLowerCase()
        );
      }

      // City filter
      if (filters.city !== 'all') {
        filteredProperties = filteredProperties.filter(p =>
          p.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      // Price filters
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice) * 1000000; // Convert to VND
        filteredProperties = filteredProperties.filter(p => p.price >= minPrice);
      }

      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice) * 1000000; // Convert to VND
        filteredProperties = filteredProperties.filter(p => p.price <= maxPrice);
      }

      // Bedroom filter
      if (filters.bedrooms !== 'all') {
        filteredProperties = filteredProperties.filter(p =>
          p.bedrooms >= parseInt(filters.bedrooms)
        );
      }

      // Bathroom filter
      if (filters.bathrooms !== 'all') {
        filteredProperties = filteredProperties.filter(p =>
          p.bathrooms >= parseInt(filters.bathrooms)
        );
      }

      // Area filters
      if (filters.minArea) {
        filteredProperties = filteredProperties.filter(p =>
          p.propertyArea >= parseFloat(filters.minArea)
        );
      }

      if (filters.maxArea) {
        filteredProperties = filteredProperties.filter(p =>
          p.propertyArea <= parseFloat(filters.maxArea)
        );
      }

      // Apply sorting
      filteredProperties.sort((a, b) => {
        switch (sortBy) {
          case 'price,asc':
            return a.price - b.price;
          case 'price,desc':
            return b.price - a.price;
          case 'area,asc':
            return a.propertyArea - b.propertyArea;
          case 'area,desc':
            return b.propertyArea - a.propertyArea;
          case 'createdAt,desc':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

      // Create filtered response
      const filteredResponse = {
        ...response,
        content: filteredProperties,
        totalElements: filteredProperties.length,
        totalPages: Math.ceil(filteredProperties.length / pageSize),
      };

      setProperties(filteredResponse);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to load properties: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentPage);
  }, [currentPage, searchTerm, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      propertyType: 'all',
      listingType: 'all',
      city: 'all',
      minPrice: '',
      maxPrice: '',
      bedrooms: 'all',
      bathrooms: 'all',
      minArea: '',
      maxArea: '',
    });
    setSearchTerm('');
    setCurrentPage(0);
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
      month: 'short',
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

  if (isLoading && !properties) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties</h1>
          <p className="text-gray-600">
            Discover your perfect property from our extensive collection
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt,desc">Newest First</SelectItem>
                  <SelectItem value="createdAt,asc">Oldest First</SelectItem>
                  <SelectItem value="price,asc">Price: Low to High</SelectItem>
                  <SelectItem value="price,desc">Price: High to Low</SelectItem>
                  <SelectItem value="area,asc">Area: Small to Large</SelectItem>
                  <SelectItem value="area,desc">Area: Large to Small</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Property Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Property Type</Label>
              <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listing Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Listing Type</Label>
              <Select value={filters.listingType} onValueChange={(value) => handleFilterChange('listingType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div>
              <Label className="text-sm font-medium mb-2 block">City</Label>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="ho chi minh">Ho Chi Minh City</SelectItem>
                  <SelectItem value="hanoi">Hanoi</SelectItem>
                  <SelectItem value="da nang">Da Nang</SelectItem>
                  <SelectItem value="can tho">Can Tho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Bedrooms</Label>
              <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Min Price (Million VND)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Max Price (Million VND)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Min Area (m²)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minArea}
                onChange={(e) => handleFilterChange('minArea', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Max Area (m²)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxArea}
                onChange={(e) => handleFilterChange('maxArea', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {properties?.totalElements || 0} properties found
          </p>
        </div>

        {/* Properties Display */}
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          : "space-y-6 mb-8"
        }>
          {properties?.content?.map((property) => (
            viewMode === 'grid' ? (
              // Grid View
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group pt-0">
                <div className="relative h-48 w-full">
                  <Image src="/images/house1.jpg" alt={property.title} fill className="object-cover w-full h-full rounded-b-none rounded-t" />
                  <div className="absolute top-2 left-2 flex items-center gap-2 mb-3">
                    <Badge className={getListingTypeColor(property.listingType)}>
                      {property.listingType}
                    </Badge>
                    <Badge className={getPropertyTypeColor(property.propertyType)}>
                      {property.propertyType}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <span className="text-xs text-white bg-black/40 rounded px-2 py-0.5">Posted on {formatDate(property.createdAt)}</span>
                  </div>
                </div>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                  </div>
                  <div className="flex items-center text-gray-600 my-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-md">{property.city}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>
                        {property.bedrooms}
                        <span className="hidden xl:inline">
                          {property.bedrooms === 1 || property.bedrooms === 0 ? ' room' : ' rooms'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>
                        {property.bathrooms}
                        <span className="hidden xl:inline">
                          {property.bathrooms === 1 || property.bathrooms === 0 ? ' room' : ' rooms'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.propertyArea}m²</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start mt-2">
                    <span className="text-md text-blue-600 font-medium">{formatPrice(property.price)}</span>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Link href={`/properties/${property.id}`}>
                        <Button size="sm">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // List View
              <React.Fragment key={property.id}>
                {/* Mobile Size */}
                <div className="block md:hidden">
                  <Card className="overflow-hidden relative group p-0">
                    <div className="relative w-full h-48">
                      <Image src="/images/house1.jpg" alt={property.title} fill className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors duration-200" />
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 mt-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getPropertyTypeColor(property.propertyType)}>
                            {property.propertyType}
                          </Badge>
                          <Badge className={getListingTypeColor(property.listingType)}>
                            {property.listingType}
                          </Badge>
                        </div>
                        <span className="text-xs text-white bg-black/40 rounded px-2 py-0.5">
                          Posted on {formatDate(property.createdAt)}
                        </span>
                      </div>
                      {/* Title */}
                      <div className="absolute left-2 right-2 top-10 z-10">
                        <h3 className="text-lg font-bold text-white line-clamp-1 drop-shadow">
                          {property.title}
                        </h3>
                      </div>
                      {/* City */}
                      <div className="absolute left-2 right-2 top-18 z-10 flex items-center">
                        <MapPin className="h-4 w-4 text-white mr-1" />
                        <span className="text-sm text-white drop-shadow">
                          {property.address}, {property.city}
                        </span>
                      </div>
                      {/* Features */}
                      <div className="absolute left-2 right-2 top-26 flex items-center gap-4 z-10">
                        <div className="flex items-center">
                          <Bed className="h-5 w-5 text-white" />
                          <span className="text-white ml-1">
                            {property.bedrooms}
                            <span className="hidden xl:inline">
                              {property.bedrooms === 1 || property.bedrooms === 0 ? ' room' : ' rooms'}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-5 w-5 text-white" />
                          <span className="text-white ml-1">
                            {property.bathrooms}
                            <span className="hidden xl:inline">
                              {property.bathrooms === 1 || property.bathrooms === 0 ? ' room' : ' rooms'}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-5 w-5 text-white" />
                          <span className="text-white ml-1">{property.propertyArea}m²</span>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-2 flex gap-2 z-10">
                        <Button size="sm" variant="secondary" className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                      <div className="absolute bottom-3 right-2 flex gap-2 z-10">
                        <Link href={`/properties/${property.id}`}>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
                {/* Desktop Size */}
                <div className="hidden md:block">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="px-6">
                      <div className="flex gap-6">
                        <div className="w-80 h-44 rounded-lg flex-shrink-0 overflow-hidden relative">
                          <Image src="/images/house1.jpg" alt={property.title} fill className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-2xl text-gray-900">
                                {property.title}
                              </h3>
                              <div className="flex items-center text-gray-600 my-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-md">
                                  {property.address}, {property.city}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getPropertyTypeColor(property.propertyType)}>
                                {property.propertyType}
                              </Badge>
                              <Badge className={getListingTypeColor(property.listingType)}>
                                {property.listingType}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-5 text-md text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              <span>
                                {property.bedrooms}
                                <span className="hidden xl:inline">
                                  {property.bedrooms === 1 || property.bedrooms === 0 ? ' room' : ' rooms'}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              <span>
                                {property.bathrooms}
                                <span className="hidden xl:inline">
                                  {property.bathrooms === 1 || property.bathrooms === 0 ? ' room' : ' rooms'}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              <span>{property.propertyArea}m²</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-blue-600 flex">
                              {formatPrice(property.price)}
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Heart className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Link href={`/properties/${property.id}`}>
                                <Button size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <p className="text-right text-sm text-gray-500 mt-4">
                            Posted on {formatDate(property.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </React.Fragment>
            )
          ))}
        </div>

        {/* Empty State */}
        {properties?.content.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {properties && properties.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {properties.number * properties.size + 1} to{' '}
              {Math.min((properties.number + 1) * properties.size, properties.totalElements)} of{' '}
              {properties.totalElements} properties
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={properties.first}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {properties.number + 1} of {properties.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={properties.last}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
