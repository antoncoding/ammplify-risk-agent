import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllPools, PoolConfig } from '@/config/pools';

export default function MarketSelection() {
  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [isLoading, setIsLoading] = useState<string>('');
  
  const markets = getAllPools();

  const handleMarketSelect = (poolAddress: string) => {
    setSelectedMarket(poolAddress);
    setIsLoading(poolAddress);
    
    // Simulate loading and then navigate
    setTimeout(() => {
      router.push(`/chat/${poolAddress}`);
    }, 800);
  };

  if (isLoading) {
    const loadingMarket = markets.find(m => m.address === isLoading);
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium mb-2">Loading {loadingMarket?.name}</div>
          <div className="text-sm text-muted-foreground">
            Preparing market data and analysis tools...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <div className="text-sm text-muted-foreground">
            Choose a trading pair to start analyzing
          </div>
        </div>
        <Select value={selectedMarket} onValueChange={handleMarketSelect}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select a market to analyze" />
          </SelectTrigger>
          <SelectContent>
            {markets.map((market) => (
              <SelectItem key={market.address} value={market.address}>
                <div className="flex flex-col">
                  <span className="font-medium">{market.name}</span>
                  <span className="text-xs text-muted-foreground">{market.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}