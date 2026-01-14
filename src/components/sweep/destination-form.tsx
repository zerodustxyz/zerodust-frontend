'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { chainMeta, supportedChains } from '@/config/wagmi';
import { isAddress } from 'viem';

interface DestinationFormProps {
  chainId: number;
  onChainChange: (chainId: number) => void;
  address: string;
  onAddressChange: (address: string) => void;
}

export function DestinationForm({
  chainId,
  onChainChange,
  address,
  onAddressChange,
}: DestinationFormProps) {
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  const selectedChain = chainMeta[chainId] || { name: 'Unknown', color: '#888' };

  // Filter to mainnet chains for destination (or show all in testnet mode)
  const destinationChains = supportedChains.filter(chain => {
    // For now, show all chains. In production, filter to mainnets
    return true;
  });

  const handleAddressChange = (value: string) => {
    setAddressInput(value);
    if (value === '' || isAddress(value)) {
      onAddressChange(value);
    }
  };

  const isValidAddress = addressInput === '' || isAddress(addressInput);

  return (
    <div className="space-y-4">
      {/* Chain selector */}
      <div className="relative">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Destination Chain
        </label>
        <button
          onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-light-elevated dark:bg-dark-elevated rounded-xl border border-light-border dark:border-dark-border hover:border-brand-purple/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedChain.color }}
            />
            <span className="font-medium">{selectedChain.name}</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-400 transition-transform ${
              isChainDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        {isChainDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 py-2 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border shadow-lg max-h-60 overflow-y-auto">
            {destinationChains.map(chain => {
              const meta = chainMeta[chain.id] || { name: chain.name, color: '#888' };
              const isSelected = chain.id === chainId;

              return (
                <button
                  key={chain.id}
                  onClick={() => {
                    onChainChange(chain.id);
                    setIsChainDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors ${
                    isSelected ? 'bg-brand-purple/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className={isSelected ? 'font-medium' : ''}>{meta.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-purple" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Address input */}
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Destination Address
          <span className="text-zinc-400 ml-1">(defaults to connected wallet)</span>
        </label>
        <input
          type="text"
          value={addressInput}
          onChange={e => handleAddressChange(e.target.value)}
          placeholder={address || '0x...'}
          className={`input-field font-mono text-sm ${
            !isValidAddress ? 'border-red-500 focus:ring-red-500/50' : ''
          }`}
        />
        {!isValidAddress && (
          <p className="mt-1 text-sm text-red-500">Invalid address format</p>
        )}
      </div>

      {/* Summary */}
      <div className="p-3 bg-light-elevated dark:bg-dark-elevated rounded-lg">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Funds will be sent to:
        </div>
        <div className="font-mono text-sm truncate mt-1">
          {address || 'Connect wallet to see address'}
        </div>
        <div className="text-sm text-zinc-500 mt-1">
          on {selectedChain.name}
        </div>
      </div>
    </div>
  );
}
