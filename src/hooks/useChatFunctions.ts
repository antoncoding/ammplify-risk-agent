'use client';

import { useEffect, useCallback } from 'react';
import { useChatContext, ChatFunction } from '@/contexts/ChatContext';
import { usePoolContext } from '@/contexts/PoolContext';
import { LookbackPeriod } from '@/hooks/usePoolStats';

// Hook to register chart control functions with the chat system
export function useChatFunctions() {
  const { registerFunction, unregisterFunction } = useChatContext();
  const { updateLookbackPeriod, refreshData, chartControls } = usePoolContext();

  // Memoize function definitions to prevent re-registration
  const createFunctions = useCallback((): ChatFunction[] => [
      {
        name: 'changeLookbackPeriod',
        description: 'Change the time period for data analysis',
        parameters: {
          period: {
            type: 'string',
            enum: ['1 week', '2 weeks', '1 month', '2 months', '3 months'],
            description: 'The lookback period to use'
          }
        },
        execute: async (params) => {
          const period = params.period as LookbackPeriod;
          updateLookbackPeriod(period);
        }
      },
      {
        name: 'refreshData',
        description: 'Refresh all chart and pool data',
        parameters: {},
        execute: async () => {
          refreshData();
        }
      },
      {
        name: 'zoomToTimeRange',
        description: 'Zoom the chart to a specific time range',
        parameters: {
          startTime: { type: 'number', description: 'Start timestamp' },
          endTime: { type: 'number', description: 'End timestamp' }
        },
        execute: async (params) => {
          chartControls.zoomToTimeRange(params.startTime as number, params.endTime as number);
        }
      },
      {
        name: 'highlightPriceLevel',
        description: 'Highlight a specific price level on the chart',
        parameters: {
          price: { type: 'number', description: 'Price level to highlight' }
        },
        execute: async (params) => {
          chartControls.highlightPriceLevel(params.price as number);
        }
      },
      {
        name: 'addChartAnnotation',
        description: 'Add an annotation to the chart',
        parameters: {
          time: { type: 'number', description: 'Timestamp for annotation' },
          price: { type: 'number', description: 'Price level for annotation' },
          text: { type: 'string', description: 'Annotation text' }
        },
        execute: async (params) => {
          chartControls.addAnnotation(params.time as number, params.price as number, params.text as string);
        }
      },
      {
        name: 'resetChartView',
        description: 'Reset the chart to default view',
        parameters: {},
        execute: async () => {
          chartControls.resetView();
        }
      }
    ], [updateLookbackPeriod, refreshData, chartControls]);

  useEffect(() => {
    const functions = createFunctions();
    
    // Register all functions
    functions.forEach(func => registerFunction(func));

    // Cleanup on unmount
    return () => {
      functions.forEach(func => unregisterFunction(func.name));
    };
  }, [createFunctions, registerFunction, unregisterFunction]);
}