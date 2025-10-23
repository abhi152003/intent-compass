'use client';

import { Handle, Position } from '@xyflow/react';
import { type TransferNodeData } from '@/types/flow';
import { Send } from 'lucide-react';
import Badge from '../ui/Badge';

interface TransferNodeProps {
  data: TransferNodeData;
  selected?: boolean;
}

export function TransferNode({ data, selected }: TransferNodeProps) {
  const statusConfig = {
    pending: { color: 'border-border-medium', badgeVariant: 'default' as const, glow: '' },
    executing: { color: 'border-accent-green animate-pulse', badgeVariant: 'warning' as const, glow: 'shadow-glow-green' },
    completed: { color: 'border-accent-green', badgeVariant: 'success' as const, glow: 'shadow-glow-green' },
    failed: { color: 'border-error', badgeVariant: 'error' as const, glow: '' },
  };

  const status = data.status || 'pending';
  const { color, badgeVariant, glow } = statusConfig[status];

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-accent-green/15 to-accent-green/5 backdrop-blur-md min-w-[240px] transition-all duration-base ${color} ${glow} ${
        selected ? 'ring-2 ring-accent-green ring-opacity-50 shadow-lg' : 'shadow-md hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-accent-green border-2 border-bg-primary transition-all duration-base hover:w-4 hover:h-4"
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-accent-green/20">
          <Send className="w-5 h-5 text-accent-green" />
        </div>
        <div className="font-bold font-heading text-text-primary">Transfer</div>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        <div className="text-text-secondary">
          <span className="text-text-muted">Amount:</span>{' '}
          <span className="font-semibold text-text-primary">{data.amount}</span>
        </div>
        <div className="text-text-secondary">
          <span className="text-text-muted">Recipient:</span>{' '}
          <span className="font-semibold text-text-primary text-xs">
            {data.recipient.slice(0, 6)}...{data.recipient.slice(-4)}
          </span>
        </div>
        {data.estimatedCost && (
          <div className="text-text-secondary">
            <span className="text-text-muted">Est. Cost:</span>{' '}
            <span className="font-semibold text-text-primary">${data.estimatedCost}</span>
          </div>
        )}
        {data.estimatedTime && (
          <div className="text-text-secondary">
            <span className="text-text-muted">Est. Time:</span>{' '}
            <span className="font-semibold text-text-primary">{data.estimatedTime}s</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {data.status && (
        <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between">
          <span className="text-xs text-text-muted">Status</span>
          <Badge variant={badgeVariant} size="sm">
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </Badge>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-accent-green border-2 border-bg-primary transition-all duration-base hover:w-4 hover:h-4"
      />
    </div>
  );
}
