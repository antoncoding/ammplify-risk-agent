import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Market {
  id: string;
  name: string;
  pair: string;
  description: string;
}

const MARKETS: Market[] = [
  {
    id: 'eth-usdc',
    name: 'ETH/USDC',
    pair: 'ETH-USDC',
    description: 'Ethereum vs USD Coin trading pair'
  },
  {
    id: 'btc-usdc',
    name: 'BTC/USDC', 
    pair: 'BTC-USDC',
    description: 'Bitcoin vs USD Coin trading pair'
  },
  {
    id: 'sol-usdc',
    name: 'SOL/USDC',
    pair: 'SOL-USDC', 
    description: 'Solana vs USD Coin trading pair'
  }
];

export default function MarketSelection() {
  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [isLoading, setIsLoading] = useState<string>('');

  const handleMarketSelect = (marketId: string) => {
    setSelectedMarket(marketId);
    setIsLoading(marketId);
    
    // Simulate loading and then navigate
    setTimeout(() => {
      router.push(`/chat/${marketId}`);
    }, 800);
  };

  if (isLoading) {
    const loadingMarket = MARKETS.find(m => m.id === isLoading);
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
            {MARKETS.map((market) => (
              <SelectItem key={market.id} value={market.id}>
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