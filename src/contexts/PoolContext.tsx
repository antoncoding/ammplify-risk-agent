'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LookbackPeriod } from '@/hooks/usePoolStats';
import { getPoolWithTokens, isValidPool, PoolWithTokens } from '@/config/pools';

export type PoolContextType = {
  poolAddress: string;
  poolConfig: PoolWithTokens | null;
  lookbackPeriod: LookbackPeriod;
  setLookbackPeriod: (period: LookbackPeriod) => void;
  // Functions that can be invoked by chat
  updateLookbackPeriod: (period: LookbackPeriod) => void;
  refreshData: () => void;
  // Chart control functions for future chat integration
  chartControls: {
    zoomToTimeRange: (startTime: number, endTime: number) => void;
    highlightPriceLevel: (price: number) => void;
    addAnnotation: (time: number, price: number, text: string) => void;
    resetView: () => void;
  };
};

const PoolContext = createContext<PoolContextType | undefined>(undefined);

type PoolProviderProps = {
  children: React.ReactNode;
  poolAddress: string;
};

export function PoolProvider({ children, poolAddress }: PoolProviderProps) {
  const [lookbackPeriod, setLookbackPeriod] = useState<LookbackPeriod>('3 months');
  const [refreshKey, setRefreshKey] = useState(0);

  // Validate pool address and get config
  if (!isValidPool(poolAddress)) {
    throw new Error(`Invalid pool address: ${poolAddress}. Pool not whitelisted.`);
  }

  const poolConfig = getPoolWithTokens(poolAddress);

  // Functions that can be called by chat or other components - use useCallback to prevent infinite loops
  const updateLookbackPeriod = useCallback((period: LookbackPeriod) => {
    setLookbackPeriod(period);
  }, []);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Chart control functions - placeholders for future implementation - memoize the object itself
  const chartControls = useMemo(() => ({
    zoomToTimeRange: (startTime: number, endTime: number) => {
      // TODO: Implement chart zoom functionality
      console.log('Zooming to time range:', { startTime, endTime });
    },
    highlightPriceLevel: (price: number) => {
      // TODO: Implement price level highlighting
      console.log('Highlighting price level:', price);
    },
    addAnnotation: (time: number, price: number, text: string) => {
      // TODO: Implement chart annotations
      console.log('Adding annotation:', { time, price, text });
    },
    resetView: () => {
      // TODO: Implement chart reset
      console.log('Resetting chart view');
    }
  }), []);

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue: PoolContextType = useMemo(() => ({
    poolAddress,
    poolConfig,
    lookbackPeriod,
    setLookbackPeriod,
    updateLookbackPeriod,
    refreshData,
    chartControls
  }), [poolAddress, poolConfig, lookbackPeriod, setLookbackPeriod, updateLookbackPeriod, refreshData, chartControls, refreshKey]);

  return (
    <PoolContext.Provider value={contextValue}>
      {children}
    </PoolContext.Provider>
  );
}

export function usePoolContext() {
  const context = useContext(PoolContext);
  if (context === undefined) {
    throw new Error('usePoolContext must be used within a PoolProvider');
  }
  return context;
}