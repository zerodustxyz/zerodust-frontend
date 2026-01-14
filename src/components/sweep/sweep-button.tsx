'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { useWalletClient, useAccount } from 'wagmi';
import { chainMeta, rpcUrls } from '@/config/wagmi';
import { api, QuoteResponse, ApiError } from '@/services/api';

interface SweepButtonProps {
  selectedChain: number | null;
  destinationAddress: string;
  quote: QuoteResponse | null;
  disabled?: boolean;
}

type SweepStatus = 'idle' | 'signing' | 'submitting' | 'processing' | 'success' | 'error';

export function SweepButton({
  selectedChain,
  destinationAddress,
  quote,
  disabled,
}: SweepButtonProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<SweepStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const chainInfo = selectedChain ? chainMeta[selectedChain] : null;

  const handleSweep = async () => {
    if (disabled || !quote || !walletClient || !address || !selectedChain) return;

    try {
      setStatus('signing');
      setError(null);
      setTxHash(null);

      // Step 1: Sign EIP-712 message
      const eip712Signature = await walletClient.signTypedData({
        domain: quote.eip712Message.domain as any,
        types: quote.eip712Message.types as any,
        primaryType: quote.eip712Message.primaryType,
        message: quote.eip712Message.message as any,
      });

      // Step 2: Sign EIP-7702 authorization
      // This requires the wallet to support EIP-7702
      // The authorization allows the ZeroDust contract to execute on behalf of the user
      let eip7702Authorization;

      try {
        // Request EIP-7702 authorization from wallet
        // Note: This is a simplified version - actual implementation depends on wallet support
        const authMessage = {
          chainId: BigInt(selectedChain),
          address: quote.eip712Message.domain.verifyingContract as `0x${string}`,
          nonce: BigInt(quote.eip712Message.message.nonce),
        };

        // Sign the authorization using experimental_signAuthorization if available
        // Otherwise fall back to manual signing
        if ('experimental_signAuthorization' in walletClient) {
          eip7702Authorization = await (walletClient as any).experimental_signAuthorization(authMessage);
        } else {
          // Fallback: construct authorization manually
          // This requires wallet to support personal_sign with EIP-7702 format
          throw new Error('Wallet does not support EIP-7702. Please use MetaMask or Rabby.');
        }
      } catch (authError: any) {
        console.error('EIP-7702 authorization error:', authError);
        throw new Error(authError.message || 'Failed to sign EIP-7702 authorization. Your wallet may not support EIP-7702.');
      }

      setStatus('submitting');

      // Step 3: Submit to backend
      const sweepResponse = await api.submitSweep({
        quoteId: quote.quoteId,
        eip712Signature,
        eip7702Authorization: {
          chainId: eip7702Authorization.chainId.toString(),
          address: eip7702Authorization.contractAddress,
          nonce: eip7702Authorization.nonce.toString(),
          yParity: eip7702Authorization.yParity.toString(),
          r: eip7702Authorization.r,
          s: eip7702Authorization.s,
        },
      });

      setStatus('processing');

      // Step 4: Poll for completion
      const finalStatus = await api.pollSweepStatus(sweepResponse.sweepId, (update) => {
        if (update.txHash) {
          setTxHash(update.txHash);
        }
      });

      if (finalStatus.status === 'completed') {
        setStatus('success');
        setTxHash(finalStatus.txHash || null);
      } else {
        throw new Error(finalStatus.error || 'Sweep failed');
      }
    } catch (err: any) {
      console.error('Sweep error:', err);
      setStatus('error');

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err.message?.includes('User rejected')) {
        setError('Transaction was rejected in wallet');
      } else if (err.message?.includes('EIP-7702')) {
        setError(err.message);
      } else {
        setError(err.message || 'Something went wrong');
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxHash(null);
  };

  const getExplorerUrl = () => {
    if (!txHash || !selectedChain) return '#';

    const explorers: Record<number, string> = {
      11155111: 'https://sepolia.etherscan.io/tx/',
      84532: 'https://sepolia.basescan.org/tx/',
      11155420: 'https://sepolia-optimism.etherscan.io/tx/',
      421614: 'https://sepolia.arbiscan.io/tx/',
      80002: 'https://amoy.polygonscan.com/tx/',
      97: 'https://testnet.bscscan.com/tx/',
    };

    return (explorers[selectedChain] || '#') + txHash;
  };

  return (
    <div className="space-y-4">
      {/* Main button */}
      <button
        onClick={handleSweep}
        disabled={disabled || status === 'signing' || status === 'submitting' || status === 'processing'}
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
        {status === 'signing' && (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Sign in Wallet...
          </span>
        )}
        {status === 'submitting' && (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </span>
        )}
        {status === 'processing' && (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
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
        {(status === 'processing' || status === 'success') && chainInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-4"
          >
            <h4 className="font-semibold mb-3">
              {status === 'processing' ? 'Sweeping in progress...' : 'Sweep Complete!'}
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

            {txHash && (
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                <a
                  href={getExplorerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
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
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={reset}
                className="mt-2 text-sm text-red-500 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disabled message */}
      {disabled && selectedChain === null && (
        <p className="text-center text-sm text-zinc-500">
          Select a chain to sweep
        </p>
      )}

      {disabled && selectedChain !== null && !quote && (
        <p className="text-center text-sm text-zinc-500">
          Waiting for quote...
        </p>
      )}
    </div>
  );
}
