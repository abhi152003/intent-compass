'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Compass className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">IntentCompass</h1>
              <p className="text-sm text-gray-400">Visual Cross-Chain Intent Composer</p>
            </div>
          </div>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
