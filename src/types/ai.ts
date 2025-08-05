export enum AgentRole {
  POOL_SELECTION = 'pool-selection',
  RANGE_ANALYSIS = 'range-analysis'
}

export interface ChatRequest {
  message: string;
  role: AgentRole;
  context?: any;
  poolData?: PoolData[]; // For pool selection agent
}

export interface ChatResponse {
  response: string;
  toolCalls?: ToolCall[];
  role: AgentRole;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface PoolData {
  address: string;
  token0: string;
  token1: string;
  tvl: number;
  volume24h: number;
  apy: number;
  fees24h: number;
  volatility: number;
}

export interface RangeData {
  minPrice: number;
  maxPrice: number;
  timeframe: string;
  confidence: number;
}