'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
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

import { StartNode, BridgeNode, TransferNode, ExecuteNode } from './nodes';
import { NodeEditDialog } from './NodeEditDialog';
import { useFlowStore } from '@/lib/stores/flowStore';
import type { FlowNode, FlowEdge, FlowNodeData } from '@/types/flow';

export function IntentCanvas() {
  const { nodes, edges, setNodes, setEdges, addEdge: addEdgeToStore, updateNode } = useFlowStore();

  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);

  // Sync store state to local state when store changes (for clear/load operations)
  useEffect(() => {
    setLocalNodes(nodes as any);
    setLocalEdges(edges as any);
  }, [nodes, edges, setLocalNodes, setLocalEdges]);

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
    <div className="w-full h-full bg-bg-primary">
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
        className="bg-bg-primary"
      >
        <Background className="bg-bg-primary" color="#7c7a72" gap={16} />
        <Controls className="!bg-bg-elevated/90 !backdrop-blur-md !border-2 !border-border-medium !rounded-lg !shadow-lg [&>button]:!bg-bg-tertiary [&>button]:!border-border-medium [&>button]:!text-text-primary [&>button:hover]:!bg-bg-hover [&>button:hover]:!border-border-dark [&>button]:!transition-all [&>button]:!duration-200 [&>button]:!shadow-sm" />
        <MiniMap
          className="bg-bg-elevated border border-border-light rounded-lg shadow-md"
          maskColor="rgba(20, 20, 19, 0.6)"
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#d97757'; // Anthropic orange
              case 'bridge':
                return '#6a9bcc'; // Anthropic blue
              case 'transfer':
                return '#788c5d'; // Anthropic green
              case 'execute':
                return '#d97757'; // Anthropic orange
              default:
                return '#b0aea5'; // Mid gray
            }
          }}
        />
        <Panel position="top-left" className="bg-bg-elevated/95 backdrop-blur-md p-3 rounded-lg border border-border-light shadow-md">
          <div className="text-sm text-text-secondary">
            <div className="font-bold font-heading mb-1 text-text-primary">IntentCompass</div>
            <div className="text-xs text-text-muted">
              Drag nodes from toolbar • Double-click to edit • Select & press Backspace to remove
            </div>
          </div>
        </Panel>
      </ReactFlow>

      <NodeEditDialog
        node={editingNode}
        isOpen={editingNode !== null}
        onClose={() => setEditingNode(null)}
        onSave={handleNodeSave}
        edges={localEdges as any}
        nodes={localNodes as any}
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
      };
    case 'bridge':
      return {
        label: 'Bridge',
        toChain: 11155111,
        amount: '100',
      };
    case 'transfer':
      return {
        label: 'Transfer',
        recipient: '0x0000000000000000000000000000000000000000',
        amount: '100',
      };
    case 'execute':
      return {
        label: 'Execute',
        action: 'stake' as const,
        amount: '100',
      };
    default:
      return {
        label: 'Start',
        chain: 84532,
        token: 'USDC' as const,
      };
  }
}
