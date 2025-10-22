'use client';

import { Handle, Position } from '@xyflow/react';
import { type BridgeNodeData, CHAIN_NAMES } from '@/types/flow';
import { ArrowRightLeft } from 'lucide-react';

interface BridgeNodeProps {
  data: BridgeNodeData;
  selected?: boolean;
}

export function BridgeNode({ data, selected }: BridgeNodeProps) {
  const statusColor = {
    pending: 'border-gray-600',
    executing: 'border-yellow-500 animate-pulse',
    completed: 'border-green-500',
    failed: 'border-red-500',
  }[data.status || 'pending'];

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm min-w-[200px] ${statusColor} ${
        selected ? 'ring-2 ring-purple-400' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <ArrowRightLeft className="w-5 h-5 text-purple-400" />
        <div className="font-semibold text-white">Bridge</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          <span className="text-gray-400">To Chain:</span>{' '}
          <span className="font-medium">{CHAIN_NAMES[data.toChain]}</span>
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
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
}
