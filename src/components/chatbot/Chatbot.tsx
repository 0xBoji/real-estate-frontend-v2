'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage, ChatbotState } from '@/types/chatbot';
import { ChatbotEngine } from '@/lib/chatbot';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

export default function Chatbot() {
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: []
  });

  const chatbotEngine = ChatbotEngine.getInstance();

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatbot_messages');
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setState(prev => ({ ...prev, messages }));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    } else {
      // Send welcome message if no history
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        content: "Hello! I'm your real estate assistant. I can help you find properties, answer questions about real estate, and more. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestions',
        data: {
          suggestions: [
            { text: "Show me apartments", action: "search_apartments" },
            { text: "Find houses for sale", action: "search_houses_sale" },
            { text: "Properties under 5B VND", action: "search_budget" },
            { text: "Help", action: "help" }
          ]
        }
      };
      setState(prev => ({ ...prev, messages: [welcomeMessage] }));
    }

    // Listen for suggestion clicks
    const handleSuggestion = (event: CustomEvent) => {
      const suggestion = event.detail;
      handleSuggestionClick(suggestion);
    };

    window.addEventListener('chatbot-suggestion', handleSuggestion as EventListener);
    
    return () => {
      window.removeEventListener('chatbot-suggestion', handleSuggestion as EventListener);
    };
  }, []);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (state.messages.length > 0) {
      localStorage.setItem('chatbot_messages', JSON.stringify(state.messages));
    }
  }, [state.messages]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const toggleChat = () => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    try {
      // Process message with chatbot engine
      const response = await chatbotEngine.processMessage(content);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Add bot response
      const botMessage: ChatMessage = {
        id: generateId(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type,
        data: response.data || (response.suggestions ? { suggestions: response.suggestions } : undefined)
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isTyping: false,
        suggestions: response.suggestions || []
      }));

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false
      }));
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    let message = '';

    switch (suggestion.action) {
      case 'search_apartments':
        message = 'Show me apartments';
        break;
      case 'search_houses_sale':
        message = 'Find houses for sale';
        break;
      case 'search_budget':
        message = 'Show me properties under 5 billion VND';
        break;
      case 'search_rent':
        message = "What's available for rent?";
        break;
      case 'search_all':
        message = 'Show me all available properties';
        break;
      case 'search_location':
        message = 'Find properties in Ho Chi Minh City';
        break;
      case 'search_price':
        message = 'Show me properties under 3 billion VND';
        break;
      case 'help':
        message = 'Help';
        break;
      case 'about':
        message = 'About';
        break;
      case 'contact':
        message = 'Contact';
        break;
      case 'refine_search':
        message = 'Help me refine my search';
        break;
      case 'show_details':
        message = 'Show me more details about these properties';
        break;
      case 'new_search':
        message = 'I want to start a new search';
        break;
      case 'retry':
        message = 'Try searching again';
        break;
      default:
        message = suggestion.text;
    }

    if (message) {
      handleSendMessage(message);
    }
  };

  const clearChat = () => {
    setState(prev => ({
      ...prev,
      messages: [],
      suggestions: []
    }));
    localStorage.removeItem('chatbot_messages');
  };

  return (
    <>
      <ChatButton
        isOpen={state.isOpen}
        onClick={toggleChat}
        hasUnread={false}
      />
      
      <ChatWindow
        isOpen={state.isOpen}
        onClose={toggleChat}
        messages={state.messages}
        isTyping={state.isTyping}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}
