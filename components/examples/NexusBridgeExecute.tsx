'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNexus } from '@/contexts/NexusProvider';
import { SUPPORTED_CHAINS } from '@/constants/chains';
import { Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function NexusBridgeExecute() {
  const { address } = useAccount();
  const { nexusService, isInitialized, isInitializing, initializeIfNeeded } = useNexus();

  const [formData, setFormData] = useState({
    operation: 'bridge' as 'bridge' | 'transfer' | 'bridgeAndExecute',
    token: 'ETH',
    amount: '',
    toChainId: 84532, // Base Sepolia (destination - Nexus likely doesn't support bridging TO Sepolia)
    recipient: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  const chainIdMapping: Record<string, number> = {
    'ethereum-sepolia': 11155111,
    'base-sepolia': 84532,
    'arbitrum-sepolia': 421614,
  };

  const handleBridge = async () => {
    if (!nexusService) {
      setError('Nexus SDK not available. Please connect your wallet.');
      return;
    }

    if (!formData.amount) {
      setError('Please enter an amount');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setTxHash(null);
    setExplorerUrl(null);

    try {
      // Initialize SDK if needed (will request signature on first use)
      if (!isInitialized) {
        console.log('Initializing Nexus SDK before bridge...');
        await initializeIfNeeded();
      }

      console.log('🚀 Starting bridge operation...');

      const bridgeResult = await nexusService.bridge({
        token: formData.token,
        amount: formData.amount,
        toChainId: formData.toChainId,
      });

      console.log('✅ Bridge result:', bridgeResult);

      setResult(bridgeResult);
      if ('explorerUrl' in bridgeResult && typeof bridgeResult.explorerUrl === 'string') {
        setExplorerUrl(bridgeResult.explorerUrl);
      }
      if ('transactionHash' in bridgeResult && typeof bridgeResult.transactionHash === 'string') {
        setTxHash(bridgeResult.transactionHash);
      }
    } catch (err) {
      console.error('❌ Bridge failed:', err);
      setError(err instanceof Error ? err.message : 'Bridge operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!nexusService) {
      setError('Nexus SDK not available. Please connect your wallet.');
      return;
    }

    if (!formData.amount || !formData.recipient) {
      setError('Please enter amount and recipient address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setTxHash(null);
    setExplorerUrl(null);

    try {
      // Initialize SDK if needed (will request signature on first use)
      if (!isInitialized) {
        console.log('Initializing Nexus SDK before transfer...');
        await initializeIfNeeded();
      }

      console.log('🚀 Starting transfer operation...');

      const transferResult = await nexusService.transfer({
        token: formData.token,
        amount: formData.amount,
        toChainId: formData.toChainId,
        recipient: formData.recipient,
      });

      console.log('✅ Transfer result:', transferResult);

      setResult(transferResult);
      if ('explorerUrl' in transferResult && typeof transferResult.explorerUrl === 'string') {
        setExplorerUrl(transferResult.explorerUrl);
      }
      if ('transactionHash' in transferResult && typeof transferResult.transactionHash === 'string') {
        setTxHash(transferResult.transactionHash);
      }
    } catch (err) {
      console.error('❌ Transfer failed:', err);
      setError(err instanceof Error ? err.message : 'Transfer operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!nexusService) {
      setError('Nexus SDK not available. Please connect your wallet.');
      return;
    }

    if (!formData.amount) {
      setError('Please enter an amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize SDK if needed (will request signature on first use)
      if (!isInitialized) {
        console.log('Initializing Nexus SDK before simulation...');
        await initializeIfNeeded();
      }

      console.log('🔍 Simulating operation...');

      const simulation = await nexusService.simulateBridge({
        token: formData.token,
        amount: formData.amount,
        toChainId: formData.toChainId,
      });

      console.log('📊 Simulation result:', simulation);
      setResult(simulation);
    } catch (err) {
      console.error('❌ Simulation failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Simulation failed';
      
      // Provide helpful error message for "universe is not supported"
      if (errorMsg.includes('universe is not supported')) {
        setError(
          `⚠️ This route is not supported by Nexus SDK. ` +
          `Make sure you're on Ethereum Sepolia and try bridging to Arbitrum Sepolia. ` +
          `Check the console logs to see your source chain ID.`
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSupportedRoutes = async () => {
    if (!nexusService || !isInitialized) {
      setError('SDK not initialized. Click Execute or Simulate first to initialize.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Checking supported routes...');
      const routes = await (nexusService as any).getSupportedRoutes();
      console.log('📋 Supported routes:', routes);
      setResult({ routes, message: 'Check console (F12) for full details' });
      setError(null);
    } catch (err) {
      console.error('Error checking routes:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAllRoutes = async () => {
    if (!nexusService || !isInitialized) {
      setError('SDK not initialized. Click Execute or Simulate first to initialize.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing all supported routes...');
      console.log('This may take 30-60 seconds. Check console for progress.');
      
      const discoveryResult = await (nexusService as any).testSupportedRoutes();
      
      console.log('✅ Route discovery complete!');
      console.log('Working routes:', discoveryResult.workingRoutes);
      
      // Format results for display
      const summaryText = `
Found ${discoveryResult.workingRoutes.length} working routes!

Working Routes:
${discoveryResult.workingRoutes.map((r: any) => `  • Sepolia/Base/Arbitrum(${r.from}) → ${r.to}, ${r.token}`).join('\n')}

⚠️ Sepolia → Base (84532) is NOT supported.
Try using a working route above instead.

See console (F12) for full test details.
      `.trim();
      
      setResult({ 
        workingRoutes: discoveryResult.workingRoutes, 
        message: summaryText 
      });
    } catch (err) {
      console.error('Error testing routes:', err);
      setError(`Route test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="text-xl font-bold mb-2">Nexus SDK - Real Cross-Chain Operations</h3>
        <p className="text-sm text-gray-400 mb-6">
          Powered by Avail Nexus SDK for real cross-chain bridging and transfers
        </p>

        {isInitializing && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <p className="text-blue-400 text-sm">
                Initializing Nexus SDK... This will only happen once per session.
              </p>
            </div>
          </div>
        )}

        {!isInitialized && !isInitializing && address && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-sm">
              💡 <strong>Important:</strong> Make sure you're connected to <strong>Ethereum Sepolia</strong> in MetaMask!<br/>
              The destination is set to Base Sepolia. Nexus SDK may not support bridging to Ethereum Sepolia directly.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Operation Type</label>
            <select
              value={formData.operation}
              onChange={(e) => setFormData({ ...formData, operation: e.target.value as 'bridge' | 'transfer' | 'bridgeAndExecute' })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="bridge">Bridge (Move tokens to another chain)</option>
              <option value="transfer">Transfer (Send to recipient on another chain)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Token</label>
            <select
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.0"
              step="0.000001"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Destination Chain</label>
            <select
              value={formData.toChainId}
              onChange={(e) => setFormData({ ...formData, toChainId: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(chainIdMapping).map(([key, chainId]) => (
                <option key={key} value={chainId}>
                  {SUPPORTED_CHAINS[key]?.name || key} (Chain ID: {chainId})
                </option>
              ))}
            </select>
          </div>

          {formData.operation === 'transfer' && (
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Address</label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                placeholder="0x..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleSimulate}
              disabled={!address || loading}
              className="flex-1 rounded-lg border border-blue-500 px-4 py-3 font-medium hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Simulate</span>
                </>
              )}
            </button>
            <button
              onClick={formData.operation === 'transfer' ? handleTransfer : handleBridge}
              disabled={!address || loading}
              className="flex-1 rounded-lg bg-blue-500 px-4 py-3 font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Execute</span>
                </>
              )}
            </button>
            <button
              onClick={handleCheckSupportedRoutes}
              disabled={!address || !isInitialized || loading}
              className="rounded-lg border border-gray-600 px-4 py-3 font-medium hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 text-sm"
              title="Diagnose: Check which routes are supported by Nexus SDK"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>🔍 Debug</span>}
            </button>
            <button
              onClick={handleTestAllRoutes}
              disabled={!address || !isInitialized || loading}
              className="rounded-lg border border-purple-500 px-4 py-3 font-medium hover:bg-purple-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-purple-300 text-sm"
              title="Discover: Test all supported routes to find which ones work"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>🧪 Discover</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Error</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result !== null && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-400">Operation Successful!</p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 block"
                >
                  View on Explorer →
                </a>
              )}
              {txHash && (
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  Tx: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
