'use client';

interface ChainIconProps {
  chainId: number;
  size?: number;
  className?: string;
}

// Chain logo URLs from LI.FI (same as Jumper exchange)
// https://github.com/lifinance/types/tree/main/src/assets/icons/chains
const LIFI_ICONS_BASE = 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains';

const chainLogoUrls: Record<number, string> = {
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
};

// Fallback colors for chains without logos
const chainColors: Record<number, string> = {
  1: '#627EEA',
  11155111: '#627EEA',
  8453: '#0052FF',
  84532: '#0052FF',
  10: '#FF0420',
  11155420: '#FF0420',
  42161: '#12AAFF',
  421614: '#12AAFF',
  137: '#8247E5',
  80002: '#8247E5',
  56: '#F0B90B',
  97: '#F0B90B',
  100: '#04795B',
};

export function ChainIcon({ chainId, size = 32, className = '' }: ChainIconProps) {
  const logoUrl = chainLogoUrls[chainId];
  const fallbackColor = chainColors[chainId] || '#888';

  if (!logoUrl) {
    // Fallback: colored circle
    return (
      <div
        className={`rounded-full ${className}`}
        style={{ width: size, height: size, backgroundColor: fallbackColor }}
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
      />
    </div>
  );
}
