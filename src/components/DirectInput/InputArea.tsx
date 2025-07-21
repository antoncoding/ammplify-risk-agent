import React, { useState } from 'react';
import { FaSeedling, FaComments, FaBolt } from 'react-icons/fa';
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
  const [mode, setMode] = useState<'easy' | 'chat' | 'pro'>('easy');
  const [chatValue, setChatValue] = useState('');
  // For animation
  const [showSection, setShowSection] = useState<'easy' | 'chat' | 'pro' | ''>('easy');
  React.useEffect(() => {
    // Animate out, then in
    setShowSection('');
    const t = setTimeout(() => setShowSection(mode), 120);
    return () => clearTimeout(t);
  }, [mode]);

  return (
    <div className="w-full max-w-4xl bg-card rounded-lg shadow p-6 flex flex-col gap-6">
      {/* Mode Switch - Switch style toggle group */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm border border-muted bg-muted overflow-hidden">
          <button
            className={`px-5 py-2 flex items-center gap-2 text-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${mode==='easy' ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'} ${mode==='easy' ? 'z-10' : ''}`}
            onClick={() => setMode('easy')}
            aria-label="Easy mode"
            type="button"
          >
            <FaSeedling className="text-xl" />
          </button>
          <button
            className={`px-5 py-2 flex items-center gap-2 text-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary border-l border-muted ${mode==='chat' ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'} ${mode==='chat' ? 'z-10' : ''}`}
            onClick={() => setMode('chat')}
            aria-label="Chat mode"
            type="button"
          >
            <FaComments className="text-xl" />
          </button>
          <button
            className={`px-5 py-2 flex items-center gap-2 text-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary border-l border-muted ${mode==='pro' ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'} ${mode==='pro' ? 'z-10' : ''}`}
            onClick={() => setMode('pro')}
            aria-label="Pro mode"
            type="button"
          >
            <FaBolt className="text-xl" />
          </button>
        </div>
      </div>
      {/* Animated Section */}
      <div className="min-h-[120px]">
        <div className={`transition-opacity duration-200 ${showSection==='easy' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'} w-full`}>
          {/* Easy Mode: Prediction Range Input */}
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
        </div>
        <div className={`transition-opacity duration-200 ${showSection==='chat' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'} w-full`}>
          {/* Chat Mode: Chat Input */}
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
        </div>
        <div className={`transition-opacity duration-200 ${showSection==='pro' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'} w-full`}>
          {/* Pro Mode: Volatility + Drift on one line */}
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
              <span className="text-base font-medium ml-6">Drift</span>
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
            <div className="flex gap-2">
              <input
                type="number"
                value={volatility}
                onChange={e => setVolatility(Number(e.target.value))}
                className="p-2 border rounded bg-background text-base w-1/2"
                placeholder="e.g. 0.25"
              />
              <input
                type="number"
                value={drift}
                onChange={e => setDrift(Number(e.target.value))}
                className="p-2 border rounded bg-background text-base w-1/2"
                placeholder="e.g. 0.05"
              />
            </div>
            <span className="text-xs text-muted-foreground">Annualized standard deviation (e.g. 0.25 = 25%), Drift (e.g. 0.05 = 5%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea; 