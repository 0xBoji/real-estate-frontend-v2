import { Property, PaginatedResponse } from './api';

export const mockProperties: Property[] = [
  {
    id: 1,
    title: "Beautiful Apartment in District 1",
    description: "Modern 2-bedroom apartment with city view. Located in the heart of Ho Chi Minh City with easy access to shopping centers, restaurants, and public transportation. Features include air conditioning, modern kitchen, and balcony with stunning city views.",
    price: 2500000000,
    address: "123 Nguyen Hue Street",
    city: "Ho Chi Minh City",
    district: "District 1",
    ward: "Ben Nghe Ward",
    propertyType: "APARTMENT",
    listingType: "SALE",
    bedrooms: 2,
    bathrooms: 2,
    propertyArea: 85.5,
    status: "APPROVED",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    categoryId: 1,
    userId: 1,
  },
  {
    id: 2,
    title: "Luxury Villa in District 2",
    description: "Spacious 4-bedroom villa with private garden and swimming pool. Perfect for families looking for luxury living in a quiet neighborhood. Features include modern amenities, garage for 2 cars, and 24/7 security.",
    price: 8500000000,
    address: "456 Thao Dien Street",
    city: "Ho Chi Minh City",
    district: "District 2",
    ward: "Thao Dien Ward",
    propertyType: "VILLA",
    listingType: "SALE",
    bedrooms: 4,
    bathrooms: 3,
    propertyArea: 250.0,
    status: "APPROVED",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
    categoryId: 1,
    userId: 2,
  },
  {
    id: 3,
    title: "Cozy Studio for Rent in District 3",
    description: "Fully furnished studio apartment perfect for young professionals or students. Located near universities and business districts. Includes all utilities and high-speed internet.",
    price: 8000000,
    address: "789 Vo Van Tan Street",
    city: "Ho Chi Minh City",
    district: "District 3",
    ward: "Ward 6",
    propertyType: "APARTMENT",
    listingType: "RENT",
    bedrooms: 1,
    bathrooms: 1,
    propertyArea: 35.0,
    status: "APPROVED",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
    categoryId: 1,
    userId: 3,
  },
  {
    id: 4,
    title: "Modern Office Space in District 1",
    description: "Premium office space in the central business district. Ideal for startups and small businesses. Features include modern facilities, meeting rooms, and excellent connectivity.",
    price: 45000000,
    address: "321 Le Loi Street",
    city: "Ho Chi Minh City",
    district: "District 1",
    ward: "Ben Thanh Ward",
    propertyType: "OFFICE",
    listingType: "RENT",
    bedrooms: 0,
    bathrooms: 2,
    propertyArea: 120.0,
    status: "APPROVED",
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    categoryId: 2,
    userId: 1,
  },
  {
    id: 5,
    title: "Family House in Binh Thanh District",
    description: "Comfortable 3-bedroom house perfect for families. Features a small garden, parking space, and is located in a safe neighborhood with good schools nearby.",
    price: 4200000000,
    address: "654 Xo Viet Nghe Tinh Street",
    city: "Ho Chi Minh City",
    district: "Binh Thanh District",
    ward: "Ward 25",
    propertyType: "HOUSE",
    listingType: "SALE",
    bedrooms: 3,
    bathrooms: 2,
    propertyArea: 150.0,
    status: "APPROVED",
    createdAt: "2024-01-11T11:30:00Z",
    updatedAt: "2024-01-11T11:30:00Z",
    categoryId: 1,
    userId: 4,
  },
  {
    id: 6,
    title: "Penthouse with City View in District 7",
    description: "Luxurious penthouse with panoramic city views. Features include private elevator access, rooftop terrace, and premium finishes throughout. Perfect for executives and luxury living enthusiasts.",
    price: 12000000000,
    address: "888 Nguyen Van Linh Street",
    city: "Ho Chi Minh City",
    district: "District 7",
    ward: "Tan Phong Ward",
    propertyType: "APARTMENT",
    listingType: "SALE",
    bedrooms: 3,
    bathrooms: 3,
    propertyArea: 180.0,
    status: "APPROVED",
    createdAt: "2024-01-10T13:20:00Z",
    updatedAt: "2024-01-10T13:20:00Z",
    categoryId: 1,
    userId: 2,
  },
  {
    id: 7,
    title: "Affordable Apartment for Rent in Go Vap",
    description: "Budget-friendly 2-bedroom apartment suitable for small families or roommates. Basic amenities included, good transportation links to city center.",
    price: 6500000,
    address: "147 Quang Trung Street",
    city: "Ho Chi Minh City",
    district: "Go Vap District",
    ward: "Ward 11",
    propertyType: "APARTMENT",
    listingType: "RENT",
    bedrooms: 2,
    bathrooms: 1,
    propertyArea: 65.0,
    status: "APPROVED",
    createdAt: "2024-01-09T08:45:00Z",
    updatedAt: "2024-01-09T08:45:00Z",
    categoryId: 1,
    userId: 5,
  },
  {
    id: 8,
    title: "Commercial Space in District 5",
    description: "Ground floor commercial space perfect for retail or restaurant business. High foot traffic area with excellent visibility and accessibility.",
    price: 35000000,
    address: "258 An Duong Vuong Street",
    city: "Ho Chi Minh City",
    district: "District 5",
    ward: "Ward 12",
    propertyType: "OFFICE",
    listingType: "RENT",
    bedrooms: 0,
    bathrooms: 1,
    propertyArea: 80.0,
    status: "APPROVED",
    createdAt: "2024-01-08T15:10:00Z",
    updatedAt: "2024-01-08T15:10:00Z",
    categoryId: 2,
    userId: 3,
  },
];

export const createMockPaginatedResponse = (
  page: number = 0,
  size: number = 10,
  data: Property[] = mockProperties
): PaginatedResponse<Property> => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = data.slice(startIndex, endIndex);
  
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false,
      },
      offset: startIndex,
      paged: true,
      unpaged: false,
    },
    last: endIndex >= data.length,
    totalPages: Math.ceil(data.length / size),
    totalElements: data.length,
    size,
    number: page,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false,
    },
    first: page === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
};
