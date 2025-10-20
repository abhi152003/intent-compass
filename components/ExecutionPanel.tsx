'use client';

import { useFlowStore } from '@/lib/stores/flowStore';
import { Loader2, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';

export function ExecutionPanel() {
  const { execution } = useFlowStore();

  if (!execution) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Execution Progress</h3>
        <p className="text-gray-400 text-sm">Execute your flow to see real-time progress</p>
      </div>
    );
  }

  const duration = execution.endTime
    ? execution.endTime - (execution.startTime || 0)
    : Date.now() - (execution.startTime || 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Execution Progress</h3>
        {execution.status === 'executing' && (
          <div className="flex items-center gap-2 text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Executing...</span>
          </div>
        )}
        {execution.status === 'completed' && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
        {execution.status === 'failed' && (
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Failed</span>
          </div>
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            Duration: {Math.floor(duration / 1000)}s
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {execution.nodeResults.map((result, index) => (
          <div
            key={result.nodeId}
            className={`rounded-lg p-4 border ${
              result.success
                ? 'bg-green-900/20 border-green-700/50'
                : 'bg-red-900/20 border-red-700/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm font-medium text-white">
                  Step {index + 1}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {result.transactionHash && (
              <div className="mt-2 text-xs text-gray-400">
                <div className="mb-1">Transaction Hash:</div>
                <div className="font-mono text-xs text-gray-300 break-all">
                  {result.transactionHash.slice(0, 10)}...
                  {result.transactionHash.slice(-8)}
                </div>
              </div>
            )}

            {result.explorerUrl && (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {result.error && (
              <div className="mt-2 text-xs text-red-400">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {execution.status === 'executing' && execution.currentNodeId && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
            <span>
              Currently executing: <span className="text-white">{execution.currentNodeId}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
