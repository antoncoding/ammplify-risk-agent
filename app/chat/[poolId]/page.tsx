import PoolContent from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pool Analysis',
  description: 'Analyze and predict price movements for specific trading pools.',
};

interface PageProps {
  params: {
    poolId: string;
  };
}

export default function Page({ params }: PageProps) {
  return <PoolContent poolId={params.poolId} />;
}