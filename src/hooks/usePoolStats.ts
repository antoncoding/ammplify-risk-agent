import { useState, useEffect } from 'react';
import { poolDataQuery } from '@/queries/uniswap';

export type PoolStats = {
  volume: number;
  fees: number;
  feeRate: number;
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
  }[];
};

type UsePoolStatsOptions = {
  poolAddress: string;
  apiKey?: string;
};

const DEFAULT_SUBGRAPH_ID = '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV';

export function usePoolStats({ poolAddress, apiKey }: UsePoolStatsOptions) {
  const [stats, setStats] = useState<PoolStats>({
    volume: 0,
    fees: 0,
    feeRate: 0.003, // Default 0.3% fee rate
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

        // Use the second most recent day data for complete 24-hour metrics
        // The first entry (pool.poolDayData[0]) might be incomplete if it's the current day
        // For example, if it's 8am, the current day data only covers 8 hours
        // The second entry (pool.poolDayData[1]) represents the previous complete 24-hour period
        const completeDayData = pool.poolDayData[1] || pool.poolDayData[0];
        if (completeDayData) {
          const volume = parseFloat(completeDayData.volumeUSD);
          const fees = parseFloat(completeDayData.feesUSD);
          

          setStats({
            volume,
            fees,
            feeRate,
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
  }, [poolAddress, apiKey]);

  return { stats, poolData, loading, error };
} 