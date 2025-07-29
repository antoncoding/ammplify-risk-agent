export type TokenPair = {
  token0: string;
  token1: string;
  symbol0: string;
  symbol1: string;
  pairName: string;
  feeTier?: string;
};

// Mock pool data - in a real implementation, this would be fetched from TheGraph or similar
const POOL_DATA: Record<string, TokenPair> = {
  '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640': {
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', // USDC
    symbol0: 'WETH',
    symbol1: 'USDC',
    pairName: 'WETH/USDC',
    feeTier: '500' // 0.05%
  },
  '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8': {
    token0: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', // USDC
    token1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    symbol0: 'USDC',
    symbol1: 'WBTC',
    pairName: 'USDC/WBTC',
    feeTier: '3000' // 0.3%
  }
};

export function parsePoolAddress(poolAddress: string): TokenPair | null {
  const normalizedAddress = poolAddress.toLowerCase();
  
  // Check if we have data for this pool
  const poolData = POOL_DATA[normalizedAddress];
  if (poolData) {
    return poolData;
  }
  
  // Fallback: return a generic pair based on address
  return {
    token0: '0x0000000000000000000000000000000000000000',
    token1: '0x0000000000000000000000000000000000000000',
    symbol0: 'TOKEN0',
    symbol1: 'TOKEN1',
    pairName: 'TOKEN0/TOKEN1',
    feeTier: '3000' // Default 0.3% fee tier
  };
}

export function formatCurrency(amount: number): string {
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(2)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(2)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(2)}K`;
  } else {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatNumber(num: number): string {
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  } else {
    return num.toLocaleString();
  }
} 