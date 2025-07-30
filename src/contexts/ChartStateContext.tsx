import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
  setTimeHorizon: (days: number) => void;
  setPredictionFromDriftVol: (drift: number, vol: number, timeHorizon: number) => void;
  setDriftVolFromPrediction: (min: number, max: number, timeHorizon: number) => void;
};

const ChartStateContext = createContext<ChartState | undefined>(undefined);

export function ChartStateProvider({ children }: { children: React.ReactNode }) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [userPrediction, setUserPrediction] = useState<UserPrediction>({ min: 0, max: 0, timeHorizon: 30 });
  const [volatility, setVolatility] = useState<number>(0);
  const [drift, setDrift] = useState<number>(0);

  // Helper: convert drift/vol -> min/max prediction (1 stddev range, geometric Brownian motion)
  const setPredictionFromDriftVol = useCallback((drift: number, vol: number, timeHorizon: number) => {
    if (!currentPrice || timeHorizon <= 0) return;
    const t = timeHorizon / 365;
    // 1 stddev up/down from expected value
    const expected = currentPrice * Math.exp(drift * t);
    const stddev = vol * Math.sqrt(t);
    const min = expected * Math.exp(-stddev);
    const max = expected * Math.exp(stddev);
    setUserPrediction({ min, max, timeHorizon });
    setVolatility(vol);
    setDrift(drift);
  }, [currentPrice]);

  // Helper: convert min/max prediction -> drift/vol (assume symmetric, solve for drift/vol)
  const setDriftVolFromPrediction = useCallback((min: number, max: number, timeHorizon: number) => {
    if (!currentPrice || timeHorizon <= 0 || min <= 0 || max <= 0) return;
    const t = timeHorizon / 365;
    // Estimate expected = sqrt(min*max), stddev = (ln(max/min))/2
    const expected = Math.sqrt(min * max);
    const stddev = Math.log(max / min) / 2;
    const drift = Math.log(expected / currentPrice) / t;
    const vol = stddev / Math.sqrt(t);
    setUserPrediction({ min, max, timeHorizon });
    setVolatility(vol);
    setDrift(drift);
  }, [currentPrice]);

  const setTimeHorizon = useCallback((days: number) => {
    setUserPrediction(pred => ({ ...pred, timeHorizon: days }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
    setTimeHorizon,
    setPredictionFromDriftVol,
    setDriftVolFromPrediction,
  }), [priceHistory, currentPrice, userPrediction, volatility, drift, setPriceHistory, setCurrentPrice, setUserPrediction, setVolatility, setDrift, setTimeHorizon, setPredictionFromDriftVol, setDriftVolFromPrediction]);

  return (
    <ChartStateContext.Provider value={contextValue}>
      {children}
    </ChartStateContext.Provider>
  );
};

export const useChartState = () => {
  const context = useContext(ChartStateContext);
  if (!context) throw new Error('useChartState must be used within a ChartStateProvider');
  return context;
}; 