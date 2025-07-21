import React, { useState } from 'react';
import { useChartState } from '@/contexts/ChartStateContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const InputArea = () => {
  const {
    volatility,
    drift,
    setVolatility,
    setDrift,
    userPrediction,
    setUserPrediction,
  } = useChartState();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatValue, setChatValue] = useState('');

  return (
    <div className="w-full max-w-2xl bg-card rounded-lg shadow p-6 flex flex-col gap-6">
      {/* Volatility Input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium">Volatility</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground">ⓘ</span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>Volatility measures how much the price fluctuates over time. Higher means more uncertainty.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <input
          type="number"
          value={volatility}
          onChange={e => setVolatility(Number(e.target.value))}
          className="mt-1 p-2 border rounded bg-background text-base"
          placeholder="e.g. 0.25"
        />
        <span className="text-xs text-muted-foreground">Annualized standard deviation of returns (e.g. 0.25 = 25%)</span>
      </div>

      {/* Drift Input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium">Drift</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground">ⓘ</span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>Drift is the expected average return or trend direction over time.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <input
          type="number"
          value={drift}
          onChange={e => setDrift(Number(e.target.value))}
          className="mt-1 p-2 border rounded bg-background text-base"
          placeholder="e.g. 0.05"
        />
        <span className="text-xs text-muted-foreground">Expected annualized return (e.g. 0.05 = 5%)</span>
      </div>

      {/* Prediction Range Input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium">Prediction Range</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground">ⓘ</span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>What do you think is the likely minimum and maximum price in your chosen time frame?</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={userPrediction.min}
            onChange={e => setUserPrediction({ ...userPrediction, min: Number(e.target.value) })}
            className="p-2 border rounded bg-background text-base w-1/2"
            placeholder="Min price"
          />
          <input
            type="number"
            value={userPrediction.max}
            onChange={e => setUserPrediction({ ...userPrediction, max: Number(e.target.value) })}
            className="p-2 border rounded bg-background text-base w-1/2"
            placeholder="Max price"
          />
          <input
            type="number"
            value={userPrediction.timeHorizon}
            onChange={e => setUserPrediction({ ...userPrediction, timeHorizon: Number(e.target.value) })}
            className="p-2 border rounded bg-background text-base w-1/3"
            placeholder="Days"
          />
        </div>
        <span className="text-xs text-muted-foreground">E.g. 1800 ~ 2400 in 30 days</span>
      </div>

      {/* Chat Input */}
      <div className="flex flex-col gap-1 mt-2">
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={() => setChatOpen(v => !v)}
          type="button"
        >
          {chatOpen ? 'Hide Chat' : 'Ask a question...'}
        </Button>
        {chatOpen && (
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); setChatValue(''); }}>
            <input
              type="text"
              value={chatValue}
              onChange={e => setChatValue(e.target.value)}
              className="flex-1 p-2 border rounded bg-background text-base"
              placeholder="Type your question about volatility, drift, or the chart..."
            />
            <Button type="submit" variant="default">Send</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InputArea; 