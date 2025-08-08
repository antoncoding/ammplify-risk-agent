import { useCallback } from 'react';

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

// Validation functions for prediction inputs
export function usePredictionInputValidation() {
  const validateVolatility = useCallback((value: number) => {
    if (isNaN(value)) return { isValid: false, error: 'Volatility must be a valid number' };
    if (value < 0) return { isValid: false, error: 'Volatility cannot be negative' };
    if (value > 100) return { isValid: false, error: 'Volatility seems unreasonably high (>100%)' };
    return { isValid: true };
  }, []);

  const validateDrift = useCallback((value: number) => {
    if (isNaN(value)) return { isValid: false, error: 'Drift must be a valid number' };
    if (value < -100) return { isValid: false, error: 'Drift cannot be less than -100%' };
    if (value > 100) return { isValid: false, error: 'Drift cannot be more than 100%' };
    return { isValid: true };
  }, []);

  const validateTimeHorizon = useCallback((value: number) => {
    if (isNaN(value)) return { isValid: false, error: 'Time horizon must be a valid number' };
    if (!Number.isInteger(value)) return { isValid: false, error: 'Time horizon must be a whole number of days' };
    if (value < 1) return { isValid: false, error: 'Time horizon must be at least 1 day' };
    if (value > 365) return { isValid: false, error: 'Time horizon cannot exceed 1 year (365 days)' };
    return { isValid: true };
  }, []);

  const validateAllInputs = useCallback((volatility: number, drift: number, timeHorizon: number) => {
    const volatilityResult = validateVolatility(volatility);
    const driftResult = validateDrift(drift);
    const timeHorizonResult = validateTimeHorizon(timeHorizon);

    const errors: string[] = [];
    if (!volatilityResult.isValid && volatilityResult.error) errors.push(`Volatility: ${volatilityResult.error}`);
    if (!driftResult.isValid && driftResult.error) errors.push(`Drift: ${driftResult.error}`);
    if (!timeHorizonResult.isValid && timeHorizonResult.error) errors.push(`Time Horizon: ${timeHorizonResult.error}`);

    return {
      isValid: errors.length === 0,
      errors,
      individualResults: {
        volatility: volatilityResult,
        drift: driftResult,
        timeHorizon: timeHorizonResult,
      }
    };
  }, [validateVolatility, validateDrift, validateTimeHorizon]);

  return {
    validateVolatility,
    validateDrift,
    validateTimeHorizon,
    validateAllInputs,
  };
}