import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PricePoint } from '@/hooks/useUniswapPriceHistory';

// Types for chart state
export type UserPrediction = {
  min: number;
  max: number;
  timeHorizon: number; // in days
};

export type ChartState = {
  priceHistory: PricePoint[];
  currentPrice: number;
  userPrediction: UserPrediction;
  volatility: number;
  drift: number;
  setPriceHistory: (prices: PricePoint[]) => void;
  setCurrentPrice: (price: number) => void;
  setUserPrediction: (prediction: UserPrediction) => void;
  setVolatility: (vol: number) => void;
  setDrift: (drift: number) => void;
};

const ChartStateContext = createContext<ChartState | undefined>(undefined);

export const ChartStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [userPrediction, setUserPrediction] = useState<UserPrediction>({ min: 0, max: 0, timeHorizon: 30 });
  const [volatility, setVolatility] = useState<number>(0);
  const [drift, setDrift] = useState<number>(0);

  return (
    <ChartStateContext.Provider
      value={{
        priceHistory,
        currentPrice,
        userPrediction,
        volatility,
        drift,
        setPriceHistory,
        setCurrentPrice,
        setUserPrediction,
        setVolatility,
        setDrift,
      }}
    >
      {children}
    </ChartStateContext.Provider>
  );
};

export const useChartState = () => {
  const context = useContext(ChartStateContext);
  if (!context) throw new Error('useChartState must be used within a ChartStateProvider');
  return context;
}; 