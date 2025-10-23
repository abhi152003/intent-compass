'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border-light bg-bg-primary/95 backdrop-blur-md sticky top-0 z-40 transition-all duration-base">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange/80 shadow-md">
              <Compass className="w-6 h-6 text-bg-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-text-primary">
                IntentCompass
              </h1>
              <p className="text-xs md:text-sm text-text-secondary font-body">
                Visual Cross-Chain Intent Composer
              </p>
            </div>
          </div>

          {/* Connect Button */}
          <div className="flex-shrink-0">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
