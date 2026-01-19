'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import { chainMeta } from '@/config/wagmi';
import { api, QuoteV3Response, ApiError } from '@/services/api';
import { priceService } from '@/services/prices';

export type FeeWarningType = 'none' | 'amount_too_low' | 'high_fee';

interface FeeBreakdownProps {
  selectedChain: number;
  balance: bigint;
  destinationAddress: string;
  onQuoteChange?: (quote: QuoteV3Response | null) => void;
  onWarningChange?: (warning: FeeWarningType) => void;
  isPreview?: boolean;
}

// Fee constants for service fee calculation
const SERVICE_FEE_PERCENT = 0.05; // 5%
const MIN_SERVICE_FEE_USD = 0.05; // $0.05
const MAX_SERVICE_FEE_USD = 0.50; // $0.50

export function FeeBreakdown({
  selectedChain,
  balance,
  destinationAddress,
  onQuoteChange,
  onWarningChange,
  isPreview = false
}: FeeBreakdownProps) {
  const { address, isConnected } = useAccount();
  const [quote, setQuote] = useState<QuoteV3Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(false);

  const chainInfo = chainMeta[selectedChain] || { name: 'Unknown', color: '#888', symbol: 'ETH' };
  const tokenSymbol = chainInfo.symbol;

  // Calculate service fee with USD caps
  const calculateServiceFee = (amountWei: bigint, tokenPriceUsd: number): bigint => {
    // Guard against invalid inputs
    if (!tokenPriceUsd || isNaN(tokenPriceUsd) || tokenPriceUsd <= 0) {
      return 0n;
    }

    const amountEth = Number(formatEther(amountWei));
    if (isNaN(amountEth) || amountEth <= 0) {
      return 0n;
    }

    const amountUsd = amountEth * tokenPriceUsd;

    // Calculate 5% of value in USD
    let serviceFeeUsd = amountUsd * SERVICE_FEE_PERCENT;

    // Apply min/max caps
    serviceFeeUsd = Math.max(MIN_SERVICE_FEE_USD, Math.min(MAX_SERVICE_FEE_USD, serviceFeeUsd));

    // Convert back to ETH
    const serviceFeeEth = serviceFeeUsd / tokenPriceUsd;

    // Final NaN check
    if (isNaN(serviceFeeEth)) {
      return 0n;
    }

    return parseEther(serviceFeeEth.toFixed(18));
  };

  // Fetch token price for USD calculations (based on chain's native token)
  useEffect(() => {
    const fetchPrice = async () => {
      if (!tokenSymbol) return;

      setPriceLoading(true);
      try {
        const priceData = await priceService.getPrice(tokenSymbol);
        const price = priceData.priceUsd;
        // Validate price before setting
        if (typeof price === 'number' && !isNaN(price) && price > 0) {
          setTokenPrice(price);
        } else {
          console.warn(`Invalid ${tokenSymbol} price received:`, price);
          setTokenPrice(0);
        }
      } catch (err) {
        console.error(`Failed to fetch ${tokenSymbol} price:`, err);
        setTokenPrice(0);
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrice();
  }, [tokenSymbol]);

  // Fetch quote from backend
  useEffect(() => {
    const fetchQuote = async () => {
      if (!destinationAddress) {
        setQuote(null);
        onQuoteChange?.(null);
        return;
      }

      // Use real address if connected, otherwise use destination address
      const userAddr = isConnected && address ? address : destinationAddress;

      setIsLoading(true);
      setError(null);

      try {
        const quoteResponse = await api.getQuote({
          fromChainId: selectedChain,
          toChainId: selectedChain,
          userAddress: userAddr,
          destination: destinationAddress,
        });

        setQuote(quoteResponse);
        if (isConnected) {
          onQuoteChange?.(quoteResponse);
        }
        setCountdown(quoteResponse.validForSeconds);
      } catch (err) {
        console.error('Failed to get quote:', err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to get quote. Is the backend running?');
        }
        setQuote(null);
        onQuoteChange?.(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [selectedChain, address, destinationAddress, isConnected]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Notify parent about warning state (must be before early returns to maintain hooks order)
  useEffect(() => {
    // When loading, error, or no quote, no warning
    if (isLoading || priceLoading || error || !quote) {
      onWarningChange?.('none');
      return;
    }

    // Calculate values needed for warning determination
    const overheadGas = BigInt(quote.fees.overheadGasUnits);
    const protocolGas = BigInt(quote.fees.protocolFeeGasUnits);
    const gasPrice = BigInt(quote.fees.reimbGasPriceCapWei);
    const extraFee = BigInt(quote.fees.extraFeeWei);
    const networkFee = (overheadGas + protocolGas) * gasPrice + extraFee;

    const inPreviewMode = !isConnected;

    let displayBalance: bigint;
    let totalFee: bigint;

    if (inPreviewMode) {
      displayBalance = balance;
      const serviceFee = calculateServiceFee(balance, tokenPrice);
      totalFee = serviceFee + networkFee;
    } else {
      displayBalance = BigInt(quote.userBalance);
      totalFee = BigInt(quote.fees.maxTotalFeeWei);
    }

    const feesExceedAmount = totalFee >= displayBalance;
    const highFeeWarning = !feesExceedAmount && displayBalance > 0n &&
      (Number(totalFee) / Number(displayBalance)) > 0.3;

    if (feesExceedAmount) {
      onWarningChange?.('amount_too_low');
    } else if (highFeeWarning) {
      onWarningChange?.('high_fee');
    } else {
      onWarningChange?.('none');
    }
  }, [isLoading, priceLoading, error, quote, isConnected, balance, tokenPrice, onWarningChange]);

  // Loading state
  if (isLoading || priceLoading) {
    return (
      <div className="flex items-center justify-center py-4 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-brand-violet" />
        <span className="text-sm text-zinc-500">
          {priceLoading ? 'Loading prices...' : 'Getting quote...'}
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  // No quote available
  if (!quote) {
    return null;
  }

  // Extract network fee from quote (gas-related costs)
  const overheadGas = BigInt(quote.fees.overheadGasUnits);
  const protocolGas = BigInt(quote.fees.protocolFeeGasUnits);
  const gasPrice = BigInt(quote.fees.reimbGasPriceCapWei);
  const extraFee = BigInt(quote.fees.extraFeeWei);
  const networkFee = (overheadGas + protocolGas) * gasPrice + extraFee;

  // Determine if we're in preview mode (not connected)
  const inPreviewMode = !isConnected;

  // Calculate fees based on mode
  let displayBalance: bigint;
  let serviceFee: bigint;
  let totalFee: bigint;
  let estimatedReceive: bigint;

  if (inPreviewMode) {
    // Preview mode: use user's entered balance + calculated fees
    displayBalance = balance;
    serviceFee = calculateServiceFee(balance, tokenPrice);
    totalFee = serviceFee + networkFee;
    estimatedReceive = balance > totalFee ? balance - totalFee : 0n;
  } else {
    // Connected mode: use actual quote data
    displayBalance = BigInt(quote.userBalance);
    totalFee = BigInt(quote.fees.maxTotalFeeWei);
    serviceFee = totalFee - networkFee; // Approximate
    estimatedReceive = BigInt(quote.estimatedReceive);
  }

  // Check if fees exceed the amount
  const feesExceedAmount = totalFee >= displayBalance;

  // Check if fees consume a significant portion of the amount (>30% goes to fees)
  const highFeeWarning = !feesExceedAmount && displayBalance > 0n &&
    (Number(totalFee) / Number(displayBalance)) > 0.3;

  const feePercentage = displayBalance > 0n && !feesExceedAmount
    ? (Number(totalFee) / Number(displayBalance) * 100).toFixed(2)
    : '0';

  // Helper to format USD safely
  const formatUsd = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return '-';
    return `$${value.toFixed(2)}`;
  };

  // Calculate USD values (only if tokenPrice is valid)
  const validPrice = tokenPrice > 0 && !isNaN(tokenPrice);
  const balanceUsd = validPrice ? Number(formatEther(displayBalance)) * tokenPrice : NaN;
  const serviceFeeUsd = validPrice ? Number(formatEther(serviceFee)) * tokenPrice : NaN;
  const networkFeeUsd = validPrice ? Number(formatEther(networkFee)) * tokenPrice : NaN;
  const totalFeeUsd = validPrice ? Number(formatEther(totalFee)) * tokenPrice : NaN;
  const receiveUsd = validPrice ? Number(formatEther(estimatedReceive)) * tokenPrice : NaN;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Preview notice */}
      {inPreviewMode && !feesExceedAmount && (
        <div className="flex items-center gap-2 text-xs text-brand-violet">
          <Info className="w-3.5 h-3.5" />
          <span>Preview - connect wallet to sweep</span>
        </div>
      )}

      {/* Warning when fees exceed amount */}
      {feesExceedAmount && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-500">Amount too low</p>
            <p className="text-xs text-red-500/80">
              Minimum amount needed: ~{Number(formatEther(totalFee)).toFixed(6)} {chainInfo.symbol} ({formatUsd(totalFeeUsd)})
            </p>
          </div>
        </div>
      )}

      {/* Warning when fees consume most of the amount */}
      {highFeeWarning && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-500">High fee ratio</p>
            <p className="text-xs text-red-500/80">
              Fees will consume {feePercentage}% of your amount. You&apos;ll only receive ~{Number(formatEther(estimatedReceive)).toFixed(6)} {chainInfo.symbol} ({formatUsd(receiveUsd)}).
            </p>
          </div>
        </div>
      )}

      {/* Summary row - You receive (only show when fees don't exceed amount) */}
      {!feesExceedAmount && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">You receive</span>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-mono font-semibold text-green-500">
                {inPreviewMode ? '~' : ''}{Number(formatEther(estimatedReceive)).toFixed(6)} {chainInfo.symbol}
              </span>
              <span className="block text-xs text-zinc-400">
                {inPreviewMode ? '~' : ''}{formatUsd(receiveUsd)}
              </span>
            </div>
            {countdown !== null && countdown > 0 && !inPreviewMode && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {countdown}s
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expandable details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-sm text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
      >
        <span>Fee breakdown</span>
        <div className="flex items-center gap-1">
          {feesExceedAmount ? (
            <span className="text-xs text-red-500">Insufficient</span>
          ) : (
            <span className="text-xs">{inPreviewMode ? '~' : ''}{feePercentage}% fee</span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Amount</span>
            <div className="text-right">
              <span className="font-mono">
                {Number(formatEther(displayBalance)).toFixed(6)} {chainInfo.symbol}
              </span>
              <span className="block text-xs text-zinc-400">{formatUsd(balanceUsd)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-zinc-500">Service fee</span>
              <span className="block text-xs text-zinc-400">5% (min $0.05, max $0.50)</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-zinc-400">
                {Number(formatEther(serviceFee)).toFixed(6)} {chainInfo.symbol}
              </span>
              <span className="block text-xs text-zinc-500">
                {formatUsd(serviceFeeUsd)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-zinc-500">Network fee</span>
              <span className="block text-xs text-zinc-400">Gas cost</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-zinc-400">
                {Number(formatEther(networkFee)).toFixed(6)} {chainInfo.symbol}
              </span>
              <span className="block text-xs text-zinc-500">
                {formatUsd(networkFeeUsd)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-light-border dark:border-dark-border">
            <span className="text-zinc-500 font-medium">You receive</span>
            <div className="text-right">
              <span className="font-mono font-semibold text-green-500">
                {inPreviewMode ? '~' : ''}{Number(formatEther(estimatedReceive)).toFixed(6)} {chainInfo.symbol}
              </span>
              <span className="block text-xs text-zinc-400">
                {inPreviewMode ? '~' : ''}{formatUsd(receiveUsd)}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 pt-2">
            Final balance: <span className="font-mono font-semibold">0 {chainInfo.symbol}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
