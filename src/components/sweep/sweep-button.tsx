'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, ExternalLink, AlertTriangle, Info, Sparkles, ArrowRight } from 'lucide-react';
import { useWalletClient, useAccount, useSwitchChain, usePublicClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { chainMeta } from '@/config/wagmi';
import { api, QuoteResponse, ApiError, SWEEP_INTENT_TYPES } from '@/services/api';
import { ChainIcon } from '@/components/ui/chain-icon';

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
  'ambire': {
    compatibility: 'unknown',
    reason: 'Ambire EIP-7702 support is being tested. It may or may not work.',
  },
  'metamask': {
    compatibility: 'compatible',
    reason: 'MetaMask (modified) supports EIP-7702 via wallet_signAuthorization',
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
  if (provider.isAmbire) {
    return { name: 'Ambire', ...KNOWN_WALLETS['ambire'] };
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

// Contract addresses per chain
// Mainnet: 0x3732398281d0606aCB7EC1D490dFB0591BE4c4f2 (CREATE2 deterministic, 26 chains)
// Testnet: Various addresses per chain
const MAINNET_ADDRESS: `0x${string}` = '0x3732398281d0606aCB7EC1D490dFB0591BE4c4f2';

const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  // Mainnets (26 chains) - all use the same CREATE2 address
  1: MAINNET_ADDRESS,        // Ethereum
  10: MAINNET_ADDRESS,       // Optimism
  56: MAINNET_ADDRESS,       // BSC
  100: MAINNET_ADDRESS,      // Gnosis
  130: MAINNET_ADDRESS,      // Unichain
  137: MAINNET_ADDRESS,      // Polygon
  146: MAINNET_ADDRESS,      // Sonic
  196: MAINNET_ADDRESS,      // X Layer
  252: MAINNET_ADDRESS,      // Fraxtal
  480: MAINNET_ADDRESS,      // World Chain
  1329: MAINNET_ADDRESS,     // Sei
  1514: MAINNET_ADDRESS,     // Story
  1868: MAINNET_ADDRESS,     // Soneium
  5000: MAINNET_ADDRESS,     // Mantle
  5330: MAINNET_ADDRESS,     // Superseed
  8453: MAINNET_ADDRESS,     // Base
  9745: MAINNET_ADDRESS,     // Plasma
  33139: MAINNET_ADDRESS,    // ApeChain
  34443: MAINNET_ADDRESS,    // Mode
  42161: MAINNET_ADDRESS,    // Arbitrum
  42220: MAINNET_ADDRESS,    // Celo
  57073: MAINNET_ADDRESS,    // Ink
  59144: MAINNET_ADDRESS,    // Linea
  60808: MAINNET_ADDRESS,    // BOB
  80094: MAINNET_ADDRESS,    // Berachain
  81457: MAINNET_ADDRESS,    // Blast
  534352: MAINNET_ADDRESS,   // Scroll
  7777777: MAINNET_ADDRESS,  // Zora
  // Testnets
  11155111: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7', // Sepolia
  84532: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7',    // Base Sepolia
  11155420: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7', // OP Sepolia
  421614: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7',   // Arbitrum Sepolia
  80002: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7',    // Polygon Amoy
  97: '0x8102a8a8029F0dFFC3C5f6528a298437d5D2c2e7',       // BSC Testnet
};

interface SweepButtonProps {
  selectedChain: number | null;
  destinationAddress: string;
  quote: QuoteResponse | null;
  disabled?: boolean;
  onSweepComplete?: () => void;
  onSweepSuccess?: () => void;
}

type SweepStatus = 'idle' | 'signing' | 'submitting' | 'processing' | 'bridging' | 'success' | 'error';

export function SweepButton({
  selectedChain,
  destinationAddress,
  quote,
  disabled,
  onSweepComplete,
  onSweepSuccess,
}: SweepButtonProps) {
  const { address, chainId: currentChainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<SweepStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [destinationTxHash, setDestinationTxHash] = useState<string | null>(null);
  const [destinationChainId, setDestinationChainId] = useState<number | null>(null);
  const [isCrossChain, setIsCrossChain] = useState<boolean>(false);
  const [userReceived, setUserReceived] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ name: 'Unknown', compatibility: 'checking' });

  const chainInfo = selectedChain ? chainMeta[selectedChain] : null;
  const contractAddress = selectedChain ? CONTRACT_ADDRESSES[selectedChain] : null;

  // Helper to truncate address for display
  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Helper to format received amount
  const formatReceived = (wei: string, chainId: number) => {
    try {
      const value = BigInt(wei);
      const eth = Number(value) / 1e18;
      const symbol = chainMeta[chainId]?.symbol || 'ETH';
      return `${eth.toFixed(6)} ${symbol}`;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (walletClient) {
      const detected = detectWallet();
      setWalletInfo(detected);
    }
  }, [walletClient]);

  // Reset to idle when user selects a different chain (after a sweep completes)
  useEffect(() => {
    // Only reset if sweep was completed/errored and user selects a new chain
    if ((status === 'success' || status === 'error') && selectedChain !== null) {
      reset();
    }
  }, [selectedChain]);

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

  // Sign multiple EIP-7702 authorizations in batch (reduces user interactions)
  const signBatchEIP7702Authorizations = async (
    chainId: number,
    authorizations: Array<{
      contractAddress: `0x${string}`;
      nonce: number;
      label?: string;
    }>
  ) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');

    const results = await (window.ethereum as any).request({
      method: 'wallet_signBatchAuthorization',
      params: [{
        from: address,
        authorizations: authorizations.map(auth => ({
          contractAddress: auth.contractAddress,
          chainId: chainId,
          nonce: auth.nonce,
          label: auth.label,
        })),
      }],
    });

    return results.map((result: any) => ({
      chainId: typeof result.chainId === 'string' ? parseInt(result.chainId, 16) : result.chainId,
      contractAddress: result.address,
      nonce: typeof result.nonce === 'string' ? parseInt(result.nonce, 16) : result.nonce,
      yParity: typeof result.yParity === 'string' ? parseInt(result.yParity, 16) : result.yParity,
      r: result.r,
      s: result.s,
    }));
  };

  // Check if wallet supports batch authorization signing
  const supportsBatchAuth = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) return false;
    const provider = window.ethereum as any;
    // Rabby fork and modified MetaMask support batch signing
    return provider.isRabby === true || provider.isMetaMask === true;
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

      // Use authNonce from the quote - it's the transaction count fetched from the correct chain by the backend
      // Don't use publicClient.getTransactionCount as it might be stale or from wrong chain after chain switch
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

      let eip7702Auth;
      let revokeAuth;

      // Try batch signing first (reduces user interactions from 3 to 2)
      const canBatchSign = await supportsBatchAuth();
      if (canBatchSign) {
        // Sign both authorizations in one user interaction
        const [sweepAuthResult, revokeAuthResult] = await signBatchEIP7702Authorizations(
          selectedChain,
          [
            {
              contractAddress: contractAddress,
              nonce: quote.authNonce,
              label: 'Delegate to ZeroDust',
            },
            {
              contractAddress: ZERO_ADDRESS,
              nonce: quote.authNonce + 1,
              label: 'Revoke Delegation',
            },
          ]
        );
        eip7702Auth = sweepAuthResult;
        revokeAuth = revokeAuthResult;
      } else {
        // Fallback to individual signing (3 signatures total)
        eip7702Auth = await signEIP7702Authorization(selectedChain, contractAddress, quote.authNonce);
        // Sign revoke authorization (delegates to address(0) to remove delegation after sweep)
        // Revoke nonce must be sweep nonce + 1 (executed after sweep completes)
        revokeAuth = await signEIP7702Authorization(selectedChain, ZERO_ADDRESS, quote.authNonce + 1);
      }

      const domain = api.buildEIP712Domain(selectedChain, address);
      const message = api.buildSweepIntentMessage(quote, address);

      // Viem 2.44+ blocks using internal accounts as verifyingContract, but this is
      // required for EIP-7702 where the user's EOA IS the contract after delegation.
      // We use ethers.js directly to bypass viem's interception entirely.
      const ethersProvider = new BrowserProvider((window as any).ethereum);
      const signer = await ethersProvider.getSigner();

      // ethers.js signTypedData doesn't have viem's safety check
      // Spread types to convert from readonly to mutable for ethers.js compatibility
      const sweepSignature = await signer.signTypedData(
        {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract,
        },
        { SweepIntent: [...SWEEP_INTENT_TYPES.SweepIntent] },
        {
          mode: message.mode,
          user: message.user,
          destination: message.destination,
          destinationChainId: message.destinationChainId,
          callTarget: message.callTarget,
          routeHash: message.routeHash,
          minReceive: message.minReceive,
          maxTotalFeeWei: message.maxTotalFeeWei,
          overheadGasUnits: message.overheadGasUnits,
          protocolFeeGasUnits: message.protocolFeeGasUnits,
          extraFeeWei: message.extraFeeWei,
          reimbGasPriceCapWei: message.reimbGasPriceCapWei,
          deadline: message.deadline,
          nonce: message.nonce,
        }
      );

      setStatus('submitting');

      const sweepResponse = await api.submitSweep({
        quoteId: quote.quoteId,
        signature: sweepSignature,
        eip7702Authorization: eip7702Auth,
        revokeAuthorization: revokeAuth,
      });

      setStatus('processing');

      // Check if this is a cross-chain sweep (mode 1 = call)
      const crossChain = quote.mode === 1;
      setIsCrossChain(crossChain);
      if (crossChain && quote.intent?.destinationChainId) {
        setDestinationChainId(parseInt(quote.intent.destinationChainId));
      }

      const finalStatus = await api.pollSweepStatus(sweepResponse.sweepId, (update) => {
        if (update.txHash) {
          setTxHash(update.txHash);
        }
        if (update.destinationTxHash) {
          setDestinationTxHash(update.destinationTxHash);
        }
        if (update.userReceived) {
          setUserReceived(update.userReceived);
        }
      });

      if (finalStatus.status === 'completed') {
        setStatus('success');
        setTxHash(finalStatus.txHash || null);
        setDestinationTxHash(finalStatus.destinationTxHash || null);
        setUserReceived(finalStatus.userReceived || null);
        // Notify parent that sweep succeeded (for balance refresh)
        onSweepSuccess?.();
      } else if (finalStatus.status === 'bridging') {
        // Cross-chain sweep: source tx confirmed, bridging in progress
        setStatus('bridging');
        setTxHash(finalStatus.txHash || null);
      } else {
        throw new Error(finalStatus.error || 'Sweep failed');
      }
    } catch (err: unknown) {
      console.error('Sweep error (full):', err);
      setStatus('error');

      // Extract error message from various error formats (wallet errors can be nested)
      let errorMessage = 'Something went wrong';
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        const errObj = err as Record<string, unknown>;
        errorMessage = (errObj.message || errObj.error || errObj.reason || JSON.stringify(err)) as string;
        console.error('Error object:', JSON.stringify(err, null, 2));
      }

      if (err instanceof ApiError) {
        if (err.code === 'EIP7702_INVALID_SIGNATURE') {
          setError('EIP-7702 authorization signature invalid. Your wallet may not support EIP-7702 signing correctly.');
        } else {
          setError(err.message);
        }
      } else if (errorMessage.includes('User rejected') || errorMessage.includes('denied') || errorMessage.includes('user rejected')) {
        setError('Signature was rejected in wallet');
      } else if (errorMessage.includes('wallet_signAuthorization') && errorMessage.includes('not support')) {
        // Only trigger wallet incompatibility for EIP-7702 auth method issues
        setError(`Your wallet (${walletInfo.name}) does not support EIP-7702 signing. Please try a different wallet.`);
        setWalletInfo(prev => ({ ...prev, compatibility: 'incompatible', reason: 'wallet_signAuthorization not supported' }));
      } else if (errorMessage.includes('Method not found') || errorMessage.includes('not implemented')) {
        setError('Your wallet does not support the required signing method for EIP-7702.');
      } else {
        // Show actual error for debugging
        setError(errorMessage || 'Something went wrong');
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxHash(null);
    setDestinationTxHash(null);
    setDestinationChainId(null);
    setIsCrossChain(false);
    setUserReceived(null);
  };

  const getExplorerUrl = (hash: string | null, chainId?: number | null) => {
    const targetChain = chainId ?? selectedChain;
    if (!hash || !targetChain) return '#';

    const explorers: Record<number, string> = {
      // Mainnets
      1: 'https://etherscan.io/tx/',
      10: 'https://optimistic.etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      100: 'https://gnosisscan.io/tx/',
      130: 'https://unichain.blockscout.com/tx/',
      137: 'https://polygonscan.com/tx/',
      146: 'https://sonicscan.org/tx/',
      196: 'https://www.okx.com/web3/explorer/xlayer/tx/',
      252: 'https://fraxscan.com/tx/',
      480: 'https://worldchain-mainnet.explorer.alchemy.com/tx/',
      1329: 'https://seitrace.com/tx/',
      1514: 'https://www.storyscan.io/tx/',
      1868: 'https://soneium.blockscout.com/tx/',
      5000: 'https://mantlescan.xyz/tx/',
      5330: 'https://explorer.superseed.xyz/tx/',
      8453: 'https://basescan.org/tx/',
      9745: 'https://plasmascan.to/tx/',
      33139: 'https://apechain.calderaexplorer.xyz/tx/',
      34443: 'https://explorer.mode.network/tx/',
      42161: 'https://arbiscan.io/tx/',
      42220: 'https://celoscan.io/tx/',
      57073: 'https://explorer.inkonchain.com/tx/',
      59144: 'https://lineascan.build/tx/',
      60808: 'https://explorer.gobob.xyz/tx/',
      80094: 'https://beratrail.io/tx/',
      81457: 'https://blastscan.io/tx/',
      534352: 'https://scrollscan.com/tx/',
      7777777: 'https://explorer.zora.energy/tx/',
      // Testnets
      11155111: 'https://sepolia.etherscan.io/tx/',
      84532: 'https://sepolia.basescan.org/tx/',
      11155420: 'https://sepolia-optimism.etherscan.io/tx/',
      421614: 'https://sepolia.arbiscan.io/tx/',
      80002: 'https://amoy.polygonscan.com/tx/',
      97: 'https://testnet.bscscan.com/tx/',
    };

    return (explorers[targetChain] || '#') + hash;
  };

  // Button is only shown in idle state now

  const getButtonClass = () => {
    const base = 'w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3';

    if (disabled) {
      return `${base} bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed`;
    }

    return `${base} bg-gradient-brand text-white hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]`;
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

      {/* Main button - only show in idle state */}
      {status === 'idle' && (
        <motion.button
          onClick={handleSweep}
          disabled={disabled}
          className={getButtonClass()}
          whileTap={!disabled ? { scale: 0.98 } : undefined}
        >
          <Sparkles className="w-5 h-5" />
          Sweep
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      )}

      {/* Signing/Submitting status */}
      <AnimatePresence>
        {(status === 'signing' || status === 'submitting') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card-elevated p-5"
          >
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-brand-violet" />
              <span className="font-medium">
                {status === 'signing' ? 'Sign in wallet (2 signatures)' : 'Submitting...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status modal */}
      <AnimatePresence>
        {(status === 'processing' || status === 'bridging' || status === 'success') && chainInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card-elevated p-5"
          >
            <h4 className="font-semibold mb-4">
              {status === 'processing' ? 'Sweeping in progress...' :
               status === 'bridging' ? 'Bridging to destination...' :
               'Sweep Complete!'}
            </h4>

            {/* Source chain progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChainIcon chainId={selectedChain!} size={32} />
                <span className="font-medium">{chainInfo.name}</span>
              </div>
              <span className="flex items-center gap-2">
                {(status === 'success' || status === 'bridging') && txHash ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-success font-medium">Confirmed</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-brand-violet" />
                    <span className="text-sm text-brand-violet font-medium">Processing</span>
                  </>
                )}
              </span>
            </div>

            {/* Destination chain progress (for cross-chain sweeps) */}
            {destinationChainId && chainMeta[destinationChainId] && (
              <>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <ChainIcon chainId={destinationChainId} size={32} />
                    <span className="font-medium">{chainMeta[destinationChainId].name}</span>
                  </div>
                  <span className="flex items-center gap-2">
                    {status === 'success' && destinationTxHash ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-sm text-success font-medium">Complete</span>
                      </>
                    ) : status === 'bridging' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-brand-violet" />
                        <span className="text-sm text-brand-violet font-medium">Bridging</span>
                      </>
                    ) : null}
                  </span>
                </div>

                {/* Cross-chain: show destination info when complete or bridging */}
                {(status === 'success' || status === 'bridging') && (
                  <div className="mt-3 pl-11 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Recipient</span>
                      <span className="font-mono">{truncateAddress(destinationAddress)}</span>
                    </div>
                    {userReceived ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Received</span>
                        <span className="font-medium text-success">
                          {formatReceived(userReceived, destinationChainId)}
                        </span>
                      </div>
                    ) : quote?.estimatedReceive && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Est. Receive</span>
                        <span className="font-medium">
                          ~{formatReceived(quote.estimatedReceive, destinationChainId)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Same-chain: show destination info */}
            {!isCrossChain && status === 'success' && (
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Recipient</span>
                    <span className="font-mono">{truncateAddress(destinationAddress)}</span>
                  </div>
                  {userReceived && selectedChain && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Received</span>
                      <span className="font-medium text-success">
                        {formatReceived(userReceived, selectedChain)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction links */}
            {(txHash || destinationTxHash) && (
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border space-y-2">
                {txHash && (
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-sm text-brand-violet w-full justify-center"
                  >
                    {isCrossChain ? 'View Source TX' : 'View Transaction'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {destinationTxHash && (
                  <a
                    href={getExplorerUrl(destinationTxHash, destinationChainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-sm text-brand-violet w-full justify-center"
                  >
                    View Destination TX
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
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
