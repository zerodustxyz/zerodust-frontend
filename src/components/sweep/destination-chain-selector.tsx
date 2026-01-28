'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import { chainMeta } from '@/config/wagmi';
import { ChainIcon } from '@/components/ui/chain-icon';

interface DestinationChainSelectorProps {
  sourceChain: number;
  selectedChain: number | null;
  onChainSelect: (chainId: number | null) => void;
  availableChains: number[];
}

export function DestinationChainSelector({
  sourceChain,
  selectedChain,
  onChainSelect,
  availableChains,
}: DestinationChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effective destination chain (same as source if null)
  const effectiveChain = selectedChain ?? sourceChain;
  const isCrossChain = selectedChain !== null && selectedChain !== sourceChain;
  const selectedMeta = chainMeta[effectiveChain];
  const sourceMeta = chainMeta[sourceChain];

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

  const handleSelect = (chainId: number) => {
    // If selecting same chain as source, set to null (same-chain sweep)
    onChainSelect(chainId === sourceChain ? null : chainId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected chain / selector trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-light-elevated dark:bg-dark-elevated rounded-2xl hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChainIcon chainId={effectiveChain} size={40} />
          <div className="text-left">
            <div className="font-semibold">{selectedMeta?.name || 'Unknown'}</div>
            <div className="text-sm text-zinc-500">
              {isCrossChain ? (
                <span className="text-brand-violet flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  Cross-chain via Gas.zip
                </span>
              ) : (
                'Same chain'
              )}
            </div>
          </div>
        </div>

        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-light-border dark:border-dark-border">
              <span className="text-sm font-medium text-zinc-500">Select destination chain</span>
            </div>

            {/* Chain list */}
            <div className="max-h-80 overflow-y-auto">
              {availableChains.map((chainId) => {
                const meta = chainMeta[chainId] || { name: `Chain ${chainId}`, color: '#888', symbol: 'ETH' };
                const isSelected = effectiveChain === chainId;
                const isSameAsSource = chainId === sourceChain;

                return (
                  <button
                    key={chainId}
                    onClick={() => handleSelect(chainId)}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${
                      isSelected
                        ? 'bg-brand-violet/10'
                        : 'hover:bg-light-elevated dark:hover:bg-dark-elevated'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChainIcon chainId={chainId} size={32} />
                      <div className="text-left">
                        <div className="font-medium text-sm">{meta.name}</div>
                        {isSameAsSource && (
                          <span className="text-xs text-zinc-400">Same chain</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">{meta.symbol}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand-violet" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
