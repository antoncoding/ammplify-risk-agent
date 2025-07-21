import React from 'react';
import { useChartState } from '@/contexts/ChartStateContext';

const InteractivePriceChart = () => {
  const { priceHistory, currentPrice, userPrediction } = useChartState();

  return (
    <div className="w-full h-80 bg-accent rounded-lg flex items-center justify-center text-2xl text-accent-foreground shadow-md">
      Price Chart Placeholder<br />
      Current Price: {currentPrice}<br />
      User Prediction: {userPrediction.min} ~ {userPrediction.max} in {userPrediction.timeHorizon} days
    </div>
  );
};

export default InteractivePriceChart; 