// Whitelisted pools configuration
export interface PoolConfig {
  address: string;
  name: string;
  pair: string;
  description: string;
  feeTier?: string;
}

export const WHITELISTED_POOLS: Record<string, PoolConfig> = {
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640': {
    address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    name: 'ETH/USDC',
    pair: 'ETH-USDC',
    description: 'Ethereum vs USD Coin trading pair',
    feeTier: '0.05%'
  },
  '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35': {
    address: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35',
    name: 'BTC/USDC',
    pair: 'BTC-USDC',
    description: 'Bitcoin vs USD Coin trading pair',
    feeTier: '0.05%'
  },
  '0x151bD0b5Cf3c03A5a6C9FA302e6FeF0FBCEe2c6E': {
    address: '0x151bD0b5Cf3c03A5a6C9FA302e6FeF0FBCEe2c6E',
    name: 'SOL/USDC',
    pair: 'SOL-USDC',
    description: 'Solana vs USD Coin trading pair',
    feeTier: '0.25%'
  }
};

export function getPoolConfig(poolAddress: string): PoolConfig | null {
  return WHITELISTED_POOLS[poolAddress] || null;
}

export function getAllPools(): PoolConfig[] {
  return Object.values(WHITELISTED_POOLS);
}

export function isValidPool(poolAddress: string): boolean {
  return poolAddress in WHITELISTED_POOLS;
}