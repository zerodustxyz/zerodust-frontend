'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Sparkles } from 'lucide-react';
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
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);

  const effectiveDestination = destinationAddress || address || '';

  const handleChainSelect = useCallback((chainId: number | null) => {
    setSelectedChain(chainId);
    setQuote(null);
  }, []);

  const handleSweepComplete = useCallback(() => {
    // Reset all state to allow a fresh sweep
    setSelectedChain(null);
    setSelectedBalance(0n);
    setQuote(null);
  }, []);

  const handleSweepSuccess = useCallback(() => {
    // Trigger balance list refresh to show updated (zero) balance
    setBalanceRefreshKey(prev => prev + 1);
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        {/* Background effects */}
        <div className="fixed inset-0 bg-mesh-gradient-light dark:bg-mesh-gradient opacity-50 dark:opacity-100 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative card-elevated p-8 md:p-12 text-center max-w-md w-full"
        >
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-brand-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-3">Connect Your Wallet</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Connect your wallet to view balances across chains and start sweeping.
          </p>

          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="btn-primary-lg w-full"
              >
                <Sparkles className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh]">
      {/* Background effects */}
      <div className="fixed inset-0 bg-mesh-gradient-light dark:bg-mesh-gradient opacity-50 dark:opacity-100 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Sweep Your Balance
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Select a chain and sweep to zero
            </p>
          </div>

          {/* Sweep interface */}
          <div className="space-y-4">
            {/* Balance List */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                  1
                </span>
                Select Chain
              </h2>
              <BalanceList
                selectedChain={selectedChain}
                onSelectionChange={handleChainSelect}
                onBalanceChange={setSelectedBalance}
                refreshKey={balanceRefreshKey}
              />
            </div>

            {/* Destination */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                  2
                </span>
                Destination
              </h2>
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
                className="card-elevated p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                    3
                  </span>
                  Review
                </h2>
                <FeeBreakdown
                  selectedChain={selectedChain}
                  balance={selectedBalance}
                  destinationAddress={effectiveDestination}
                  onQuoteChange={setQuote}
                />
              </motion.div>
            )}

            {/* Sweep Button */}
            <div className="pt-2">
              <SweepButton
                selectedChain={selectedChain}
                destinationAddress={effectiveDestination}
                quote={quote}
                disabled={selectedChain === null || !effectiveDestination || !quote}
                onSweepComplete={handleSweepComplete}
                onSweepSuccess={handleSweepSuccess}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
