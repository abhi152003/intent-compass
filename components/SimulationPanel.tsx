'use client';

import { useFlowStore } from '@/lib/stores/flowStore';
import { DollarSign, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export function SimulationPanel() {
  const { simulation } = useFlowStore();

  if (!simulation) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Simulation Results</h3>
        <p className="text-gray-400 text-sm">Run a simulation to see cost and time estimates</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Simulation Results</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-white">${simulation.totalCost}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Total Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{simulation.totalTime}s</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(simulation.successRate * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Step Breakdown</h4>
        {simulation.nodeResults.map((result, index) => (
          <div
            key={result.nodeId}
            className="bg-gray-800/30 rounded-lg p-3 border border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-sm text-gray-500 font-mono">#{index + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-medium text-white">
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {result.route && result.route.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {result.route.join(' → ')}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-xs text-red-400 mt-1">{result.error}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">${result.estimatedCost}</div>
                <div className="text-xs text-gray-400">{result.estimatedTime}s</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          Ready to execute? Click the <span className="text-green-400 font-medium">Execute</span>{' '}
          button in the toolbar.
        </p>
      </div>
    </div>
  );
}
