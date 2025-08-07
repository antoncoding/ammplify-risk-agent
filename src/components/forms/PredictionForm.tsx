import React, { useState, useEffect, useCallback } from 'react';
import { Bot } from 'lucide-react';
import { useChartState } from '@/contexts/ChartStateContext';
import { useChatContext } from '@/contexts/ChatContext';
import { usePredictionInputValidation } from '@/hooks/useInputValidation';
import { useAgentInputHelper } from '@/hooks/useAgentInputHelper';
import { FinancialInput } from './inputs/FinancialInput';
import PredictionResult from '../DirectInput/PredictionResult';

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
};

export function PredictionForm(): JSX.Element {
  const {
    volatility,
    drift,
    setPredictionFromDriftVol,
    userPrediction,
    currentPrice,
  } = useChartState();
  
  const { setIsCollapsed } = useChatContext();
  const { validateAllInputs } = usePredictionInputValidation();
  const {
    isLoading: agentLoading,
    error: agentError
  } = useAgentInputHelper();

  // Local state for controlled inputs with proper typing
  const [localInputs, setLocalInputs] = useState<PredictionInputs>({
    volatility: volatility,
    drift: drift,
    timeHorizon: userPrediction.timeHorizon,
  });

  const [calculationState, setCalculationState] = useState<CalculationState>({
    isVisible: false,
    inputs: { ...localInputs },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Update prediction as user types with proper dependency management
  useEffect(() => {
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
  }, [localInputs, setPredictionFromDriftVol, validateAllInputs]);

  // Handlers with proper typing and error boundaries
  const handleInputChange = useCallback((field: keyof PredictionInputs, value: number) => {
    if (isNaN(value)) return; // Input validation
    
    setLocalInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleCalculate = useCallback(() => {
    const validationResult = validateAllInputs(
      localInputs.volatility,
      localInputs.drift,
      localInputs.timeHorizon
    );

    if (!validationResult.isValid) {
      // Don't calculate if inputs are invalid
      return;
    }

    setCalculationState({
      isVisible: true,
      inputs: { ...localInputs },
    });
  }, [localInputs, validateAllInputs]);

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

  // Check if form is valid for calculation
  const isFormValid = Object.values(validationErrors).every(error => !error);

  return (
    <div className="w-full max-w-6xl bg-card rounded-lg shadow p-6 flex flex-col gap-4 font-zen">
      {/* Title and Description */}
      <div className="mb-2">
        <h2 className="text-xl font-medium">
          Your Market Prediction
        </h2>
        <p className="text-sm text-muted-foreground">
          Share your view on future price movement by entering your expected trend (drift) and uncertainty (volatility).
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
            tooltip="Annualized standard deviation of price returns. Higher values mean more uncertainty."
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
            tooltip="Expected average return or trend direction over time."
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
            tooltip="Number of days into the future for your prediction."
            validation={{ 
              isValid: !validationErrors.timeHorizon, 
              error: validationErrors.timeHorizon 
            }}
            aria-label="Time horizon in days"
          />
          
          <button
            className={`py-3 px-6 rounded text-sm font-medium transition ${
              isFormValid
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleCalculate}
            type="button"
            disabled={!isFormValid}
            aria-label="Calculate prediction results"
          >
            Calculate
          </button>
        </div>

        <div className="flex items-center justify-center my-2">
          <div className="flex-1 border-t border-muted"></div>
          <span className="px-3 text-xs text-muted-foreground font-medium">OR</span>
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
            Get AI assistance with volatility, drift, and time horizon estimates
          </div>
        </button>

        {agentError && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">
            Failed to get agent suggestions: {agentError}
          </div>
        )}

        {calculationState.isVisible && (
          <PredictionResult
            drift={calculationState.inputs.drift}
            vol={calculationState.inputs.volatility}
            time={calculationState.inputs.timeHorizon}
            currentPrice={currentPrice}
          />
        )}
      </div>
    </div>
  );
}