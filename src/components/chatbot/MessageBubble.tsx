'use client';

import React from 'react';
import { ChatMessage } from '@/types/chatbot';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import PropertyCard from './PropertyCard';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === 'bot';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isBot ? "justify-start" : "justify-end"
    )}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] space-y-1",
        isBot ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-2xl",
          isBot 
            ? "bg-gray-100 text-gray-900 rounded-bl-sm" 
            : "bg-blue-600 text-white rounded-br-sm"
        )}>
          {message.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.type === 'property_results' && message.data && (
            <div className="space-y-3">
              <p className="text-sm font-medium">{message.content}</p>
              <div className="space-y-2">
                {message.data.properties.slice(0, 3).map((property: any) => (
                  <PropertyCard key={property.id} property={property} compact />
                ))}
                {message.data.total > 3 && (
                  <p className="text-xs text-gray-600 mt-2">
                    And {message.data.total - 3} more properties...
                  </p>
                )}
              </div>
            </div>
          )}
          
          {message.type === 'suggestions' && message.data && (
            <div className="space-y-2">
              <p className="text-sm">{message.content}</p>
              <div className="flex flex-wrap gap-2">
                {message.data.suggestions.map((suggestion: any, index: number) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
                    onClick={() => {
                      // This will be handled by the parent component
                      const event = new CustomEvent('chatbot-suggestion', { 
                        detail: suggestion 
                      });
                      window.dispatchEvent(event);
                    }}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {message.type === 'error' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700">{message.content}</p>
            </div>
          )}
        </div>
        
        <p className={cn(
          "text-xs text-gray-500 px-1",
          isBot ? "text-left" : "text-right"
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
