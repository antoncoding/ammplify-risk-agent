import { useEffect, useState } from 'react';
import { poolHourDataQuery } from '@/queries/uniswap';

export interface PricePoint {
  timestamp: number;
  price: number;
}

interface UseUniswapPriceHistoryOptions {
  poolAddress: string;
  apiKey: string;
  subgraphId?: string; // default to the provided one
  limit?: number;
}

const DEFAULT_SUBGRAPH_ID = '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV';
const BATCH_SIZE = 1000;

export function useUniswapPriceHistory({ poolAddress, apiKey, subgraphId = DEFAULT_SUBGRAPH_ID, limit = 240 } : UseUniswapPriceHistoryOptions) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poolAddress || !apiKey) return;
    setLoading(true);
    setError(null);
    const endpoint = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
    const totalBatches = Math.ceil(limit / BATCH_SIZE);
    let allPoints: PricePoint[] = [];
    let cancelled = false;

    async function fetchAllBatches() {
      for (let batch = 0; batch < totalBatches; batch++) {
        const first = Math.min(BATCH_SIZE, limit - batch * BATCH_SIZE);
        const skip = batch * BATCH_SIZE;
        const query = poolHourDataQuery(poolAddress, first, skip);
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          });
          const json = await res.json();
          const points = (json.data?.poolHourDatas || []).map((d: any) => ({
            timestamp: Number(d.periodStartUnix),
            price: Number(d.token0Price),
          }));
          allPoints = allPoints.concat(points);
          if (points.length < first) break; // No more data
        } catch (err: any) {
          if (!cancelled) setError(err.message || 'Unknown error');
          setLoading(false);
          return;
        }
      }
      if (!cancelled) {
        // Sort and dedupe by timestamp
        const sorted = allPoints
          .slice()
          .sort((a, b) => a.timestamp - b.timestamp)
          .filter((point, idx, arr) => idx === 0 || point.timestamp !== arr[idx - 1].timestamp);
        setData(sorted);
        setLoading(false);
      }
    }
    fetchAllBatches();
    return () => { cancelled = true; };
  }, [poolAddress, apiKey, subgraphId, limit]);

  return { data, loading, error };
} 