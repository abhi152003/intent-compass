'use client';

import { BridgeButton } from '@avail-project/nexus-widgets';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function NexusWidgetsTest() {
  const { address, isConnected } = useAccount();
  const [providerStatus, setProviderStatus] = useState<{
    exists: boolean;
    isConnected: boolean | null;
    selectedAddress: string | null;
    chainId: string | null;
  }>({ exists: false, isConnected: null, selectedAddress: null, chainId: null });

  // Check provider status
  useEffect(() => {
    const checkProvider = () => {
      if (typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum;
        setProviderStatus({
          exists: !!ethereum,
          isConnected: ethereum?.isConnected ? ethereum.isConnected() : null,
          selectedAddress: ethereum?.selectedAddress || null,
          chainId: ethereum?.chainId || null,
        });
      }
    };

    // Check immediately and on interval
    checkProvider();
    const interval = setInterval(checkProvider, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDebugClick = () => {
    console.log('=== NEXUS WIDGET DEBUG ===');
    console.log('Wagmi Connected:', isConnected);
    console.log('Wagmi Address:', address);
    console.log('window.ethereum exists:', !!(window as any).ethereum);
    console.log('window.ethereum:', (window as any).ethereum);
    if ((window as any).ethereum) {
      const eth = (window as any).ethereum;
      console.log('Provider methods:', {
        request: typeof eth.request,
        on: typeof eth.on,
        removeListener: typeof eth.removeListener,
        isConnected: typeof eth.isConnected,
        enable: typeof eth.enable,
      });
      console.log('Provider properties:', {
        isConnected: eth.isConnected?.(),
        selectedAddress: eth.selectedAddress,
        chainId: eth.chainId,
        isMetaMask: eth.isMetaMask,
      });
    }
    console.log('=========================');
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">🎨 Nexus Widgets Test</h2>
      <p className="text-gray-400 mb-6">
        Using official Nexus widgets for enhanced UI/UX components
      </p>

      {/* Debug Panel */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
          <span>🔍 Provider Debug Info</span>
          <button
            onClick={handleDebugClick}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-sm rounded"
          >
            Log Full Debug
          </button>
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className={providerStatus.exists ? 'text-green-400' : 'text-red-400'}>
              {providerStatus.exists ? '✓' : '✗'}
            </span>
            <span>window.ethereum exists: {providerStatus.exists ? 'Yes' : 'No'}</span>
          </div>
          {providerStatus.exists && (
            <>
              <div className="flex items-center space-x-2">
                <span className={providerStatus.isConnected ? 'text-green-400' : 'text-red-400'}>
                  {providerStatus.isConnected ? '✓' : '✗'}
                </span>
                <span>isConnected(): {String(providerStatus.isConnected)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={providerStatus.selectedAddress ? 'text-green-400' : 'text-yellow-400'}>
                  {providerStatus.selectedAddress ? '✓' : '○'}
                </span>
                <span>selectedAddress: {providerStatus.selectedAddress || 'null'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={providerStatus.chainId ? 'text-green-400' : 'text-yellow-400'}>
                  {providerStatus.chainId ? '✓' : '○'}
                </span>
                <span>chainId: {providerStatus.chainId || 'null'}</span>
              </div>
            </>
          )}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? '✓' : '✗'}
              </span>
              <span>Wagmi Connected: {isConnected ? 'Yes' : 'No'}</span>
            </div>
            {address && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-green-400">✓</span>
                <span className="truncate">Wagmi Address: {address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bridge Button Widget */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Bridge Button Widget</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <BridgeButton
            prefill={{
              token: 'USDC',
              amount: '1',
              chainId: 84532, // Base Sepolia
            }}
          >
            {({ onClick, isLoading }) => (
              <button
                onClick={onClick}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Bridging...</span>
                  </>
                ) : (
                  <span>Bridge USDC to Base Sepolia</span>
                )}
              </button>
            )}
          </BridgeButton>
        </div>
      </div>

      {/* Custom Bridge Button */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Custom Bridge Button</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <BridgeButton
            prefill={{
              token: 'ETH',
              amount: '0.001',
              chainId: 421614, // Arbitrum Sepolia
            }}
          >
            {({ onClick, isLoading }) => (
              <div className="space-y-3">
                <div className="text-sm text-gray-300">
                  Bridge ETH to Arbitrum Sepolia
                </div>
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Start Bridge'}
                </button>
              </div>
            )}
          </BridgeButton>
        </div>
      </div>


      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
        <h4 className="text-blue-300 font-semibold mb-2">📋 Widget Features & Requirements</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• <strong>Pre-filled forms:</strong> Automatically sets token, amount, and destination chain</li>
          <li>• <strong>Built-in loading states:</strong> Shows progress during bridge operations</li>
          <li>• <strong>Error handling:</strong> Displays user-friendly error messages</li>
          <li>• <strong>Success callbacks:</strong> Handles successful bridge results</li>
          <li>• <strong>Customizable UI:</strong> Render custom button designs while keeping functionality</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-blue-400/30">
          <h5 className="text-yellow-300 font-semibold mb-1">⚠️ Wallet Connection Requirements:</h5>
          <ul className="text-yellow-100 text-sm space-y-1">
            <li>• ✅ Wallet must be connected to MetaMask or compatible wallet</li>
            <li>• ✅ Wallet must be connected to a <strong>testnet chain</strong> (Ethereum Sepolia, Base Sepolia, or Arbitrum Sepolia)</li>
            <li>• ✅ Accept all wallet permissions when prompted</li>
            <li>• ✅ Ensure you have some test tokens on the source chain</li>
          </ul>
        </div>
        <p className="text-blue-200 text-sm mt-2">
          <strong>Note:</strong> The widgets handle all the complex bridge logic internally, providing a clean API for your UI.
        </p>
      </div>
    </div>
  );
}
