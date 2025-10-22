'use client';

import { Handle, Position } from '@xyflow/react';
import { type ExecuteNodeData } from '@/types/flow';
import { Zap } from 'lucide-react';

interface ExecuteNodeProps {
  data: ExecuteNodeData;
  selected?: boolean;
}

export function ExecuteNode({ data, selected }: ExecuteNodeProps) {
  const statusColor = {
    pending: 'border-gray-600',
    executing: 'border-yellow-500 animate-pulse',
    completed: 'border-green-500',
    failed: 'border-red-500',
  }[data.status || 'pending'];

  const actionLabels = {
    stake: 'Stake',
    lend: 'Lend',
    swap: 'Swap',
  };

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm min-w-[200px] ${statusColor} ${
        selected ? 'ring-2 ring-orange-400' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-orange-400" />
        <div className="font-semibold text-white">Execute</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          <span className="text-gray-400">Action:</span>{' '}
          <span className="font-medium">{actionLabels[data.action]}</span>
        </div>
        <div className="text-gray-300">
          <span className="text-gray-400">Amount:</span>{' '}
          <span className="font-medium">{data.amount}</span>
        </div>
        {data.estimatedCost && (
          <div className="text-gray-300">
            <span className="text-gray-400">Est. Cost:</span>{' '}
            <span className="font-medium">${data.estimatedCost}</span>
          </div>
        )}
        {data.estimatedTime && (
          <div className="text-gray-300">
            <span className="text-gray-400">Est. Time:</span>{' '}
            <span className="font-medium">{data.estimatedTime}s</span>
          </div>
        )}
      </div>

      {data.status && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 capitalize">{data.status}</div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  );
}
