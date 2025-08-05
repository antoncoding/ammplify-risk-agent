import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllPoolsWithTokens, formatFeeTier } from '@/config/pools';
import { TokenIcon } from '@/components/TokenIcon';
import { useChatContext } from '@/contexts/ChatContext';

export default function MarketSelection() {
  const router = useRouter();
  const { setIsCollapsed } = useChatContext();
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [isLoading, setIsLoading] = useState<string>('');
  
  const markets = getAllPoolsWithTokens();

  const handleMarketSelect = (poolAddress: string) => {
    setSelectedMarket(poolAddress);
    setIsLoading(poolAddress);
    
    // Simulate loading and then navigate
    setTimeout(() => {
      router.push(`/chat/${poolAddress}`);
    }, 800);
  };

  const handleAskAgent = () => {
    setIsCollapsed(false);
  };

  if (isLoading) {
    const loadingMarket = markets.find(m => m.address === isLoading);
    return (
      <div className="w-full max-w-md mx-auto">
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <div className="text-lg font-semibold mb-2">Pool Selection</div>
          <div className="text-sm text-muted-foreground">
            Choose from top liquidity pools or get personalized recommendations
          </div>
        </div>
        
        <Select value={selectedMarket} onValueChange={handleMarketSelect}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Browse available pools" />
          </SelectTrigger>
          <SelectContent>
            {markets.map((market) => (
              <SelectItem key={market.address} value={market.address}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <TokenIcon 
                        address={market.token0Config.address} 
                        chainId={1} 
                        width={20} 
                        height={20}
                      />
                      <TokenIcon 
                        address={market.token1Config.address} 
                        chainId={1} 
                        width={20} 
                        height={20}
                      />
                    </div>
                    <span className="font-medium">{market.displayName}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {formatFeeTier(market.feeTier)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{market.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-center my-4">
          <div className="flex-1 border-t border-muted"></div>
          <span className="px-3 text-xs text-muted-foreground font-medium">OR</span>
          <div className="flex-1 border-t border-muted"></div>
        </div>

        <button
          onClick={handleAskAgent}
          className="w-full p-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-center gap-2">
            <Bot className="h-4 w-4 text-primary group-hover:animate-pulse" />
            <span className="text-primary font-medium">Ask Agent for Recommendations</span>
          </div>
          <div className="text-xs text-primary/70 mt-1">
            Tell me your risk preferences and get personalized pool suggestions
          </div>
        </button>
      </div>
    </div>
  );
}