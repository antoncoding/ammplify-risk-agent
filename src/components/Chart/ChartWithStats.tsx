import React, { useEffect } from 'react';
import { useChartState } from '@/contexts/ChartStateContext';
import { useUniswapPriceHistory } from '@/hooks/useUniswapPriceHistory';
import { ColorType, createChart, AreaSeries } from 'lightweight-charts';

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
    // Ensure the container is relatively positioned for absolute overlays
    chartContainerRef.current.style.position = 'relative';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 320,
      layout: { background: { color: 'transparent' }, textColor: '#888' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      timeScale: { timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderColor: '#ccc' },
    });
    // Map to { time, value } and dedupe by time string (hour precision)
    const mappedData = priceHistory
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(p => ({
        time: new Date(p.timestamp * 1000).toISOString().slice(0, 10),
        value: p.price,
        originalTimestamp: p.timestamp
      }));
    const dedupedData = mappedData.filter((point, idx, arr) => idx === 0 || point.time !== arr[idx - 1].time);
    // Debug log
    // console.log('Chart data for setData:', dedupedData);

    // Use Tailwind's primary color or fallback
    const primary = '#3B82F6'; // Tailwind blue-500
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: primary,
      bottomColor: 'rgba(59, 130, 246, 0.18)', // blue-500 with opacity
      lineColor: primary,
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    areaSeries.setData(
      dedupedData.map(({ time, value }) => ({ time, value }))
    );

    // Add a price line at the latest price
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
    };
    // Show latest by default
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
          // param.time is in YYYY-MM-DD, find the original timestamp
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
    // --- Legend logic end ---

    chart.timeScale().fitContent();
    // Note: setMarkers is not supported in lightweight-charts v5 for line series. For advanced markers/tools, consider a custom overlay or a different charting library.
    return () => {
      chart.remove();
      if (legend && legend.parentNode) legend.parentNode.removeChild(legend);
    };
  }, [priceHistory, volatility]);

  return (
    <div className="w-full max-w-4xl bg-card rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">ETH/USDC</div>
          <div className="text-xs text-muted-foreground">Powered by Uniswap v3 subgraph</div>
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
  );
};

export default ChartWithStats; 