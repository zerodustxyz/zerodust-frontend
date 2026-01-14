'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BalanceList } from '@/components/sweep/balance-list';
import { DestinationForm } from '@/components/sweep/destination-form';
import { SweepButton } from '@/components/sweep/sweep-button';
import { FeeBreakdown } from '@/components/sweep/fee-breakdown';
import { QuoteResponse } from '@/services/api';

export default function AppPage() {
  const { isConnected, address } = useAccount();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<bigint>(0n);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const effectiveDestination = destinationAddress || address || '';

  const handleChainSelect = useCallback((chainId: number | null) => {
    setSelectedChain(chainId);
    setQuote(null);
  }, []);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 text-center max-w-md mx-auto"
        >
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Connect your wallet to view balances and start sweeping.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-4"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Sweep Your Balance
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Select a chain and enter destination address
          </p>
        </div>

        {/* Balance List */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold mb-3">Select Chain</h2>
          <BalanceList
            selectedChain={selectedChain}
            onSelectionChange={handleChainSelect}
            onBalanceChange={setSelectedBalance}
          />
        </div>

        {/* Destination */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold mb-3">Destination Address</h2>
          <DestinationForm
            chainId={selectedChain}
            address={effectiveDestination}
            onAddressChange={setDestinationAddress}
          />
        </div>

        {/* Fee Breakdown */}
        {selectedChain !== null && selectedBalance > 0n && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-5"
          >
            <FeeBreakdown
              selectedChain={selectedChain}
              balance={selectedBalance}
              destinationAddress={effectiveDestination}
              onQuoteChange={setQuote}
            />
          </motion.div>
        )}

        {/* Sweep Button */}
        <SweepButton
          selectedChain={selectedChain}
          destinationAddress={effectiveDestination}
          quote={quote}
          disabled={selectedChain === null || !effectiveDestination || !quote}
        />
      </motion.div>
    </div>
  );
}
