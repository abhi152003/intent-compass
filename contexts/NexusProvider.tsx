'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { getNexusService } from '@/lib/services/nexusSDK';
import type { NexusService } from '@/lib/services/nexusSDK';

interface NexusContextType {
  nexusService: NexusService | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeIfNeeded: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType>({
  nexusService: null,
  isInitialized: false,
  isInitializing: false,
  error: null,
  initializeIfNeeded: async () => {},
});

const NEXUS_SESSION_KEY = 'nexus_session';

interface NexusSession {
  address: string;
  timestamp: number;
  initialized: boolean;
}

interface WalletClient {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  account?: { address: string };
  chain?: { id: number };
}

type EventListener = (...args: unknown[]) => void;

interface Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (eventName: string | symbol, listener: EventListener) => Provider;
  removeListener: (eventName: string | symbol, listener: EventListener) => Provider;
  account?: { address: string };
  chain?: { id: number };
}

function createProvider(walletClient: WalletClient): Provider {
  const eventListeners = new Map<string | symbol, Set<EventListener>>();

  const provider: Provider = {
    request: async ({ method, params }: { method: string; params?: unknown[] }) => {
      return await walletClient.request({
        method: method as never,
        params: params as never
      });
    },
    on(eventName: string | symbol, listener: EventListener) {
      if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, new Set());
      }
      eventListeners.get(eventName)!.add(listener);
      return provider;
    },
    removeListener(eventName: string | symbol, listener: EventListener) {
      const listeners = eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(listener);
      }
      return provider;
    },
    get account() {
      return walletClient.account;
    },
    get chain() {
      return walletClient.chain;
    },
  };

  return provider;
}

export function NexusProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [nexusService] = useState(() => getNexusService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializationAttempted = useRef<string | null>(null);

  const initializeIfNeeded = useCallback(async () => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (isInitialized) {
      console.log('[NexusProvider] SDK already initialized');
      return;
    }

    if (isInitializing) {
      console.log('[NexusProvider] SDK initialization already in progress, waiting...');
      return new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!isInitializing) {
            clearInterval(checkInterval);
            if (isInitialized) {
              resolve();
            } else {
              reject(new Error('Initialization failed'));
            }
          }
        }, 100);
      });
    }

    setIsInitializing(true);
    setError(null);

    try {
      console.log('[NexusProvider] 🔄 Initializing Nexus SDK (will request signature)...');

      const provider = createProvider(walletClient as WalletClient);
      await nexusService.initialize(provider);

      const session: NexusSession = {
        address,
        timestamp: Date.now(),
        initialized: true,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(NEXUS_SESSION_KEY, JSON.stringify(session));
      }

      setIsInitialized(true);
      initializationAttempted.current = address;

      console.log('[NexusProvider] ✅ Nexus SDK ready');
    } catch (err) {
      console.error('[NexusProvider] Failed to initialize Nexus SDK:', err);

      const errorMessage = err instanceof Error ? err.message : String(err);
      const isUserRejection = errorMessage.toLowerCase().includes('user rejected') ||
                             errorMessage.toLowerCase().includes('user denied') ||
                             errorMessage.toLowerCase().includes('user cancelled') ||
                             errorMessage.toLowerCase().includes('user disapproved');

      if (isUserRejection) {
        setError('Signature request cancelled.');
        console.log('[NexusProvider] User cancelled signature request');
      } else {
        setError(errorMessage);
      }

      setIsInitialized(false);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [walletClient, address, nexusService, isInitialized, isInitializing]);

  useEffect(() => {
    if (!walletClient || !address) {
      setIsInitialized(false);
      setError(null);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const storedSession = localStorage.getItem(NEXUS_SESSION_KEY);
    if (storedSession) {
      try {
        const session: NexusSession = JSON.parse(storedSession);

        if (session.address === address && session.initialized) {
          const sessionAge = Date.now() - session.timestamp;
          const FIVE_MINUTES = 5 * 60 * 1000;

          if (sessionAge < FIVE_MINUTES) {
            console.log(`[NexusProvider] ✅ Found very recent session (${Math.round(sessionAge / 1000)}s old)`);
            setIsInitialized(true);
            initializationAttempted.current = address;
            return;
          } else {
            console.log(`[NexusProvider] Session found but stale (${Math.round(sessionAge / 1000 / 60)}min old) - will re-initialize when needed`);
            localStorage.removeItem(NEXUS_SESSION_KEY);
          }
        }
      } catch {
        localStorage.removeItem(NEXUS_SESSION_KEY);
      }
    }

    console.log('[NexusProvider] No recent session - SDK will initialize when first used');
  }, [walletClient, address]);

  useEffect(() => {
    if (!address && typeof window !== 'undefined') {
      localStorage.removeItem(NEXUS_SESSION_KEY);
      initializationAttempted.current = null;
      setIsInitialized(false);
      setError(null);
    }
  }, [address]);

  return (
    <NexusContext.Provider value={{ nexusService, isInitialized, isInitializing, error, initializeIfNeeded }}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within NexusProvider');
  }
  return context;
}
