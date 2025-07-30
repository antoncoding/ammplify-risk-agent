'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import MarketSelection from '@/components/MarketSelection/MarketSelection';

export default function Content() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-zen">
      <Header ghost />
      
      {/* Main Content Area with bottom padding for persistent chat */}
      <div className="flex-1 flex items-center justify-center p-6 pb-80">
        <MarketSelection />
      </div>
    </div>
  );
} 