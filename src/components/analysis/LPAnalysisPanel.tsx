import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bot } from 'lucide-react';
import { useChartState } from '@/contexts/ChartStateContext';
import { usePoolContext } from '@/contexts/PoolContext';
import { useChatContext } from '@/contexts/ChatContext';
import { usePredictionInputValidation } from '@/hooks/useInputValidation';
import { useAgentInputHelper } from '@/hooks/useAgentInputHelper';
import { usePoolStats } from '@/hooks/usePoolStats';
import { FinancialInput } from '@/components/forms/inputs/FinancialInput';
import { analyzeLiquidityProviderExpectedPNL, type LPAnalysisResult } from '@/utils/liquidityProviderAnalysis';

// Type definitions for better maintainability
type PredictionInputs = {
  volatility: number;
  drift: number;
  timeHorizon: number;
};

type ValidationErrors = {
  volatility?: string;
  drift?: string;
  timeHorizon?: string;
};

type CalculationState = {
  isVisible: boolean;
  inputs: PredictionInputs;
  lpAnalysis: LPAnalysisResult | null;
};

const API_KEY = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY ?? '';

export function LPAnalysisPanel(): JSX.Element {
  const {
    setPredictionFromDriftVol,
    currentPrice,
  } = useChartState();
  
  const { poolAddress, lookbackPeriod } = usePoolContext();
  const { stats, loading: statsLoading } = usePoolStats({ poolAddress, apiKey: API_KEY, lookbackPeriod });
  const { setIsCollapsed } = useChatContext();
  const { validateAllInputs } = usePredictionInputValidation();
  const {
    isLoading: agentLoading,
    error: agentError
  } = useAgentInputHelper();

  // Initialize with pool stats or defaults
  const [localInputs, setLocalInputs] = useState<PredictionInputs>({
    volatility: 0,
    drift: 0,
    timeHorizon: 30,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const [calculationState, setCalculationState] = useState<CalculationState>({
    isVisible: false,
    inputs: { ...localInputs },
    lpAnalysis: null,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Initialize with pool stats data once available
  useEffect(() => {
    if (!statsLoading && stats.volatility > 0 && !isInitialized) {
      const poolVolatility = Math.round(stats.volatility * 100) / 100; // Round to 2 decimals
      const poolDrift = Math.round(stats.growth * 100) / 100; // Round to 2 decimals
      
      setLocalInputs({
        volatility: poolVolatility,
        drift: poolDrift,
        timeHorizon: 30,
      });
      setIsInitialized(true);
    }
  }, [stats, statsLoading, isInitialized]);

  // Update prediction and auto-calculate when inputs change
  useEffect(() => {
    if (!isInitialized) return;
    
    setPredictionFromDriftVol(
      localInputs.drift,
      localInputs.volatility,
      localInputs.timeHorizon
    );

    // Validate inputs and update errors
    const validationResult = validateAllInputs(
      localInputs.volatility,
      localInputs.drift,
      localInputs.timeHorizon
    );

    setValidationErrors({
      volatility: validationResult.individualResults.volatility.error,
      drift: validationResult.individualResults.drift.error,
      timeHorizon: validationResult.individualResults.timeHorizon.error,
    });

    // Auto-calculate when form is valid
    if (validationResult.isValid && currentPrice > 0 && stats.fees > 0) {
      const lpAnalysis = analyzeLiquidityProviderExpectedPNL(
        localInputs.drift / 100,
        localInputs.volatility / 100,
        localInputs.timeHorizon,
        currentPrice,
        stats
      );

      setCalculationState({
        isVisible: true,
        inputs: { ...localInputs },
        lpAnalysis,
      });
    } else {
      // Reset calculation state if form becomes invalid
      setCalculationState(prev => ({ ...prev, isVisible: false }));
    }
  }, [localInputs, setPredictionFromDriftVol, validateAllInputs, isInitialized, currentPrice, stats]);

  // Calculate expected price range for display
  const expectedPriceRange = useMemo(() => {
    if (!currentPrice || !localInputs.volatility || !localInputs.drift) return null;
    
    const timeInYears = localInputs.timeHorizon / 365;
    const driftDecimal = localInputs.drift / 100;
    const volDecimal = localInputs.volatility / 100;
    
    const expected = currentPrice * Math.exp(driftDecimal * timeInYears);
    const stddev = volDecimal * Math.sqrt(timeInYears);
    const min = expected * Math.exp(-stddev);
    const max = expected * Math.exp(stddev);
    
    return { min, max, expected };
  }, [currentPrice, localInputs]);

  // Handlers with proper typing and error boundaries
  const handleInputChange = useCallback((field: keyof PredictionInputs, value: number) => {
    if (isNaN(value)) return; // Input validation
    
    setLocalInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleManualCalculate = useCallback(() => {
    const validationResult = validateAllInputs(
      localInputs.volatility,
      localInputs.drift,
      localInputs.timeHorizon
    );

    if (!validationResult.isValid) {
      return;
    }

    const lpAnalysis = analyzeLiquidityProviderExpectedPNL(
      localInputs.drift / 100,
      localInputs.volatility / 100,
      localInputs.timeHorizon,
      currentPrice,
      stats
    );

    setCalculationState({
      isVisible: true,
      inputs: { ...localInputs },
      lpAnalysis,
    });
  }, [localInputs, validateAllInputs, currentPrice, stats]);


  const handleRequestAgentAssistance = useCallback(async () => {
    try {
      // For now, just open the chat. In the future, we could use agent suggestions
      // const suggestions = await suggestAllInputs(poolData, marketConditions);
      setIsCollapsed(false);
    } catch (error) {
      console.error('Failed to get agent suggestions:', error);
      // Still open chat as fallback
      setIsCollapsed(false);
    }
  }, [setIsCollapsed]);


  return (
    <div className="w-full max-w-6xl bg-card rounded-lg shadow p-6 flex flex-col gap-4 font-zen">
      {/* Title and Description */}
      <div className="mb-2">
        <h2 className="text-xl font-medium">
          Future Projection
        </h2>
        <p className="text-sm text-muted-foreground">
          Based on {lookbackPeriod} historical data. Adjust volatility, drift, and time horizon to explore different scenarios and see how they impact LP profitability.
        </p>
      </div>
      
      {/* Input Fields */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-4 w-full">
          <FinancialInput
            id="volatility"
            label="Volatility"
            value={localInputs.volatility}
            onChange={(value) => handleInputChange('volatility', value)}
            placeholder="0.25"
            min={0}
            max={10}
            step={0.01}
            suffix="%"
            tooltip={`Historical volatility: ${stats.volatility?.toFixed(1)}%. Annualized measure of price uncertainty from ${lookbackPeriod} data.`}
            validation={{ 
              isValid: !validationErrors.volatility, 
              error: validationErrors.volatility 
            }}
            aria-label="Volatility percentage"
          />
          
          <FinancialInput
            id="drift"
            label="Drift"
            value={localInputs.drift}
            onChange={(value) => handleInputChange('drift', value)}
            placeholder="0.05"
            min={-1}
            max={1}
            step={0.01}
            suffix="%"
            tooltip={`Historical drift: ${stats.growth?.toFixed(1)}%. Price trend from ${lookbackPeriod} period.`}
            validation={{ 
              isValid: !validationErrors.drift, 
              error: validationErrors.drift 
            }}
            aria-label="Drift percentage"
          />
          
          <FinancialInput
            id="timeHorizon"
            label="Time Horizon"
            value={localInputs.timeHorizon}
            onChange={(value) => handleInputChange('timeHorizon', value)}
            placeholder="30"
            min={1}
            max={365}
            step={1}
            suffix="days"
            tooltip="Projection timeframe. Shows expected price range and LP performance over this period."
            validation={{ 
              isValid: !validationErrors.timeHorizon, 
              error: validationErrors.timeHorizon 
            }}
            aria-label="Time horizon in days"
          />
          
          <button
            className="py-3 px-6 rounded text-sm font-medium transition bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleManualCalculate}
            type="button"
            aria-label="Calculate prediction results"
          >
            Calculate
          </button>
        </div>

        {/* Results Section - Right after inputs */}
        
        {/* Price Projection Display */}
        {expectedPriceRange && (
          <div className="bg-muted/50 rounded-lg p-3 text-center animate-in fade-in duration-300">
            <div className="text-xs text-muted-foreground mb-1">Projected Price Range ({localInputs.timeHorizon} days)</div>
            <div className="text-sm font-medium">
              ${expectedPriceRange.min.toFixed(2)} ~ ${expectedPriceRange.max.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Expected: ${expectedPriceRange.expected.toFixed(2)}
            </div>
          </div>
        )}

        {/* LP Analysis Results */}
        {calculationState.isVisible && calculationState.lpAnalysis && (
          <div className="bg-card border rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Liquidity Provider Analysis</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                calculationState.lpAnalysis.feeIncome > calculationState.lpAnalysis.impermanentLoss
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {calculationState.lpAnalysis.feeIncome > calculationState.lpAnalysis.impermanentLoss
                  ? 'Profitable'
                  : 'Risk'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground text-xs">Expected PNL</div>
                  <div className={`font-semibold ${calculationState.lpAnalysis.expectedPNL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculationState.lpAnalysis.expectedPNL >= 0 ? '+' : ''}{calculationState.lpAnalysis.expectedPNL.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Real Fee APR</div>
                  <div className="font-medium text-blue-600">
                    {calculationState.lpAnalysis.realFeeAPR?.toFixed(1) || calculationState.lpAnalysis.feeAPR.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Position Type</div>
                  <div className="font-medium text-purple-600 capitalize">
                    {calculationState.lpAnalysis.concentrationType?.replace('-', ' ') || 'Standard'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground text-xs">Real Fee Income</div>
                  <div className="font-medium text-green-600">
                    ${calculationState.lpAnalysis.realFeeIncome?.toFixed(0) || calculationState.lpAnalysis.feeIncome.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Impermanent Loss</div>
                  <div className="font-medium text-red-600">
                    ${calculationState.lpAnalysis.impermanentLoss.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Time in Range</div>
                  <div className="font-medium text-orange-600">
                    {calculationState.lpAnalysis.timeInRangeEstimate?.toFixed(0) || '100'}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-2">
              Based on $10k position • Real Uniswap V3 fee calculations using feeGrowthGlobal0X128 • Data from {lookbackPeriod}
            </div>
          </div>
        )}

        {/* Agent Help Section - At the very bottom */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-center mb-2">
            <div className="flex-1 border-t border-muted"></div>
            <span className="px-3 text-xs text-muted-foreground font-medium">Need Help?</span>
            <div className="flex-1 border-t border-muted"></div>
          </div>

          <button
            onClick={() => void handleRequestAgentAssistance()}
            className="w-full p-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            type="button"
            disabled={agentLoading}
            aria-label="Request agent assistance for market prediction inputs"
          >
            <div className="flex items-center justify-center gap-2">
              {agentLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Bot className="h-4 w-4 text-primary group-hover:animate-pulse" />
              )}
              <span className="text-primary font-medium">
                {agentLoading ? 'Getting Suggestions...' : 'Ask Agent for Help'}
              </span>
            </div>
            <div className="text-xs text-primary/70 mt-1">
              Get AI assistance with parameter estimates
            </div>
          </button>

          {agentError && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2 mt-2">
              Failed to get agent suggestions: {agentError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}