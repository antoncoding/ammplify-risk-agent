export enum AgentRole {
  POOL_SELECTION = 'pool-selection',
  RANGE_ANALYSIS = 'range-analysis'
}

export type ChatRequest = {
  message: string;
  role: AgentRole;
  context?: unknown;
  poolData?: PoolData[]; // For pool selection agent
}

export type ChatResponse = {
  response: string;
  toolCalls?: ToolCall[];
  role: AgentRole;
  structuredData?: unknown; // Structured response from agent tools
}

export type ToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export type PoolData = {
  address: string;
  token0: string;
  token1: string;
  volume24h: number;
  fees24h: number;
  volatility: number;
}

export type RangeData = {
  minPrice: number;
  maxPrice: number;
  timeframe: string;
  confidence: number;
}