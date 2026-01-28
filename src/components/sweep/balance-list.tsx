'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Check, ChevronDown } from 'lucide-react';
import { testnetChainIds, mainnetChainIds, chainMeta } from '@/config/wagmi';
import { api } from '@/services/api';
import { ChainIcon } from '@/components/ui/chain-icon';

export type NetworkMode = 'mainnet' | 'testnet';

interface BalanceListProps {
  selectedChain: number | null;
  onSelectionChange: (chain: number | null, balance?: bigint) => void;
  onBalanceChange?: (balance: bigint) => void;
  networkMode?: NetworkMode;
  refreshKey?: number;
}

interface ChainBalance {
  chainId: number;
  balance: bigint;
  isLoading: boolean;
  error: string | null;
}

export function BalanceList({ selectedChain, onSelectionChange, onBalanceChange, networkMode = 'testnet', refreshKey }: BalanceListProps) {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const chainsToShow = networkMode === 'mainnet' ? mainnetChainIds : testnetChainIds;

  // Initialize chains without balances when not connected or when network mode changes
  useEffect(() => {
    if (!isConnected) {
      setBalances(chainsToShow.map(chainId => ({
        chainId,
        balance: 0n,
        isLoading: false,
        error: null,
      })));
    }
    // Reset selection when network mode changes
    onSelectionChange(null);
  }, [isConnected, networkMode]);

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

    try {
      // Fetch balances from backend API
      const response = await api.getBalances(address, networkMode === 'testnet');

      // Map backend response to our ChainBalance format
      const results = chainsToShow.map(chainId => {
        const chainBalance = response.chains.find(c => c.chainId === chainId);
        return {
          chainId,
          balance: chainBalance ? BigInt(chainBalance.balance) : 0n,
          isLoading: false,
          error: null,
        };
      });

      setBalances(results);
    } catch (err) {
      console.error('Error fetching balances from backend:', err);
      // Set error state for all chains
      setBalances(chainsToShow.map(chainId => ({
        chainId,
        balance: 0n,
        isLoading: false,
        error: 'Failed to fetch',
      })));
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    if (address) {
      fetchBalances();
    }
  }, [address, networkMode, refreshKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectChain = (chainId: number) => {
    const balance = balances.find(b => b.chainId === chainId)?.balance || 0n;
    onSelectionChange(chainId, balance);
    onBalanceChange?.(balance);
    setIsOpen(false);
  };

  const selectedBalance = balances.find(b => b.chainId === selectedChain)?.balance || 0n;
  const selectedMeta = selectedChain ? chainMeta[selectedChain] : null;
  const isLoading = balances.some(b => b.isLoading);
  const chainsWithBalance = balances.filter(b => b.balance > 0n);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected chain / selector trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-light-elevated dark:bg-dark-elevated rounded-2xl hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedChain && selectedMeta ? (
            <>
              {/* Chain icon */}
              <ChainIcon chainId={selectedChain} size={40} />
              <div className="text-left">
                <div className="font-semibold">{selectedMeta.name}</div>
                <div className="text-sm text-zinc-500">{selectedMeta.symbol}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <span className="text-zinc-400">?</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-zinc-400">Select chain</div>
                <div className="text-sm text-zinc-500">
                  {isConnected ? `${chainsWithBalance.length} with balance` : 'Choose source chain'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Balance display */}
          {selectedChain && !isLoading && (
            <div className="text-right">
              <div className="font-mono text-lg font-semibold">
                {isConnected
                  ? Number(formatEther(selectedBalance)).toFixed(6)
                  : '—'
                }
              </div>
            </div>
          )}
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />}
          <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-xl overflow-hidden"
          >
            {/* Header with refresh */}
            <div className="flex items-center justify-between p-3 border-b border-light-border dark:border-dark-border">
              <span className="text-sm font-medium text-zinc-500">
                {isConnected && !isLoading
                  ? `${chainsWithBalance.length} chain${chainsWithBalance.length !== 1 ? 's' : ''} with balance`
                  : 'Select source chain'}
              </span>
              {isConnected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchBalances();
                  }}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Chain list - show only chains with balance when connected */}
            <div className="max-h-80 overflow-y-auto">
              {(isConnected && !isLoading ? chainsWithBalance : balances).map((item) => {
                // Handle both ChainBalance objects and chainId numbers
                const chainId = typeof item === 'number' ? item : item.chainId;
                const chainData = balances.find(b => b.chainId === chainId);
                const balance = chainData?.balance || 0n;
                const chainLoading = chainData?.isLoading || false;
                const error = chainData?.error || null;

                const meta = chainMeta[chainId] || { name: `Chain ${chainId}`, color: '#888', symbol: 'ETH' };
                const isSelected = selectedChain === chainId;

                return (
                  <button
                    key={chainId}
                    onClick={() => !chainLoading && selectChain(chainId)}
                    disabled={chainLoading}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${
                      isSelected
                        ? 'bg-brand-violet/10'
                        : 'hover:bg-light-elevated dark:hover:bg-dark-elevated'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Chain icon */}
                      <ChainIcon chainId={chainId} size={32} />
                      <div className="text-left">
                        <div className="font-medium text-sm">{meta.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        chainLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        ) : error ? (
                          <span className="text-xs text-red-500">{error}</span>
                        ) : (
                          <span className="font-mono text-sm">
                            {Number(formatEther(balance)).toFixed(4)} {meta.symbol}
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-zinc-400">{meta.symbol}</span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-brand-violet" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Connect prompt when not connected */}
            {!isConnected && (
              <div className="p-3 border-t border-light-border dark:border-dark-border bg-light-elevated/50 dark:bg-dark-elevated/50">
                <p className="text-xs text-zinc-500 text-center">
                  Connect wallet to view balances
                </p>
              </div>
            )}

            {/* Empty state - only show when connected and no balances */}
            {isConnected && !isLoading && chainsWithBalance.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-500">No balances found</p>
                <p className="text-xs text-zinc-400 mt-1">
                  No dust to sweep on supported chains
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
