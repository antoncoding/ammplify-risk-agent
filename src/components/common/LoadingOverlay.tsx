'use client';

import React from 'react';
import { TokenIcon } from '@/components/common/TokenIcon';
import { getAllPoolsWithTokens } from '@/config/pools';

// Generic loading overlay types
export type LoadingOverlayType = 
  | { type: 'pool-navigation'; poolId: string }
  | { type: 'general'; title: string; message: string }
  | { type: 'pools-loading' }
  | { type: 'ai-analyzing' };

type LoadingOverlayProps = {
  loadingState: LoadingOverlayType;
  className?: string;
};

/**
 * Shared loading overlay component that matches MarketSelection's loading design
 * Can be used by any component that needs to show loading states
 * Designed to be shown in main content areas, not just footers
 */
export default function LoadingOverlay({ loadingState, className = "w-full max-w-md mx-auto" }: LoadingOverlayProps) {
  
  if (loadingState.type === 'pool-navigation') {
    const markets = getAllPoolsWithTokens();
    const loadingMarket = markets.find(m => m.address.toLowerCase() === loadingState.poolId.toLowerCase());
    
    return (
      <div className={className}>
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {loadingMarket && (
              <div className="flex items-center gap-1">
                <TokenIcon 
                  address={loadingMarket.token0Config.address} 
                  chainId={1} 
                  width={24} 
                  height={24}
                />
                <TokenIcon 
                  address={loadingMarket.token1Config.address} 
                  chainId={1} 
                  width={24} 
                  height={24}
                />
              </div>
            )}
            <div className="text-lg font-medium">Loading {loadingMarket?.displayName}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Preparing market data and analysis tools...
          </div>
        </div>
      </div>
    );
  }

  if (loadingState.type === 'general') {
    return (
      <div className={className}>
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium mb-2">{loadingState.title}</div>
          <div className="text-sm text-muted-foreground">{loadingState.message}</div>
        </div>
      </div>
    );
  }

  if (loadingState.type === 'pools-loading') {
    return (
      <div className={className}>
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium mb-2">Loading Pools</div>
          <div className="text-sm text-muted-foreground">
            Fetching pool data and metrics...
          </div>
        </div>
      </div>
    );
  }

  if (loadingState.type === 'ai-analyzing') {
    return (
      <div className={className}>
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium mb-2">AI Analyzing</div>
          <div className="text-sm text-muted-foreground">
            Processing your request and generating insights...
          </div>
        </div>
      </div>
    );
  }

  return null;
}