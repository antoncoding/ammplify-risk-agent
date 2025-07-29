import React from 'react';
import { GoQuestion } from 'react-icons/go';
import { PiHandCoinsThin } from "react-icons/pi";
import { HiOutlineCash } from "react-icons/hi";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import { Tooltip } from '@/components/ui/tooltip';
import { PoolStats } from '@/hooks/usePoolStats';
import { formatCurrency, formatNumber } from '@/utils/poolUtils';

type PoolMetricsProps = {
  stats: PoolStats;
  loading: boolean;
};

const PoolMetrics: React.FC<PoolMetricsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Volume */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Volume</h3>
          <Tooltip 
            content={`Total trading volume from ${stats.startDate} to ${stats.endDate}. This represents the aggregated trading activity over the selected period.`} 
            icon={<HiOutlineCash className="h-4 w-4" />}
          >
            <GoQuestion className="h-4 w-4 text-muted-foreground" />
          </Tooltip>
        </div>
        <div className="text-2xl">{formatCurrency(stats.volume)}</div>
        <div className="text-xs text-muted-foreground">{formatNumber(stats.volume)} USD</div>
      </div>

      {/* Total Fees */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Fees</h3>
          <Tooltip 
            content={`Total fees collected from ${stats.startDate} to ${stats.endDate}. This represents the aggregated fee revenue over the selected period.`} 
            icon={<PiHandCoinsThin className="h-4 w-4" />}
          >
            <GoQuestion className="h-4 w-4 text-muted-foreground" />
          </Tooltip>
        </div>
        <div className="text-2xl">{formatCurrency(stats.fees)}</div>
        <div className="text-xs text-muted-foreground">{formatNumber(stats.fees)} USD</div>
      </div>

      {/* Price Range */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Price Range</h3>
          <Tooltip 
            content={`Price range from ${stats.startDate} to ${stats.endDate}. Shows the highest and lowest prices reached during the selected period.`} 
            icon={<BiTrendingUp className="h-4 w-4" />}
          >
            <GoQuestion className="h-4 w-4 text-muted-foreground" />
          </Tooltip>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">High</span>
            <span className="text-lg text-green-500">{stats.high.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Low</span>
            <span className="text-lg text-red-500">{stats.low.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Growth & Volatility */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Growth & Volatility</h3>
          <Tooltip 
            content={`Growth: ${stats.growth >= 0 ? '+' : ''}${stats.growth.toFixed(2)}% from ${stats.startDate} to ${stats.endDate}. Volatility: ${stats.volatility.toFixed(2)}% (standard deviation of daily returns).`} 
            icon={<BiTrendingUp className="h-4 w-4" />}
          >
            <GoQuestion className="h-4 w-4 text-muted-foreground" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {stats.growth >= 0 ? (
            <BiTrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <BiTrendingDown className="h-5 w-5 text-red-500" />
          )}
          <div className={`text-lg ${stats.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(2)}%
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Vol: {stats.volatility.toFixed(2)}%</div>
      </div>
    </div>
  );
};

export default PoolMetrics; 