'use client';

import { Wallet, ArrowRightLeft, Send, Zap, Play, RotateCcw, Save, FolderOpen } from 'lucide-react';
import { useFlowStore } from '@/lib/stores/flowStore';
import Button from './ui/Button';
import Tooltip from './ui/Tooltip';

interface ToolbarProps {
  onSimulate?: () => void;
  onExecute?: () => void;
  onSaveTemplate?: () => void;
  onLoadTemplate?: () => void;
}

export function Toolbar({ onSimulate, onExecute, onSaveTemplate, onLoadTemplate }: ToolbarProps) {
  const { clearFlow, resetExecution, simulation, execution } = useFlowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeButtons = [
    {
      type: 'start',
      label: 'Start',
      icon: <Wallet className="w-4 h-4" />,
      tooltip: 'Define wallet & initial amount',
      colorClass: 'from-accent-orange/20 to-accent-orange/10 border-accent-orange/30 hover:from-accent-orange/30 hover:to-accent-orange/20',
      textColor: 'text-accent-orange',
    },
    {
      type: 'bridge',
      label: 'Bridge',
      icon: <ArrowRightLeft className="w-4 h-4" />,
      tooltip: 'Cross-chain bridge transaction',
      colorClass: 'from-accent-blue/20 to-accent-blue/10 border-accent-blue/30 hover:from-accent-blue/30 hover:to-accent-blue/20',
      textColor: 'text-accent-blue',
    },
    {
      type: 'transfer',
      label: 'Transfer',
      icon: <Send className="w-4 h-4" />,
      tooltip: 'Transfer tokens between accounts',
      colorClass: 'from-accent-green/20 to-accent-green/10 border-accent-green/30 hover:from-accent-green/30 hover:to-accent-green/20',
      textColor: 'text-accent-green',
    },
    {
      type: 'execute',
      label: 'Execute',
      icon: <Zap className="w-4 h-4" />,
      tooltip: 'Execute smart contract function',
      colorClass: 'from-accent-orange/20 to-accent-orange/10 border-accent-orange/30 hover:from-accent-orange/30 hover:to-accent-orange/20',
      textColor: 'text-accent-orange',
    },
  ];

  return (
    <div className="bg-bg-secondary/50 backdrop-blur-sm border-b border-border-light p-4 sticky top-[90px] z-30 transition-all duration-base">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          {/* Node Dragging Section */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-secondary whitespace-nowrap">
              Nodes:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {nodeButtons.map((nodeBtn) => (
                <Tooltip key={nodeBtn.type} content={nodeBtn.tooltip}>
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, nodeBtn.type)}
                    className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${nodeBtn.colorClass} border rounded-lg cursor-move transition-all duration-base active:scale-95`}
                  >
                    <span className={nodeBtn.textColor}>{nodeBtn.icon}</span>
                    <span className="text-sm font-semibold text-text-primary hidden sm:inline">
                      {nodeBtn.label}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Actions */}
            <Tooltip content="Run simulation without execution">
              <Button
                onClick={onSimulate}
                disabled={!onSimulate || !!simulation}
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Simulate</span>
              </Button>
            </Tooltip>

            <Tooltip content="Execute the flow on-chain">
              <Button
                onClick={onExecute}
                disabled={!onExecute || !simulation || !!execution}
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Execute</span>
              </Button>
            </Tooltip>

            {/* Divider */}
            <div className="w-px h-6 bg-border-light mx-2" />

            {/* Secondary Actions */}
            <Tooltip content="Save flow as template">
              <Button
                onClick={onSaveTemplate}
                disabled={!onSaveTemplate}
                variant="secondary"
                size="sm"
                icon={<Save className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Save</span>
              </Button>
            </Tooltip>

            <Tooltip content="Load saved template">
              <Button
                onClick={onLoadTemplate}
                disabled={!onLoadTemplate}
                variant="secondary"
                size="sm"
                icon={<FolderOpen className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Load</span>
              </Button>
            </Tooltip>

            <Tooltip content="Clear canvas and reset state">
              <Button
                onClick={() => {
                  resetExecution();
                  clearFlow();
                }}
                variant="secondary"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
