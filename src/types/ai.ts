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
  structuredData?: any; // Structured response from agent tools
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
  volume24h: number;
  fees24h: number;
  volatility: number;
}

export interface RangeData {
  minPrice: number;
  maxPrice: number;
  timeframe: string;
  confidence: number;
}