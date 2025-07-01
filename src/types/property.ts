export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude?: number;
  longitude?: number;
  propertyArea: number;
  landArea?: number;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  isFeatured: boolean;
  viewCount: number;
  contactCount: number;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Owner info
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  
  // Category info
  categoryName?: string;
  categoryId: number;
  
  // Images
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: number;
  url: string;
  caption?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  LAND = 'LAND',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  OFFICE = 'OFFICE'
}

export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT'
}

export enum PropertyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  SOLD = 'SOLD',
  RENTED = 'RENTED'
}

export interface PropertySearchFilters {
  city?: string;
  district?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  keyword?: string;
}

export interface PropertySearchParams extends PropertySearchFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedPropertyResponse {
  content: Property[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  propertyCount?: number;
}

// Property form data for creating/editing
export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude?: number;
  longitude?: number;
  propertyArea: number;
  landArea?: number;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  propertyType: PropertyType;
  listingType: ListingType;
  categoryId: number;
  images?: File[];
}

// Property card props for components
export interface PropertyCardProps {
  property: Property;
  showOwnerInfo?: boolean;
  showActions?: boolean;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onContact?: (property: Property) => void;
  className?: string;
}

// Property list props
export interface PropertyListProps {
  properties: Property[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
}

// Property filters component props
export interface PropertyFiltersProps {
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  categories: Category[];
  loading?: boolean;
  className?: string;
}

// Property detail props
export interface PropertyDetailProps {
  property: Property;
  loading?: boolean;
  error?: string;
  onContact?: (property: Property) => void;
  onShare?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  className?: string;
}

// Property stats
export interface PropertyStats {
  totalProperties: number;
  totalViews: number;
  totalContacts: number;
  averagePrice: number;
  propertiesByType: Record<PropertyType, number>;
  propertiesByStatus: Record<PropertyStatus, number>;
}

// Location data
export interface Location {
  city: string;
  district: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
}

// Price range
export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

// Common price ranges for Vietnam
export const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 1000000000, label: 'Dưới 1 tỷ' },
  { min: 1000000000, max: 2000000000, label: '1 - 2 tỷ' },
  { min: 2000000000, max: 3000000000, label: '2 - 3 tỷ' },
  { min: 3000000000, max: 5000000000, label: '3 - 5 tỷ' },
  { min: 5000000000, max: 10000000000, label: '5 - 10 tỷ' },
  { min: 10000000000, max: Infinity, label: 'Trên 10 tỷ' }
];

// Area ranges
export const AREA_RANGES: PriceRange[] = [
  { min: 0, max: 50, label: 'Dưới 50m²' },
  { min: 50, max: 80, label: '50 - 80m²' },
  { min: 80, max: 100, label: '80 - 100m²' },
  { min: 100, max: 150, label: '100 - 150m²' },
  { min: 150, max: 200, label: '150 - 200m²' },
  { min: 200, max: Infinity, label: 'Trên 200m²' }
];

// Property type labels in Vietnamese
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.HOUSE]: 'Nhà ở',
  [PropertyType.APARTMENT]: 'Chung cư',
  [PropertyType.LAND]: 'Đất nền',
  [PropertyType.VILLA]: 'Biệt thự',
  [PropertyType.COMMERCIAL]: 'Thương mại',
  [PropertyType.OFFICE]: 'Văn phòng'
};

// Listing type labels in Vietnamese
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  [ListingType.SALE]: 'Bán',
  [ListingType.RENT]: 'Cho thuê'
};

// Property status labels in Vietnamese
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.PENDING]: 'Chờ duyệt',
  [PropertyStatus.APPROVED]: 'Đã duyệt',
  [PropertyStatus.REJECTED]: 'Bị từ chối',
  [PropertyStatus.EXPIRED]: 'Hết hạn',
  [PropertyStatus.SOLD]: 'Đã bán',
  [PropertyStatus.RENTED]: 'Đã cho thuê'
};
