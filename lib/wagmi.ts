import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

// Custom chain configuration for Hedera Testnet
const hederaTestnet: Chain = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 8,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'UniSpend',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia, baseSepolia, arbitrumSepolia, hederaTestnet],
  ssr: true,
});
