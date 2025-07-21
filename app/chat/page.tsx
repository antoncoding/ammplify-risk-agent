import Content from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Chat with the Ammplify Risk Agent and view live price charts.',
};

export default function Page() {
  return <Content />;
} 