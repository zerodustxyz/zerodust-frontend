'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import { chainMeta } from '@/config/wagmi';

interface SweepButtonProps {
  selectedChain: number | null;
  destinationAddress: string;
  disabled?: boolean;
}

type SweepStatus = 'idle' | 'confirming' | 'sweeping' | 'success' | 'error';

export function SweepButton({
  selectedChain,
  destinationAddress,
  disabled,
}: SweepButtonProps) {
  const [status, setStatus] = useState<SweepStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const chainInfo = selectedChain ? chainMeta[selectedChain] : null;

  const handleSweep = async () => {
    if (disabled || !selectedChain) return;

    try {
      setStatus('confirming');
      setError(null);

      // In production:
      // 1. Get quote from API
      // 2. Sign EIP-712 message
      // 3. Sign EIP-7702 authorization
      // 4. Submit to API
      // 5. Poll for completion

      // Simulate signing
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('sweeping');

      // Simulate sweep execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Main button */}
      <button
        onClick={handleSweep}
        disabled={disabled || status === 'confirming' || status === 'sweeping'}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
          disabled
            ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-gradient-brand hover:bg-gradient-brand-hover text-white hover:shadow-glow'
        }`}
      >
        {status === 'idle' && (
          <>Sweep {chainInfo?.name || 'Chain'}</>
        )}
        {status === 'confirming' && (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirm in Wallet...
          </span>
        )}
        {status === 'sweeping' && (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Sweeping...
          </span>
        )}
        {status === 'success' && (
          <span className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Sweep Complete!
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center justify-center gap-2">
            <X className="w-5 h-5" />
            Sweep Failed
          </span>
        )}
      </button>

      {/* Status modal */}
      <AnimatePresence>
        {(status === 'sweeping' || status === 'success') && chainInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-4"
          >
            <h4 className="font-semibold mb-3">
              {status === 'sweeping' ? 'Sweeping in progress...' : 'Sweep Complete!'}
            </h4>

            {/* Chain progress */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chainInfo.color }}
                />
                <span>{chainInfo.name}</span>
              </div>
              <span className="flex items-center gap-2">
                {status === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Complete</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                    <span className="text-brand-purple">Processing</span>
                  </>
                )}
              </span>
            </div>

            {status === 'success' && (
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                <a
                  href="#"
                  target="_blank"
                  className="text-sm text-brand-purple hover:text-brand-purple/80 flex items-center gap-1"
                >
                  View on Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {status === 'error' && error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={reset}
            className="mt-2 text-sm text-red-500 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Disabled message */}
      {disabled && selectedChain === null && (
        <p className="text-center text-sm text-zinc-500">
          Select a chain to sweep
        </p>
      )}
    </div>
  );
}
