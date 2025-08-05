// Shared subgraph configuration
export const SUBGRAPH_CONFIG = {
  // Default subgraph ID for The Graph hosted service
  SUBGRAPH_ID: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
  
  // Free public endpoint (rate limited)
  PUBLIC_URL: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  
  // Gateway URL template - requires API key
  getGatewayUrl: (apiKey?: string) => 
    apiKey ? `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${SUBGRAPH_CONFIG.SUBGRAPH_ID}` 
           : SUBGRAPH_CONFIG.PUBLIC_URL
};

// Whitelisted pool addresses
export const WHITELISTED_POOLS = [
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', // USDC/WETH 0.05%
  '0xcbcdf9626bc03e24f779434178a73a0b4bad62ed', // WBTC/WETH 0.3%
  '0x5777d92f208679db4b9778590fa3cab3ac9e2168', // DAI/USDC 0.01%
  '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', // WETH/USDT 0.3%
  '0x11b815efb8f581194ae79006d24e0d814b7697f6', // WETH/USDT 0.05%
  '0x60594a405d53811d3bc4766596efd80fd545a270', // WETH/DAI 0.3%
];