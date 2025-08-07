import PoolContent from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pool Analysis',
  description: 'Analyze and predict price movements for specific trading pools.',
};

type PageProps = {
  params: {
    poolId: string; // URL parameter name (keeping as poolId for URL structure)
  };
};

export default function Page({ params }: PageProps) {
  // Pass the poolId URL parameter as poolAddress to the component
  return <PoolContent poolAddress={params.poolId} />;
}