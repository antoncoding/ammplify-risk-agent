import type { PoolStats } from '@/hooks/usePoolStats';

export type LPAnalysisResult = {
  expectedPNL: number;
  impermanentLoss: number;
  feeIncome: number;
  netPosition: number;
  priceDeviation: number;
  feeAPR: number;
  worstCaseIL: number;
  bestCaseScenario: number;
};

/**
 * Calculates expected PNL for liquidity providers based on market predictions and historical fee data.
 * This function estimates whether current fee rates can cover impermanent loss given predicted price movements.
 */
export function analyzeLiquidityProviderExpectedPNL(
  drift: number,
  volatility: number,
  timeHorizon: number,
  currentPrice: number,
  poolStats: PoolStats,
  positionSize = 10000
): LPAnalysisResult {
  const timeInYears = timeHorizon / 365;
  
  // Calculate expected price movement using geometric Brownian motion
  const expectedPrice = currentPrice * Math.exp(drift * timeInYears);
  const priceRatio = expectedPrice / currentPrice;
  const priceDeviation = Math.abs(1 - priceRatio) * 100; // As percentage
  
  // Calculate impermanent loss using the standard formula
  const sqrt_ratio = Math.sqrt(priceRatio);
  const impermanentLoss = (2 * sqrt_ratio / (1 + priceRatio)) - 1;
  const impermanentLossUSD = positionSize * Math.abs(impermanentLoss);
  
  // Calculate expected fee income based on historical data
  const lookbackDays = Math.min(90, timeHorizon);
  const historicalDailyFees = poolStats.fees / lookbackDays;
  const feeAPR = (poolStats.fees / (poolStats.volume || 1)) * 365 * 100; // As percentage
  
  // Estimate expected fee income with volatility adjustment
  const volatilityMultiplier = 1 + (volatility - 0.2) * 2;
  const expectedDailyFees = historicalDailyFees * Math.max(0.5, volatilityMultiplier);
  const feeIncome = expectedDailyFees * timeHorizon * (positionSize / 1000000);
  
  // Calculate metrics
  const netPosition = feeIncome - impermanentLossUSD;
  const expectedPNL = netPosition / positionSize * 100;
  const worstCaseIL = positionSize * 0.5 * (volatility * Math.sqrt(timeInYears));
  const bestCaseScenario = feeIncome * 1.5;
  
  return {
    expectedPNL,
    impermanentLoss: impermanentLossUSD,
    feeIncome,
    netPosition,
    priceDeviation,
    feeAPR,
    worstCaseIL,
    bestCaseScenario
  };
}