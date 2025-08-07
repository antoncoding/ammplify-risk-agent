export type PoolAnalysisRequest = {
  poolAddress: string;
  timeframe?: '1d' | '7d' | '30d';
}

export type PoolAnalysisResponse = {
  tvl: string;
  volume24h: string;
  apy: string;
  riskScore: number;
  recommendation: string;
}

export type RiskAnalysisRequest = {
  token0: string;
  token1: string;
  amount: number;
}

export type RiskAnalysisResponse = {
  impermanentLoss: string;
  volatilityRisk: string;
  liquidityRisk: string;
  overallRisk: number;
}

export type YieldAnalysisRequest = {
  poolAddress: string;
  amount: number;
  duration: number;
}

export type YieldAnalysisResponse = {
  projectedYield: string;
  dailyYield: string;
  feeAPR: string;
  totalAPY: string;
}