import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  polygon,
  polygonAmoy,
  bsc,
  bscTestnet,
  gnosis,
} from 'wagmi/chains';

// Chains supported by ZeroDust
export const supportedChains = [
  // Mainnets (for future)
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
  bsc,
  gnosis,
  // Testnets (current)
  sepolia,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  polygonAmoy,
  bscTestnet,
] as const;

// Testnet chain IDs for filtering
export const testnetChainIds = [
  11155111, // Sepolia
  84532,    // Base Sepolia
  11155420, // OP Sepolia
  421614,   // Arbitrum Sepolia
  80002,    // Polygon Amoy
  97,       // BSC Testnet
];

export const config = getDefaultConfig({
  appName: 'ZeroDust',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: supportedChains,
  ssr: true,
});

// Chain metadata for UI
export const chainMeta: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: 'Ethereum', icon: '/chains/ethereum.svg', color: '#627EEA' },
  11155111: { name: 'Sepolia', icon: '/chains/ethereum.svg', color: '#627EEA' },
  8453: { name: 'Base', icon: '/chains/base.svg', color: '#0052FF' },
  84532: { name: 'Base Sepolia', icon: '/chains/base.svg', color: '#0052FF' },
  10: { name: 'Optimism', icon: '/chains/optimism.svg', color: '#FF0420' },
  11155420: { name: 'OP Sepolia', icon: '/chains/optimism.svg', color: '#FF0420' },
  42161: { name: 'Arbitrum', icon: '/chains/arbitrum.svg', color: '#12AAFF' },
  421614: { name: 'Arbitrum Sepolia', icon: '/chains/arbitrum.svg', color: '#12AAFF' },
  137: { name: 'Polygon', icon: '/chains/polygon.svg', color: '#8247E5' },
  80002: { name: 'Polygon Amoy', icon: '/chains/polygon.svg', color: '#8247E5' },
  56: { name: 'BNB Chain', icon: '/chains/bnb.svg', color: '#F0B90B' },
  97: { name: 'BSC Testnet', icon: '/chains/bnb.svg', color: '#F0B90B' },
  100: { name: 'Gnosis', icon: '/chains/gnosis.svg', color: '#04795B' },
};
