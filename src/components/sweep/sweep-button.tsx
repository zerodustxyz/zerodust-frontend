'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, ExternalLink, AlertTriangle, Info, Sparkles, ArrowRight } from 'lucide-react';
import { useWalletClient, useAccount, useSwitchChain, usePublicClient } from 'wagmi';
import { chainMeta } from '@/config/wagmi';
import { api, QuoteV3Response, ApiError, SWEEP_INTENT_TYPES } from '@/services/api';

// EIP-7702 wallet compatibility status
type WalletCompatibility = 'unknown' | 'checking' | 'compatible' | 'incompatible' | 'partial';

interface WalletInfo {
  name: string;
  compatibility: WalletCompatibility;
  reason?: string;
}

// Known wallet compatibility (updated as wallets add support)
const KNOWN_WALLETS: Record<string, Omit<WalletInfo, 'name'>> = {
  'rabby': {
    compatibility: 'compatible',
    reason: 'Rabby supports EIP-7702 via wallet_signAuthorization',
  },
  'metamask': {
    compatibility: 'unknown',
    reason: 'MetaMask EIP-7702 support is experimental. It may or may not work.',
  },
  'coinbase': {
    compatibility: 'unknown',
    reason: 'Coinbase Wallet EIP-7702 support status unknown.',
  },
  'rainbow': {
    compatibility: 'unknown',
    reason: 'Rainbow EIP-7702 support status unknown.',
  },
};

function detectWallet(): WalletInfo {
  if (typeof window === 'undefined' || !window.ethereum) {
    return { name: 'Unknown', compatibility: 'unknown' };
  }

  const provider = window.ethereum as any;

  if (provider.isRabby) {
    return { name: 'Rabby', ...KNOWN_WALLETS['rabby'] };
  }
  if (provider.isMetaMask && !provider.isRabby) {
    return { name: 'MetaMask', ...KNOWN_WALLETS['metamask'] };
  }
  if (provider.isCoinbaseWallet) {
    return { name: 'Coinbase Wallet', ...KNOWN_WALLETS['coinbase'] };
  }
  if (provider.isRainbow) {
    return { name: 'Rainbow', ...KNOWN_WALLETS['rainbow'] };
  }

  return { name: 'Unknown Wallet', compatibility: 'unknown' };
}

// V3 contract addresses per chain
const V3_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7',
  84532: '0x3f544C958A43E40d8C05e8233EAf502279A403E5',
  11155420: '0x8b2c2330B6FaDcC51d4619fdAf8843870c6a722c',
  421614: '0x79B214978eCae1ABe3Fd50A2BE9E158Aa3034E02',
  80002: '0xA90B6700B3788F73E481Af1eCeeE9F51513a848b',
  97: '0x8b2c2330B6FaDcC51d4619fdAf8843870c6a722c',
};

interface SweepButtonProps {
  selectedChain: number | null;
  destinationAddress: string;
  quote: QuoteV3Response | null;
  disabled?: boolean;
}

type SweepStatus = 'idle' | 'signing' | 'submitting' | 'processing' | 'success' | 'error';

export function SweepButton({
  selectedChain,
  destinationAddress,
  quote,
  disabled,
}: SweepButtonProps) {
  const { address, chainId: currentChainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<SweepStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ name: 'Unknown', compatibility: 'checking' });

  const chainInfo = selectedChain ? chainMeta[selectedChain] : null;
  const contractAddress = selectedChain ? V3_CONTRACT_ADDRESSES[selectedChain] : null;

  useEffect(() => {
    if (walletClient) {
      const detected = detectWallet();
      setWalletInfo(detected);
    }
  }, [walletClient]);

  const signEIP7702Authorization = async (
    chainId: number,
    contractAddr: `0x${string}`,
    authNonce: number
  ) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');

    const result = await (window.ethereum as any).request({
      method: 'wallet_signAuthorization',
      params: [{
        from: address,
        contractAddress: contractAddr,
        chainId: chainId,
        nonce: authNonce,
      }],
    });

    return {
      chainId: typeof result.chainId === 'string' ? parseInt(result.chainId, 16) : result.chainId,
      contractAddress: result.address,
      nonce: typeof result.nonce === 'string' ? parseInt(result.nonce, 16) : result.nonce,
      yParity: typeof result.yParity === 'string' ? parseInt(result.yParity, 16) : result.yParity,
      r: result.r,
      s: result.s,
    };
  };

  const handleSweep = async () => {
    if (disabled || !quote || !walletClient || !address || !selectedChain) return;

    if (!contractAddress) {
      setError(`Chain ${selectedChain} not supported yet`);
      setStatus('error');
      return;
    }

    try {
      setStatus('signing');
      setError(null);
      setTxHash(null);

      if (currentChainId !== selectedChain) {
        try {
          await switchChainAsync({ chainId: selectedChain });
        } catch {
          throw new Error(`Please switch to ${chainInfo?.name || 'the correct chain'} in your wallet`);
        }
      }

      const userNonce = await publicClient!.getTransactionCount({ address });
      const eip7702Auth = await signEIP7702Authorization(selectedChain, contractAddress, userNonce);

      const domain = api.buildEIP712Domain(selectedChain, address);
      const message = api.buildSweepIntentMessage(quote, address);

      const sweepSignature = await walletClient.signTypedData({
        domain,
        types: SWEEP_INTENT_TYPES,
        primaryType: 'SweepIntent',
        message,
      });

      setStatus('submitting');

      const sweepResponse = await api.submitSweep({
        quoteId: quote.quoteId,
        signature: sweepSignature,
        eip7702Authorization: eip7702Auth,
      });

      setStatus('processing');

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
    } catch (err: unknown) {
      console.error('Sweep error:', err);
      setStatus('error');

      const errorMessage = err instanceof Error ? err.message : String(err);

      if (err instanceof ApiError) {
        if (err.code === 'EIP7702_INVALID_SIGNATURE') {
          setError('EIP-7702 authorization signature invalid. Your wallet may not support EIP-7702 signing correctly.');
        } else {
          setError(err.message);
        }
      } else if (errorMessage.includes('User rejected') || errorMessage.includes('denied')) {
        setError('Signature was rejected in wallet');
      } else if (errorMessage.includes('eth_sign') || errorMessage.includes('not support')) {
        setError(`Your wallet (${walletInfo.name}) does not support EIP-7702 signing. Please try a different wallet.`);
        setWalletInfo(prev => ({ ...prev, compatibility: 'incompatible', reason: 'eth_sign is blocked or unsupported' }));
      } else if (errorMessage.includes('Method not found') || errorMessage.includes('not implemented')) {
        setError('Your wallet does not support the required signing method for EIP-7702.');
      } else {
        setError(errorMessage || 'Something went wrong');
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxHash(null);
  };

  const getExplorerUrl = (hash: string | null) => {
    if (!hash || !selectedChain) return '#';

    const explorers: Record<number, string> = {
      11155111: 'https://sepolia.etherscan.io/tx/',
      84532: 'https://sepolia.basescan.org/tx/',
      11155420: 'https://sepolia-optimism.etherscan.io/tx/',
      421614: 'https://sepolia.arbiscan.io/tx/',
      80002: 'https://amoy.polygonscan.com/tx/',
      97: 'https://testnet.bscscan.com/tx/',
    };

    return (explorers[selectedChain] || '#') + hash;
  };

  const isButtonDisabled = disabled ||
    status === 'signing' ||
    status === 'submitting' ||
    status === 'processing';

  const getButtonContent = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <Sparkles className="w-5 h-5" />
            Sweep to Zero
            <ArrowRight className="w-5 h-5" />
          </>
        );
      case 'signing':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sign in wallet (2 signatures)
          </>
        );
      case 'submitting':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        );
      case 'processing':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sweeping...
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-5 h-5" />
            Sweep Complete!
          </>
        );
      case 'error':
        return (
          <>
            <X className="w-5 h-5" />
            Failed
          </>
        );
    }
  };

  const getButtonClass = () => {
    const base = 'w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3';

    if (isButtonDisabled && status === 'idle') {
      return `${base} bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed`;
    }

    switch (status) {
      case 'success':
        return `${base} bg-success text-white`;
      case 'error':
        return `${base} bg-error text-white hover:bg-error/90`;
      default:
        return `${base} bg-gradient-brand text-white hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Wallet compatibility warning */}
      {walletInfo.compatibility === 'incompatible' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="notice-warning"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">
                {walletInfo.name} Not Compatible
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {walletInfo.reason}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                EIP-7702 is a new Ethereum feature. Wallet support is still rolling out.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Wallet compatibility unknown warning */}
      {walletInfo.compatibility === 'unknown' && walletClient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="notice-info"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-violet mt-0.5 flex-shrink-0" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">{walletInfo.name}</span>: EIP-7702 support unknown.
              The sweep may fail if your wallet doesn't support EIP-7702 signing.
            </p>
          </div>
        </motion.div>
      )}

      {/* Main button */}
      <motion.button
        onClick={status === 'error' ? reset : handleSweep}
        disabled={isButtonDisabled}
        className={getButtonClass()}
        whileTap={!isButtonDisabled ? { scale: 0.98 } : undefined}
      >
        {getButtonContent()}
      </motion.button>

      {/* Status modal */}
      <AnimatePresence>
        {(status === 'processing' || status === 'success') && chainInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card-elevated p-5"
          >
            <h4 className="font-semibold mb-4">
              {status === 'processing' ? 'Sweeping in progress...' : 'Sweep Complete!'}
            </h4>

            {/* Chain progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${chainInfo.color}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: chainInfo.color }}
                  />
                </div>
                <span className="font-medium">{chainInfo.name}</span>
              </div>
              <span className="flex items-center gap-2">
                {status === 'success' ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-success font-medium">Complete</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-brand-violet" />
                    <span className="text-sm text-brand-violet font-medium">Processing</span>
                  </>
                )}
              </span>
            </div>

            {txHash && (
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-sm text-brand-violet w-full justify-center"
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {status === 'error' && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="notice-error"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-error font-medium">{error}</p>
              <button
                onClick={reset}
                className="mt-2 text-sm text-error underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Disabled messages */}
      {disabled && status === 'idle' && (
        <p className="text-center text-sm text-zinc-500">
          {selectedChain === null
            ? 'Select a chain to sweep'
            : !quote
            ? 'Waiting for quote...'
            : 'Complete the form above'}
        </p>
      )}
    </div>
  );
}
