'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { UIComponent, PoolRecommendationComponent, ButtonListComponent } from '@/types/agent-responses';
import { PoolData } from '@/types/ai';
import { getPoolWithTokens } from '@/config/pools';
import { TokenIcon } from '@/components/common/TokenIcon';

// Legacy component type for backward compatibility
export type GenerativeUIAction = {
  id: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
};

export type GenerativeUIComponent = {
  type: 'buttonList';
  title?: string;
  actions: GenerativeUIAction[];
};

type GenerativeUIProps = {
  component: GenerativeUIComponent | UIComponent;
  poolData?: PoolData[]; // Available pool data for lookups
  onAction?: (message: string) => void; // Callback for sending messages
  loadingSuggestion?: string | null; // ID of currently loading suggestion
  onPoolNavigation?: (poolId: string) => void; // Callback for pool navigation loading
}

export default function GenerativeUI({ component, poolData = [], onAction, loadingSuggestion, onPoolNavigation }: GenerativeUIProps) {
  const router = useRouter();
  const [loadingPoolId, setLoadingPoolId] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const handlePoolNavigation = (poolId: string) => {
    if (onPoolNavigation) {
      // Let the parent component handle navigation and loading state
      onPoolNavigation(poolId);
    } else {
      // Fallback to local loading state if no callback provided
      setLoadingPoolId(poolId);
      setTimeout(() => {
        try {
          router.push(`/analysis/${poolId}`);
        } catch (error) {
          console.error('Navigation error:', error);
          setLoadingPoolId(null);
        }
      }, 800);
    }
  };

  // Handle pool recommendations from structured agent response
  if (component.type === 'poolRecommendations') {
    const poolComp = component as PoolRecommendationComponent;
    
    return (
      <div className="space-y-3">
        {poolComp.title && (
          <div className="text-sm font-medium text-muted-foreground">
            {poolComp.title}
          </div>
        )}
        {poolComp.description && (
          <div className="text-xs text-muted-foreground">
            {poolComp.description}
          </div>
        )}
        <div className="grid gap-3">
          {poolComp.pools.map((poolRec) => {
            // Find the actual pool data by ID
            const pool = poolData?.find(p => p.address.toLowerCase() === poolRec.id.toLowerCase());
            if (!pool) return null;

            const isTopRecommended = poolRec.rank === 1 || poolRec.isRecommended;
            const isLoadingLocal = !onPoolNavigation && loadingPoolId === poolRec.id;
            
            return (
              <button
                key={poolRec.id}
                onClick={() => handlePoolNavigation(poolRec.id)}
                disabled={isLoadingLocal}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left border relative ${
                  isTopRecommended
                    ? 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary'
                    : 'bg-muted/50 hover:bg-muted border-border text-foreground hover:border-primary/20'
                } ${isLoadingLocal ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoadingLocal && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const poolWithTokens = getPoolWithTokens(pool.address);
                      return poolWithTokens ? (
                        <div className="flex items-center gap-1">
                          <TokenIcon 
                            address={poolWithTokens.token0Config.address} 
                            chainId={1} 
                            width={20} 
                            height={20}
                          />
                          <TokenIcon 
                            address={poolWithTokens.token1Config.address} 
                            chainId={1} 
                            width={20} 
                            height={20}
                          />
                        </div>
                      ) : null;
                    })()}
                    <span className="font-medium">{pool.token0}/{pool.token1}</span>
                    {isTopRecommended && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                        ⭐ Recommended
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      #{poolRec.rank}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(pool.volume24h)} Vol
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {poolRec.reasoning}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Fees: {formatNumber(pool.fees24h)}</span>
                  <span>Volatility: {pool.volatility.toFixed(1)}%</span>
                  <span>Confidence: {poolRec.confidence}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Handle button lists from structured agent response
  if (component.type === 'buttonList' && 'buttons' in component) {
    const buttonComp = component as ButtonListComponent;
    
    return (
      <div className="space-y-3">
        {buttonComp.title && (
          <div className="text-sm font-medium text-muted-foreground">
            {buttonComp.title}
          </div>
        )}
        {buttonComp.description && (
          <div className="text-xs text-muted-foreground">
            {buttonComp.description}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {buttonComp.buttons.map((button) => (
            <button
              key={button.id}
              onClick={() => onAction?.(button.action)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                button.variant === 'primary'
                  ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary'
                  : 'bg-muted/50 hover:bg-muted border border-border text-foreground hover:border-primary/20'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Legacy support for old GenerativeUIComponent format
  if (component.type === 'buttonList' && 'actions' in component) {
    const legacyComp = component as GenerativeUIComponent;
    
    return (
      <div className="space-y-3">
        {legacyComp.title && (
          <div className="text-sm font-medium text-muted-foreground">
            {legacyComp.title}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {legacyComp.actions.map((action) => {
            const isLoading = loadingSuggestion === action.id;
            return (
              <button
                key={action.id}
                onClick={() => action.action()}
                disabled={isLoading || loadingSuggestion !== null}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative ${
                  action.variant === 'primary'
                    ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary'
                    : 'bg-muted/50 hover:bg-muted border border-border text-foreground hover:border-primary/20'
                } ${isLoading || loadingSuggestion !== null ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                <span className={isLoading ? 'opacity-0' : ''}>
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // TODO: Add handler for GenericCardComponent

  return null;
}