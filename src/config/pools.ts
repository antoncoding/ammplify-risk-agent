import { getTokenBySymbol, getTokenByAddress, TokenConfig } from './tokens';

// Whitelisted pools configuration
export type PoolConfig = {
  address: string;
  token0: string; // Token address
  token1: string; // Token address
  feeTier: number; // in basis points
  description?: string;
};

export type PoolWithTokens = PoolConfig & {
  token0Config: TokenConfig;
  token1Config: TokenConfig;
  displayName: string; // Dynamic name like "WETH/USDC"
};

export const WHITELISTED_POOLS: Record<string, PoolConfig> = {
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640': {
    address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    feeTier: 500, // 0.05%
    description: 'Most liquid ETH/USDC pair on Uniswap V3'
  },
  '0x11b815efb8f581194ae79006d24e0d814b7697f6': {
    address: '0x11b815efb8f581194ae79006d24e0d814b7697f6',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    feeTier: 500, // 0.05%
    description: 'High volume ETH/USDT trading pair'
  },
  '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35': {
    address: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35',
    token0: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    feeTier: 500, // 0.05%
    description: 'Bitcoin exposure through WBTC/USDC pair'
  },
  '0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf': {
    address: '0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf',
    token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    feeTier: 100, // 0.01%
    description: 'Low-fee stablecoin pair for arbitrage'
  },
};

export function getPoolConfig(poolAddress: string): PoolConfig | null {
  return WHITELISTED_POOLS[poolAddress] || null;
}

export function getPoolWithTokens(poolAddress: string): PoolWithTokens | null {
  const poolConfig = getPoolConfig(poolAddress);
  if (!poolConfig) return null;

  const token0Config = getTokenByAddress(poolConfig.token0);
  const token1Config = getTokenByAddress(poolConfig.token1);

  if (!token0Config || !token1Config) {
    console.error(`Invalid tokens for pool ${poolAddress}: ${poolConfig.token0}/${poolConfig.token1}`);
    return null;
  }

  return {
    ...poolConfig,
    token0Config,
    token1Config,
    displayName: `${token0Config.symbol}/${token1Config.symbol}`
  };
}

export function getAllPools(): PoolConfig[] {
  return Object.values(WHITELISTED_POOLS);
}

export function getAllPoolsWithTokens(): PoolWithTokens[] {
  return Object.keys(WHITELISTED_POOLS)
    .map(address => getPoolWithTokens(address))
    .filter((pool): pool is PoolWithTokens => pool !== null);
}

export function isValidPool(poolAddress: string): boolean {
  return poolAddress in WHITELISTED_POOLS;
}

export function formatFeeTier(feeTier: number): string {
  return `${feeTier / 100}%`;
}