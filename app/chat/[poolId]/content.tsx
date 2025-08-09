'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import { ChartStateProvider } from '@/contexts/ChartStateContext';
import { PoolProvider } from '@/contexts/PoolContext';
import ChartWithStats from '@/components/Chart/ChartWithStats';
import InputArea from '@/components/DirectInput/InputArea';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
import { useChatContext } from '@/contexts/ChatContext';

type PoolContentProps = {
  poolAddress: string; // Pool contract address from the URL parameter
};

export default function PoolContent({ poolAddress }: PoolContentProps) {
  const { pageLoadingState } = useChatContext();
  
  return (
    <PoolProvider poolAddress={poolAddress}>
      <ChartStateProvider>
        <div className="flex flex-col min-h-screen bg-background font-zen">
          <Header ghost />
          
          {/* Main Content Area with bottom padding for persistent chat */}
          <div className="flex-1 p-6 pb-80 overflow-y-auto">
            {pageLoadingState ? (
              <div className="flex items-center justify-center h-full">
                <LoadingOverlay loadingState={pageLoadingState} />
              </div>
            ) : (
              <div className="max-w-6xl mx-auto flex flex-col gap-6">
                <ChartWithStats />
                <InputArea />
              </div>
            )}
          </div>
        </div>
      </ChartStateProvider>
    </PoolProvider>
  );
}