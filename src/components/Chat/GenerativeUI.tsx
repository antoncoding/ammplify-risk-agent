'use client';

import React from 'react';

// Define the different types of generative UI components
export type GenerativeUIAction = {
  id: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
};

export type GenerativeUIComponent = {
  type: 'buttonList';
  title?: string;
  actions: GenerativeUIAction[];
};

interface GenerativeUIProps {
  component: GenerativeUIComponent;
}

export default function GenerativeUI({ component }: GenerativeUIProps) {
  if (component.type === 'buttonList') {
    return (
      <div className="space-y-3">
        {component.title && (
          <div className="text-sm font-medium text-muted-foreground">
            {component.title}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {component.actions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                action.variant === 'primary'
                  ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary'
                  : 'bg-muted/50 hover:bg-muted border border-border text-foreground hover:border-primary/20'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}