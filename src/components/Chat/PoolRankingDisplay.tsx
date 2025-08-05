'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap } from 'lucide-react';
import { PoolData } from '@/types/ai';

interface PoolRankingProps {
  pools: PoolData[];
  rankings?: number[];
  explanation?: string;
}

export default function PoolRankingDisplay({ pools, rankings, explanation }: PoolRankingProps) {
  // If rankings are provided, sort pools by ranking, otherwise show original order
  const sortedPools = rankings 
    ? pools.map((pool, index) => ({ pool, ranking: rankings[index] || index + 1 }))
        .sort((a, b) => a.ranking - b.ranking)
        .map(item => item.pool)
    : pools;

  const getRankingColor = (index: number) => {
    if (index === 0) return 'text-green-600 bg-green-50 border-green-200';
    if (index === 1) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (index === 2) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRankingBadge = (index: number) => {
    if (index === 0) return '🥇 Best Match';
    if (index === 1) return '🥈 Good Option';
    if (index === 2) return '🥉 Consider';
    return `#${index + 1}`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      {explanation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-zen">{explanation}</p>
        </div>
      )}
      
      <div className="space-y-3">
        {sortedPools.map((pool, index) => (
          <div
            key={pool.address}
            className={`p-4 border rounded-lg transition-all hover:shadow-sm ${getRankingColor(index)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-lg font-zen">
                  {pool.token0}/{pool.token1}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankingColor(index)}`}>
                  {getRankingBadge(index)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">APY</div>
                <div className="font-bold text-lg">{pool.apy.toFixed(1)}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">TVL</div>
                  <div className="font-semibold">{formatCurrency(pool.tvl)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Volume 24h</div>
                  <div className="font-semibold">{formatCurrency(pool.volume24h)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Fees 24h</div>
                  <div className="font-semibold">{formatCurrency(pool.fees24h)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pool.volatility > 50 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <div>
                  <div className="text-xs text-gray-500">Volatility</div>
                  <div className="font-semibold">{pool.volatility.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <button 
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                onClick={() => {
                  // Navigate to pool analysis page
                  window.location.href = `/chat/${pool.address}`;
                }}
              >
                Analyze This Pool →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}