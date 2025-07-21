import React from 'react';
import { useChartState } from '@/contexts/ChartStateContext';

const VolDriftInput = () => {
  const { volatility, drift, setVolatility, setDrift } = useChartState();

  return (
    <div className="flex gap-4 items-center p-4 bg-card rounded shadow mb-4">
      <label>
        Volatility:
        <input
          type="number"
          value={volatility}
          onChange={e => setVolatility(Number(e.target.value))}
          className="ml-2 p-1 border rounded"
        />
      </label>
      <label>
        Drift:
        <input
          type="number"
          value={drift}
          onChange={e => setDrift(Number(e.target.value))}
          className="ml-2 p-1 border rounded"
        />
      </label>
    </div>
  );
};

export default VolDriftInput; 