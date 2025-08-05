'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PoolData } from '@/types/ai';

interface PoolRecommendationCardsProps {
  pools: PoolData[];
}

export default function PoolRecommendationCards({ pools }: PoolRecommendationCardsProps) {
  const router = useRouter();

  const handlePoolClick = (poolAddress: string) => {
    router.push(`/chat/${poolAddress}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="grid gap-3 mt-4">
      {pools.map((pool, index) => {
        const isRecommended = index === 0; // First pool is most recommended
        
        return (
          <button
            key={pool.address}
            onClick={() => handlePoolClick(pool.address)}
            className={`p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left border ${
              isRecommended
                ? 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary'
                : 'bg-muted/50 hover:bg-muted border-border text-foreground hover:border-primary/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{pool.token0}/{pool.token1}</span>
                {isRecommended && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    ⭐ Recommended
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(pool.volume24h)} Vol
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>Fees: {formatNumber(pool.fees24h)}</span>
              <span>Volatility: {pool.volatility.toFixed(1)}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}