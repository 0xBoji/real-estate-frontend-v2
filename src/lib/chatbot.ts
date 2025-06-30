import { ChatMessage, PropertySearchResult, ChatSuggestion } from '@/types/chatbot';
import { chatbotApi } from './api';

export interface ChatbotResponse {
  message: string;
  type: 'text' | 'property_results' | 'suggestions' | 'error';
  data?: any;
  suggestions?: ChatSuggestion[];
}

export class ChatbotEngine {
  private static instance: ChatbotEngine;
  
  public static getInstance(): ChatbotEngine {
    if (!ChatbotEngine.instance) {
      ChatbotEngine.instance = new ChatbotEngine();
    }
    return ChatbotEngine.instance;
  }

  // Keywords for different intents
  private readonly intents = {
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'xin chào', 'chào'],
    search: ['find', 'search', 'show', 'look for', 'want', 'need', 'looking for', 'tìm', 'tìm kiếm', 'hiển thị'],
    price: ['price', 'cost', 'budget', 'cheap', 'expensive', 'under', 'below', 'above', 'giá', 'tiền', 'dưới', 'trên'],
    location: ['in', 'at', 'near', 'around', 'district', 'city', 'area', 'ở', 'tại', 'gần', 'quận', 'thành phố'],
    propertyType: ['apartment', 'house', 'villa', 'office', 'condo', 'studio', 'chung cư', 'nhà', 'biệt thự', 'văn phòng'],
    listingType: ['rent', 'sale', 'buy', 'lease', 'cho thuê', 'bán', 'mua'],
    features: ['bedroom', 'bathroom', 'bed', 'bath', 'room', 'sqm', 'square', 'phòng ngủ', 'phòng tắm', 'm2'],
    help: ['help', 'what can you do', 'commands', 'how to', 'guide', 'trợ giúp', 'hướng dẫn'],
    contact: ['contact', 'phone', 'email', 'call', 'liên hệ', 'số điện thoại'],
    about: ['about', 'who are you', 'what are you', 'giới thiệu', 'bạn là ai'],
    thanks: ['thank', 'thanks', 'thank you', 'cảm ơn', 'cám ơn'],
    goodbye: ['bye', 'goodbye', 'see you', 'tạm biệt', 'chào tạm biệt'],
  };

  // Common responses
  private readonly responses = {
    greeting: [
      "Hello! I'm your real estate assistant. How can I help you find the perfect property today?",
      "Hi there! I'm here to help you with property searches. What are you looking for?",
      "Welcome! I can help you find apartments, houses, and more. What interests you?",
      "Xin chào! Tôi là trợ lý bất động sản của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
      "Chào bạn! Tôi có thể giúp bạn tìm kiếm bất động sản. Bạn đang quan tâm đến loại nào?"
    ],
    help: `I can help you with:
🏠 **Property Search** - Find apartments, houses, villas, offices
💰 **Price Filtering** - Search by budget or price range
📍 **Location Search** - Find properties in specific cities or districts
🛏️ **Feature Filtering** - Search by bedrooms, bathrooms, area
📋 **Listing Types** - Find properties for sale or rent

**Example queries:**
• "Show me apartments in Ho Chi Minh City"
• "Find houses under 5 billion VND"
• "3-bedroom apartments for rent"
• "Villas in District 1"
• "Tìm chung cư ở Hồ Chí Minh"
• "Nhà dưới 3 tỷ đồng"

**Commands:**
• Type "help" for this guide
• Type "contact" for contact information
• Type "about" to learn more about me`,
    about: `I'm an AI-powered real estate assistant created to help you find the perfect property!

🤖 **What I can do:**
• Search through thousands of properties
• Filter by price, location, and features
• Provide detailed property information
• Answer questions about real estate
• Support both English and Vietnamese

🏠 **Property Types I know:**
• Apartments (Chung cư)
• Houses (Nhà)
• Villas (Biệt thự)
• Offices (Văn phòng)

I'm here 24/7 to help you find your dream property!`,
    contact: `📞 **Contact Information:**

🏢 **Real Estate Platform**
📧 Email: support@realestate.com
📱 Phone: +84 123 456 789
🌐 Website: www.realestate.com

🕒 **Business Hours:**
Monday - Friday: 8:00 AM - 6:00 PM
Saturday: 9:00 AM - 5:00 PM
Sunday: Closed

💬 **Need immediate help?**
I'm available 24/7 for property searches and questions!`,
    thanks: [
      "You're welcome! Is there anything else I can help you with?",
      "Happy to help! Let me know if you need to find more properties.",
      "My pleasure! Feel free to ask if you have more questions.",
      "Không có gì! Bạn còn cần tìm hiểu gì khác không?"
    ],
    goodbye: [
      "Goodbye! Come back anytime you need help finding properties.",
      "See you later! Good luck with your property search!",
      "Take care! I'll be here whenever you need real estate assistance.",
      "Tạm biệt! Chúc bạn tìm được bất động sản ưng ý!"
    ],
    noResults: "I couldn't find any properties matching your criteria. Try adjusting your search terms or budget.",
    error: "I'm sorry, I encountered an error while searching. Please try again or contact support.",
    unclear: "I'm not sure what you're looking for. Could you be more specific? For example, try 'Find 2-bedroom apartments in Ho Chi Minh City' or type 'help' for more options."
  };

  public async processMessage(message: string): Promise<ChatbotResponse> {
    const normalizedMessage = message.toLowerCase().trim();
    
    try {
      // Check for greeting
      if (this.matchesIntent(normalizedMessage, this.intents.greeting)) {
        return {
          message: this.getRandomResponse(this.responses.greeting),
          type: 'suggestions',
          suggestions: [
            { text: "Show me apartments", action: "search_apartments" },
            { text: "Find houses for sale", action: "search_houses_sale" },
            { text: "Properties under 5B VND", action: "search_budget" },
            { text: "Help", action: "help" }
          ]
        };
      }

      // Check for help
      if (this.matchesIntent(normalizedMessage, this.intents.help)) {
        return {
          message: this.responses.help,
          type: 'suggestions',
          suggestions: [
            { text: "Find apartments", action: "search_apartments" },
            { text: "Search by location", action: "search_location" },
            { text: "Filter by price", action: "search_price" },
            { text: "Browse all properties", action: "search_all" }
          ]
        };
      }

      // Check for about
      if (this.matchesIntent(normalizedMessage, this.intents.about)) {
        return {
          message: this.responses.about,
          type: 'suggestions',
          suggestions: [
            { text: "Find properties", action: "search_all" },
            { text: "Contact info", action: "contact" },
            { text: "Help", action: "help" }
          ]
        };
      }

      // Check for contact
      if (this.matchesIntent(normalizedMessage, this.intents.contact)) {
        return {
          message: this.responses.contact,
          type: 'suggestions',
          suggestions: [
            { text: "Find properties", action: "search_all" },
            { text: "About me", action: "about" },
            { text: "Help", action: "help" }
          ]
        };
      }

      // Check for thanks
      if (this.matchesIntent(normalizedMessage, this.intents.thanks)) {
        return {
          message: this.getRandomResponse(this.responses.thanks),
          type: 'suggestions',
          suggestions: [
            { text: "Find more properties", action: "search_all" },
            { text: "Search by location", action: "search_location" },
            { text: "Help", action: "help" }
          ]
        };
      }

      // Check for goodbye
      if (this.matchesIntent(normalizedMessage, this.intents.goodbye)) {
        return {
          message: this.getRandomResponse(this.responses.goodbye),
          type: 'suggestions',
          suggestions: [
            { text: "Actually, find properties", action: "search_all" },
            { text: "Contact info", action: "contact" }
          ]
        };
      }

      // Check for property search or any message that might be a search query
      if (this.matchesIntent(normalizedMessage, this.intents.search) || this.looksLikeSearchQuery(normalizedMessage)) {
        return await this.handleChatbotSearch(message);
      }

      // Default response for unclear messages
      return {
        message: this.responses.unclear,
        type: 'suggestions',
        suggestions: [
          { text: "Show me all properties", action: "search_all" },
          { text: "Find apartments", action: "search_apartments" },
          { text: "Help", action: "help" }
        ]
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        message: this.responses.error,
        type: 'error'
      };
    }
  }

  private async handleChatbotSearch(message: string): Promise<ChatbotResponse> {
    try {
      console.log('🔍 Sending query to chatbot API:', message);
      const response = await chatbotApi.quickSearch(message);
      console.log('✅ Chatbot API response:', response);

      // Handle different response types from the backend
      if (response.properties && response.properties.length > 0) {
        const resultMessage = response.message || `Found ${response.properties.length} properties matching your search:`;

        return {
          message: resultMessage,
          type: 'property_results',
          data: {
            properties: response.properties,
            total: response.properties.length,
            query: message
          },
          suggestions: [
            { text: "Refine search", action: "refine_search" },
            { text: "Show more details", action: "show_details" },
            { text: "New search", action: "new_search" }
          ]
        };
      } else if (response.message) {
        // Backend returned a text response
        return {
          message: response.message,
          type: 'text',
          suggestions: [
            { text: "Show all properties", action: "search_all" },
            { text: "Try different search", action: "search_location" },
            { text: "Help", action: "help" }
          ]
        };
      } else {
        // No results found
        return {
          message: this.responses.noResults,
          type: 'suggestions',
          suggestions: [
            { text: "Show all properties", action: "search_all" },
            { text: "Try different location", action: "search_location" },
            { text: "Adjust price range", action: "search_price" }
          ]
        };
      }

    } catch (error) {
      console.error('❌ Chatbot API error:', error);
      return {
        message: "I'm having trouble processing your request right now. Please try again later.",
        type: 'error',
        suggestions: [
          { text: "Try again", action: "retry" },
          { text: "Show all properties", action: "search_all" },
          { text: "Help", action: "help" }
        ]
      };
    }
  }

  private looksLikeSearchQuery(message: string): boolean {
    // Check if message contains property-related keywords or seems like a search
    const searchIndicators = [
      ...this.intents.propertyType,
      ...this.intents.location,
      ...this.intents.price,
      ...this.intents.features,
      'apartment', 'house', 'villa', 'office', 'property', 'properties',
      'chung cư', 'nhà', 'biệt thự', 'văn phòng', 'bất động sản',
      'bedroom', 'bathroom', 'price', 'cost', 'budget',
      'phòng ngủ', 'phòng tắm', 'giá', 'tiền',
      'ho chi minh', 'hanoi', 'da nang', 'district', 'quận'
    ];

    return searchIndicators.some(indicator => message.includes(indicator));
  }

  private matchesIntent(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public generateSuggestions(context?: string): ChatSuggestion[] {
    const baseSuggestions = [
      { text: "Show me apartments", action: "search_apartments" },
      { text: "Find houses for sale", action: "search_houses_sale" },
      { text: "Properties under 5B VND", action: "search_budget" },
      { text: "What's available for rent?", action: "search_rent" },
      { text: "Help", action: "help" }
    ];
    
    return baseSuggestions;
  }
}
