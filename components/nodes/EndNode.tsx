'use client';

import { Handle, Position } from '@xyflow/react';
import { type EndNodeData, CHAIN_NAMES } from '@/types/flow';
import { Flag } from 'lucide-react';

interface EndNodeProps {
  data: EndNodeData;
  selected?: boolean;
}

export function EndNode({ data, selected }: EndNodeProps) {
  const statusColor = {
    pending: 'border-gray-600',
    executing: 'border-yellow-500 animate-pulse',
    completed: 'border-green-500',
    failed: 'border-red-500',
  }[data.status || 'pending'];

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 backdrop-blur-sm min-w-[200px] ${statusColor} ${
        selected ? 'ring-2 ring-indigo-400' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <Flag className="w-5 h-5 text-indigo-400" />
        <div className="font-semibold text-white">End</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          <span className="text-gray-400">Chain:</span>{' '}
          <span className="font-medium">{CHAIN_NAMES[data.chain]}</span>
        </div>
        <div className="text-gray-300">
          <span className="text-gray-400">Expected:</span>{' '}
          <span className="font-medium">
            {data.expectedAmount} {data.expectedToken}
          </span>
        </div>
        {data.description && (
          <div className="text-gray-300">
            <span className="text-gray-400">Note:</span>{' '}
            <span className="font-medium text-xs">{data.description}</span>
          </div>
        )}
      </div>

      {data.status && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 capitalize">{data.status}</div>
        </div>
      )}
    </div>
  );
}
