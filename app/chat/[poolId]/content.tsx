'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import { ChartStateProvider } from '@/contexts/ChartStateContext';
import { PoolProvider } from '@/contexts/PoolContext';
import ChartWithStats from '@/components/Chart/ChartWithStats';
import DriftVolInput from '@/components/DirectInput/DriftVolInput';

type PoolContentProps = {
  poolId: string; // This is actually the poolAddress from the URL
};

export default function PoolContent({ poolId }: PoolContentProps) {
  // poolId is actually the poolAddress from the URL parameter
  const poolAddress = poolId;
  
  return (
    <PoolProvider poolAddress={poolAddress}>
      <ChartStateProvider>
        <div className="flex flex-col min-h-screen bg-background font-zen">
          <Header ghost />
          
          {/* Main Content Area with bottom padding for persistent chat */}
          <div className="flex-1 p-6 pb-80 overflow-y-auto">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
              <ChartWithStats />
              <DriftVolInput />
            </div>
          </div>
        </div>
      </ChartStateProvider>
    </PoolProvider>
  );
}