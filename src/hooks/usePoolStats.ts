import { useState, useEffect } from 'react';
import { poolDataQuery } from '@/queries/uniswap';

export type LookbackPeriod = '3 months' | '2 months' | '1 month' | '2 weeks' | '1 week';

export type PoolStats = {
  volume: number;
  fees: number;
  feeRate: number;
  high: number;
  low: number;
  growth: number;
  volatility: number;
  startDate: string;
  endDate: string;
};

export type PoolData = {
  id: string;
  feeTier: string;
  token0: {
    id: string;
    symbol: string;
  };
  token1: {
    id: string;
    symbol: string;
  };
  poolDayData: {
    volumeUSD: string;
    volumeToken0: string;
    volumeToken1: string;
    date: number;
    feesUSD: string;
    high: string;
    low: string;
    open: string;
    close: string;
  }[];
};

type UsePoolStatsOptions = {
  poolAddress: string;
  apiKey?: string;
  lookbackPeriod?: LookbackPeriod;
};

const DEFAULT_SUBGRAPH_ID = '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV';

// Convert lookback period to days
const getDaysFromLookbackPeriod = (period: LookbackPeriod): number => {
  switch (period) {
    case '3 months': return 90;
    case '2 months': return 60;
    case '1 month': return 30;
    case '2 weeks': return 14;
    case '1 week': return 7;
    default: return 90;
  }
};

export function usePoolStats({ poolAddress, apiKey, lookbackPeriod = '3 months' }: UsePoolStatsOptions) {
  const [stats, setStats] = useState<PoolStats>({
    volume: 0,
    fees: 0,
    feeRate: 0.003,
    high: 0,
    low: 0,
    growth: 0,
    volatility: 0,
    startDate: '',
    endDate: ''
  });
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poolAddress || !apiKey) return;

    setLoading(true);
    setError(null);

    const fetchPoolData = async () => {
      try {
        const endpoint = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${DEFAULT_SUBGRAPH_ID}`;
        const query = poolDataQuery(poolAddress);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        
        if (json.errors) {
          throw new Error(json.errors[0]?.message ?? 'GraphQL error');
        }

        const pool = json.data?.pool;
        if (!pool) {
          throw new Error('Pool not found');
        }

        setPoolData(pool);

        const feeRate = parseInt(pool.feeTier) / 1000000; // Convert from basis points to decimal
        const daysToLookback = getDaysFromLookbackPeriod(lookbackPeriod);
        
        // Filter data based on lookback period
        const filteredData = pool.poolDayData.slice(0, daysToLookback);
        
        if (filteredData.length > 0) {
          // Aggregate volume and fees
          const volume = filteredData.reduce((sum: number, day: any) => sum + parseFloat(day.volumeUSD), 0);
          const fees = filteredData.reduce((sum: number, day: any) => sum + parseFloat(day.feesUSD), 0);
          
          // Calculate high/low prices
          const prices = filteredData.flatMap((day: any) => [
            parseFloat(day.high),
            parseFloat(day.low),
            parseFloat(day.open),
            parseFloat(day.close)
          ]).filter((price: number) => !isNaN(price) && price > 0);
          
          const high = Math.max(...prices);
          const low = Math.min(...prices);
          
          // Calculate growth (percentage change from start to end)
          const startPrice = parseFloat(filteredData[filteredData.length - 1]?.close || '0');
          const endPrice = parseFloat(filteredData[0]?.close || '0');
          const growth = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
          
          // Calculate volatility (standard deviation of daily returns)
          const dailyReturns = filteredData
            .map((day: any) => parseFloat(day.close))
            .filter((price: number) => !isNaN(price) && price > 0)
            .map((price: number, index: number, prices: number[]) => {
              if (index === 0) return 0;
              const prevPrice = prices[index - 1];
              return prevPrice > 0 ? (price - prevPrice) / prevPrice : 0;
            })
            .filter((return_: number) => return_ !== 0);
          
          const meanReturn = dailyReturns.reduce((sum: number, ret: number) => sum + ret, 0) / dailyReturns.length;
          const variance = dailyReturns.reduce((sum: number, ret: number) => sum + Math.pow(ret - meanReturn, 2), 0) / dailyReturns.length;
          const volatility = Math.sqrt(variance) * 100; // Convert to percentage
          
          // Format dates
          const startDate = new Date(filteredData[filteredData.length - 1]?.date * 1000).toLocaleDateString();
          const endDate = new Date(filteredData[0]?.date * 1000).toLocaleDateString();

          setStats({
            volume,
            fees,
            feeRate,
            high,
            low,
            growth,
            volatility,
            startDate,
            endDate
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pool stats');
        console.error('Error fetching pool data:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchPoolData();
  }, [poolAddress, apiKey, lookbackPeriod]);

  return { stats, poolData, loading, error };
} 