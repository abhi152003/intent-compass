'use client';

import { useCallback, useState } from 'react';
import { NexusSDK, type BridgeResult } from '@avail-project/nexus-core';

export default function NexusBridgeTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<BridgeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runBridge = useCallback(async () => {
    setIsRunning(true);
    setErrorMsg(null);
    setLastResult(null);

    const sdk = new NexusSDK();

    try {
      await sdk.initialize(window.ethereum);

      const result: BridgeResult = await sdk.bridge({
        token: 'USDC',
        amount: 1,
        chainId: 84532,
      });

      setLastResult(result);

      if (result.success) {
        // eslint-disable-next-line no-console
        console.log('✅ Bridge successful!');
        if (result.explorerUrl) {
          // eslint-disable-next-line no-console
          console.log('View transaction:', result.explorerUrl);
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ Bridge failed:', result.error);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMsg(msg);
      // eslint-disable-next-line no-console
      console.error('Bridge error:', error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Minimal Bridge Test</h2>
      <p className="text-gray-400 mb-4">Runs a single USDC bridge to chainId 84532 (Base Sepolia).</p>
      <button
        onClick={runBridge}
        disabled={isRunning}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
      >
        {isRunning ? 'Bridging...' : 'Run Bridge'}
      </button>

      {errorMsg && (
        <div className="mt-4 p-3 rounded border border-red-600 bg-red-900/30 text-red-200 text-sm">
          Error: {errorMsg}
        </div>
      )}

      {lastResult && (
        <div className="mt-4 p-3 rounded border border-gray-700 bg-gray-800 text-sm">
          <div className="mb-2">
            <span className="text-gray-400">Success:</span>
            <span className="ml-2">{String(lastResult.success)}</span>
          </div>
          {'error' in lastResult && lastResult.error && (
            <div className="mb-2">
              <span className="text-gray-400">Error:</span>
              <span className="ml-2">{String(lastResult.error)}</span>
            </div>
          )}
          {'explorerUrl' in lastResult && lastResult.explorerUrl && (
            <div>
              <span className="text-gray-400">Explorer:</span>
              <a
                href={lastResult.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-blue-400 underline"
              >
                View transaction
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


