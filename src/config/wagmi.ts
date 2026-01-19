import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
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

// Mainnet chain IDs for filtering
export const mainnetChainIds = [
  1,        // Ethereum
  8453,     // Base
  10,       // Optimism
  42161,    // Arbitrum
  137,      // Polygon
  56,       // BNB Chain
  100,      // Gnosis
];

// Public RPC URLs for each chain (used only for wallet signing, not balance fetching)
// Balance fetching goes through the backend API for better reliability and key security
export const rpcUrls: Record<number, string> = {
  // Testnets (public RPCs - using more reliable endpoints)
  11155111: 'https://ethereum-sepolia-rpc.publicnode.com',
  84532: 'https://sepolia.base.org',
  11155420: 'https://sepolia.optimism.io',
  421614: 'https://sepolia-rollup.arbitrum.io/rpc',
  80002: 'https://rpc-amoy.polygon.technology',
  97: 'https://bsc-testnet-rpc.publicnode.com',
};

export const config = getDefaultConfig({
  appName: 'ZeroDust',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: supportedChains,
  transports: {
    // Testnets with custom RPCs
    [sepolia.id]: http(rpcUrls[11155111]),
    [baseSepolia.id]: http(rpcUrls[84532]),
    [optimismSepolia.id]: http(rpcUrls[11155420]),
    [arbitrumSepolia.id]: http(rpcUrls[421614]),
    [polygonAmoy.id]: http(rpcUrls[80002]),
    [bscTestnet.id]: http(rpcUrls[97]),
    // Mainnets (default RPCs for now)
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [gnosis.id]: http(),
  },
  ssr: true,
});

// Chain metadata for UI
export const chainMeta: Record<number, { name: string; icon: string; color: string; symbol: string }> = {
  1: { name: 'Ethereum', icon: '/chains/ethereum.svg', color: '#627EEA', symbol: 'ETH' },
  11155111: { name: 'Sepolia', icon: '/chains/ethereum.svg', color: '#627EEA', symbol: 'ETH' },
  8453: { name: 'Base', icon: '/chains/base.svg', color: '#0052FF', symbol: 'ETH' },
  84532: { name: 'Base Sepolia', icon: '/chains/base.svg', color: '#0052FF', symbol: 'ETH' },
  10: { name: 'Optimism', icon: '/chains/optimism.svg', color: '#FF0420', symbol: 'ETH' },
  11155420: { name: 'OP Sepolia', icon: '/chains/optimism.svg', color: '#FF0420', symbol: 'ETH' },
  42161: { name: 'Arbitrum', icon: '/chains/arbitrum.svg', color: '#12AAFF', symbol: 'ETH' },
  421614: { name: 'Arbitrum Sepolia', icon: '/chains/arbitrum.svg', color: '#12AAFF', symbol: 'ETH' },
  137: { name: 'Polygon', icon: '/chains/polygon.svg', color: '#8247E5', symbol: 'POL' },
  80002: { name: 'Polygon Amoy', icon: '/chains/polygon.svg', color: '#8247E5', symbol: 'POL' },
  56: { name: 'BNB Chain', icon: '/chains/bnb.svg', color: '#F0B90B', symbol: 'BNB' },
  97: { name: 'BSC Testnet', icon: '/chains/bnb.svg', color: '#F0B90B', symbol: 'tBNB' },
  100: { name: 'Gnosis', icon: '/chains/gnosis.svg', color: '#04795B', symbol: 'xDAI' },
};
