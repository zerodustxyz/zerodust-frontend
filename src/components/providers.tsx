'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider, useTheme } from 'next-themes';
import { config } from '@/config/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <RainbowKitProvider
      theme={resolvedTheme === 'dark' ? darkTheme({
        accentColor: '#8B5CF6',
        accentColorForeground: 'white',
        borderRadius: 'large',
        fontStack: 'system',
      }) : lightTheme({
        accentColor: '#8B5CF6',
        accentColorForeground: 'white',
        borderRadius: 'large',
        fontStack: 'system',
      })}
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProviderWrapper>
            {children}
          </RainbowKitProviderWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
