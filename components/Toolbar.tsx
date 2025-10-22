'use client';

import { Wallet, ArrowRightLeft, Send, Zap, Play, RotateCcw, Save, FolderOpen } from 'lucide-react';
import { useFlowStore } from '@/lib/stores/flowStore';

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

  return (
    <div className="bg-gray-900 border-b border-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-400 mr-2">Nodes:</div>

            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'start')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-900/40 border border-blue-700 rounded-lg cursor-move hover:bg-blue-900/60 transition-colors"
            >
              <Wallet className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">Start</span>
            </div>

            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'bridge')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-900/40 border border-purple-700 rounded-lg cursor-move hover:bg-purple-900/60 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">Bridge</span>
            </div>

            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'transfer')}
              className="flex items-center gap-2 px-3 py-2 bg-green-900/40 border border-green-700 rounded-lg cursor-move hover:bg-green-900/60 transition-colors"
            >
              <Send className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Transfer</span>
            </div>

            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'execute')}
              className="flex items-center gap-2 px-3 py-2 bg-orange-900/40 border border-orange-700 rounded-lg cursor-move hover:bg-orange-900/60 transition-colors"
            >
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white">Execute</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulate}
              disabled={!onSimulate || !!simulation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Simulate
            </button>

            <button
              onClick={onExecute}
              disabled={!onExecute || !simulation || !!execution}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Execute
            </button>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            <button
              onClick={onSaveTemplate}
              disabled={!onSaveTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={onLoadTemplate}
              disabled={!onLoadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              <FolderOpen className="w-4 h-4" />
              Load
            </button>

            <button
              onClick={() => {
                resetExecution();
                clearFlow();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
