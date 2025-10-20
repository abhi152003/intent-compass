'use client';

import { useState, useEffect } from 'react';
import { useNexus } from '@/contexts/NexusProvider';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';

// Mock contract ABI for testing execute functionality
const MOCK_CONTRACT_ABI = [
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "user", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const MOCK_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96c4b4Db45';
const MOCK_FUNCTION_NAME = 'deposit';

// Token metadata for testing
const TOKEN_METADATA = {
  USDC: { decimals: 6 },
  USDT: { decimals: 6 },
  ETH: { decimals: 18 },
} as const;

const TOKEN_CONTRACT_ADDRESSES = {
  USDC: {
    11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
    421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
  },
  USDT: {
    11155111: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT
    84532: '0x4200000000000000000000000000000000000006', // Base Sepolia USDT
    421614: '0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63', // Arbitrum Sepolia USDT
  },
  ETH: {
    11155111: '0x0000000000000000000000000000000000000000', // Native ETH
    84532: '0x0000000000000000000000000000000000000000', // Native ETH
    421614: '0x0000000000000000000000000000000000000000', // Native ETH
  },
} as const;

type SUPPORTED_TOKENS = keyof typeof TOKEN_METADATA;
type SUPPORTED_CHAINS_IDS = keyof typeof TOKEN_CONTRACT_ADDRESSES.USDC;

interface TestResult {
  operation: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export function NexusSDKTestComponent() {
  const { nexusService, isInitialized, isInitializing, error, initializeIfNeeded } = useNexus();
  const { address } = useAccount();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);

  // Add test result helper
  const addTestResult = (operation: string, success: boolean, data?: any, error?: string) => {
    const result: TestResult = {
      operation,
      success,
      data,
      error,
      timestamp: Date.now(),
    };
    setTestResults(prev => [result, ...prev]);
  };

  // Test 1: Get Unified Balances
  const testGetUnifiedBalances = async () => {
    if (!nexusService || !isInitialized) {
      addTestResult('Get Unified Balances', false, null, 'SDK not initialized');
      return;
    }

    try {
      console.log('🧪 Testing getUnifiedBalances...');
      const balances = await nexusService.getUnifiedBalances();
      console.log('✅ Unified balances:', balances);
      setBalances(balances);
      addTestResult('Get Unified Balances', true, balances);
    } catch (error) {
      console.error('❌ Get unified balances failed:', error);
      addTestResult('Get Unified Balances', false, null, error instanceof Error ? error.message : String(error));
    }
  };

  // Test 2: Bridge Tokens
  const testBridge = async () => {
    if (!nexusService || !isInitialized) {
      addTestResult('Bridge Tokens', false, null, 'SDK not initialized');
      return;
    }

    try {
      console.log('🧪 Testing bridge...');
      const bridgeResult = await nexusService.bridge({
        token: 'USDC',
        amount: '1', // Small amount for testing
        toChainId: 84532, // Base Sepolia
      });
      console.log('✅ Bridge result:', bridgeResult);
      addTestResult('Bridge Tokens', true, bridgeResult);
    } catch (error) {
      console.error('❌ Bridge failed:', error);
      addTestResult('Bridge Tokens', false, null, error instanceof Error ? error.message : String(error));
    }
  };

  // Test 3: Transfer Tokens
  const testTransfer = async () => {
    if (!nexusService || !isInitialized || !address) {
      addTestResult('Transfer Tokens', false, null, 'SDK not initialized or no address');
      return;
    }

    try {
      console.log('🧪 Testing transfer...');
      const transferResult = await nexusService.transfer({
        token: 'ETH',
        amount: '0.001', // Very small amount for testing
        toChainId: 11155111, // Ethereum Sepolia
        recipient: address, // Transfer to self for testing
      });
      console.log('✅ Transfer result:', transferResult);
      addTestResult('Transfer Tokens', true, transferResult);
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      addTestResult('Transfer Tokens', false, null, error instanceof Error ? error.message : String(error));
    }
  };

  // Test 4: Execute Contract Function
  const testExecute = async () => {
    if (!nexusService || !isInitialized || !address) {
      addTestResult('Execute Contract', false, null, 'SDK not initialized or no address');
      return;
    }

    try {
      console.log('🧪 Testing execute...');
      
      const buildFunctionParams = (
        token: SUPPORTED_TOKENS,
        amount: string,
        chainId: SUPPORTED_CHAINS_IDS,
        user: `0x${string}`,
      ) => {
        const decimals = TOKEN_METADATA[token].decimals;
        const amountWei = parseUnits(amount, decimals);
        const tokenAddr = TOKEN_CONTRACT_ADDRESSES[token][chainId];
        return { functionParams: [tokenAddr, amountWei, user, 0] };
      };

      const executeResult = await nexusService.execute({
        contractAddress: MOCK_CONTRACT_ADDRESS,
        contractAbi: MOCK_CONTRACT_ABI,
        functionName: MOCK_FUNCTION_NAME,
        buildFunctionParams: (
          token: SUPPORTED_TOKENS,
          amount: string,
          chainId: SUPPORTED_CHAINS_IDS,
          user: `0x${string}`,
        ) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddr = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          return { functionParams: [tokenAddr, amountWei, user, 0] };
        },
        value: '0', // No ETH value for this test
        tokenApproval: {
          token: 'USDC',
          amount: '1000000', // 1 USDC (6 decimals)
        },
      });
      
      console.log('✅ Execute result:', executeResult);
      addTestResult('Execute Contract', true, executeResult);
    } catch (error) {
      console.error('❌ Execute failed:', error);
      addTestResult('Execute Contract', false, null, error instanceof Error ? error.message : String(error));
    }
  };

  // Test 5: Simulate Bridge
  const testSimulateBridge = async () => {
    if (!nexusService || !isInitialized) {
      addTestResult('Simulate Bridge', false, null, 'SDK not initialized');
      return;
    }

    try {
      console.log('🧪 Testing simulate bridge...');
      const simulationResult = await nexusService.simulateBridge({
        token: 'USDC',
        amount: '1',
        toChainId: 84532, // Base Sepolia
      });
      console.log('✅ Bridge simulation result:', simulationResult);
      addTestResult('Simulate Bridge', true, simulationResult);
    } catch (error) {
      console.error('❌ Bridge simulation failed:', error);
      addTestResult('Simulate Bridge', false, null, error instanceof Error ? error.message : String(error));
    }
  };

  // Test 6: Get Supported Routes
  const testGetSupportedRoutes = async () => {
    if (!nexusService || !isInitialized) {
      addTestResult('Get Supported Routes', false, null, 'SDK not initialized');
      return;
    }

    try {
      console.log('🧪 Testing get supported routes...');
      const routesResult = await nexusService.getSupportedRoutes();
      console.log('✅ Supported routes result:', routesResult);
      addTestResult('Get Supported Routes', true, routesResult);
    } catch (error) {
      console.error('❌ Get supported routes failed:', error);
      addTestResult('Get Supported Routes', false, null, error instanceof Error ? error.message : String(error));
    }
  };

  // Run all tests
  const runAllTests = async () => {
    if (!isInitialized) {
      try {
        await initializeIfNeeded();
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
        return;
      }
    }

    setIsRunningTests(true);
    setTestResults([]);

    // Run tests sequentially to avoid conflicts
    await testGetUnifiedBalances();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between tests
    
    await testSimulateBridge();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGetSupportedRoutes();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // These tests require user interaction and may fail in automated testing
    // await testBridge();
    // await testTransfer();
    // await testExecute();

    setIsRunningTests(false);
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
    setBalances([]);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🧪 Nexus SDK Test Suite</h2>
        <div className="flex gap-2">
          <button
            onClick={runAllTests}
            disabled={isRunningTests || isInitializing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            disabled={isRunningTests}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* SDK Status */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">SDK Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Initialized:</span>
            <span className={`ml-2 ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
              {isInitialized ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Initializing:</span>
            <span className={`ml-2 ${isInitializing ? 'text-yellow-400' : 'text-gray-400'}`}>
              {isInitializing ? '⏳ Yes' : '✅ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Wallet Connected:</span>
            <span className={`ml-2 ${address ? 'text-green-400' : 'text-red-400'}`}>
              {address ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Address:</span>
            <span className="ml-2 text-gray-300 font-mono text-xs">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </span>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Individual Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Individual Tests</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            onClick={testGetUnifiedBalances}
            disabled={!isInitialized || isRunningTests}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            Get Balances
          </button>
          <button
            onClick={testSimulateBridge}
            disabled={!isInitialized || isRunningTests}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            Simulate Bridge
          </button>
          <button
            onClick={testGetSupportedRoutes}
            disabled={!isInitialized || isRunningTests}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            Get Routes
          </button>
          <button
            onClick={testBridge}
            disabled={!isInitialized || isRunningTests}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            Bridge (Live)
          </button>
          <button
            onClick={testTransfer}
            disabled={!isInitialized || isRunningTests}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            Transfer (Live)
          </button>
          <button
            onClick={testExecute}
            disabled={!isInitialized || isRunningTests}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            Execute (Live)
          </button>
        </div>
      </div>

      {/* Balances Display */}
      {balances.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Unified Balances</h3>
          <div className="bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(balances, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Test Results</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              No test results yet. Click "Run All Tests" or individual test buttons above.
            </div>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-900/30 border-green-500/50'
                    : 'bg-red-900/30 border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                    {result.success ? '✅' : '❌'} {result.operation}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {result.error && (
                  <div className="text-red-200 text-sm mb-2">
                    Error: {result.error}
                  </div>
                )}
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-300 hover:text-white">
                      View Data
                    </summary>
                    <pre className="mt-2 text-gray-400 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
        <h4 className="text-blue-300 font-semibold mb-2">📋 Test Instructions</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• <strong>Get Balances:</strong> Safe read operation - always works</li>
          <li>• <strong>Simulate Bridge:</strong> Safe simulation - no real transactions</li>
          <li>• <strong>Get Routes:</strong> Safe read operation - shows supported chains/tokens</li>
          <li>• <strong>Bridge (Live):</strong> Real transaction - requires wallet approval</li>
          <li>• <strong>Transfer (Live):</strong> Real transaction - requires wallet approval</li>
          <li>• <strong>Execute (Live):</strong> Real contract interaction - requires wallet approval</li>
        </ul>
        <p className="text-blue-200 text-sm mt-2">
          <strong>Note:</strong> Live tests will prompt for wallet signatures and may fail if you don't have sufficient tokens or gas.
        </p>
      </div>
    </div>
  );
}
