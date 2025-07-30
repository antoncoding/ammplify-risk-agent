import React from 'react';
import { useChartState } from '@/contexts/ChartStateContext';

function ChartStats() {
  const { currentPrice, volatility } = useChartState();

  return (
    <div className="p-4 bg-muted rounded shadow mb-4">
      <div>Current Price: {currentPrice}</div>
      <div>Volatility: {volatility}</div>
    </div>
  );
}

export default ChartStats; 