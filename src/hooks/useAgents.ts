import { useState } from 'react';
import { ChatResponse, PoolData } from '@/types/ai';
import { VolDriftInput, VolDriftOutput } from '@/lib/tools/vol-drift-calculator';

export function usePoolSelectionAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rankPools = async (message: string, poolData: PoolData[]): Promise<ChatResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agents/pool-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, poolData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get pool ranking');
      }
      
      return await response.json() as ChatResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rankPools, loading, error };
}

export function useRangeAnalysisAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRange = async (message: string, context?: unknown): Promise<ChatResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agents/range-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get range analysis');
      }
      
      return await response.json() as ChatResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeRange, loading, error };
}

export function useVolDriftCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateVolDrift = async (input: VolDriftInput): Promise<VolDriftOutput | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tools/vol-drift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate vol/drift');
      }
      
      return await response.json() as VolDriftOutput;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { calculateVolDrift, loading, error };
}

export function usePoolData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPools = async (): Promise<PoolData[] | null> => {
    console.log('🌐 usePoolData: Starting fetchAllPools...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 usePoolData: Calling /api/pools/all');
      const response = await fetch('/api/pools/all');
      console.log('📊 usePoolData: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pools: ${response.status}`);
      }
      
      const data = await response.json() as PoolData[];
      console.log('✅ usePoolData: Received data:', data);
      return data;
    } catch (err) {
      console.error('💥 usePoolData: Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      console.log('🏁 usePoolData: Finished loading');
    }
  };

  const fetchPoolData = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pools/${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pool data');
      }
      
      return await response.json() as ChatResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchAllPools, fetchPoolData, loading, error };
}