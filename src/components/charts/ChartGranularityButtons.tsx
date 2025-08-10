import React from 'react';

const options = [
  { label: '1D', value: 'day' },
  { label: '1W', value: 'week' },
  { label: '1M', value: 'month' },
  { label: '3M', value: '3month' },
];

export type ChartGranularity = 'day' | 'week' | 'month' | '3month';

type ChartGranularityButtonsProps = {
  selected: ChartGranularity;
  onChange: (granularity: ChartGranularity) => void;
};

function ChartGranularityButtons({ selected, onChange }: ChartGranularityButtonsProps) {
  return (
    <div className="flex gap-2 mb-2">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`px-3 py-1 rounded ${selected === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          onClick={() => onChange(opt.value as ChartGranularity)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default ChartGranularityButtons; 