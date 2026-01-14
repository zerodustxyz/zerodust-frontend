'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Info, Loader2, AlertCircle } from 'lucide-react';
import { chainMeta } from '@/config/wagmi';
import { api, QuoteResponse, ApiError } from '@/services/api';

interface FeeBreakdownProps {
  selectedChain: number;
  balance: bigint;
  destinationAddress: string;
  onQuoteChange?: (quote: QuoteResponse | null) => void;
}

export function FeeBreakdown({
  selectedChain,
  balance,
  destinationAddress,
  onQuoteChange
}: FeeBreakdownProps) {
  const { address } = useAccount();
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainInfo = chainMeta[selectedChain] || { name: 'Unknown', color: '#888', symbol: 'ETH' };

  useEffect(() => {
    const fetchQuote = async () => {
      if (!address || !destinationAddress || balance === 0n) {
        setQuote(null);
        onQuoteChange?.(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const quoteResponse = await api.getQuote({
          chainId: selectedChain,
          userAddress: address,
          destinationAddress,
        });

        setQuote(quoteResponse);
        onQuoteChange?.(quoteResponse);
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
  }, [selectedChain, address, destinationAddress, balance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-brand-purple mr-2" />
        <span className="text-sm text-zinc-500">Getting quote...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-500 font-medium">Failed to get quote</p>
            <p className="text-xs text-red-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const fee = BigInt(quote.fee);
  const estimatedReceive = BigInt(quote.estimatedReceive);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        Fee Breakdown
        <Info className="w-4 h-4 text-zinc-400" />
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">Balance on {chainInfo.name}</span>
          <span className="font-mono">{Number(formatEther(balance)).toFixed(6)} {chainInfo.symbol}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">
            Service Fee (gas + buffer)
          </span>
          <span className="font-mono text-amber-500">
            -{Number(formatEther(fee)).toFixed(6)} {chainInfo.symbol}
          </span>
        </div>

        <div className="pt-2 border-t border-light-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <span className="font-medium">You Receive</span>
            <div className="text-right">
              <div className="font-mono font-semibold text-green-500">
                {Number(formatEther(estimatedReceive)).toFixed(6)} {chainInfo.symbol}
              </div>
              {quote.feeUsd && (
                <div className="text-xs text-zinc-500">
                  Fee: ~${quote.feeUsd}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fee notice */}
      <div className="p-3 bg-brand-purple/10 rounded-lg">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Quote expires in {Math.round((new Date(quote.expiresAt).getTime() - Date.now()) / 1000)}s.
          Your wallet will have exactly 0 balance after sweeping.
        </p>
      </div>
    </div>
  );
}
