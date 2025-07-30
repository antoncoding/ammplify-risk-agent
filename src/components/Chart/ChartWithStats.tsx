import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useChartState } from '@/contexts/ChartStateContext';
import { usePoolContext } from '@/contexts/PoolContext';
import { useUniswapPriceHistory } from '@/hooks/useUniswapPriceHistory';
import { usePoolStats, LookbackPeriod } from '@/hooks/usePoolStats';
import { useChatFunctions } from '@/hooks/useChatFunctions';
import { parsePoolAddress } from '@/utils/poolUtils';
import PoolMetrics from './PoolMetrics';
import { createChart, AreaSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper function to convert lookback period to days
const getDaysFromLookbackPeriod = (period: LookbackPeriod): number => {
  switch (period) {
    case '3 months': return 90;
    case '2 months': return 60;
    case '1 month': return 30;
    case '2 weeks': return 14;
    case '1 week': return 7;
    default: return 90;
  }
};

const API_KEY = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY ?? '';

function ChartWithStats() {
  const router = useRouter();
  const { priceHistory, setPriceHistory, volatility, drift, userPrediction } = useChartState();
  const { poolAddress, poolConfig, lookbackPeriod, setLookbackPeriod } = usePoolContext();
  
  // Register chat control functions
  useChatFunctions();
  
  const isPoolPage = !!poolAddress;
  const { data, loading, error } = useUniswapPriceHistory({ poolAddress, apiKey: API_KEY, limit: 24 * 90 });
  const { stats, poolData, loading: statsLoading } = usePoolStats({ poolAddress, apiKey: API_KEY, lookbackPeriod });
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Get token pair info from pool config, real data, or fallback to parsing
  const tokenPair = poolData ? {
    token0: poolData.token0.id,
    token1: poolData.token1.id,
    symbol0: poolData.token0.symbol,
    symbol1: poolData.token1.symbol,
    pairName: `${poolData.token0.symbol}/${poolData.token1.symbol}`,
    feeTier: poolData.feeTier
  } : poolConfig ? {
    token0: '',
    token1: '',
    symbol0: poolConfig.pair.split('-')[0],
    symbol1: poolConfig.pair.split('-')[1],
    pairName: poolConfig.name,
    feeTier: poolConfig.feeTier
  } : parsePoolAddress(poolAddress);

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
      timeScale: { 
        timeVisible: true, 
        secondsVisible: true,
        rightOffset: 12,
        barSpacing: 3,
      },
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

    // --- Lookback Period High/Low Visualization ---
    if (stats.high > 0 && stats.low > 0) {
      // Add high price line
      areaSeries.createPriceLine({
        price: stats.high,
        color: '#10B981',
        lineWidth: 2,
        lineStyle: 1, // Solid line
        axisLabelVisible: true,
        title: `High (${lookbackPeriod})`
      });

      // Add low price line
      areaSeries.createPriceLine({
        price: stats.low,
        color: '#EF4444',
        lineWidth: 2,
        lineStyle: 1, // Solid line
        axisLabelVisible: true,
        title: `Low (${lookbackPeriod})`
      });

      // Add start date marker
      if (dedupedData.length > 0) {
        const daysToLookback = getDaysFromLookbackPeriod(lookbackPeriod);
        const endIndex = dedupedData.length - 1;
        const startIndex = Math.max(0, endIndex - daysToLookback + 1);
        
        if (startIndex < endIndex) {
          const startTime = dedupedData[startIndex].time;
          const startPrice = dedupedData[startIndex].value;
          const endTime = dedupedData[endIndex].time;
          
          // Add start date marker using series markers
          const startMarker = [{
            time: startTime,
            position: 'aboveBar' as const,
            color: '#F59E0B',
            shape: 'circle' as const,
            text: `Start (${lookbackPeriod})`,
            price: startPrice,
            size: 1, // Make it a smaller dot
          }];
          
          createSeriesMarkers(areaSeries, startMarker);

          // Animate zoom to the selected period with smooth transition
          setTimeout(() => {
            // First fit content to show all data briefly
            chart.timeScale().fitContent();
            
            // Then animate to the selected period
            setTimeout(() => {
              chart.timeScale().setVisibleRange({
                from: startTime,
                to: endTime
              });
            }, 300); // Smooth transition delay
          }, 100); // Initial delay to ensure chart is ready
        }
      }
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
      
      // Add lookback period info
      if (stats.high > 0 && stats.low > 0 && dedupedData.length > 0) {
        const daysToLookback = getDaysFromLookbackPeriod(lookbackPeriod);
        const endIndex = dedupedData.length - 1;
        const startIndex = Math.max(0, endIndex - daysToLookback + 1);
        
        legend.innerHTML += `<div style=\"font-size:13px;color:#059669;\">Period High: ${formatPrice(stats.high)}</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#dc2626;\">Period Low: ${formatPrice(stats.low)}</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#F59E0B;\">Start: ${formatPrice(dedupedData[startIndex]?.value ?? 0)} (marked)</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#666;\">${lookbackPeriod} (zoomed)</div>`;
      }
      
      if (userPrediction.min > 0 && userPrediction.max > 0) {
        legend.innerHTML += `<div style=\"font-size:13px;color:#059669;\">Min: ${formatPrice(userPrediction.min)}</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#dc2626;\">Max: ${formatPrice(userPrediction.max)}</div>`;
        legend.innerHTML += `<div style=\"font-size:13px;color:#666;\">Horizon: ${userPrediction.timeHorizon} days</div>`;
      }
    };
    if (dedupedData.length > 0) {
      setLegendHtml(formatDate(dedupedData[dedupedData.length-1].originalTimestamp), formatPrice(dedupedData[dedupedData.length-1].value));
    }
    const updateLegend = (param: unknown) => {
      let price = '';
      let date = '';
      if (param && typeof param === 'object' && 'time' in param && param.time) {
        const typedParam = param as { time: unknown; seriesData?: Map<unknown, { value?: number; close?: number }> };
        const bar = typedParam.seriesData?.get(areaSeries);
        if (bar) {
          price = formatPrice(bar.value ?? bar.close ?? 0);
          const found = dedupedData.find(d => d.time === String(typedParam.time));
          date = found ? formatDate(found.originalTimestamp) : String(typedParam.time);
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
      if (legend?.parentNode) legend.parentNode.removeChild(legend);
    };
  }, [priceHistory, volatility, drift, userPrediction, stats, lookbackPeriod]);

  return (
    <div className="w-full max-w-6xl bg-background">
      {/* Token Pair Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {isPoolPage && (
              <button
                onClick={() => router.push('/chat')}
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted/50"
                title="Back to markets"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="text-3xl font-bold">{tokenPair?.pairName ?? 'TOKEN0/TOKEN1'}</div>
            {tokenPair?.feeTier && (
              <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                {(parseInt(tokenPair.feeTier) / 10000).toFixed(2)}%
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Lookback Period:</span>
            <Select value={lookbackPeriod} onValueChange={(value: LookbackPeriod) => {
              setLookbackPeriod(value);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3 months">3 months</SelectItem>
                <SelectItem value="2 months">2 months</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Powered by Uniswap v3 subgraph</div>
      </div>

      {/* Pool Metrics */}
      <PoolMetrics stats={stats} loading={statsLoading} />

      {/* Chart Section */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div>
            <div className="text-lg">Price Chart</div>
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