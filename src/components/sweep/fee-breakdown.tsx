'use client';

import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { chainMeta } from '@/config/wagmi';

interface FeeBreakdownProps {
  selectedChain: number;
}

export function FeeBreakdown({ selectedChain }: FeeBreakdownProps) {
  const chainInfo = chainMeta[selectedChain] || { name: 'Unknown', color: '#888' };

  // In production, this would fetch actual quotes from the API
  const breakdown = useMemo(() => {
    // Mock fee calculation
    const gasFee = 0.0002; // ~$0.70 at $3500/ETH

    // Mock total balance (would come from actual balances)
    const mockTotalBalance = 0.025;
    const youReceive = mockTotalBalance - gasFee;

    return {
      totalBalance: mockTotalBalance,
      networkFee: gasFee,
      youReceive: youReceive > 0 ? youReceive : 0,
      feePercentage: ((gasFee / mockTotalBalance) * 100).toFixed(1),
    };
  }, [selectedChain]);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        Fee Breakdown
        <Info className="w-4 h-4 text-zinc-400" />
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">Balance on {chainInfo.name}</span>
          <span className="font-mono">{breakdown.totalBalance.toFixed(6)} ETH</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">
            Service Fee (gas + buffer)
          </span>
          <span className="font-mono text-amber-500">
            -{breakdown.networkFee.toFixed(6)} ETH
          </span>
        </div>

        <div className="pt-2 border-t border-light-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <span className="font-medium">You Receive</span>
            <div className="text-right">
              <div className="font-mono font-semibold text-green-500">
                {breakdown.youReceive.toFixed(6)} ETH
              </div>
              <div className="text-xs text-zinc-500">
                ~${(breakdown.youReceive * 3500).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee notice */}
      <div className="p-3 bg-brand-purple/10 rounded-lg">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-brand-purple">{breakdown.feePercentage}%</span> of your balance covers the service fee.
          Your source wallet will have exactly 0 balance after sweeping.
        </p>
      </div>
    </div>
  );
}
