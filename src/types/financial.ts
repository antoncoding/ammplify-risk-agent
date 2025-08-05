export interface PoolAnalysisRequest {
  poolAddress: string;
  timeframe?: '1d' | '7d' | '30d';
}

export interface PoolAnalysisResponse {
  tvl: string;
  volume24h: string;
  apy: string;
  riskScore: number;
  recommendation: string;
}

export interface RiskAnalysisRequest {
  token0: string;
  token1: string;
  amount: number;
}

export interface RiskAnalysisResponse {
  impermanentLoss: string;
  volatilityRisk: string;
  liquidityRisk: string;
  overallRisk: number;
}

export interface YieldAnalysisRequest {
  poolAddress: string;
  amount: number;
  duration: number;
}

export interface YieldAnalysisResponse {
  projectedYield: string;
  dailyYield: string;
  feeAPR: string;
  totalAPY: string;
}