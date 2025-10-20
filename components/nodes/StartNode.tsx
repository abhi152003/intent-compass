'use client';

import { Handle, Position } from '@xyflow/react';
import { type StartNodeData, CHAIN_NAMES } from '@/types/flow';
import { Wallet } from 'lucide-react';

interface StartNodeProps {
  data: StartNodeData;
  selected?: boolean;
}

export function StartNode({ data, selected }: StartNodeProps) {
  const statusColor = {
    pending: 'border-gray-600',
    executing: 'border-yellow-500 animate-pulse',
    completed: 'border-green-500',
    failed: 'border-red-500',
  }[data.status || 'pending'];

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm min-w-[200px] ${statusColor} ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-5 h-5 text-blue-400" />
        <div className="font-semibold text-white">Start</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          <span className="text-gray-400">Chain:</span>{' '}
          <span className="font-medium">{CHAIN_NAMES[data.chain]}</span>
        </div>
        <div className="text-gray-300">
          <span className="text-gray-400">Token:</span>{' '}
          <span className="font-medium">{data.token}</span>
        </div>
        <div className="text-gray-300">
          <span className="text-gray-400">Amount:</span>{' '}
          <span className="font-medium">{data.amount}</span>
        </div>
      </div>

      {data.status && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 capitalize">{data.status}</div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
}
