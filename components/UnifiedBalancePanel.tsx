'use client';

import { useEffect, useState } from 'react';
import { Wallet, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useNexus } from '@/contexts/NexusProvider';
import { CHAIN_NAMES } from '@/types/flow';
import Card from './ui/Card';
import Button from './ui/Button';

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
      const formattedBalances: TokenBalance[] = unifiedBalances.map((asset) => ({
        symbol: asset.symbol,
        balance: asset.balance || '0',
        balanceInFiat: typeof asset.balanceInFiat === 'number' ? asset.balanceInFiat.toString() : asset.balanceInFiat,
        breakdown: asset.breakdown?.map((chain) => ({
          chain: {
            id: chain.chain.id,
            name: CHAIN_NAMES[chain.chain.id as keyof typeof CHAIN_NAMES] || chain.chain.name || `Chain ${chain.chain.id}`,
          },
          balance: chain.balance || '0',
          balanceInFiat: typeof chain.balanceInFiat === 'number' ? chain.balanceInFiat.toString() : chain.balanceInFiat,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  if (!isInitialized && !isInitializing) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent-blue/20">
            <Wallet className="w-5 h-5 text-accent-blue" />
          </div>
          <h3 className="text-lg font-bold font-heading text-text-primary">Unified Balance</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm mb-4">
            Initialize Nexus SDK to view your balances across all chains
          </p>
          <Button
            onClick={initializeIfNeeded}
            variant="primary"
            size="md"
          >
            Initialize SDK
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-blue/20">
            <Wallet className="w-5 h-5 text-accent-blue" />
          </div>
          <h3 className="text-lg font-bold font-heading text-text-primary">Unified Balance</h3>
        </div>
        <button
          onClick={fetchBalances}
          disabled={isLoading || !isInitialized}
          className="p-2 text-text-muted hover:text-text-primary transition-all duration-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-hover rounded-lg"
          title="Refresh balances"
          aria-label="Refresh balances"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && balances.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
        </div>
      ) : error ? (
        <Card variant="default" padding="md" className="bg-error/10 border-error/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-error mb-1">Error Loading Balances</div>
              <div className="text-xs text-error/80">{error}</div>
            </div>
          </div>
        </Card>
      ) : balances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm">No balances found</p>
          <p className="text-text-muted text-xs mt-1">
            Add testnet tokens to see your balance
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {balances.map((token) => {
            const isExpanded = expandedToken === token.symbol;
            const hasBreakdown = token.breakdown && token.breakdown.length > 0;

            return (
              <div
                key={token.symbol}
                className="bg-bg-secondary rounded-lg border border-border-light overflow-hidden transition-all duration-base"
              >
                <div
                  className={`p-4 transition-all duration-base ${hasBreakdown ? 'cursor-pointer hover:bg-bg-tertiary' : ''}`}
                  onClick={() => hasBreakdown && setExpandedToken(isExpanded ? null : token.symbol)}
                  role="button"
                  tabIndex={hasBreakdown ? 0 : -1}
                  onKeyDown={(e) => hasBreakdown && (e.key === 'Enter' || e.key === ' ') && setExpandedToken(isExpanded ? null : token.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold font-heading text-text-primary">{token.symbol}</div>
                      {token.balanceInFiat && (
                        <div className="text-xs text-text-muted mt-1">
                          ${token.balanceInFiat}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold font-mono text-text-primary">
                        {parseFloat(token.balance).toFixed(6)}
                      </div>
                      {hasBreakdown && (
                        <div className="text-xs text-text-muted mt-1">
                          {token.breakdown?.length} chain{token.breakdown?.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && hasBreakdown && (
                  <div className="border-t border-border-light bg-bg-tertiary/50">
                    <div className="p-3 space-y-2">
                      {token.breakdown?.map((chainBalance, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="text-text-secondary">{chainBalance.chain.name}</div>
                          <div className="font-mono text-text-primary">
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
        <div className="mt-4 pt-4 border-t border-border-light">
          <p className="text-xs text-text-muted text-center">
            Showing balances across all testnet chains
          </p>
        </div>
      )}
    </Card>
  );
}
