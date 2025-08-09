/**
 * Uniswap V3 Fee Calculation Utilities
 * 
 * Implements proper Q128.128 fixed-point arithmetic for calculating LP fees
 * from feeGrowthGlobal0X128 and feeGrowthGlobal1X128 data.
 * Uses big.js for safe arbitrary precision arithmetic.
 */

import Big from 'big.js';

// Configure Big.js for high precision
Big.DP = 50; // Set decimal places to 50 for high precision
Big.RM = Big.roundHalfUp; // Set rounding mode

// Q128 constants for fixed-point arithmetic
const Q128_STRING = '340282366920938463463374607431768211456'; // 2^128
const Q256_STRING = '115792089237316195423570985008687907853269984665640564039457584007913129639936'; // 2^256

/**
 * Handle overflow/underflow in 256-bit arithmetic using big.js
 * Uniswap V3 intentionally allows overflow - only differences matter
 */
function subIn256(x: Big, y: Big): Big {
  const difference = x.minus(y);
  if (difference.lt(0)) {
    return new Big(Q256_STRING).plus(difference);
  }
  return difference;
}

/**
 * Convert string/number to Big safely
 */
function toBig(value: string | number | Big): Big {
  if (value instanceof Big) return value;
  return new Big(value.toString());
}

/**
 * Convert token amount to human readable format
 */
function fromWei(amount: Big, decimals: number): Big {
  const divisor = new Big(10).pow(decimals);
  return amount.div(divisor);
}

/**
 * Convert human readable amount to wei
 */
function toWei(amount: Big, decimals: number): Big {
  const multiplier = new Big(10).pow(decimals);
  return amount.mul(multiplier);
}

/**
 * Represents a Uniswap V3 pool's fee growth state
 */
export type PoolFeeGrowthState = {
  feeGrowthGlobal0X128: string;
  feeGrowthGlobal1X128: string;
  currentTick: number;
  liquidity: string;
  token0Decimals: number;
  token1Decimals: number;
};

/**
 * Represents a liquidity position's parameters
 */
export type LiquidityPosition = {
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  // For simplicity, assume we're calculating from pool initialization
  // In real implementations, these would be from position creation
  feeGrowthInside0LastX128?: string;
  feeGrowthInside1LastX128?: string;
};

/**
 * Result of fee calculations using Big for precision
 */
export type FeeCalculationResult = {
  token0FeesEarned: Big;
  token1FeesEarned: Big;
  token0FeesEarnedRaw: Big;
  token1FeesEarnedRaw: Big;
  totalFeesUSD: Big;
  feeAPR: Big;
  dailyFeeRate: Big;
  // Convenience getters for display
  token0FeesEarnedNumber: number;
  token1FeesEarnedNumber: number;
  totalFeesUSDNumber: number;
  feeAPRNumber: number;
  dailyFeeRateNumber: number;
};

/**
 * Calculate the theoretical maximum fees that could be earned by a full-range position
 * This provides an upper bound for fee income analysis using big.js for precision
 */
export function calculateMaxPossibleFees(
  poolState: PoolFeeGrowthState,
  positionLiquidity: string,
  token0Price: number,
  token1Price: number,
  daysHeld: number
): FeeCalculationResult {
  
  // For full-range position, we can use the global fee growth directly
  const feeGrowthGlobal0 = toBig(poolState.feeGrowthGlobal0X128);
  const feeGrowthGlobal1 = toBig(poolState.feeGrowthGlobal1X128);
  const liquidity = toBig(positionLiquidity);
  const Q128 = toBig(Q128_STRING);

  // Calculate raw fees earned (assuming position was active for entire fee accumulation)
  const token0FeesRaw = liquidity.mul(feeGrowthGlobal0).div(Q128);
  const token1FeesRaw = liquidity.mul(feeGrowthGlobal1).div(Q128);

  // Convert to human-readable amounts
  const token0FeesEarned = fromWei(token0FeesRaw, poolState.token0Decimals);
  const token1FeesEarned = fromWei(token1FeesRaw, poolState.token1Decimals);

  // Calculate total USD value
  const token0USD = token0FeesEarned.mul(token0Price);
  const token1USD = token1FeesEarned.mul(token1Price);
  const totalFeesUSD = token0USD.plus(token1USD);

  // Calculate position value for APR calculation (simplified for full range)
  const sqrtPrice = toBig(Math.sqrt(token0Price).toString());
  const token0Amount = liquidity.div(sqrtPrice);
  const token1Amount = liquidity.mul(sqrtPrice);
  
  const token0ValueUSD = fromWei(token0Amount, poolState.token0Decimals).mul(token0Price);
  const token1ValueUSD = fromWei(token1Amount, poolState.token1Decimals).mul(token1Price);
  const positionValueUSD = token0ValueUSD.plus(token1ValueUSD);

  // Calculate APR and daily rates
  const feeAPR = positionValueUSD.gt(0) 
    ? totalFeesUSD.mul(365).div(positionValueUSD.mul(daysHeld)).mul(100)
    : toBig(0);
  const dailyFeeRate = totalFeesUSD.div(daysHeld);

  return {
    token0FeesEarned,
    token1FeesEarned,
    token0FeesEarnedRaw: token0FeesRaw,
    token1FeesEarnedRaw: token1FeesRaw,
    totalFeesUSD,
    feeAPR,
    dailyFeeRate,
    // Convenience getters for display
    token0FeesEarnedNumber: Number(token0FeesEarned.toString()),
    token1FeesEarnedNumber: Number(token1FeesEarned.toString()),
    totalFeesUSDNumber: Number(totalFeesUSD.toString()),
    feeAPRNumber: Number(feeAPR.toString()),
    dailyFeeRateNumber: Number(dailyFeeRate.toString())
  };
}

/**
 * Estimate fees for a concentrated liquidity position within specific price bounds
 * This is more complex as it requires calculating time spent in range
 */
export function calculateConcentratedPositionFees(
  poolState: PoolFeeGrowthState,
  position: LiquidityPosition,
  token0Price: number,
  token1Price: number,
  daysHeld: number,
  timeInRangePercentage = 0.7 // Estimate: position was active 70% of time
): FeeCalculationResult {
  
  // For concentrated positions, we need to account for time in range
  // This is a simplified calculation - real implementation would need tick-level data
  
  const maxFees = calculateMaxPossibleFees(
    poolState,
    position.liquidity,
    token0Price,
    token1Price,
    daysHeld
  );

  // Adjust fees based on time spent in active range and concentration factor
  // Concentrated positions earn more when in range but less when out of range
  const concentrationMultiplier = toBig(calculateConcentrationMultiplier(
    position.tickLower,
    position.tickUpper
  ));
  const timeInRange = toBig(timeInRangePercentage);

  const adjustedToken0Fees = maxFees.token0FeesEarned.mul(timeInRange).mul(concentrationMultiplier);
  const adjustedToken1Fees = maxFees.token1FeesEarned.mul(timeInRange).mul(concentrationMultiplier);
  
  const adjustedToken0USD = adjustedToken0Fees.mul(token0Price);
  const adjustedToken1USD = adjustedToken1Fees.mul(token1Price);
  const adjustedTotalFeesUSD = adjustedToken0USD.plus(adjustedToken1USD);

  // Calculate adjusted raw values
  const adjustedToken0FeesRaw = toWei(adjustedToken0Fees, poolState.token0Decimals);
  const adjustedToken1FeesRaw = toWei(adjustedToken1Fees, poolState.token1Decimals);

  const adjustedFeeAPR = maxFees.feeAPR.mul(timeInRange).mul(concentrationMultiplier);
  const adjustedDailyFeeRate = adjustedTotalFeesUSD.div(daysHeld);

  return {
    token0FeesEarned: adjustedToken0Fees,
    token1FeesEarned: adjustedToken1Fees,
    token0FeesEarnedRaw: adjustedToken0FeesRaw,
    token1FeesEarnedRaw: adjustedToken1FeesRaw,
    totalFeesUSD: adjustedTotalFeesUSD,
    feeAPR: adjustedFeeAPR,
    dailyFeeRate: adjustedDailyFeeRate,
    // Convenience getters for display
    token0FeesEarnedNumber: Number(adjustedToken0Fees.toString()),
    token1FeesEarnedNumber: Number(adjustedToken1Fees.toString()),
    totalFeesUSDNumber: Number(adjustedTotalFeesUSD.toString()),
    feeAPRNumber: Number(adjustedFeeAPR.toString()),
    dailyFeeRateNumber: Number(adjustedDailyFeeRate.toString())
  };
}

/**
 * Calculate concentration multiplier based on position width
 * Narrower positions earn more fees when active but are active less often
 */
function calculateConcentrationMultiplier(tickLower: number, tickUpper: number): number {
  const tickRange = tickUpper - tickLower;
  
  // Very wide range (close to full range): 1x multiplier
  if (tickRange > 100000) return 1.0;
  
  // Narrow range: higher multiplier when in range
  if (tickRange < 1000) return 10.0;
  if (tickRange < 5000) return 5.0;
  if (tickRange < 20000) return 2.5;
  
  return 1.5; // Medium concentration
}

/**
 * Convert tick to price (simplified version)
 */
export function tickToPrice(tick: number, token0Decimals: number, token1Decimals: number): number {
  const price = Math.pow(1.0001, tick);
  const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
  return price * decimalAdjustment;
}

/**
 * Calculate impermanent loss for comparison with fees using big.js
 */
export function calculateImpermanentLoss(
  initialPrice: number,
  currentPrice: number,
  positionValueUSD: number
): Big {
  // Validate inputs to prevent division by zero and invalid calculations
  if (!initialPrice || initialPrice <= 0) {
    console.warn('Invalid initialPrice for IL calculation:', initialPrice);
    return toBig(0);
  }
  
  if (!currentPrice || currentPrice <= 0) {
    console.warn('Invalid currentPrice for IL calculation:', currentPrice);
    return toBig(0);
  }
  
  if (!positionValueUSD || positionValueUSD <= 0) {
    return toBig(0);
  }

  try {
    const priceRatio = toBig(currentPrice).div(initialPrice);
    const sqrt_ratio = toBig(Math.sqrt(Number(priceRatio.toString())));
    
    // Standard IL formula for 50/50 positions: (2 * sqrt(ratio) / (1 + ratio)) - 1
    const numerator = sqrt_ratio.mul(2);
    const denominator = priceRatio.plus(1);
    const impermanentLoss = numerator.div(denominator).minus(1);
    
    return toBig(Math.abs(Number(impermanentLoss.toString()))).mul(positionValueUSD);
  } catch (error) {
    console.error('Error calculating impermanent loss:', error);
    return toBig(0);
  }
}

/**
 * Estimate daily fee income based on recent fee growth using big.js
 * Uses the difference between recent fee growth values to project forward
 */
export function estimateDailyFeeIncome(
  recentFeeGrowthGlobal0: string[],
  recentFeeGrowthGlobal1: string[],
  positionLiquidity: string,
  token0Price: number,
  token1Price: number,
  token0Decimals: number,
  token1Decimals: number
): Big {
  
  if (recentFeeGrowthGlobal0.length < 2 || recentFeeGrowthGlobal1.length < 2) {
    return toBig(0);
  }

  // Calculate fee growth over the period
  const latestFeeGrowth0 = toBig(recentFeeGrowthGlobal0[0]);
  const previousFeeGrowth0 = toBig(recentFeeGrowthGlobal0[1]);
  const latestFeeGrowth1 = toBig(recentFeeGrowthGlobal1[0]);
  const previousFeeGrowth1 = toBig(recentFeeGrowthGlobal1[1]);

  const feeGrowthDelta0 = subIn256(latestFeeGrowth0, previousFeeGrowth0);
  const feeGrowthDelta1 = subIn256(latestFeeGrowth1, previousFeeGrowth1);

  const liquidity = toBig(positionLiquidity);
  const Q128 = toBig(Q128_STRING);

  // Calculate fees earned in the period
  const periodFees0 = liquidity.mul(feeGrowthDelta0).div(Q128);
  const periodFees1 = liquidity.mul(feeGrowthDelta1).div(Q128);

  // Convert to human-readable amounts
  const token0Fees = fromWei(periodFees0, token0Decimals);
  const token1Fees = fromWei(periodFees1, token1Decimals);
  
  // Convert to USD and sum
  const token0USD = token0Fees.mul(token0Price);
  const token1USD = token1Fees.mul(token1Price);
  const totalFeesUSD = token0USD.plus(token1USD);

  return totalFeesUSD;
}