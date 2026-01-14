'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-border dark:border-dark-border bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold gradient-text">ZeroDust</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isConnected && (
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus="avatar"
            />
          )}
        </div>
      </div>
    </header>
  );
}
