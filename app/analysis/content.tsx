'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import PoolSelector from '@/components/analysis/PoolSelector';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useChatContext } from '@/contexts/ChatContext';

export default function Content() {
  const { pageLoadingState } = useChatContext();

  return (
    <div className="flex flex-col min-h-screen bg-background font-zen">
      <Header ghost />
      
      {/* Main Content Area with bottom padding for persistent chat */}
      <div className="flex-1 flex items-center justify-center p-6 pb-80">
        {pageLoadingState ? (
          <LoadingOverlay loadingState={pageLoadingState} />
        ) : (
          <PoolSelector />
        )}
      </div>
    </div>
  );
} 