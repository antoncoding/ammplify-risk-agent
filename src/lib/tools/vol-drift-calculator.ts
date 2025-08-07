export type VolDriftInput = {
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  timeframeDays: number;
  confidence?: number; // Default 68% (1 standard deviation)
}

export type VolDriftOutput = {
  annualizedVolatility: number;
  dailyVolatility: number;
  drift: number;
  expectedReturn: number;
  riskMetrics: {
    valueAtRisk: number;
    maxExpectedLoss: number;
    probabilityOfLoss: number;
  };
}

export async function calculateVolAndDriftFromRange(input: VolDriftInput): Promise<VolDriftOutput> {
  const { currentPrice, minPrice, maxPrice, timeframeDays, confidence = 0.68 } = input;
  
  // Calculate price bounds as percentage moves
  const downMove = (currentPrice - minPrice) / currentPrice;
  const upMove = (maxPrice - currentPrice) / currentPrice;
  
  // Average range as percentage
  const averageRange = (Math.abs(downMove) + Math.abs(upMove)) / 2;
  
  // Convert confidence level to z-score (68% = 1, 95% = 1.96, 99% = 2.58)
  const zScore = confidence <= 0.68 ? 1 : confidence <= 0.95 ? 1.96 : 2.58;
  
  // Calculate daily volatility
  const timeframeSqrt = Math.sqrt(timeframeDays);
  const dailyVolatility = averageRange / (zScore * timeframeSqrt);
  
  // Annualize volatility
  const annualizedVolatility = dailyVolatility * Math.sqrt(365);
  
  // Calculate drift (expected return)
  const midPoint = (minPrice + maxPrice) / 2;
  const drift = Math.log(midPoint / currentPrice) / (timeframeDays / 365);
  const expectedReturn = (midPoint - currentPrice) / currentPrice;
  
  // Calculate risk metrics
  const valueAtRisk = currentPrice * dailyVolatility * 1.65; // 95% VaR
  const maxExpectedLoss = currentPrice * dailyVolatility * 2.33; // 99% worst case
  const probabilityOfLoss = 0.5 - (drift / (dailyVolatility * Math.sqrt(2 * Math.PI)));
  
  return {
    annualizedVolatility: Math.round(annualizedVolatility * 10000) / 100, // Percentage
    dailyVolatility: Math.round(dailyVolatility * 10000) / 100, // Percentage
    drift: Math.round(drift * 10000) / 100, // Percentage
    expectedReturn: Math.round(expectedReturn * 10000) / 100, // Percentage
    riskMetrics: {
      valueAtRisk: Math.round(valueAtRisk * 100) / 100,
      maxExpectedLoss: Math.round(maxExpectedLoss * 100) / 100,
      probabilityOfLoss: Math.round(probabilityOfLoss * 1000) / 10 // Percentage
    }
  };
}

// Tool definition for OpenRouter function calling
export const calculateVolAndDriftTool = {
  type: 'function',
  function: {
    name: 'calculateVolAndDriftFromRange',
    description: 'Calculate volatility and drift from user-provided price range expectations',
    parameters: {
      type: 'object',
      properties: {
        currentPrice: {
          type: 'number',
          description: 'Current price of the asset'
        },
        minPrice: {
          type: 'number', 
          description: 'Minimum expected price in the timeframe'
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum expected price in the timeframe'
        },
        timeframeDays: {
          type: 'number',
          description: 'Timeframe in days for the price range'
        },
        confidence: {
          type: 'number',
          description: 'Confidence level (0.68 for 68%, 0.95 for 95%, 0.99 for 99%)',
          minimum: 0.5,
          maximum: 0.99
        }
      },
      required: ['currentPrice', 'minPrice', 'maxPrice', 'timeframeDays']
    }
  }
};