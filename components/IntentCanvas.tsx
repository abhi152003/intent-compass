'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StartNode, BridgeNode, TransferNode, ExecuteNode, EndNode } from './nodes';
import { NodeEditDialog } from './NodeEditDialog';
import { useFlowStore } from '@/lib/stores/flowStore';
import type { FlowNode, FlowEdge, FlowNodeData } from '@/types/flow';

export function IntentCanvas() {
  const { nodes, edges, setNodes, setEdges, addEdge: addEdgeToStore, updateNode } = useFlowStore();

  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);

  const syncToStore = useCallback(() => {
    setNodes(localNodes);
    setEdges(localEdges);
  }, [localNodes, localEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: FlowEdge = {
        id: `edge-${connection.source}-${connection.target}`,
        type: 'smoothstep',
        animated: true,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle || null,
        targetHandle: connection.targetHandle || null,
      };
      setLocalEdges((eds) => addEdge(newEdge as any, eds));
      addEdgeToStore(newEdge);
    },
    [setLocalEdges, addEdgeToStore]
  );

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      start: StartNode,
      bridge: BridgeNode,
      transfer: TransferNode,
      execute: ExecuteNode,
      end: EndNode,
    }),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 50,
      };

      const newNode: FlowNode = {
        id: `${type}-${Date.now()}`,
        type: type as FlowNode['type'],
        position,
        data: getDefaultNodeData(type),
      };

      setLocalNodes((nds) => [...nds, newNode] as any);
      syncToStore();
    },
    [setLocalNodes, syncToStore]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setTimeout(syncToStore, 0);
    },
    [onNodesChange, syncToStore]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setTimeout(syncToStore, 0);
    },
    [onEdgesChange, syncToStore]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      console.log('Node double-clicked:', node);
      setEditingNode(node as FlowNode);
    },
    []
  );

  const handleNodeSave = useCallback(
    (nodeId: string, updates: Record<string, any>) => {
      updateNode(nodeId, updates);
      setLocalNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n
        )
      );
    },
    [updateNode, setLocalNodes]
  );

  return (
    <div className="w-full h-full bg-gray-950">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
      >
        <Background className="bg-gray-950" />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap
          className="bg-gray-900 border border-gray-700"
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#3b82f6';
              case 'bridge':
                return '#a855f7';
              case 'transfer':
                return '#22c55e';
              case 'execute':
                return '#f97316';
              case 'end':
                return '#6366f1';
              default:
                return '#9ca3af';
            }
          }}
        />
        <Panel position="top-left" className="bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-300">
            <div className="font-semibold mb-1 text-white">IntentCompass</div>
            <div className="text-xs text-gray-400">Drag nodes from toolbar • Double-click to edit</div>
          </div>
        </Panel>
      </ReactFlow>

      <NodeEditDialog
        node={editingNode}
        isOpen={editingNode !== null}
        onClose={() => setEditingNode(null)}
        onSave={handleNodeSave}
      />
    </div>
  );
}

function getDefaultNodeData(type: string): FlowNodeData {
  switch (type) {
    case 'start':
      return {
        label: 'Start',
        chain: 84532,
        token: 'USDC' as const,
        amount: '100',
      };
    case 'bridge':
      return {
        label: 'Bridge',
        fromChain: 84532,
        toChain: 11155111,
        token: 'USDC' as const,
        amount: '100',
      };
    case 'transfer':
      return {
        label: 'Transfer',
        chain: 84532,
        token: 'USDC' as const,
        amount: '100',
        recipient: '0x0000000000000000000000000000000000000000',
      };
    case 'execute':
      return {
        label: 'Execute',
        chain: 84532,
        action: 'stake' as const,
        token: 'USDC' as const,
        amount: '100',
      };
    case 'end':
      return {
        label: 'End',
        chain: 84532,
        expectedToken: 'USDC' as const,
        expectedAmount: '100',
        description: 'Flow complete',
      };
    default:
      return {
        label: 'Start',
        chain: 84532,
        token: 'USDC' as const,
        amount: '100',
      };
  }
}
