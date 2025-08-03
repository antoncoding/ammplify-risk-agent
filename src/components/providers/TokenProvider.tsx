'use client';

import React, { createContext, useContext } from 'react';
import { getTokenByAddress } from '@/config/tokens';

type Token = {
  address: string;
  symbol: string;
  decimals: number;
  img?: string;
  isFactoryToken?: boolean;
  protocol?: {
    name: string;
  };
};

type TokenProviderContextType = {
  findToken: (address: string, chainId: number) => Token | null;
};

const TokenProviderContext = createContext<TokenProviderContextType | null>(null);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const findToken = (address: string, chainId: number): Token | null => {
    // For now, we only support mainnet (chainId 1)
    if (chainId !== 1) {
      return null;
    }

    const tokenConfig = getTokenByAddress(address);
    if (tokenConfig) {
      return {
        address: tokenConfig.address,
        symbol: tokenConfig.symbol,
        decimals: tokenConfig.decimals,
        img: tokenConfig.img,
        isFactoryToken: false,
      };
    }

    return null;
  };

  return (
    <TokenProviderContext.Provider value={{ findToken }}>
      {children}
    </TokenProviderContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenProviderContext);
  if (!context) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
} 