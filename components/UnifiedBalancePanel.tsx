'use client';

import { useEffect, useState } from 'react';
import { Wallet, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useNexus } from '@/contexts/NexusProvider';
import { CHAIN_NAMES } from '@/types/flow';

interface TokenBalance {
  symbol: string;
  balance: string;
  balanceInFiat?: string;
  breakdown?: Array<{
    chain: { id: number; name: string };
    balance: string;
    balanceInFiat?: string;
  }>;
}

export function UnifiedBalancePanel() {
  const { nexusService, isInitialized, isInitializing, initializeIfNeeded } = useNexus();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!nexusService || !isInitialized) {
      if (!isInitializing) {
        try {
          await initializeIfNeeded();
        } catch (err) {
          console.error('Failed to initialize SDK:', err);
          setError('Please initialize SDK to view balances');
          return;
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[UnifiedBalancePanel] Fetching unified balances...');
      const unifiedBalances = await nexusService.getUnifiedBalances();
      console.log('[UnifiedBalancePanel] Balances:', unifiedBalances);

      // Transform to our format
      const formattedBalances: TokenBalance[] = unifiedBalances.map((asset: any) => ({
        symbol: asset.symbol,
        balance: asset.balance || '0',
        balanceInFiat: asset.balanceInFiat,
        breakdown: asset.breakdown?.map((chain: any) => ({
          chain: {
            id: chain.chain.id,
            name: CHAIN_NAMES[chain.chain.id as keyof typeof CHAIN_NAMES] || chain.chain.name || `Chain ${chain.chain.id}`,
          },
          balance: chain.balance || '0',
          balanceInFiat: chain.balanceInFiat,
        })),
      }));

      setBalances(formattedBalances);
    } catch (err) {
      console.error('[UnifiedBalancePanel] Error fetching balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      fetchBalances();
    }
  }, [isInitialized]);

  if (!isInitialized && !isInitializing) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Unified Balance</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">
            Initialize Nexus SDK to view your balances across all chains
          </p>
          <button
            onClick={initializeIfNeeded}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Initialize SDK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Unified Balance</h3>
        </div>
        <button
          onClick={fetchBalances}
          disabled={isLoading || !isInitialized}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh balances"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && balances.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-red-300 mb-1">Error Loading Balances</div>
              <div className="text-xs text-red-400">{error}</div>
            </div>
          </div>
        </div>
      ) : balances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No balances found</p>
          <p className="text-gray-500 text-xs mt-1">
            Add testnet tokens to see your balance
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {balances.map((token) => {
            const isExpanded = expandedToken === token.symbol;
            const hasBreakdown = token.breakdown && token.breakdown.length > 0;

            return (
              <div
                key={token.symbol}
                className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
              >
                <div
                  className={`p-4 ${hasBreakdown ? 'cursor-pointer hover:bg-gray-800/70' : ''}`}
                  onClick={() => hasBreakdown && setExpandedToken(isExpanded ? null : token.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{token.symbol}</div>
                      {token.balanceInFiat && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          ${token.balanceInFiat}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">
                        {parseFloat(token.balance).toFixed(6)}
                      </div>
                      {hasBreakdown && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {token.breakdown?.length} chain{token.breakdown?.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && hasBreakdown && (
                  <div className="border-t border-gray-700 bg-gray-800/30">
                    <div className="p-3 space-y-2">
                      {token.breakdown?.map((chainBalance, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="text-gray-400">{chainBalance.chain.name}</div>
                          <div className="font-mono text-gray-300">
                            {parseFloat(chainBalance.balance).toFixed(6)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {balances.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Showing balances across all testnet chains
          </p>
        </div>
      )}
    </div>
  );
}
