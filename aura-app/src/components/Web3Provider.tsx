"use client";

import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { avalancheFuji, mainnet } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'Aura Agentic Payments',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with a real project ID in production
  chains: [avalancheFuji, mainnet],
  ssr: true,
});

const queryClient = new QueryClient();

// Error boundary to prevent RainbowKit / WalletConnect crashes from
// taking down the entire page (e.g. on mobile with invalid projectId)
class Web3ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("Web3Provider error:", error);
  }
  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>;
    }
    return this.props.children;
  }
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <Web3ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            theme={darkTheme({
              accentColor: '#8a2be2', // Aura Purple
              accentColorForeground: 'white',
              borderRadius: 'large',
              fontStack: 'system',
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  );
}

