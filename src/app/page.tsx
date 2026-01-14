'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ArrowRight, Wallet, MousePointerClick, Send, CheckCircle2 } from 'lucide-react';
import { BalanceList } from '@/components/sweep/balance-list';
import { DestinationForm } from '@/components/sweep/destination-form';
import { SweepButton } from '@/components/sweep/sweep-button';
import { FeeBreakdown } from '@/components/sweep/fee-breakdown';

const steps = [
  {
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Connect your wallet to see your balances across supported chains.',
  },
  {
    icon: MousePointerClick,
    title: 'Select Chain',
    description: 'Choose which chain has funds you want to sweep.',
  },
  {
    icon: Send,
    title: 'Pick Destination',
    description: 'Select the address where you want to receive your funds.',
  },
  {
    icon: CheckCircle2,
    title: 'Sign & Sweep',
    description: 'One signature sweeps everything. Balance goes to exactly zero.',
  },
];

const testnetChains = [
  { name: 'Sepolia', color: '#627EEA' },
  { name: 'Base Sepolia', color: '#0052FF' },
  { name: 'Optimism Sepolia', color: '#FF0420' },
  { name: 'Arbitrum Sepolia', color: '#12AAFF' },
  { name: 'Polygon Amoy', color: '#8247E5' },
  { name: 'BSC Testnet', color: '#F0B90B' },
];

export default function Home() {
  const { isConnected, address } = useAccount();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>('');

  const effectiveDestination = destinationAddress || address || '';

  return (
    <div className="relative">
      {/* Testnet Banner */}
      <div className="bg-brand-purple/10 border-b border-brand-purple/20 py-2 px-4 text-center">
        <p className="text-sm text-brand-purple font-medium">
          Currently live on testnets only. Same-chain sweeps supported.
        </p>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Sweep your leftover balance{' '}
              <span className="gradient-text">to zero</span>
            </h1>

            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
              Exit a blockchain without leaving any gas token behind. Transfer 100% of your native gas token from chains you no longer use in one click.
            </p>

            {!isConnected && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button onClick={openConnectModal} className="btn-primary flex items-center gap-2">
                      Connect Wallet
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </ConnectButton.Custom>
                <a href="#how-it-works" className="btn-secondary">
                  How it works
                </a>
              </div>
            )}
          </motion.div>

          {/* Sweep Interface - shown when connected */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto mt-8 space-y-4"
            >
              {/* Balance List */}
              <div className="glass-card p-5">
                <h2 className="text-base font-semibold mb-3">Select Chain</h2>
                <BalanceList
                  selectedChain={selectedChain}
                  onSelectionChange={setSelectedChain}
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
              {selectedChain !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="glass-card p-5"
                >
                  <FeeBreakdown selectedChain={selectedChain} />
                </motion.div>
              )}

              {/* Sweep Button */}
              <SweepButton
                selectedChain={selectedChain}
                destinationAddress={effectiveDestination}
                disabled={selectedChain === null || !effectiveDestination}
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 border-t border-light-border dark:border-dark-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto text-sm md:text-base">
              Sweeping works on any chain with EIP-7702 support. ZeroDust sponsors the gas on the source chain so you can transfer 100% of your balance. A fee is charged for the service, which covers the actual gas cost plus a buffer to ensure transactions succeed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-5 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs text-brand-purple font-medium mb-1">
                  Step {index + 1}
                </div>
                <h3 className="text-base font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Chains Section */}
      <section className="py-16 border-t border-light-border dark:border-dark-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              6 Testnet Chains Supported
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Currently live on testnets. Mainnet coming soon.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {testnetChains.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-card px-3 py-2 flex items-center gap-2"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: chain.color }}
                />
                <span className="text-sm font-medium">{chain.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - only show when not connected */}
      {!isConnected && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 md:p-10 text-center max-w-xl mx-auto"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-3">
                Ready to clean up your wallets?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-5 text-sm">
                Start sweeping your dust today. No signup required.
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal} className="btn-primary inline-flex items-center gap-2">
                    Connect Wallet
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </ConnectButton.Custom>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
