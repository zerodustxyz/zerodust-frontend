'use client';

import { useState } from 'react';

interface ChainIconProps {
  chainId: number;
  size?: number;
  className?: string;
}

// Chain logo URLs from various sources
// Primary: LI.FI (https://github.com/lifinance/types/tree/main/src/assets/icons/chains)
// Secondary: LlamaFi (https://icons.llamao.fi/icons/chains/)
const LIFI_ICONS_BASE = 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains';
const LLAMAFI_ICONS_BASE = 'https://icons.llamao.fi/icons/chains/rsz';

const chainLogoUrls: Record<number, string> = {
  // === MAINNETS (26 chains) ===

  // Ethereum (mainnet & Sepolia)
  1: `${LIFI_ICONS_BASE}/ethereum.svg`,
  11155111: `${LIFI_ICONS_BASE}/ethereum.svg`,

  // Base
  8453: `${LIFI_ICONS_BASE}/base.svg`,
  84532: `${LIFI_ICONS_BASE}/base.svg`,

  // Optimism
  10: `${LIFI_ICONS_BASE}/optimism.svg`,
  11155420: `${LIFI_ICONS_BASE}/optimism.svg`,

  // Arbitrum
  42161: `${LIFI_ICONS_BASE}/arbitrum.svg`,
  421614: `${LIFI_ICONS_BASE}/arbitrum.svg`,

  // Polygon
  137: `${LIFI_ICONS_BASE}/polygon.svg`,
  80002: `${LIFI_ICONS_BASE}/polygon.svg`,

  // BNB Chain
  56: `${LIFI_ICONS_BASE}/bsc.svg`,
  97: `${LIFI_ICONS_BASE}/bsc.svg`,

  // Gnosis
  100: `${LIFI_ICONS_BASE}/gnosis.svg`,

  // Zora (using LlamaFi)
  7777777: `${LLAMAFI_ICONS_BASE}_zora.jpg`,

  // Scroll
  534352: `${LIFI_ICONS_BASE}/scroll.svg`,

  // Linea
  59144: `${LIFI_ICONS_BASE}/linea.svg`,

  // Mode
  34443: `${LIFI_ICONS_BASE}/mode.svg`,

  // Mantle
  5000: `${LIFI_ICONS_BASE}/mantle.svg`,

  // Celo
  42220: `${LIFI_ICONS_BASE}/celo.svg`,

  // Blast
  81457: `${LIFI_ICONS_BASE}/blast.svg`,

  // Fraxtal
  252: `${LIFI_ICONS_BASE}/fraxtal.svg`,

  // Sei
  1329: `${LIFI_ICONS_BASE}/sei.svg`,

  // BOB
  60808: `${LIFI_ICONS_BASE}/bob.svg`,

  // Unichain
  130: `${LIFI_ICONS_BASE}/unichain.svg`,

  // World Chain
  480: `${LIFI_ICONS_BASE}/world.svg`,

  // Berachain
  80094: `${LIFI_ICONS_BASE}/berachain.svg`,

  // Ink
  57073: `${LIFI_ICONS_BASE}/ink.svg`,

  // Plasma
  9745: `${LIFI_ICONS_BASE}/plasma.svg`,

  // Story (using LlamaFi)
  1514: `${LLAMAFI_ICONS_BASE}_story.jpg`,

  // Superseed (using LlamaFi)
  5330: `${LLAMAFI_ICONS_BASE}_superseed.jpg`,

  // ApeChain
  33139: `${LIFI_ICONS_BASE}/apechain.svg`,

  // Sonic
  146: `${LIFI_ICONS_BASE}/sonic.svg`,

  // Soneium
  1868: `${LIFI_ICONS_BASE}/soneium.svg`,

  // X Layer
  196: `${LIFI_ICONS_BASE}/xlayer.svg`,
};

// Fallback colors for chains (used when logo unavailable or fails to load)
const chainColors: Record<number, string> = {
  // Mainnets
  1: '#627EEA',       // Ethereum
  8453: '#0052FF',    // Base
  10: '#FF0420',      // Optimism
  42161: '#12AAFF',   // Arbitrum
  137: '#8247E5',     // Polygon
  56: '#F0B90B',      // BNB Chain
  100: '#04795B',     // Gnosis
  7777777: '#000000', // Zora
  534352: '#FFEEDA',  // Scroll
  59144: '#121212',   // Linea
  34443: '#DFFE00',   // Mode
  5000: '#000000',    // Mantle
  42220: '#FCFF52',   // Celo
  81457: '#FCFC03',   // Blast
  252: '#000000',     // Fraxtal
  1329: '#9B1B30',    // Sei
  60808: '#F25D23',   // BOB
  130: '#FF007A',     // Unichain
  480: '#000000',     // World Chain
  80094: '#7C3F00',   // Berachain
  57073: '#7B3FE4',   // Ink
  9745: '#FF6B35',    // Plasma
  1514: '#6366F1',    // Story
  5330: '#00FF00',    // Superseed
  33139: '#0050FF',   // ApeChain
  146: '#1969FF',     // Sonic
  1868: '#000000',    // Soneium
  196: '#000000',     // X Layer

  // Testnets (same as mainnets)
  11155111: '#627EEA', // Sepolia
  84532: '#0052FF',    // Base Sepolia
  11155420: '#FF0420', // OP Sepolia
  421614: '#12AAFF',   // Arbitrum Sepolia
  80002: '#8247E5',    // Polygon Amoy
  97: '#F0B90B',       // BSC Testnet
};

// Get chain initial for fallback display
function getChainInitial(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'E', 11155111: 'E',
    8453: 'B', 84532: 'B',
    10: 'O', 11155420: 'O',
    42161: 'A', 421614: 'A',
    137: 'P', 80002: 'P',
    56: 'B', 97: 'B',
    100: 'G',
    7777777: 'Z',
    534352: 'S',
    59144: 'L',
    34443: 'M',
    5000: 'M',
    42220: 'C',
    81457: 'B',
    252: 'F',
    1329: 'S',
    60808: 'B',
    130: 'U',
    480: 'W',
    80094: 'B',
    57073: 'I',
    9745: 'P',
    1514: 'S',
    5330: 'S',
    33139: 'A',
    146: 'S',
    1868: 'S',
    196: 'X',
  };
  return chainNames[chainId] || '?';
}

// Fallback component for chains without logos or when image fails to load
function ChainFallback({
  chainId,
  size,
  className,
  color,
}: {
  chainId: number;
  size: number;
  className: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.4,
      }}
    >
      {getChainInitial(chainId)}
    </div>
  );
}

export function ChainIcon({ chainId, size = 32, className = '' }: ChainIconProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = chainLogoUrls[chainId];
  const fallbackColor = chainColors[chainId] || '#888';

  if (!logoUrl || imageError) {
    return (
      <ChainFallback
        chainId={chainId}
        size={size}
        className={className}
        color={fallbackColor}
      />
    );
  }

  return (
    <div className={`flex-shrink-0 rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`Chain ${chainId}`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
