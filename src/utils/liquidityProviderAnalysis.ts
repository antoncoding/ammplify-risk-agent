import type { PoolStats } from '@/hooks/usePoolStats';
import { 
  calculateMaxPossibleFees, 
  calculateConcentratedPositionFees,
  calculateImpermanentLoss,
  estimateDailyFeeIncome,
  type PoolFeeGrowthState,
  type LiquidityPosition 
} from './uniswapV3FeeCalculations';

export type LPAnalysisResult = {
  expectedPNL: number;
  impermanentLoss: number;
  feeIncome: number;
  netPosition: number;
  priceDeviation: number;
  feeAPR: number;
  worstCaseIL: number;
  bestCaseScenario: number;
  // New fields for real Uniswap V3 data
  realFeeIncome: number;
  realFeeAPR: number;
  dailyFeeIncome: number;
  timeInRangeEstimate: number;
  concentrationType: 'full-range' | 'concentrated' | 'narrow';
};

/**
 * Create empty/safe result when calculations can't be performed
 */
function createEmptyResult(): LPAnalysisResult {
  return {
    expectedPNL: 0,
    impermanentLoss: 0,
    feeIncome: 0,
    netPosition: 0,
    priceDeviation: 0,
    feeAPR: 0,
    worstCaseIL: 0,
    bestCaseScenario: 0,
    realFeeIncome: 0,
    realFeeAPR: 0,
    dailyFeeIncome: 0,
    timeInRangeEstimate: 0,
    concentrationType: 'full-range'
  };
}

/**
 * Calculates comprehensive LP analysis using real Uniswap V3 fee data and IL calculations
 * Now uses actual feeGrowthGlobal0X128 data for precise fee calculations
 */
export function analyzeLiquidityProviderExpectedPNL(
  drift: number,
  volatility: number,
  timeHorizon: number,
  currentPrice: number,
  poolStats: PoolStats,
  positionSize = 10000
): LPAnalysisResult {
  // Validate inputs to prevent errors
  if (!currentPrice || currentPrice <= 0) {
    console.warn('Invalid currentPrice for LP analysis:', currentPrice);
    return createEmptyResult();
  }
  
  if (!positionSize || positionSize <= 0) {
    console.warn('Invalid positionSize for LP analysis:', positionSize);
    return createEmptyResult();
  }

  const timeInYears = timeHorizon / 365;
  
  // Calculate expected price movement using geometric Brownian motion
  const expectedPrice = currentPrice * Math.exp(drift * timeInYears);
  
  // Validate expectedPrice to ensure it's reasonable
  if (!expectedPrice || expectedPrice <= 0 || !isFinite(expectedPrice)) {
    console.warn('Invalid expectedPrice calculated:', expectedPrice);
    return createEmptyResult();
  }
  
  const priceRatio = expectedPrice / currentPrice;
  const priceDeviation = Math.abs(1 - priceRatio) * 100;
  
  // Calculate impermanent loss using proper formula
  const impermanentLossUSD = calculateImpermanentLoss(currentPrice, expectedPrice, positionSize);
  const impermanentLossNumber = Number(impermanentLossUSD.toString());
  
  // Create pool fee growth state for real calculations
  const poolFeeGrowthState: PoolFeeGrowthState = {
    feeGrowthGlobal0X128: poolStats.currentFeeGrowthGlobal0X128,
    feeGrowthGlobal1X128: poolStats.currentFeeGrowthGlobal1X128,
    currentTick: Math.log(currentPrice) / Math.log(1.0001), // Approximate tick from price
    liquidity: '1000000000000000000', // 1e18 as base liquidity unit
    token0Decimals: 18, // Assume standard ERC20
    token1Decimals: 18
  };

  // Estimate daily fee income from recent data
  const dailyFeeIncomeUSD = estimateDailyFeeIncome(
    poolStats.historicalFeeGrowth0X128,
    poolStats.historicalFeeGrowth1X128,
    poolFeeGrowthState.liquidity,
    currentPrice,
    1, // Assume token1 price = 1 USD (like USDC)
    18,
    18
  );
  const dailyFeeIncome = Number(dailyFeeIncomeUSD.toString());

  // Calculate position liquidity based on position size
  const positionLiquidity = calculatePositionLiquidity(positionSize, currentPrice);
  
  // For the analysis, we'll assume different concentration levels
  const concentrationType = determineConcentrationType(volatility);
  const timeInRangeEstimate = estimateTimeInRange(volatility, concentrationType);
  
  // Calculate real fee income using Uniswap V3 mathematics
  let realFeeCalculation;
  if (concentrationType === 'full-range') {
    realFeeCalculation = calculateMaxPossibleFees(
      poolFeeGrowthState,
      positionLiquidity,
      currentPrice,
      1, // Token1 price
      timeHorizon
    );
  } else {
    // Create a concentrated position based on volatility
    const tickRange = getTickRangeFromVolatility(volatility, concentrationType);
    const currentTick = poolFeeGrowthState.currentTick;
    
    const position: LiquidityPosition = {
      tickLower: Math.floor(currentTick - tickRange / 2),
      tickUpper: Math.floor(currentTick + tickRange / 2),
      liquidity: positionLiquidity
    };

    realFeeCalculation = calculateConcentratedPositionFees(
      poolFeeGrowthState,
      position,
      currentPrice,
      1,
      timeHorizon,
      timeInRangeEstimate
    );
  }

  // Legacy fee calculation for comparison
  const lookbackDays = Math.min(90, timeHorizon);
  const historicalDailyFees = poolStats.fees / lookbackDays;
  const legacyFeeIncome = historicalDailyFees * timeHorizon * (positionSize / 1000000);
  
  // Calculate metrics (convert Big numbers to numbers for calculations)
  const realFeeIncome = realFeeCalculation.totalFeesUSDNumber * (positionSize / 10000); // Scale to position size
  const feeIncome = Math.max(legacyFeeIncome, realFeeIncome); // Use the higher estimate
  const netPosition = feeIncome - impermanentLossNumber;
  const expectedPNL = netPosition / positionSize * 100;
  
  // APR calculations (convert Big numbers to numbers)
  const realFeeAPR = realFeeCalculation.feeAPRNumber;
  const legacyFeeAPR = (poolStats.fees / (poolStats.volume || 1)) * 365 * 100;
  const feeAPR = Math.max(legacyFeeAPR, realFeeAPR);
  
  const worstCaseIL = positionSize * 0.5 * (volatility * Math.sqrt(timeInYears));
  const bestCaseScenario = feeIncome * 1.5;
  
  return {
    expectedPNL,
    impermanentLoss: impermanentLossNumber,
    feeIncome,
    netPosition,
    priceDeviation,
    feeAPR,
    worstCaseIL,
    bestCaseScenario,
    realFeeIncome,
    realFeeAPR,
    dailyFeeIncome,
    timeInRangeEstimate: timeInRangeEstimate * 100, // As percentage
    concentrationType
  };
}

/**
 * Convert position size in USD to liquidity units
 */
function calculatePositionLiquidity(positionSize: number, currentPrice: number): string {
  // Simplified calculation for demonstration
  // In real implementation, this would depend on the tick range
  const baseLiquidity = Math.sqrt(positionSize * currentPrice);
  return Math.floor(baseLiquidity * 1e18).toString();
}

/**
 * Determine concentration type based on volatility
 */
function determineConcentrationType(volatility: number): 'full-range' | 'concentrated' | 'narrow' {
  if (volatility > 0.8) return 'full-range'; // High volatility = wide range
  if (volatility > 0.3) return 'concentrated'; // Medium volatility = concentrated
  return 'narrow'; // Low volatility = narrow range
}

/**
 * Estimate time in range based on volatility and concentration
 */
function estimateTimeInRange(volatility: number, concentrationType: string): number {
  if (concentrationType === 'full-range') return 1.0; // Always in range
  if (concentrationType === 'narrow') return Math.max(0.3, 1 - volatility * 2); // Narrow = less time in range
  return Math.max(0.5, 1 - volatility); // Concentrated = moderate time in range
}

/**
 * Get tick range based on volatility and concentration type
 */
function getTickRangeFromVolatility(volatility: number, concentrationType: string): number {
  const baseRange = volatility * 20000; // Scale volatility to tick range
  
  switch (concentrationType) {
    case 'narrow': return Math.max(200, baseRange * 0.5);
    case 'concentrated': return Math.max(2000, baseRange * 2);
    case 'full-range': return 100000; // Very wide range
    default: return 10000;
  }
}