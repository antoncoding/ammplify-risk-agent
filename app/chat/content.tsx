'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import { ChartStateProvider } from '@/contexts/ChartStateContext';

import ChartWithStats from '@/components/Chart/ChartWithStats';
import InputArea from '@/components/DirectInput/InputArea';

export default function Content() {
  return (
    <ChartStateProvider>
      <div className="flex flex-col min-h-screen bg-background font-zen">
        <Header ghost />
        {/* Main Content Section */}
        <section className="flex flex-col items-center p-6 gap-6 flex-1">
          <ChartWithStats />
          <InputArea />
        </section>
      </div>
    </ChartStateProvider>
  );
} 