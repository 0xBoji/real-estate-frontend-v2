'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function TestPropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Properties Page
        </h1>
        
        <div className="space-y-4">
          <Button>Test Button</Button>
          <p>This is a test page to check if basic components work.</p>
        </div>
      </div>
    </div>
  );
}
