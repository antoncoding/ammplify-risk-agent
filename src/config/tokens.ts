import { mainnet } from 'viem/chains';

export enum TokenPeg {
  USD = 'USD',
  ETH = 'ETH',
  BTC = 'BTC',
}

export type TokenConfig = {
  symbol: string;
  name: string;
  img: string | undefined;
  decimals: number;
  address: string; // Mainnet address for now
  peg?: TokenPeg;
};

// Supported tokens - only WETH, WBTC, USDC, USDT as requested
export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
  'WETH': {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    img: '/tokens/weth.webp',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    peg: TokenPeg.ETH,
  },
  'WBTC': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    img: '/tokens/wbtc.png',
    decimals: 8,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    peg: TokenPeg.BTC,
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    img: '/tokens/usdc.webp',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    peg: TokenPeg.USD,
  },
  'USDT': {
    symbol: 'USDT',
    name: 'Tether USD',
    img: '/tokens/usdt.webp',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    peg: TokenPeg.USD,
  },
};

// Helper functions
export function getTokenBySymbol(symbol: string): TokenConfig | null {
  return SUPPORTED_TOKENS[symbol.toUpperCase()] || null;
}

export function getTokenByAddress(address: string): TokenConfig | null {
  return Object.values(SUPPORTED_TOKENS).find(
    token => token.address.toLowerCase() === address.toLowerCase()
  ) || null;
}

export function getAllTokens(): TokenConfig[] {
  return Object.values(SUPPORTED_TOKENS);
}

export function isValidToken(symbolOrAddress: string): boolean {
  const bySymbol = getTokenBySymbol(symbolOrAddress);
  const byAddress = getTokenByAddress(symbolOrAddress);
  return !!(bySymbol || byAddress);
}