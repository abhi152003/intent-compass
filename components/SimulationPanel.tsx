'use client';

import { useFlowStore } from '@/lib/stores/flowStore';
import { DollarSign, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import Card from './ui/Card';

export function SimulationPanel() {
  const { simulation } = useFlowStore();

  if (!simulation) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold font-heading text-text-primary mb-2">Simulation Results</h3>
        <p className="text-text-secondary text-sm">Run a simulation to see cost and time estimates</p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-lg font-bold font-heading text-text-primary mb-4">Simulation Results</h3>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card variant="default" padding="md" className="bg-bg-secondary">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-accent-green" />
            <span className="text-xs font-semibold text-text-muted">Total Cost</span>
          </div>
          <div className="text-2xl font-bold font-heading text-text-primary">${simulation.totalCost}</div>
        </Card>

        <Card variant="default" padding="md" className="bg-bg-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-accent-blue" />
            <span className="text-xs font-semibold text-text-muted">Total Time</span>
          </div>
          <div className="text-2xl font-bold font-heading text-text-primary">{simulation.totalTime}s</div>
        </Card>

        <Card variant="default" padding="md" className="bg-bg-secondary">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-orange" />
            <span className="text-xs font-semibold text-text-muted">Success Rate</span>
          </div>
          <div className="text-2xl font-bold font-heading text-text-primary">
            {(simulation.successRate * 100).toFixed(0)}%
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold font-heading text-text-primary mb-3">Step Breakdown</h4>
        {simulation.nodeResults.map((result, index) => (
          <Card
            key={result.nodeId}
            variant="default"
            padding="md"
            className="bg-bg-secondary/50 hover:bg-bg-secondary transition-all duration-base"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-sm text-text-muted font-mono flex-shrink-0">{String(index + 1).padStart(2, '0')}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error flex-shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${result.success ? 'text-accent-green' : 'text-error'}`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {result.route && Array.isArray(result.route) && result.route.length > 0 && (
                    <div className="text-xs text-text-muted mt-1 break-words">
                      {result.route.join(' → ')}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-xs text-error mt-1">{result.error}</div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-text-primary break-words">
                  ${result.estimatedCost}
                </div>
                <div className="text-xs text-text-muted">{result.estimatedTime}s</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border-light">
        <p className="text-sm text-text-secondary">
          Ready to execute? Click the <span className="text-accent-orange font-semibold">Execute</span>{' '}
          button in the toolbar.
        </p>
      </div>
    </Card>
  );
}
