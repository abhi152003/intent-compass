'use client';

import { NexusProvider } from '@avail-project/nexus-widgets';
import { useEffect, useMemo } from 'react';
import { useWalletClient } from 'wagmi';

interface NexusProviderWrapperProps {
  children: React.ReactNode;
}

function createEIP1193Provider(walletClient: any) {
  const eventListeners = new Map<string | symbol, Set<(...args: any[]) => void>>();

  const provider: any = {
    request: async ({ method, params }: { method: string; params?: unknown[] }) => {
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
    on(eventName: string | symbol, listener: (...args: any[]) => void) {
      if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, new Set());
      }
      eventListeners.get(eventName)!.add(listener);
      return this;
    },
    once(eventName: string | symbol, listener: (...args: any[]) => void) {
      const onceListener = (...args: any[]) => {
        listener(...args);
        this.removeListener(eventName, onceListener);
      };
      return this.on(eventName, onceListener);
    },
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void) {
      const listeners = eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(listener);
      }
      return this;
    },
    off(eventName: string | symbol, listener: (...args: any[]) => void) {
      return this.removeListener(eventName, listener);
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
    send: (methodOrPayload: any, paramsOrCallback: any) => {
      console.log(`[EIP-1193 Provider] Legacy send() called`, methodOrPayload);
      if (typeof methodOrPayload === 'string') {
        return provider.request({ method: methodOrPayload, params: paramsOrCallback });
      }
      return provider.request(methodOrPayload);
    },
    sendAsync: (payload: any, callback: any) => {
      console.log(`[EIP-1193 Provider] Legacy sendAsync() called`, payload);
      provider.request(payload)
        .then((result: any) => callback(null, { result }))
        .catch((error: any) => callback(error));
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
      return createEIP1193Provider(walletClient);
    }
    console.log('[NexusProviderWrapper] No wallet client available yet');
    return null;
  }, [walletClient]);

  useEffect(() => {
    if (eip1193Provider && typeof window !== 'undefined') {
      (window as any).ethereum = eip1193Provider;
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
