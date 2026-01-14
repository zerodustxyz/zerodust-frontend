'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Check, Loader2 } from 'lucide-react';
import { testnetChainIds, chainMeta } from '@/config/wagmi';

interface BalanceListProps {
  selectedChains: number[];
  onSelectionChange: (chains: number[]) => void;
}

interface ChainBalance {
  chainId: number;
  balance: bigint;
  isLoading: boolean;
}

export function BalanceList({ selectedChains, onSelectionChange }: BalanceListProps) {
  const { address } = useAccount();
  const [balances, setBalances] = useState<ChainBalance[]>([]);

  // For demo purposes, we'll show testnet chains
  // In production, this would fetch from all supported chains
  const chainsToShow = testnetChainIds;

  // Fetch balances for all chains
  // Note: In a real implementation, you'd use multicall or parallel fetches
  useEffect(() => {
    if (!address) return;

    // Initialize with loading state
    setBalances(chainsToShow.map(chainId => ({
      chainId,
      balance: 0n,
      isLoading: true,
    })));

    // Simulate fetching balances (replace with actual RPC calls)
    const fetchBalances = async () => {
      // In production, use viem's multicall or batch requests
      const newBalances = chainsToShow.map(chainId => ({
        chainId,
        balance: BigInt(Math.floor(Math.random() * 10000000000000000)), // Mock: 0-0.01 ETH
        isLoading: false,
      }));

      setBalances(newBalances);
    };

    fetchBalances();
  }, [address]);

  const toggleChain = (chainId: number) => {
    if (selectedChains.includes(chainId)) {
      onSelectionChange(selectedChains.filter(id => id !== chainId));
    } else {
      onSelectionChange([...selectedChains, chainId]);
    }
  };

  const selectAll = () => {
    const chainsWithBalance = balances
      .filter(b => b.balance > 0n)
      .map(b => b.chainId);
    onSelectionChange(chainsWithBalance);
  };

  const totalSelected = balances
    .filter(b => selectedChains.includes(b.chainId))
    .reduce((sum, b) => sum + b.balance, 0n);

  return (
    <div className="space-y-4">
      {/* Select all button */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-zinc-500">
          {selectedChains.length} chain{selectedChains.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={selectAll}
          className="text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
        >
          Select all with balance
        </button>
      </div>

      {/* Chain list */}
      <div className="space-y-2">
        {balances.map(({ chainId, balance, isLoading }) => {
          const meta = chainMeta[chainId] || { name: `Chain ${chainId}`, color: '#888' };
          const isSelected = selectedChains.includes(chainId);
          const hasBalance = balance > 0n;

          return (
            <button
              key={chainId}
              onClick={() => hasBalance && toggleChain(chainId)}
              disabled={!hasBalance || isLoading}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                isSelected
                  ? 'bg-brand-purple/10 border-2 border-brand-purple'
                  : 'bg-light-elevated dark:bg-dark-elevated border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              } ${!hasBalance && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-purple'
                      : 'border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Chain info */}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="font-medium">{meta.name}</span>
              </div>

              {/* Balance */}
              <div className="text-right">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                  <>
                    <div className="font-mono text-sm">
                      {Number(formatEther(balance)).toFixed(6)} ETH
                    </div>
                    <div className="text-xs text-zinc-500">
                      ~${(Number(formatEther(balance)) * 3500).toFixed(2)}
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Total */}
      {selectedChains.length > 0 && (
        <div className="pt-4 border-t border-light-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 dark:text-zinc-400">Total Selected</span>
            <div className="text-right">
              <div className="font-mono font-semibold">
                {Number(formatEther(totalSelected)).toFixed(6)} ETH
              </div>
              <div className="text-sm text-zinc-500">
                ~${(Number(formatEther(totalSelected)) * 3500).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
