'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check, AlertCircle, Pencil } from 'lucide-react';
import { chainMeta } from '@/config/wagmi';

interface DestinationFormProps {
  chainId: number | null;
  address: string;
  onAddressChange: (address: string) => void;
}

export function DestinationForm({
  chainId,
  address,
  onAddressChange,
}: DestinationFormProps) {
  const { address: connectedAddress, isConnected } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedChain = chainId ? chainMeta[chainId] : null;
  const effectiveAddress = addressInput || address;
  const isUsingConnectedWallet = !addressInput && address === connectedAddress && isConnected;

  const handleAddressChange = (value: string) => {
    setAddressInput(value);
    if (value === '' || isAddress(value)) {
      onAddressChange(value);
    }
  };

  const useConnectedWallet = () => {
    setAddressInput('');
    onAddressChange('');
    setIsEditing(false);
  };

  const copyAddress = () => {
    if (effectiveAddress) {
      navigator.clipboard.writeText(effectiveAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isValidAddress = addressInput === '' || isAddress(addressInput);

  // Truncate address for display
  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Determine display state
  const hasCustomAddress = addressInput && isAddress(addressInput);
  const showPlaceholder = !isConnected && !hasCustomAddress && !isEditing;

  return (
    <div className="space-y-2">
      {/* Destination display/input */}
      <div className="flex items-center justify-between p-4 bg-light-elevated dark:bg-dark-elevated rounded-2xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Wallet icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUsingConnectedWallet
              ? 'bg-brand-violet/10'
              : hasCustomAddress
              ? 'bg-green-500/10'
              : 'bg-zinc-200 dark:bg-zinc-700'
          }`}>
            <Wallet className={`w-5 h-5 ${
              isUsingConnectedWallet
                ? 'text-brand-violet'
                : hasCustomAddress
                ? 'text-green-500'
                : 'text-zinc-400'
            }`} />
          </div>

          {isEditing ? (
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={addressInput}
                onChange={e => handleAddressChange(e.target.value)}
                placeholder="0x..."
                autoFocus
                className={`w-full bg-transparent font-mono text-sm outline-none ${
                  !isValidAddress ? 'text-red-500' : ''
                }`}
                onBlur={() => {
                  if (!addressInput) setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidAddress) {
                    setIsEditing(false);
                  }
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 min-w-0 text-left"
            >
              <div className="font-semibold">
                {showPlaceholder
                  ? 'Enter address'
                  : isUsingConnectedWallet
                  ? 'Your wallet'
                  : hasCustomAddress
                  ? 'Custom address'
                  : 'Your wallet'}
              </div>
              <div className="font-mono text-sm text-zinc-500 truncate">
                {showPlaceholder
                  ? 'Click to enter destination address'
                  : effectiveAddress
                  ? truncateAddress(effectiveAddress)
                  : 'Connect to use your wallet'}
              </div>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!isEditing && effectiveAddress && (
            <button
              onClick={copyAddress}
              className="p-2 rounded-lg hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
            aria-label="Edit address"
          >
            <Pencil className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {!isValidAddress && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1 px-1"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Invalid Ethereum address
        </motion.p>
      )}

      {/* Quick action: Use connected wallet */}
      {isEditing && isConnected && connectedAddress && addressInput && (
        <button
          onClick={useConnectedWallet}
          className="w-full text-sm text-brand-violet hover:text-brand-purple transition-colors flex items-center justify-center gap-1.5 py-2"
        >
          <Wallet className="w-3.5 h-3.5" />
          Use my connected wallet
        </button>
      )}

      {/* Chain indicator */}
      {selectedChain && (
        <div className="flex items-center gap-2 px-1">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${selectedChain.color}20` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedChain.color }}
            />
          </div>
          <span className="text-xs text-zinc-500">
            on {selectedChain.name}
          </span>
        </div>
      )}
    </div>
  );
}
