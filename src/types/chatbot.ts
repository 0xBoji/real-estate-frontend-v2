export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'property_results' | 'suggestions' | 'error';
  data?: any; // For property results or other structured data
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  query: string;
}

export interface ChatSuggestion {
  text: string;
  action: string;
}

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  suggestions: ChatSuggestion[];
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  district: string;
  ward: string;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  propertyArea: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  userId: number;
  images?: string[];
}
