import { Address } from 'viem';

// Generic Web3 Types
export type TokenInfo = {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  img?: string;
};

export type Transaction = {
  hash: string;
  timestamp: number;
  from: Address;
  to: Address;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed';
};

export type Balance = {
  token: TokenInfo;
  balance: string;
  balanceUsd: number;
  chainId: number;
};

export type NetworkInfo = {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export type UserProfile = {
  address: Address;
  ensName?: string;
  avatar?: string;
  balances: Balance[];
  transactions: Transaction[];
};

// Generic API Response Types
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

// Generic Chart/Data Types
export type DataPoint = {
  x: number | string;
  y: number;
};

export type ChartData = {
  label: string;
  data: DataPoint[];
  color?: string;
};

export type TimeRange = {
  start: number;
  end: number;
};

// Generic Settings Types
export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  analytics: boolean;
  language: string;
};

// Generic Error Types
export type AppError = {
  code: string;
  message: string;
  details?: unknown;
};

// Generic Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type AsyncState<T> = {
  data: T | null;
  loading: LoadingState;
  error: AppError | null;
};

// Re-export AI and Financial types for convenience
export * from './ai';
export * from './financial';
