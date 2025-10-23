'use client';

import { useFlowStore } from '@/lib/stores/flowStore';
import { Loader2, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

export function ExecutionPanel() {
  const { execution } = useFlowStore();

  if (!execution) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold font-heading text-text-primary mb-2">Execution Progress</h3>
        <p className="text-text-secondary text-sm">Execute your flow to see real-time progress</p>
      </Card>
    );
  }

  const duration = execution.endTime
    ? execution.endTime - (execution.startTime || 0)
    : Date.now() - (execution.startTime || 0);

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-heading text-text-primary">Execution Progress</h3>
        {execution.status === 'executing' && (
          <Badge variant="warning">
            <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />
            Executing
          </Badge>
        )}
        {execution.status === 'completed' && (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1 inline" />
            Completed
          </Badge>
        )}
        {execution.status === 'failed' && (
          <Badge variant="error">
            <XCircle className="w-3 h-3 mr-1 inline" />
            Failed
          </Badge>
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-border-light">
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Clock className="w-4 h-4" />
          <span>
            Duration: <span className="font-semibold">{Math.floor(duration / 1000)}s</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {execution.nodeResults.map((result, index) => (
          <Card
            key={result.nodeId}
            variant="default"
            padding="md"
            className={result.success ? 'bg-accent-green/10 border-accent-green/30' : 'bg-error/10 border-error/30'}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                )}
                <span className={`text-sm font-semibold ${result.success ? 'text-accent-green' : 'text-error'}`}>
                  Step {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {result.transactionHash && (
              <div className="mt-2 text-xs text-text-muted">
                <div className="mb-1 font-semibold">Transaction Hash:</div>
                <code className="font-mono text-xs text-text-secondary break-all">
                  {result.transactionHash.slice(0, 10)}...
                  {result.transactionHash.slice(-8)}
                </code>
              </div>
            )}

            {result.explorerUrl && (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors duration-base"
                aria-label="View transaction on explorer"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {result.error && (
              <div className="mt-2 text-xs text-error">
                Error: {result.error}
              </div>
            )}
          </Card>
        ))}
      </div>

      {execution.status === 'executing' && execution.currentNodeId && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2 text-sm text-text-secondary animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-accent-orange" />
            <span>
              Currently executing: <span className="text-text-primary font-semibold">{execution.currentNodeId}</span>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
