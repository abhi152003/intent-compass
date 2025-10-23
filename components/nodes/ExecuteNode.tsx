'use client';

import { Handle, Position } from '@xyflow/react';
import { type ExecuteNodeData } from '@/types/flow';
import { Zap } from 'lucide-react';
import Badge from '../ui/Badge';

interface ExecuteNodeProps {
  data: ExecuteNodeData;
  selected?: boolean;
}

export function ExecuteNode({ data, selected }: ExecuteNodeProps) {
  const statusConfig = {
    pending: { color: 'border-border-medium', badgeVariant: 'default' as const, glow: '' },
    executing: { color: 'border-accent-orange animate-pulse', badgeVariant: 'warning' as const, glow: 'shadow-glow-orange' },
    completed: { color: 'border-accent-green', badgeVariant: 'success' as const, glow: 'shadow-glow-green' },
    failed: { color: 'border-error', badgeVariant: 'error' as const, glow: '' },
  };

  const status = data.status || 'pending';
  const { color, badgeVariant, glow } = statusConfig[status];

  const actionLabels = {
    stake: 'Stake',
    lend: 'Lend',
    swap: 'Swap',
  };

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 bg-gradient-to-br from-accent-orange/15 to-accent-orange/5 backdrop-blur-md min-w-[240px] transition-all duration-base ${color} ${glow} ${
        selected ? 'ring-2 ring-accent-orange ring-opacity-50 shadow-lg' : 'shadow-md hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-accent-orange border-2 border-bg-primary transition-all duration-base hover:w-4 hover:h-4"
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-accent-orange/20">
          <Zap className="w-5 h-5 text-accent-orange" />
        </div>
        <div className="font-bold font-heading text-text-primary">Execute</div>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        <div className="text-text-secondary">
          <span className="text-text-muted">Action:</span>{' '}
          <span className="font-semibold text-text-primary">{actionLabels[data.action]}</span>
        </div>
        <div className="text-text-secondary">
          <span className="text-text-muted">Amount:</span>{' '}
          <span className="font-semibold text-text-primary">{data.amount}</span>
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
        className="w-3 h-3 bg-accent-orange border-2 border-bg-primary transition-all duration-base hover:w-4 hover:h-4"
      />
    </div>
  );
}
