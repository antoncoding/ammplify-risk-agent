import Content from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pool Analysis - Ammplify Risk Agent',
  description: 'Select and analyze liquidity pools with advanced risk assessment tools.',
};

export default function Page() {
  return <Content />;
} 