'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { createPublicClient, http, formatEther } from 'viem';
import { Loader2, RefreshCw } from 'lucide-react';
import { testnetChainIds, chainMeta, rpcUrls } from '@/config/wagmi';

interface BalanceListProps {
  selectedChain: number | null;
  onSelectionChange: (chain: number | null) => void;
  onBalanceChange?: (balance: bigint) => void;
}

interface ChainBalance {
  chainId: number;
  balance: bigint;
  isLoading: boolean;
  error: string | null;
}

export function BalanceList({ selectedChain, onSelectionChange, onBalanceChange }: BalanceListProps) {
  const { address } = useAccount();
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chainsToShow = testnetChainIds;

  const fetchBalances = async () => {
    if (!address) return;

    setIsRefreshing(true);

    // Initialize with loading state
    setBalances(chainsToShow.map(chainId => ({
      chainId,
      balance: 0n,
      isLoading: true,
      error: null,
    })));

    // Fetch balances in parallel for all chains
    const balancePromises = chainsToShow.map(async (chainId) => {
      try {
        const client = createPublicClient({
          transport: http(rpcUrls[chainId]),
        });

        const balance = await client.getBalance({ address });

        return {
          chainId,
          balance,
          isLoading: false,
          error: null,
        };
      } catch (err) {
        console.error(`Error fetching balance for chain ${chainId}:`, err);
        return {
          chainId,
          balance: 0n,
          isLoading: false,
          error: 'Failed to fetch',
        };
      }
    });

    const results = await Promise.all(balancePromises);
    setBalances(results);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchBalances();
  }, [address]);

  const selectChain = (chainId: number) => {
    // Toggle: if already selected, deselect; otherwise select
    if (selectedChain === chainId) {
      onSelectionChange(null);
      onBalanceChange?.(0n);
    } else {
      const balance = balances.find(b => b.chainId === chainId)?.balance || 0n;
      onSelectionChange(chainId);
      onBalanceChange?.(balance);
    }
  };

  const selectedBalance = balances.find(b => b.chainId === selectedChain)?.balance || 0n;
  const isLoading = balances.some(b => b.isLoading);

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={fetchBalances}
          disabled={isRefreshing}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Chain list */}
      <div className="space-y-2">
        {balances.map(({ chainId, balance, isLoading, error }) => {
          const meta = chainMeta[chainId] || { name: `Chain ${chainId}`, color: '#888', symbol: 'ETH' };
          const isSelected = selectedChain === chainId;
          const hasBalance = balance > 0n;

          return (
            <button
              key={chainId}
              onClick={() => hasBalance && !isLoading && selectChain(chainId)}
              disabled={!hasBalance || isLoading}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                isSelected
                  ? 'bg-brand-purple/10 border-2 border-brand-purple'
                  : 'bg-light-elevated dark:bg-dark-elevated border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              } ${!hasBalance && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Radio button */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    isSelected
                      ? 'border-brand-purple'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />}
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
                ) : error ? (
                  <span className="text-xs text-red-500">{error}</span>
                ) : (
                  <>
                    <div className="font-mono text-sm">
                      {Number(formatEther(balance)).toFixed(6)} {meta.symbol}
                    </div>
                    {balance === 0n && (
                      <div className="text-xs text-zinc-500">No balance</div>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected balance */}
      {selectedChain !== null && (
        <div className="pt-4 border-t border-light-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 dark:text-zinc-400">Amount to Sweep</span>
            <div className="text-right">
              <div className="font-mono font-semibold">
                {Number(formatEther(selectedBalance)).toFixed(6)} {chainMeta[selectedChain]?.symbol || 'ETH'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No balances message */}
      {!isLoading && balances.every(b => b.balance === 0n) && (
        <div className="text-center py-4 text-sm text-zinc-500">
          No balances found on testnet chains. Fund a testnet wallet to test sweeping.
        </div>
      )}
    </div>
  );
}
