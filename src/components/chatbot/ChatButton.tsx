'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
}

export default function ChatButton({ isOpen, onClick, hasUnread = false }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-50",
        "hover:scale-110 active:scale-95",
        isOpen ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
      )}
      size="icon"
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <div className="relative">
          <MessageCircle className="h-6 w-6 text-white" />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      )}
    </Button>
  );
}
