'use client';

import { Handle, Position } from '@xyflow/react';
import { type TransferNodeData, CHAIN_NAMES } from '@/types/flow';
import { Send } from 'lucide-react';

interface TransferNodeProps {
  data: TransferNodeData;
  selected?: boolean;
}

export function TransferNode({ data, selected }: TransferNodeProps) {
  const statusColor = {
    pending: 'border-gray-600',
    executing: 'border-yellow-500 animate-pulse',
    completed: 'border-green-500',
    failed: 'border-red-500',
  }[data.status || 'pending'];

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm min-w-[200px] ${statusColor} ${
        selected ? 'ring-2 ring-green-400' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <Send className="w-5 h-5 text-green-400" />
        <div className="font-semibold text-white">Transfer</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          <span className="text-gray-400">Chain:</span>{' '}
          <span className="font-medium">{CHAIN_NAMES[data.chain]}</span>
        </div>
        <div className="text-gray-300">
          <span className="text-gray-400">Amount:</span>{' '}
          <span className="font-medium">
            {data.amount} {data.token}
          </span>
        </div>
        <div className="text-gray-300">
          <span className="text-gray-400">To:</span>{' '}
          <span className="font-medium text-xs">
            {data.recipient.slice(0, 6)}...{data.recipient.slice(-4)}
          </span>
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
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
}
