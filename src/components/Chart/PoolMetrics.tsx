import React from 'react';
import { GoQuestion } from 'react-icons/go';
import { PiHandCoinsThin } from "react-icons/pi";
import { HiOutlineCash } from "react-icons/hi";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Volume',
      value: formatCurrency(stats.volume),
      subtitle: `${formatNumber(stats.volume)} USD`,
      tooltip: 'Total trading volume from the most recent complete 24-hour period. This represents the previous day\'s full trading activity.',
      icon: <HiOutlineCash className="h-4 w-4" />
    },
    {
      title: 'Total Fees',
      value: formatCurrency(stats.fees),
      subtitle: `${formatNumber(stats.fees)} USD`,
      tooltip: 'Total fees collected from the most recent complete 24-hour period. This represents the previous day\'s fee revenue.',
      icon: <PiHandCoinsThin className="h-4 w-4" />
    },
    {
      title: 'Fee Rate',
      value: `${(stats.feeRate * 100).toFixed(2)}%`,
      subtitle: 'Constant fee rate',
      tooltip: 'Fixed fee rate applied to all trades in this pool. This rate is constant and does not change.'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-card rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
            <Tooltip content={metric.tooltip} icon={metric.icon}>
              <GoQuestion className="h-4 w-4 text-muted-foreground" />
            </Tooltip>
          </div>
          <div className="text-2xl font-semibold">{metric.value}</div>
          <div className="text-xs text-muted-foreground">{metric.subtitle}</div>
        </div>
      ))}
    </div>
  );
};

export default PoolMetrics; 