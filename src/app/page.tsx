'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import {
  Wallet,
  MousePointerClick,
  Send,
  CheckCircle2,
  ArrowDown,
  AlertTriangle,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Coins,
  ArrowRightLeft,
  Lock,
  Gauge,
  ArrowUpRight,
} from 'lucide-react';
import { BalanceList, NetworkMode } from '@/components/sweep/balance-list';
import { DestinationForm } from '@/components/sweep/destination-form';
import { SweepButton } from '@/components/sweep/sweep-button';
import { FeeBreakdown, FeeWarningType } from '@/components/sweep/fee-breakdown';
import { QuoteV3Response } from '@/services/api';
import { chainMeta, testnetChainIds, mainnetChainIds } from '@/config/wagmi';
import { priceService } from '@/services/prices';
import { ChainIcon } from '@/components/ui/chain-icon';

const steps = [
  {
    icon: Wallet,
    title: 'Connect',
    description: 'Connect your wallet to scan balances across all supported chains.',
  },
  {
    icon: MousePointerClick,
    title: 'Select',
    description: 'Choose the chain with leftover funds you want to sweep.',
  },
  {
    icon: Send,
    title: 'Destination',
    description: 'Pick where you want your funds to go (defaults to your wallet).',
  },
  {
    icon: CheckCircle2,
    title: 'Sweep',
    description: 'Sign and sweep. Your balance goes to exactly zero.',
  },
];

const trustIndicators = [
  { icon: Shield, label: 'Non-custodial', description: 'Your keys, your crypto' },
  { icon: Zap, label: 'Instant', description: 'One-click sweeps' },
  { icon: Clock, label: 'No deposits', description: 'Direct transfers' },
];

const features = [
  {
    icon: Coins,
    title: 'Recover Every Wei',
    description: 'Traditional transfers leave dust behind. ZeroDust sweeps your entire balance down to the last wei.',
  },
  {
    icon: ArrowRightLeft,
    title: 'EIP-7702 Powered',
    description: 'Using the latest Ethereum standard, we execute transfers directly from your wallet with maximum efficiency.',
  },
  {
    icon: Lock,
    title: 'Fully Non-Custodial',
    description: 'Your funds never touch our servers. Sign once and the sweep executes directly on-chain.',
  },
  {
    icon: Gauge,
    title: 'Gas Optimized',
    description: 'Our smart routing ensures you pay the lowest possible fees while sweeping your dust.',
  },
];

// Get chains to display based on network mode
const getDisplayChains = (mode: NetworkMode) => {
  const chainIds = mode === 'mainnet' ? mainnetChainIds : testnetChainIds;
  return chainIds.map(id => ({
    chainId: id,
    ...chainMeta[id]
  }));
};

export default function Home() {
  const { isConnected, address } = useAccount();
  const [networkMode, setNetworkMode] = useState<NetworkMode>('testnet');
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<bigint>(0n);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [quote, setQuote] = useState<QuoteV3Response | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [feeWarning, setFeeWarning] = useState<FeeWarningType>('none');
  const [confirmedHighFee, setConfirmedHighFee] = useState(false);

  const displayChains = getDisplayChains(networkMode);

  const effectiveDestination = destinationAddress || address || '';
  const selectedChainInfo = selectedChain ? chainMeta[selectedChain] : null;
  const tokenSymbol = selectedChainInfo?.symbol || 'ETH';

  // Fetch token price when chain changes
  useEffect(() => {
    if (!selectedChain) {
      setTokenPrice(0);
      return;
    }

    const fetchPrice = async () => {
      try {
        const priceData = await priceService.getPrice(tokenSymbol);
        if (priceData?.priceUsd && !isNaN(priceData.priceUsd)) {
          setTokenPrice(priceData.priceUsd);
        }
      } catch (err) {
        console.error('Failed to fetch token price:', err);
      }
    };
    fetchPrice();
  }, [selectedChain, tokenSymbol]);

  // Use manual amount if entered, otherwise use actual balance
  const effectiveBalance = (() => {
    if (!manualAmount) return selectedBalance;
    const parsed = parseFloat(manualAmount);
    if (isNaN(parsed) || parsed <= 0) return 0n;
    return BigInt(Math.floor(parsed * 1e18));
  })();

  const handleChainSelect = useCallback((chainId: number | null, balance?: bigint) => {
    setSelectedChain(chainId);
    setSelectedBalance(balance || 0n);
    // When connected and chain selected, auto-fill with balance
    if (balance && balance > 0n) {
      setManualAmount('');
    }
    setQuote(null);
  }, []);

  const handleAmountChange = (value: string) => {
    // Only allow valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setManualAmount(value);
      setQuote(null);
      setConfirmedHighFee(false); // Reset confirmation when amount changes
    }
  };

  const handleMaxClick = () => {
    if (selectedBalance > 0n) {
      const formattedBalance = (Number(selectedBalance) / 1e18).toString();
      setManualAmount(formattedBalance);
    }
  };

  // Determine if we can proceed with sweep
  const canSweep = isConnected && selectedChain !== null && effectiveDestination && quote;

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="animated-bg-gradient">
        <div className="animated-orb animated-orb-1" />
        <div className="animated-orb animated-orb-2" />
        <div className="animated-orb animated-orb-3" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      {/* Network Banner */}
      <div className={`relative border-b py-2.5 px-4 ${
        networkMode === 'mainnet'
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 border-amber-500/20'
          : 'bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-brand-primary/10 border-brand-primary/20'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <Sparkles className={`w-4 h-4 ${networkMode === 'mainnet' ? 'text-amber-500' : 'text-brand-primary'}`} />
          <p className={`text-sm font-medium ${networkMode === 'mainnet' ? 'text-amber-500' : 'text-brand-primary'}`}>
            {networkMode === 'mainnet'
              ? 'Not live on mainnet yet. Coming soon!'
              : 'Currently live on testnets only. Same-chain sweeps supported.'}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-2 md:py-4 lg:py-6">
        <div className="container mx-auto px-4">
          {/* Animated sweep effect - dust particles (hidden on mobile for cleaner look) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
            {/* Floating dust particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`dust-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${15 + (i % 4) * 18}%`,
                  width: `${3 + (i % 3) * 2}px`,
                  height: `${3 + (i % 3) * 2}px`,
                  background: i % 2 === 0
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(20, 184, 166, 0.3)',
                }}
                animate={{
                  y: [0, -40, 0],
                  x: [0, (i % 2 === 0 ? 20 : -20), 0],
                  opacity: [0.2, 0.7, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 4 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Sweep line animation */}
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent"
              style={{ top: '60%' }}
              animate={{
                opacity: [0, 0.5, 0],
                scaleX: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Hero headline - compact on both mobile and desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-2 md:mb-3"
          >
            {/* Mobile: Simple tagline */}
            <h1 className="md:hidden text-2xl font-bold tracking-tight mb-1">
              Sweep Your <span className="gradient-text">Dust</span> to Zero
            </h1>
            <p className="md:hidden text-sm text-zinc-500 dark:text-zinc-400 mb-0">
              Exit any chain with exactly 0 balance.
            </p>

            {/* Desktop: Compact hero */}
            <motion.h1
              className="hidden md:block text-3xl lg:text-4xl font-extrabold tracking-tighter mb-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Sweep Your{' '}
              <span className="gradient-text-animated">Dust</span>
              {' '}to Zero
            </motion.h1>
            <motion.p
              className="hidden md:block text-sm lg:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Exit any chain with exactly 0 balance. No leftover dust, no wasted value.
            </motion.p>
          </motion.div>

          {/* Trust indicators - hidden on mobile, compact on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden md:flex flex-wrap justify-center gap-3 mb-4"
          >
            {trustIndicators.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <div className="w-6 h-6 rounded-md bg-brand-primary/10 flex items-center justify-center">
                  <item.icon className="w-3 h-3 text-brand-primary" />
                </div>
                <span className="font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="max-w-[440px] mx-auto"
          >
            {/* Sweep Card - Premium glassmorphism with gradient border */}
            <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-brand-primary/50 via-brand-secondary/30 to-brand-primary/50">
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/10 to-brand-primary/20 rounded-3xl blur-xl opacity-70" />
              <div className="sweep-card sweep-card-enter relative">
              {/* Header */}
              <div className="p-5 pb-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Sweep</h2>
                  {/* Network Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <button
                      onClick={() => setNetworkMode('mainnet')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        networkMode === 'mainnet'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Mainnet
                    </button>
                    <button
                      onClick={() => setNetworkMode('testnet')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        networkMode === 'testnet'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Testnet
                    </button>
                  </div>
                </div>
              </div>

              {/* From section - Always interactive */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">From</span>
                  {isConnected && selectedBalance > 0n && (
                    <button
                      onClick={handleMaxClick}
                      className="text-xs text-brand-primary hover:text-brand-dark font-semibold transition-colors"
                    >
                      MAX
                    </button>
                  )}
                </div>
                <BalanceList
                  selectedChain={selectedChain}
                  onSelectionChange={handleChainSelect}
                  onBalanceChange={setSelectedBalance}
                  networkMode={networkMode}
                />
                {/* Amount input */}
                {selectedChain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/30">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={manualAmount || (isConnected && selectedBalance > 0n ? (Number(selectedBalance) / 1e18).toFixed(6) : '')}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-transparent text-3xl font-bold outline-none placeholder-zinc-400"
                        />
                        <span className="text-zinc-500 font-semibold ml-3 text-lg">{tokenSymbol}</span>
                      </div>
                      {/* USD value display */}
                      {effectiveBalance > 0n && tokenPrice > 0 && (
                        <p className="text-sm text-zinc-500 mt-2">
                          ≈ ${(Number(effectiveBalance) / 1e18 * tokenPrice).toFixed(2)}
                        </p>
                      )}
                      {!isConnected && effectiveBalance === 0n && (
                        <p className="text-xs text-zinc-500 mt-2">
                          Enter amount to see estimated fees
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Arrow divider with animation */}
              <div className="relative h-0 z-10">
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-4 border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-lg">
                    <ArrowDown className="w-5 h-5 text-brand-primary" />
                  </div>
                </motion.div>
              </div>

              {/* To section - Always interactive */}
              <div className="p-5 pt-3 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-b-3xl">
                <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">To</div>
                <DestinationForm
                  chainId={selectedChain}
                  address={effectiveDestination}
                  onAddressChange={setDestinationAddress}
                />
              </div>

              {/* Fee Breakdown - show when chain selected and amount entered */}
              {/* In preview mode, show even without destination (uses placeholder) */}
              {selectedChain !== null && effectiveBalance > 0n && (isConnected ? effectiveDestination : true) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 py-4 border-t border-zinc-200/50 dark:border-zinc-800/50"
                >
                  <FeeBreakdown
                    selectedChain={selectedChain}
                    balance={effectiveBalance}
                    destinationAddress={effectiveDestination || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'}
                    onQuoteChange={setQuote}
                    onWarningChange={setFeeWarning}
                    isPreview={!isConnected}
                  />
                </motion.div>
              )}

              {/* Action Button */}
              <div className="p-5 pt-3">
                {isConnected ? (
                  // Block sweep if amount too low
                  feeWarning === 'amount_too_low' ? (
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-zinc-400 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      Amount Too Low
                    </button>
                  ) : feeWarning === 'high_fee' && !confirmedHighFee ? (
                    // Show confirmation for high fee
                    <motion.button
                      onClick={() => setConfirmedHighFee(true)}
                      className="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <AlertTriangle className="w-5 h-5" />
                      I understand, proceed anyway
                    </motion.button>
                  ) : (
                    <SweepButton
                      selectedChain={selectedChain}
                      destinationAddress={effectiveDestination}
                      quote={quote}
                      disabled={!canSweep}
                    />
                  )
                ) : (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <motion.button
                        onClick={openConnectModal}
                        className="btn-glow w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Wallet className="w-5 h-5" />
                        Connect Wallet
                      </motion.button>
                    )}
                  </ConnectButton.Custom>
                )}
              </div>
              </div>
            </div>

            {/* Tagline below card - desktop only */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block text-center text-sm text-zinc-500 mt-6"
            >
              Transfer 100% of your native gas token. Zero dust left behind.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-12 md:py-16 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              ZeroDust uses EIP-7702 to execute transfers from your wallet,
              allowing you to move your entire balance with zero leftover.
            </p>
          </motion.div>

          {/* Steps timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line - desktop only with animated gradient */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/30 to-brand-primary/20" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"
                style={{ opacity: 0.4 }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Mobile: vertical line */}
            <div className="lg:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Step card - horizontal layout on mobile */}
                  <div className="step-card p-4 md:p-6 lg:text-center flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0 h-full ml-8 lg:ml-0">
                    {/* Step number badge */}
                    <div className="relative flex-shrink-0 lg:mb-4">
                      <div className="step-number w-10 h-10 lg:w-12 lg:h-12 lg:mx-auto">
                        <step.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-white dark:bg-zinc-900 border-2 border-brand-primary text-xs font-bold flex items-center justify-center shadow-md text-brand-primary">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 lg:text-center">
                      <h3 className="text-base lg:text-lg font-bold mb-1 lg:mb-2">{step.title}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why ZeroDust Section */}
      <section className="relative py-12 md:py-16 border-t border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.02] to-transparent pointer-events-none" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="badge-primary mb-3 inline-flex">Why ZeroDust</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              The <span className="gradient-text">Cleanest</span> Way to Exit
            </h2>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Stop leaving money behind. Sweep every last wei from chains you no longer use.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="feature-card p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="feature-card-icon">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-brand-primary transition-colors">{feature.title}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Chains Section */}
      <section id="chains" className="relative py-12 md:py-16 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-10"
          >
            <span className="badge-primary mb-3 inline-flex">
              {networkMode === 'mainnet' ? 'Mainnets' : 'Testnets'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              <span className="gradient-text">{displayChains.length} Chains</span> Supported
            </h2>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {networkMode === 'mainnet'
                ? 'Live on mainnet. Same-chain sweeps supported.'
                : 'Currently live on testnets. Mainnet support coming soon.'}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {displayChains.map((chain, index) => (
              <motion.div
                key={chain.chainId}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card px-4 py-3 md:px-5 md:py-4 flex items-center gap-3 md:gap-4 cursor-default group"
              >
                <div className="relative">
                  <ChainIcon chainId={chain.chainId} size={36} className="md:w-10 md:h-10" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand-primary/20"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.5, opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div>
                  <span className="font-semibold block text-sm md:text-base group-hover:text-brand-primary transition-colors">{chain.name}</span>
                  <span className="text-xs text-zinc-500">{chain.symbol}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 md:py-20 border-t border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Decorative sweep icon with animation */}
            <div className="relative inline-block mb-6">
              <motion.div
                className="w-4 h-4 bg-brand-primary/40 rounded-full absolute -left-8 top-0"
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="w-3 h-3 bg-brand-secondary/40 rounded-full absolute -right-6 top-2"
                animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="w-2 h-2 bg-brand-light/50 rounded-full absolute -left-4 bottom-0"
                animate={{ y: [0, -6, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-12 h-12 text-brand-primary mx-auto" />
              </motion.div>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to <span className="gradient-text">Clean House</span>?
            </h2>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Connect your wallet and start sweeping your dust to zero. It only takes a few seconds.
            </p>

            {!isConnected && (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <motion.button
                    onClick={openConnectModal}
                    className="btn-glow text-lg group"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Wallet className="w-5 h-5" />
                    Start Sweeping
                    <ArrowUpRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </motion.button>
                )}
              </ConnectButton.Custom>
            )}

            {isConnected && (
              <motion.button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-glow text-lg group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowDown className="w-5 h-5 rotate-180" />
                Go to Sweep
                <ArrowUpRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </motion.button>
            )}

            <p className="text-sm text-zinc-500 mt-6">
              Non-custodial. Gas optimized. Zero dust left behind.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
