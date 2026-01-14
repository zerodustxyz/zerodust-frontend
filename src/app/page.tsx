'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ArrowRight, Wallet, MousePointerClick, Send, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const stats = [
  { label: 'Total Swept', value: '$2.5M+' },
  { label: 'Chains Supported', value: '15+' },
  { label: 'Sweeps Completed', value: '10K+' },
];

const steps = [
  {
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Connect your wallet to see dust balances across all chains.',
  },
  {
    icon: MousePointerClick,
    title: 'Select Chains',
    description: 'Choose which chains have dust you want to sweep.',
  },
  {
    icon: Send,
    title: 'Pick Destination',
    description: 'Select where to send your consolidated funds.',
  },
  {
    icon: CheckCircle2,
    title: 'Sign & Sweep',
    description: 'One signature sweeps everything. Balance goes to exactly zero.',
  },
];

const chains = [
  { name: 'Ethereum', color: '#627EEA' },
  { name: 'Base', color: '#0052FF' },
  { name: 'Optimism', color: '#FF0420' },
  { name: 'Arbitrum', color: '#12AAFF' },
  { name: 'Polygon', color: '#8247E5' },
  { name: 'BNB Chain', color: '#F0B90B' },
  { name: 'Gnosis', color: '#04795B' },
  { name: 'Unichain', color: '#FF007A' },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <Logo className="h-16 w-16" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sweep your dust{' '}
              <span className="gradient-text">to zero</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Exit any blockchain with exactly 0 balance. Consolidate leftover ETH from unused chains to your main wallet in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Link href="/app" className="btn-primary flex items-center gap-2">
                  Launch App
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button onClick={openConnectModal} className="btn-primary flex items-center gap-2">
                      Connect Wallet
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
              <Link href="#how-it-works" className="btn-secondary">
                How it works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-light-border dark:border-dark-border bg-light-elevated/50 dark:bg-dark-elevated/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              ZeroDust uses EIP-7702 sponsored transactions to sweep your entire balance without needing gas on the source chain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-brand-purple font-medium mb-2">
                  Step {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Chains Section */}
      <section className="py-20 border-t border-light-border dark:border-dark-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supported Chains
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sweep dust from any EIP-7702 compatible chain
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {chains.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-card px-4 py-2 flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chain.color }}
                />
                <span className="text-sm font-medium">{chain.name}</span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: chains.length * 0.05 }}
              className="glass-card px-4 py-2"
            >
              <span className="text-sm text-zinc-500">+ more coming</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to clean up your wallets?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Start sweeping your dust today. No signup required.
            </p>
            {isConnected ? (
              <Link href="/app" className="btn-primary inline-flex items-center gap-2">
                Launch App
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal} className="btn-primary inline-flex items-center gap-2">
                    Connect Wallet
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </ConnectButton.Custom>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
