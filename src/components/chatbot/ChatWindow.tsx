'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types/chatbot';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Send, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatWindow({ 
  isOpen, 
  onClose, 
  messages, 
  isTyping, 
  onSendMessage 
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border z-40",
      "flex flex-col transition-all duration-300 transform",
      isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">🏠</span>
          </div>
          <div>
            <h3 className="font-semibold">Real Estate Assistant</h3>
            <p className="text-xs text-blue-100">Ask me about properties!</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-blue-500 h-8 w-8 p-0"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏠</span>
            </div>
            <h4 className="font-medium mb-2">Welcome to Real Estate Assistant!</h4>
            <p className="text-sm">
              I can help you find properties, answer questions about real estate, and more.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Show me apartments in Ho Chi Minh City",
                  "Find houses under 5 billion VND",
                  "What's available for rent?",
                  "Help me find a 3-bedroom house"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about properties..."
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
