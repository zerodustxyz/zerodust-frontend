'use client';

import { useState } from 'react';
import { chainMeta } from '@/config/wagmi';
import { isAddress } from 'viem';

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
  const [addressInput, setAddressInput] = useState('');

  const selectedChain = chainId ? chainMeta[chainId] : null;

  const handleAddressChange = (value: string) => {
    setAddressInput(value);
    if (value === '' || isAddress(value)) {
      onAddressChange(value);
    }
  };

  const isValidAddress = addressInput === '' || isAddress(addressInput);

  return (
    <div className="space-y-4">
      {/* Address input */}
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Send funds to
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
        {selectedChain && (
          <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
            <span>on</span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedChain.color }}
            />
            <span>{selectedChain.name}</span>
            <span className="text-xs text-zinc-400">(same chain)</span>
          </div>
        )}
      </div>
    </div>
  );
}
