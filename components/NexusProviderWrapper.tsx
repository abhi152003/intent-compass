'use client';

import { NexusProvider } from '@avail-project/nexus-widgets';
import { useEffect, useMemo } from 'react';
import { useWalletClient } from 'wagmi';

interface NexusProviderWrapperProps {
  children: React.ReactNode;
}

type EIP1193RequestParams = { method: string; params?: unknown[] };
type EventListener = (...args: unknown[]) => void;

interface WalletClient {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  account?: { address: string };
  chain?: { id: number };
}

interface EIP1193Provider {
  request: (args: EIP1193RequestParams) => Promise<unknown>;
  on: (eventName: string | symbol, listener: EventListener) => EIP1193Provider;
  once: (eventName: string | symbol, listener: EventListener) => EIP1193Provider;
  removeListener: (eventName: string | symbol, listener: EventListener) => EIP1193Provider;
  off: (eventName: string | symbol, listener: EventListener) => EIP1193Provider;
  isMetaMask: boolean;
  isConnected: () => boolean;
  selectedAddress?: string;
  chainId?: string;
  account?: { address: string };
  chain?: { id: number };
  enable: () => Promise<unknown>;
  send: (methodOrPayload: string | EIP1193RequestParams, paramsOrCallback?: unknown) => Promise<unknown>;
  sendAsync: (payload: EIP1193RequestParams, callback: (error: Error | null, result?: { result: unknown }) => void) => void;
}

function createEIP1193Provider(walletClient: WalletClient): EIP1193Provider {
  const eventListeners = new Map<string | symbol, Set<EventListener>>();

  const provider: EIP1193Provider = {
    request: async ({ method, params }: EIP1193RequestParams) => {
      console.log(`[EIP-1193 Provider] Request: ${method}`, params);
      try {
        const result = await walletClient.request({
          method: method as never,
          params: params as never
        });
        console.log(`[EIP-1193 Provider] Response:`, result);
        return result;
      } catch (error) {
        console.error(`[EIP-1193 Provider] Error:`, error);
        throw error;
      }
    },
    on(eventName: string | symbol, listener: EventListener) {
      if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, new Set());
      }
      eventListeners.get(eventName)!.add(listener);
      return provider;
    },
    once(eventName: string | symbol, listener: EventListener) {
      const onceListener: EventListener = (...args: unknown[]) => {
        listener(...args);
        provider.removeListener(eventName, onceListener);
      };
      return provider.on(eventName, onceListener);
    },
    removeListener(eventName: string | symbol, listener: EventListener) {
      const listeners = eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(listener);
      }
      return provider;
    },
    off(eventName: string | symbol, listener: EventListener) {
      return provider.removeListener(eventName, listener);
    },
    isMetaMask: true,
    isConnected: () => {
      const connected = !!walletClient && !!walletClient.account;
      console.log(`[EIP-1193 Provider] isConnected: ${connected}`);
      return connected;
    },
    get selectedAddress() {
      const address = walletClient.account?.address;
      console.log(`[EIP-1193 Provider] selectedAddress: ${address}`);
      return address;
    },
    get chainId() {
      const chainId = walletClient.chain?.id;
      const hexChainId = chainId ? `0x${chainId.toString(16)}` : undefined;
      console.log(`[EIP-1193 Provider] chainId: ${hexChainId} (${chainId})`);
      return hexChainId;
    },
    get account() {
      return walletClient.account;
    },
    get chain() {
      return walletClient.chain;
    },
    enable: async () => {
      console.log(`[EIP-1193 Provider] enable() called`);
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      return accounts;
    },
    send: (methodOrPayload: string | EIP1193RequestParams, paramsOrCallback?: unknown) => {
      console.log(`[EIP-1193 Provider] Legacy send() called`, methodOrPayload);
      if (typeof methodOrPayload === 'string') {
        return provider.request({ method: methodOrPayload, params: paramsOrCallback as unknown[] });
      }
      return provider.request(methodOrPayload);
    },
    sendAsync: (payload: EIP1193RequestParams, callback: (error: Error | null, result?: { result: unknown }) => void) => {
      console.log(`[EIP-1193 Provider] Legacy sendAsync() called`, payload);
      provider.request(payload)
        .then((result: unknown) => callback(null, { result }))
        .catch((error: Error) => callback(error));
    },
  };

  return provider;
}

export function NexusProviderWrapper({ children }: NexusProviderWrapperProps) {
  const { data: walletClient } = useWalletClient();
  const eip1193Provider = useMemo(() => {
    if (walletClient && typeof window !== 'undefined') {
      console.log('[NexusProviderWrapper] Creating EIP-1193 provider with wallet client:', {
        account: walletClient.account?.address,
        chainId: walletClient.chain?.id,
      });
      return createEIP1193Provider(walletClient as WalletClient);
    }
    console.log('[NexusProviderWrapper] No wallet client available yet');
    return null;
  }, [walletClient]);

  useEffect(() => {
    if (eip1193Provider && typeof window !== 'undefined') {
      (window as typeof window & { ethereum: EIP1193Provider }).ethereum = eip1193Provider;
      console.log('✅ [NexusProviderWrapper] EIP-1193 wallet provider injected at window.ethereum');
      console.log('   - Provider properties:', {
        isConnected: eip1193Provider.isConnected(),
        selectedAddress: eip1193Provider.selectedAddress,
        chainId: eip1193Provider.chainId,
      });
    } else if (!eip1193Provider) {
      console.log('⚠️ [NexusProviderWrapper] No provider to inject - wallet not connected');
    }
  }, [eip1193Provider]);

  return (
    <NexusProvider config={{ network: 'testnet' }}>
      {children}
    </NexusProvider>
  );
}
