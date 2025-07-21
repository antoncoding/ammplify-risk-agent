import React, { useEffect } from 'react';
import { useChartState } from '@/contexts/ChartStateContext';
import { useUniswapPriceHistory } from '@/hooks/useUniswapPriceHistory';
import { createChart, LineSeries } from 'lightweight-charts';

const POOL_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'; // ETH/USDC
const API_KEY = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY || '';

const ChartWithStats = () => {
  const { priceHistory, setPriceHistory, volatility, drift } = useChartState();
  const { data, loading, error } = useUniswapPriceHistory({ poolAddress: POOL_ADDRESS, apiKey: API_KEY, limit: 24 * 90 });
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length) setPriceHistory(data);
  }, [data, setPriceHistory]);

  console.log('priceHistory', data);

  useEffect(() => {
    if (!chartContainerRef.current || !priceHistory.length) return;
    chartContainerRef.current.innerHTML = '';
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 320,
      layout: { background: { color: 'transparent' }, textColor: '#888' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#ccc' },
    });
    // Map to { time, value } and dedupe by time string (hour precision)
    const mappedData = priceHistory
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(p => ({
        time: new Date(p.timestamp * 1000).toISOString().slice(0, 13) + ':00:00Z',
        value: p.price,
        originalTimestamp: p.timestamp
      }));
    const dedupedData = mappedData.filter((point, idx, arr) => idx === 0 || point.time !== arr[idx - 1].time);
    // Debug log
    // console.log('Chart data for setData:', dedupedData);

    const lineSeries = chart.addSeries(LineSeries);
    lineSeries.setData(
      dedupedData.map(({ time, value }) => ({ time, value }))
    );

    // Add a price line at the latest price
    if (dedupedData.length > 0) {
      lineSeries.createPriceLine({
        price: dedupedData[dedupedData.length - 1].value,
        color: '#3B82F6',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Latest'
      });
    }
    // Note: setMarkers is not supported in lightweight-charts v5 for line series. For advanced markers/tools, consider a custom overlay or a different charting library.
    return () => chart.remove();
  }, [priceHistory]);

  return (
    <div className="w-full max-w-4xl bg-card rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">ETH/USDC Price Chart</div>
          <div className="text-xs text-muted-foreground">Powered by Uniswap v3 subgraph</div>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div>Current Price: {priceHistory.length ? priceHistory[priceHistory.length-1].price.toFixed(2) : '--'}</div>
          <div>Volatility: {volatility}</div>
          <div>Drift: {drift}</div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-80" />
      {loading && <div className="text-center text-muted-foreground">Loading price data...</div>}
      {error && <div className="text-center text-destructive">Error: {error}</div>}
    </div>
  );
};

export default ChartWithStats; 