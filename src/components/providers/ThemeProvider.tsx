'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ToastContainer } from 'react-toastify';

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark']}
    >
      {children}
      <ToastContainer
        position="bottom-right"
        toastClassName="bg-[#fff] dark:bg-[#202426] text-[#000] dark:text-[#fff]"
        toastStyle={{ borderRadius: '3px', fontSize: '16px' }}
      />
    </NextThemesProvider>
  );
}
