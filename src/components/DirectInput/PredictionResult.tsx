import React from 'react';

interface PredictionResultProps {
  drift: number;
  vol: number;
  time: number;
  currentPrice: number;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ drift, vol, time, currentPrice }) => {
  const valid = currentPrice > 0 && !isNaN(drift) && !isNaN(vol) && !isNaN(time) && time > 0;
  const min = valid ? currentPrice * (1 + drift - vol) : null;
  const max = valid ? currentPrice * (1 + drift + vol) : null;

  return (
    <div className="mt-4 w-full bg-muted rounded-lg p-4 flex flex-col items-center justify-center font-zen">
      <div className="text-sm text-muted-foreground">
        This is equivalent to ETH price being <span className="font-semibold">{min !== null ? `$${min.toFixed(2)}` : '—'} ~ {max !== null ? `$${max.toFixed(2)}` : '—'}</span> in {time || '—'} days
      </div>
    </div>
  );
};

export default PredictionResult; 