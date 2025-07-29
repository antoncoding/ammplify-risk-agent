'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import { ChartStateProvider } from '@/contexts/ChartStateContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import ChartWithStats from '@/components/Chart/ChartWithStats';
import InputArea from '@/components/DirectInput/InputArea';

export default function Content() {
  return (
    <ChartStateProvider>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-main font-zen">
          <Header ghost />
          {/* Price Chart Section */}
          <section className="flex flex-col items-center justify-center p-6 gap-6 flex-1">
            <ChartWithStats />
            <InputArea />
          </section>
        </div>
      </TooltipProvider>
    </ChartStateProvider>
  );
} 