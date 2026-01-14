'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BalanceList } from '@/components/sweep/balance-list';
import { DestinationForm } from '@/components/sweep/destination-form';
import { SweepButton } from '@/components/sweep/sweep-button';
import { FeeBreakdown } from '@/components/sweep/fee-breakdown';

export default function AppPage() {
  const { isConnected, address } = useAccount();
  const [selectedChains, setSelectedChains] = useState<number[]>([]);
  const [destinationChainId, setDestinationChainId] = useState<number>(8453); // Default to Base
  const [destinationAddress, setDestinationAddress] = useState<string>('');

  // Use connected address as default destination
  const effectiveDestination = destinationAddress || address || '';

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
            Connect your wallet to view balances and start sweeping dust.
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
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Sweep Your Dust
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select chains to sweep and choose your destination
          </p>
        </div>

        {/* Balance List */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Your Balances</h2>
          <BalanceList
            selectedChains={selectedChains}
            onSelectionChange={setSelectedChains}
          />
        </div>

        {/* Destination */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Destination</h2>
          <DestinationForm
            chainId={destinationChainId}
            onChainChange={setDestinationChainId}
            address={effectiveDestination}
            onAddressChange={setDestinationAddress}
          />
        </div>

        {/* Fee Breakdown */}
        {selectedChains.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-6"
          >
            <FeeBreakdown
              selectedChains={selectedChains}
              destinationChainId={destinationChainId}
            />
          </motion.div>
        )}

        {/* Sweep Button */}
        <SweepButton
          selectedChains={selectedChains}
          destinationChainId={destinationChainId}
          destinationAddress={effectiveDestination}
          disabled={selectedChains.length === 0 || !effectiveDestination}
        />
      </motion.div>
    </div>
  );
}
