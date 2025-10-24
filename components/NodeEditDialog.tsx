'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { FlowNode, FlowEdge } from '@/types/flow';
import { CHAIN_NAMES as CHAINS } from '@/types/flow';
import { Modal, Button, Input, Select } from './ui';

interface NodeEditDialogProps {
  node: FlowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updates: Record<string, unknown>) => void;
  edges: FlowEdge[];
  nodes: FlowNode[];
}

export function NodeEditDialog({ node, isOpen, onClose, onSave, edges, nodes }: NodeEditDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (node) {
      setFormData({ ...node.data });
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  // Check if an Execute node follows this node
  const hasExecuteNodeAfter = () => {
    if (!node) return false;
    const outgoingEdge = edges.find((edge) => edge.source === node.id);
    if (!outgoingEdge) return false;
    const targetNode = nodes.find((n) => n.id === outgoingEdge.target);
    return targetNode?.type === 'execute';
  };

  const renderFields = () => {
    switch (node.type) {
      case 'start':
        return (
          <>
            <Select
              label="Chain"
              value={(formData.chain as number) || 84532}
              onChange={(e) => setFormData({ ...formData, chain: Number(e.target.value) })}
            >
              {Object.entries(CHAINS).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
            <Select
              label="Token"
              value={(formData.token as string) || 'USDC'}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </Select>
          </>
        );

      case 'bridge':
        const showBridgeAmount = !hasExecuteNodeAfter();
        return (
          <>
            <Select
              label="To Chain"
              value={(formData.toChain as number) || 11155111}
              onChange={(e) => setFormData({ ...formData, toChain: Number(e.target.value) })}
            >
              {Object.entries(CHAINS).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
            {showBridgeAmount ? (
              <Input
                type="number"
                label="Amount"
                value={(formData.amount as string) || '100'}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
                min="0"
              />
            ) : (
              <div className="p-3 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
                <p className="text-sm text-accent-blue">
                  <strong>BridgeAndExecute Mode:</strong> Amount will be automatically calculated based on the Execute node&apos;s amount and your existing balance on the target chain.
                </p>
              </div>
            )}
          </>
        );

      case 'transfer':
        return (
          <>
            <Input
              type="number"
              label="Amount"
              value={(formData.amount as string) || '100'}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              step="0.01"
              min="0"
            />
            <Input
              type="text"
              label="Recipient Address"
              value={(formData.recipient as string) || '0x0000000000000000000000000000000000000000'}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              className="font-mono text-sm"
              placeholder="0x..."
            />
          </>
        );

      case 'execute':
        return (
          <>
            <Select
              label="Action"
              value={(formData.action as string) || 'stake'}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            >
              <option value="stake">Stake</option>
              <option value="lend">Lend</option>
              <option value="swap">Swap</option>
            </Select>
            <Input
              type="number"
              label="Amount"
              value={(formData.amount as string) || '100'}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              step="0.01"
              min="0"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node`}
      description="Modify node parameters and settings"
      size="md"
      footer={
        <>
          <Button
            onClick={onClose}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {renderFields()}
      </div>
    </Modal>
  );
}
