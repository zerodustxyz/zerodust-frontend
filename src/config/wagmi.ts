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
  zora,
  scroll,
  linea,
  mode,
  mantle,
  celo,
  blast,
  fraxtal,
  sei,
  bob,
} from 'wagmi/chains';
import { defineChain } from 'viem';

// Custom chain definitions for chains not in viem/wagmi
const unichain = defineChain({
  id: 130,
  name: 'Unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.unichain.org'] } },
  blockExplorers: { default: { name: 'Uniscan', url: 'https://uniscan.xyz' } },
});

const worldchain = defineChain({
  id: 480,
  name: 'World Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] } },
  blockExplorers: { default: { name: 'World Explorer', url: 'https://worldscan.org' } },
});

const berachain = defineChain({
  id: 80094,
  name: 'Berachain',
  nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.berachain.com'] } },
  blockExplorers: { default: { name: 'Berascan', url: 'https://berascan.com' } },
});

const ink = defineChain({
  id: 57073,
  name: 'Ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc-gel.inkonchain.com'] } },
  blockExplorers: { default: { name: 'Ink Explorer', url: 'https://explorer.inkonchain.com' } },
});

const plasma = defineChain({
  id: 9745,
  name: 'Plasma',
  nativeCurrency: { name: 'Plasma', symbol: 'XPL', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.plasma.to'] } },
  blockExplorers: { default: { name: 'Plasma Explorer', url: 'https://explorer.plasma.to' } },
});

const story = defineChain({
  id: 1514,
  name: 'Story',
  nativeCurrency: { name: 'IP Token', symbol: 'IP', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.storyrpc.io'] } },
  blockExplorers: { default: { name: 'Story Explorer', url: 'https://storyscan.xyz' } },
});

const superseed = defineChain({
  id: 5330,
  name: 'Superseed',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.superseed.xyz'] } },
  blockExplorers: { default: { name: 'Superseed Explorer', url: 'https://explorer.superseed.xyz' } },
});

const apechain = defineChain({
  id: 33139,
  name: 'ApeChain',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.apechain.com'] } },
  blockExplorers: { default: { name: 'ApeChain Explorer', url: 'https://apescan.io' } },
});

const sonic = defineChain({
  id: 146,
  name: 'Sonic',
  nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.soniclabs.com'] } },
  blockExplorers: { default: { name: 'Sonic Explorer', url: 'https://sonicscan.org' } },
});

const soneium = defineChain({
  id: 1868,
  name: 'Soneium',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.soneium.org'] } },
  blockExplorers: { default: { name: 'Soneium Explorer', url: 'https://soneium.blockscout.com' } },
});

const xlayer = defineChain({
  id: 196,
  name: 'X Layer',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.xlayer.tech'] } },
  blockExplorers: { default: { name: 'X Layer Explorer', url: 'https://www.okx.com/explorer/xlayer' } },
});

// Chains supported by ZeroDust (26 mainnets + 6 testnets)
export const supportedChains = [
  // Mainnets (26 chains)
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
  bsc,
  gnosis,
  zora,
  scroll,
  linea,
  mode,
  mantle,
  celo,
  blast,
  fraxtal,
  sei,
  bob,
  unichain,
  worldchain,
  berachain,
  ink,
  plasma,
  story,
  superseed,
  apechain,
  sonic,
  soneium,
  xlayer,
  // Testnets
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

// Mainnet chain IDs for filtering (26 chains)
export const mainnetChainIds = [
  1,        // Ethereum
  8453,     // Base
  10,       // Optimism
  42161,    // Arbitrum
  137,      // Polygon
  56,       // BNB Chain
  100,      // Gnosis
  7777777,  // Zora
  534352,   // Scroll
  59144,    // Linea
  34443,    // Mode
  5000,     // Mantle
  42220,    // Celo
  81457,    // Blast
  252,      // Fraxtal
  1329,     // Sei
  60808,    // BOB
  130,      // Unichain
  480,      // World Chain
  80094,    // Berachain
  57073,    // Ink
  9745,     // Plasma
  1514,     // Story
  5330,     // Superseed
  33139,    // ApeChain
  146,      // Sonic
  1868,     // Soneium
  196,      // X Layer
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
    // Mainnets (26 chains)
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [gnosis.id]: http(),
    [zora.id]: http(),
    [scroll.id]: http(),
    [linea.id]: http(),
    [mode.id]: http(),
    [mantle.id]: http(),
    [celo.id]: http(),
    [blast.id]: http(),
    [fraxtal.id]: http(),
    [sei.id]: http(),
    [bob.id]: http(),
    [unichain.id]: http(),
    [worldchain.id]: http(),
    [berachain.id]: http(),
    [ink.id]: http(),
    [plasma.id]: http(),
    [story.id]: http(),
    [superseed.id]: http(),
    [apechain.id]: http(),
    [sonic.id]: http(),
    [soneium.id]: http(),
    [xlayer.id]: http(),
  },
  ssr: true,
});

// Chain metadata for UI (26 mainnets + 6 testnets)
export const chainMeta: Record<number, { name: string; icon: string; color: string; symbol: string }> = {
  // Mainnets (26 chains)
  1: { name: 'Ethereum', icon: '/chains/ethereum.svg', color: '#627EEA', symbol: 'ETH' },
  8453: { name: 'Base', icon: '/chains/base.svg', color: '#0052FF', symbol: 'ETH' },
  10: { name: 'Optimism', icon: '/chains/optimism.svg', color: '#FF0420', symbol: 'ETH' },
  42161: { name: 'Arbitrum', icon: '/chains/arbitrum.svg', color: '#12AAFF', symbol: 'ETH' },
  137: { name: 'Polygon', icon: '/chains/polygon.svg', color: '#8247E5', symbol: 'POL' },
  56: { name: 'BNB Chain', icon: '/chains/bnb.svg', color: '#F0B90B', symbol: 'BNB' },
  100: { name: 'Gnosis', icon: '/chains/gnosis.svg', color: '#04795B', symbol: 'xDAI' },
  7777777: { name: 'Zora', icon: '/chains/zora.svg', color: '#000000', symbol: 'ETH' },
  534352: { name: 'Scroll', icon: '/chains/scroll.svg', color: '#FFEEDA', symbol: 'ETH' },
  59144: { name: 'Linea', icon: '/chains/linea.svg', color: '#121212', symbol: 'ETH' },
  34443: { name: 'Mode', icon: '/chains/mode.svg', color: '#DFFE00', symbol: 'ETH' },
  5000: { name: 'Mantle', icon: '/chains/mantle.svg', color: '#000000', symbol: 'MNT' },
  42220: { name: 'Celo', icon: '/chains/celo.svg', color: '#FCFF52', symbol: 'CELO' },
  81457: { name: 'Blast', icon: '/chains/blast.svg', color: '#FCFC03', symbol: 'ETH' },
  252: { name: 'Fraxtal', icon: '/chains/fraxtal.svg', color: '#000000', symbol: 'frxETH' },
  1329: { name: 'Sei', icon: '/chains/sei.svg', color: '#9B1B30', symbol: 'SEI' },
  60808: { name: 'BOB', icon: '/chains/bob.svg', color: '#F25D23', symbol: 'ETH' },
  130: { name: 'Unichain', icon: '/chains/unichain.svg', color: '#FF007A', symbol: 'ETH' },
  480: { name: 'World Chain', icon: '/chains/worldchain.svg', color: '#000000', symbol: 'ETH' },
  80094: { name: 'Berachain', icon: '/chains/berachain.svg', color: '#7C3F00', symbol: 'BERA' },
  57073: { name: 'Ink', icon: '/chains/ink.svg', color: '#7B3FE4', symbol: 'ETH' },
  9745: { name: 'Plasma', icon: '/chains/plasma.svg', color: '#FF6B35', symbol: 'XPL' },
  1514: { name: 'Story', icon: '/chains/story.svg', color: '#6366F1', symbol: 'IP' },
  5330: { name: 'Superseed', icon: '/chains/superseed.svg', color: '#00FF00', symbol: 'ETH' },
  33139: { name: 'ApeChain', icon: '/chains/apechain.svg', color: '#0050FF', symbol: 'APE' },
  146: { name: 'Sonic', icon: '/chains/sonic.svg', color: '#1969FF', symbol: 'S' },
  1868: { name: 'Soneium', icon: '/chains/soneium.svg', color: '#000000', symbol: 'ETH' },
  196: { name: 'X Layer', icon: '/chains/xlayer.svg', color: '#000000', symbol: 'OKB' },
  // Testnets
  11155111: { name: 'Sepolia', icon: '/chains/ethereum.svg', color: '#627EEA', symbol: 'ETH' },
  84532: { name: 'Base Sepolia', icon: '/chains/base.svg', color: '#0052FF', symbol: 'ETH' },
  11155420: { name: 'OP Sepolia', icon: '/chains/optimism.svg', color: '#FF0420', symbol: 'ETH' },
  421614: { name: 'Arbitrum Sepolia', icon: '/chains/arbitrum.svg', color: '#12AAFF', symbol: 'ETH' },
  80002: { name: 'Polygon Amoy', icon: '/chains/polygon.svg', color: '#8247E5', symbol: 'POL' },
  97: { name: 'BSC Testnet', icon: '/chains/bnb.svg', color: '#F0B90B', symbol: 'tBNB' },
};
