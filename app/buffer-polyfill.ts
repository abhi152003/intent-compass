'use client';

import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as typeof window & { Buffer: typeof Buffer }).Buffer = Buffer;
  (global as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
}

// Polyfill localStorage for SSR (server-side rendering)
if (typeof window === 'undefined') {
  const localStorageMock = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
  (global as unknown as typeof globalThis & { localStorage: typeof localStorageMock }).localStorage = localStorageMock;
}

export {};