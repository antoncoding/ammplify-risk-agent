import React from 'react';
import { GoQuestion } from 'react-icons/go';
import { Tooltip } from '@/components/ui/tooltip';
import { ValidationResult } from '@/hooks/useInputValidation';

type FinancialInputProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  tooltip?: string;
  validation?: ValidationResult;
  'aria-label'?: string;
  disabled?: boolean;
  loading?: boolean;
};

export function FinancialInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 0.01,
  suffix = '%',
  tooltip,
  validation,
  'aria-label': ariaLabel,
  disabled = false,
  loading = false,
}: FinancialInputProps): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = Number(e.target.value);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const hasError = validation && !validation.isValid;

  return (
    <div className="flex flex-col items-start gap-1 flex-1">
      <div className="flex items-center gap-1">
        <label 
          htmlFor={id} 
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <GoQuestion className="text-muted-foreground text-xs" />
          </Tooltip>
        )}
      </div>
      
      <div className="relative w-full">
        <input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          className={`w-full p-3 pr-10 border rounded bg-background text-sm ${
            hasError 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-border focus:border-primary'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel}
          disabled={disabled || loading}
        />
        
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
        
        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      {hasError && validation?.error && (
        <span className="text-xs text-red-500 mt-1">
          {validation.error}
        </span>
      )}
    </div>
  );
}