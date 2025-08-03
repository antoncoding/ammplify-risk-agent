import './global.css';

import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics';
import { ClientProviders } from '@/components/providers/ClientProviders';
import OnchainProviders from '@/OnchainProviders';
import { ChatProvider } from '@/contexts/ChatContext';
import PersistentChatFooter from '@/components/Chat/PersistentChatFooter';
import ChatInitializer from '@/components/Chat/ChatInitializer';

import { initAnalytics } from '@/utils/analytics';
import { ThemeProviders } from '../src/components/providers/ThemeProvider';
import { inter, zen, monospace } from './fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'http://localhost:3000'
  ),
  manifest: '/manifest.json',
  other: {
    boat: '0.17.0',
  },
};

// Start analytics before the App renders,
// so we can track page views and early events
initAnalytics();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${zen.variable} ${inter.variable} ${monospace.variable}`}>
      <head>
        <title>Ammplify Risk Agent</title>
      </head>
      <body>
        <ThemeProviders>
          <OnchainProviders>
            <ClientProviders>
              <ChatProvider>
                <ChatInitializer />
                {children}
                <PersistentChatFooter />
              </ChatProvider>
            </ClientProviders>
          </OnchainProviders>
        </ThemeProviders>
      </body>
      <GoogleAnalytics />
    </html>
  );
}
