import { generateMetadata } from '@/utils/generateMetadata';
import HomePage from './home/HomePage';

export const metadata = generateMetadata({
  title: 'Ammplify Risk Agent',
  description: 'Advanced liquidity pool analysis and risk assessment tool for AMM trading on Ethereum',
});

export default function Page() {
  return <HomePage />;
}
