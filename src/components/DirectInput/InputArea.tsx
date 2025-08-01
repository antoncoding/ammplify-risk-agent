import React, { useState } from 'react';
import { GoQuestion } from 'react-icons/go';
import { useChartState } from '@/contexts/ChartStateContext';
import { Tooltip } from '@/components/ui/tooltip';
import PredictionResult from './PredictionResult';

function InputArea() {
  const {
    volatility,
    drift,
    setPredictionFromDriftVol,
    userPrediction,
    currentPrice,
  } = useChartState();

  // Local state for controlled inputs
  const [localVol, setLocalVol] = useState(volatility);
  const [localDrift, setLocalDrift] = useState(drift);
  const [localTime, setLocalTime] = useState(userPrediction.timeHorizon);
  const [showResult, setShowResult] = useState(false);
  const [calcDrift, setCalcDrift] = useState(localDrift);
  const [calcVol, setCalcVol] = useState(localVol);
  const [calcTime, setCalcTime] = useState(localTime);

  // Update prediction as user types
  React.useEffect(() => {
    setPredictionFromDriftVol(localDrift, localVol, localTime);
  }, [localDrift, localVol, localTime, setPredictionFromDriftVol]);

  const handleCalculate = () => {
    setCalcDrift(localDrift);
    setCalcVol(localVol);
    setCalcTime(localTime);
    setShowResult(true);
  };

  return (
    <div className="w-full max-w-6xl bg-card rounded-lg shadow p-6 flex flex-col gap-4 font-zen">
      {/* Title and Description */}
      <div className="mb-2">
        <div className="text-xl">Your Market Prediction</div>
        <div className="text-sm text-muted-foreground">
          Share your view on future price movement by entering your expected trend (drift) and uncertainty (volatility).
        </div>
      </div>
      {/* Input Fields */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-4 w-full">
          <div className="flex flex-col items-start gap-1 flex-1">
            <div className="flex items-center gap-1">
              <label htmlFor="volatility" className="text-xs font-medium text-muted-foreground">Volatility</label>
              <Tooltip content="Annualized standard deviation of price returns. Higher values mean more uncertainty.">
                <GoQuestion className="text-muted-foreground text-xs" />
              </Tooltip>
            </div>
            <div className="relative w-full">
              <input
                id="volatility"
                type="number"
                value={localVol}
                onChange={e => setLocalVol(Number(e.target.value))}
                className="w-full p-3 pr-10 border rounded bg-background text-sm"
                placeholder="0.25"
                min={0}
                step={0.01}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 flex-1">
            <div className="flex items-center gap-1">
              <label htmlFor="drift" className="text-xs font-medium text-muted-foreground">Drift</label>
              <Tooltip content="Expected average return or trend direction over time.">
                <GoQuestion className="text-muted-foreground text-xs" />
              </Tooltip>
            </div>
            <div className="relative w-full">
              <input
                id="drift"
                type="number"
                value={localDrift}
                onChange={e => setLocalDrift(Number(e.target.value))}
                className="w-full p-3 pr-10 border rounded bg-background text-sm"
                placeholder="0.05"
                min={-1}
                step={0.01}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 flex-1">
            <div className="flex items-center gap-1">
              <label htmlFor="timeHorizon" className="text-xs font-medium text-muted-foreground">Time Horizon</label>
              <Tooltip content="Number of days into the future for your prediction.">
                <GoQuestion className="text-muted-foreground text-xs" />
              </Tooltip>
            </div>
            <div className="relative w-full">
              <input
                id="timeHorizon"
                type="number"
                value={localTime}
                onChange={e => setLocalTime(Number(e.target.value))}
                className="w-full p-3 pr-14 border rounded bg-background text-sm"
                placeholder="30"
                min={1}
                step={1}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">days</span>
            </div>
          </div>
          <button
            className="py-3 px-6 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            onClick={handleCalculate}
            type="button"
          >
            Calculate
          </button>
        </div>
        {showResult && (
          <PredictionResult
            drift={calcDrift}
            vol={calcVol}
            time={calcTime}
            currentPrice={currentPrice}
          />
        )}
      </div>
    </div>
  );
};

export default InputArea; 