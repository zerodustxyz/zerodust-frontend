'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and tagline */}
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Sweep your dust to zero
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="https://docs.zerodust.xyz"
              target="_blank"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/zerodust"
              target="_blank"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://twitter.com/zerodust"
              target="_blank"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border text-center">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} ZeroDust. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
