import React, { useEffect } from 'react';
import { useChartState } from '@/contexts/ChartStateContext';
import { useUniswapPriceHistory } from '@/hooks/useUniswapPriceHistory';
import { usePoolStats } from '@/hooks/usePoolStats';
import { parsePoolAddress } from '@/utils/poolUtils';
import PoolMetrics from './PoolMetrics';
import { createChart, AreaSeries, LineSeries } from 'lightweight-charts';

const POOL_ADDRESS = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'; // ETH/USDC
const API_KEY = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY ?? '';

const ChartWithStats = () => {
  const { priceHistory, setPriceHistory, volatility, drift, userPrediction } = useChartState();
  const { data, loading, error } = useUniswapPriceHistory({ poolAddress: POOL_ADDRESS, apiKey: API_KEY, limit: 24 * 90 });
  const { stats, poolData, loading: statsLoading } = usePoolStats({ poolAddress: POOL_ADDRESS, apiKey: API_KEY });
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Get token pair info from real data or fallback to parsing
  const tokenPair = poolData ? {
    token0: poolData.token0.id,
    token1: poolData.token1.id,
    symbol0: poolData.token0.symbol,
    symbol1: poolData.token1.symbol,
    pairName: `${poolData.token0.symbol}/${poolData.token1.symbol}`,
    feeTier: poolData.feeTier
  } : parsePoolAddress(POOL_ADDRESS);

  useEffect(() => {
    if (data.length) setPriceHistory(data);
  }, [data, setPriceHistory]);

  useEffect(() => {
    if (!chartContainerRef.current || !priceHistory.length) return;
    chartContainerRef.current.innerHTML = '';
    chartContainerRef.current.style.position = 'relative';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 320,
      layout: { background: { color: 'transparent' }, textColor: '#888' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      timeScale: { timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderColor: '#ccc' },
    });
    const mappedData = priceHistory
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(p => ({
        time: new Date(p.timestamp * 1000).toISOString().slice(0, 10),
        value: p.price,
        originalTimestamp: p.timestamp
      }));
    const dedupedData = mappedData.filter((point, idx, arr) => idx === 0 || point.time !== arr[idx - 1].time);
    const primary = '#3B82F6';
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: primary,
      bottomColor: 'rgba(59, 130, 246, 0.18)',
      lineColor: primary,
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    areaSeries.setData(
      dedupedData.map(({ time, value }) => ({ time, value }))
    );
    if (dedupedData.length > 0) {
      areaSeries.createPriceLine({
        price: dedupedData[dedupedData.length - 1].value,
        color: primary,
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Latest'
      });
    }
    // --- Prediction Range Visualization ---
    if (userPrediction.min > 0 && userPrediction.max > 0) {
      // Draw min/max as price lines using line series
      const minLine = chart.addSeries(LineSeries, { color: '#10B981', lineWidth: 2 });
      minLine.setData(
        dedupedData.map(({ time }) => ({ time, value: userPrediction.min }))
      );
      const maxLine = chart.addSeries(LineSeries, { color: '#EF4444', lineWidth: 2 });
      maxLine.setData(
        dedupedData.map(({ time }) => ({ time, value: userPrediction.max }))
      );
    }
    // --- Legend logic start ---
    const legend = document.createElement('div');
    legend.style.position = 'absolute';
    legend.style.left = '16px';
    legend.style.top = '16px';
    legend.style.zIndex = '2';
    legend.style.fontSize = '15px';
    legend.style.fontFamily = 'sans-serif';
    legend.style.lineHeight = '20px';
    legend.style.fontWeight = '400';
    legend.style.background = 'rgba(255,255,255,0.85)';
    legend.style.borderRadius = '6px';
    legend.style.padding = '8px 16px';
    legend.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
    legend.style.color = '#222';
    legend.style.pointerEvents = 'none';
    chartContainerRef.current.appendChild(legend);

    const formatPrice = (price: number) => price !== undefined ? price.toFixed(2) : '--';
    const formatDate = (timestamp: number) => {
      const d = new Date(timestamp * 1000);
      return d.toLocaleDateString();
    };
    const setLegendHtml = (date: string, price: string) => {
      legend.innerHTML = `<div style=\"font-size:20px;margin:2px 0;\">${price}</div><div style=\"font-size:13px;color:#666;\">${date}</div>`;
      if (userPrediction.min > 0 && userPrediction.max > 0) {
        legend.innerHTML += `<div style=\"font-size:13px;color:#059669;\">Min: ${formatPrice(userPrediction.min)}</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#dc2626;\">Max: ${formatPrice(userPrediction.max)}</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#666;\">Horizon: ${userPrediction.timeHorizon} days</div>`;
      }
    };
    if (dedupedData.length > 0) {
      setLegendHtml(formatDate(dedupedData[dedupedData.length-1].originalTimestamp), formatPrice(dedupedData[dedupedData.length-1].value));
    }
    const updateLegend = (param: any) => {
      let price = '';
      let date = '';
      if (param && param.time) {
        const bar = param.seriesData.get(areaSeries);
        if (bar) {
          price = formatPrice(bar.value !== undefined ? bar.value : bar.close);
          const found = dedupedData.find(d => d.time === param.time);
          date = found ? formatDate(found.originalTimestamp) : param.time;
        }
      } else if (dedupedData.length > 0) {
        price = formatPrice(dedupedData[dedupedData.length-1].value);
        date = formatDate(dedupedData[dedupedData.length-1].originalTimestamp);
      }
      setLegendHtml(date, price);
    };
    chart.subscribeCrosshairMove(updateLegend);
    chart.timeScale().fitContent();
    return () => {
      chart.remove();
      if (legend && legend.parentNode) legend.parentNode.removeChild(legend);
    };
  }, [priceHistory, volatility, drift, userPrediction]);

  return (
    <div className="w-full max-w-6xl bg-background">
      {/* Token Pair Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl font-bold">{tokenPair?.pairName ?? 'TOKEN0/TOKEN1'}</div>
          {tokenPair?.feeTier && (
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
              {(parseInt(tokenPair.feeTier) / 10000).toFixed(2)}%
            </div>
          )}
          
        </div>
        <div className="text-sm text-muted-foreground">Powered by Uniswap v3 subgraph</div>
      </div>

      {/* Pool Metrics */}
      <PoolMetrics stats={stats} loading={statsLoading} />

      {/* Chart Section */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div>
            <div className="text-lg font-semibold">Price Chart</div>
            <div className="text-xs text-muted-foreground">Historical price data</div>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <div>Current Price: {priceHistory.length ? priceHistory[priceHistory.length-1].price.toFixed(2) : '--'}</div>
            <div>Volatility: {volatility}</div>
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full h-80" />
        {loading && <div className="text-center text-muted-foreground">Loading price data...</div>}
        {error && <div className="text-center text-destructive">Error: {error}</div>}
      </div>
    </div>
  );
};

export default ChartWithStats; 