import { PoolData } from '@/types/ai';
import { poolsDataQuery, poolDataQuery } from '@/queries/uniswap';
import { SUBGRAPH_CONFIG, WHITELISTED_POOL_ADDRESSES } from '@/config/pools';

export interface PoolMetrics {
  address: string;
  volume24h: number;
  fees24h: number;
  volatility: number;
  priceChange24h: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

// Get the appropriate subgraph URL (with API key if available)
const getSubgraphUrl = () => {
  const apiKey = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY;
  return SUBGRAPH_CONFIG.getGatewayUrl(apiKey);
};

interface SubgraphPoolResponse {
  pools: Array<{
    id: string;
    feeTier: string;
    token0: {
      id: string;
      symbol: string;
    };
    token1: {
      id: string;
      symbol: string;
    };
    sqrtPrice: string;
    liquidity: string;
    poolHourData: Array<{
      volumeUSD: string;
      volumeToken0: string;
      volumeToken1: string;
    }>;
    poolDayData: Array<{
      volumeUSD: string;
      volumeToken0: string;
      volumeToken1: string;
      date: number;
      feesUSD: string;
    }>;
  }>;
}

async function querySubgraph(query: string): Promise<any> {
  console.log('🔍 Querying subgraph with query length:', query.length);
  
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(getSubgraphUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('📡 Subgraph response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Subgraph data structure:', {
      hasData: !!data.data,
      hasErrors: !!data.errors,
      poolsCount: data.data?.pools?.length || 0
    });
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏰ Subgraph query timed out');
      throw new Error('Subgraph query timed out');
    }
    console.error('💥 Subgraph query error:', error);
    throw error;
  }
}



function calculateVolatility(poolDayData: any[]): number {
  if (poolDayData.length < 2) return 0;
  
  const volumes = poolDayData.map(day => parseFloat(day.volumeUSD));
  const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const variance = volumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / volumes.length;
  
  return Math.sqrt(variance) / mean * 100; // Volatility as percentage
}

function calculateAPY(fees24h: number, tvl: number): number {
  if (tvl === 0) return 0;
  return (fees24h * 365 / tvl) * 100; // Annualized fee yield
}

// No fallback data - fail properly if subgraph is down

// Main function to get all pools data
export async function getAllPoolsData(): Promise<PoolData[]> {
  console.log('🚀 Starting to fetch all pools data...');
  
  try {
    const query = poolsDataQuery(WHITELISTED_POOL_ADDRESSES);
    console.log('📝 Generated query for pools:', WHITELISTED_POOL_ADDRESSES);
    
    const response: SubgraphPoolResponse = await querySubgraph(query);
    
    if (!response || !response.pools || response.pools.length === 0) {
      console.error('❌ No pools data received from subgraph');
      return [];
    }

    console.log(`✅ Received ${response.pools.length} pools from subgraph`);

    const processedPools = response.pools.map(pool => {
      console.log('🔄 Processing pool:', pool.id);
      
      // Always use index 1 (last completed day) - only fallback to 0 if only one data point exists
      const latestDayData = pool.poolDayData.length > 1 ? pool.poolDayData[1] : pool.poolDayData[0];
      const volume24h = latestDayData ? parseFloat(latestDayData.volumeUSD) : 0;
      const fees24h = latestDayData ? parseFloat(latestDayData.feesUSD) : 0;
      
      const volatility = calculateVolatility(pool.poolDayData);

      console.log(`📊 Pool ${pool.token0.symbol}/${pool.token1.symbol}: Volume=$${volume24h.toLocaleString()}`);

      return {
        address: pool.id,
        token0: pool.token0.symbol,
        token1: pool.token1.symbol,
        volume24h,
        fees24h,
        volatility
      };
    });
    
    console.log(`🎯 Returning ${processedPools.length} valid pools`);
    return processedPools;
    
  } catch (error) {
    console.error('💥 Failed to fetch pools data from subgraph:', error);
    throw error; // Let the error bubble up instead of using fallback
  }
}

export async function getPoolMetrics(poolAddress: string): Promise<PoolMetrics> {
  try {
    const query = poolsDataQuery([poolAddress]);
    const response: SubgraphPoolResponse = await querySubgraph(query);

    const pool = response.pools[0];
    if (!pool) {
      throw new Error(`Pool ${poolAddress} not found`);
    }

    // Always use index 1 (last completed day) - only fallback to 0 if only one data point exists
    const latestDayData = pool.poolDayData.length > 1 ? pool.poolDayData[1] : pool.poolDayData[0];
    
    const volume24h = latestDayData ? parseFloat(latestDayData.volumeUSD) : 0;
    const fees24h = latestDayData ? parseFloat(latestDayData.feesUSD) : 0;
    const volatility = calculateVolatility(pool.poolDayData);
    
    // No price change calculation needed - just use the last completed day data
    const priceChange24h = 0;

    return {
      address: pool.id,
      volume24h,
      fees24h,
      volatility,
      priceChange24h
    };
  } catch (error) {
    console.error(`Failed to fetch metrics for pool ${poolAddress}:`, error);
    throw error;
  }
}

// Individual metric functions - these now use the main query and cache results
let poolsCache: PoolData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedPoolsData(): Promise<PoolData[]> {
  const now = Date.now();
  if (!poolsCache || (now - cacheTimestamp) > CACHE_DURATION) {
    poolsCache = await getAllPoolsData();
    cacheTimestamp = now;
  }
  return poolsCache;
}

export async function getPoolVolume(poolAddress: string): Promise<number> {
  const pools = await getCachedPoolsData();
  const pool = pools.find(p => p.address.toLowerCase() === poolAddress.toLowerCase());
  return pool?.volume24h || 0;
}



export async function getPoolFees(poolAddress: string): Promise<number> {
  const pools = await getCachedPoolsData();
  const pool = pools.find(p => p.address.toLowerCase() === poolAddress.toLowerCase());
  return pool?.fees24h || 0;
}



export async function getPoolVolatility(poolAddress: string): Promise<number> {
  const pools = await getCachedPoolsData();
  const pool = pools.find(p => p.address.toLowerCase() === poolAddress.toLowerCase());
  return pool?.volatility || 0;
}

export async function getPoolTokens(poolAddress: string): Promise<{ token0: TokenInfo; token1: TokenInfo }> {
  try {
    const query = poolsDataQuery([poolAddress]);
    const response: SubgraphPoolResponse = await querySubgraph(query);

    const pool = response.pools[0];
    if (!pool) {
      throw new Error(`Pool ${poolAddress} not found`);
    }

    // Token info with basic details - could be expanded with token registry
    return {
      token0: {
        address: pool.token0.id,
        symbol: pool.token0.symbol,
        name: pool.token0.symbol, // Using symbol as name for now
        decimals: 18 // Default decimals, could be fetched separately
      },
      token1: {
        address: pool.token1.id,
        symbol: pool.token1.symbol,
        name: pool.token1.symbol,
        decimals: 18
      }
    };
  } catch (error) {
    console.error(`Failed to fetch tokens for pool ${poolAddress}:`, error);
    throw error;
  }
}

export async function getCurrentPrice(poolAddress: string): Promise<number> {
  try {
    const query = poolsDataQuery([poolAddress]);
    const response: SubgraphPoolResponse = await querySubgraph(query);

    const pool = response.pools[0];
    if (!pool) {
      throw new Error(`Pool ${poolAddress} not found`);
    }

    // Convert sqrtPrice to actual price
    // sqrtPrice is the square root of the price ratio (token1/token0)
    const sqrtPrice = parseFloat(pool.sqrtPrice);
    const price = Math.pow(sqrtPrice / Math.pow(2, 96), 2);
    
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for pool ${poolAddress}:`, error);
    // Return a default price to prevent errors
    return 1;
  }
}