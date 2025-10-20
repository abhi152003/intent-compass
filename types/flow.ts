import { Node, Edge } from '@xyflow/react';

export type NodeType = 'start' | 'bridge' | 'transfer' | 'execute' | 'end';

export type ExecutionStatus = 'idle' | 'simulating' | 'executing' | 'completed' | 'failed';

export type ChainId = 11155111 | 11155420 | 80002 | 421614 | 84532 | 10143;

export const CHAIN_NAMES: Record<ChainId, string> = {
  11155111: 'Sepolia',
  11155420: 'Optimism Sepolia',
  80002: 'Polygon Amoy',
  421614: 'Arbitrum Sepolia',
  84532: 'Base Sepolia',
  10143: 'Monad Testnet',
};

export type Token = 'ETH' | 'USDC' | 'USDT';

export type ExecuteAction = 'stake' | 'lend' | 'swap';

export interface BaseNodeData {
  label: string;
  status?: 'pending' | 'executing' | 'completed' | 'failed';
  [key: string]: unknown;
}

export interface StartNodeData extends BaseNodeData {
  chain: ChainId;
  token: Token;
  amount: string;
  userAddress?: string;
}

export interface BridgeNodeData extends BaseNodeData {
  fromChain: ChainId;
  toChain: ChainId;
  token: Token;
  amount: string;
  estimatedCost?: string;
  estimatedTime?: number;
}

export interface TransferNodeData extends BaseNodeData {
  chain: ChainId;
  token: Token;
  amount: string;
  recipient: string;
  estimatedCost?: string;
  estimatedTime?: number;
}

export interface ExecuteNodeData extends BaseNodeData {
  chain: ChainId;
  action: ExecuteAction;
  token: Token;
  amount: string;
  contractAddress?: string;
  estimatedCost?: string;
  estimatedTime?: number;
  params?: Record<string, unknown>;
}

export interface EndNodeData extends BaseNodeData {
  chain: ChainId;
  expectedToken: Token;
  expectedAmount: string;
  description?: string;
}

export type FlowNodeData =
  | StartNodeData
  | BridgeNodeData
  | TransferNodeData
  | ExecuteNodeData
  | EndNodeData;

export interface FlowNode extends Omit<Node, 'data' | 'type'> {
  type: NodeType;
  data: FlowNodeData;
}

export interface FlowEdge extends Omit<Edge, 'type'> {
  type: string;
}

export interface SimulationResult {
  nodeId: string;
  success: boolean;
  estimatedCost: string;
  estimatedTime: number;
  route?: string[];
  error?: string;
}

export interface FlowSimulation {
  totalCost: string;
  totalTime: number;
  successRate: number;
  nodeResults: SimulationResult[];
}

export interface ExecutionResult {
  nodeId: string;
  success: boolean;
  transactionHash?: string;
  explorerUrl?: string;
  error?: string;
  timestamp: number;
}

export interface FlowExecution {
  status: ExecutionStatus;
  currentNodeId?: string;
  nodeResults: ExecutionResult[];
  startTime?: number;
  endTime?: number;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface FlowStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  addNode: (node: FlowNode) => void;
  updateNode: (nodeId: string, data: Partial<FlowNodeData>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: FlowEdge) => void;
  removeEdge: (edgeId: string) => void;
  simulation: FlowSimulation | null;
  setSimulation: (simulation: FlowSimulation | null) => void;
  execution: FlowExecution | null;
  setExecution: (execution: FlowExecution | null) => void;
  updateExecutionStatus: (status: ExecutionStatus) => void;
  templates: FlowTemplate[];
  addTemplate: (template: Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeTemplate: (id: string) => void;
  loadTemplate: (id: string) => void;
  clearFlow: () => void;
  resetExecution: () => void;
}

export interface NexusBridgeParams {
  token: Token;
  amount: number | string;
  chainId: ChainId;
}

export interface NexusTransferParams {
  token: Token;
  amount: number | string;
  chainId: ChainId;
  recipient: string;
}

export interface NexusExecuteParams {
  contractAddress: string;
  contractAbi: unknown[];
  functionName: string;
  functionParams: unknown[];
  toChainId: ChainId;
}

export interface NexusBridgeAndExecuteParams {
  toChainId: ChainId;
  contractAddress: string;
  contractAbi: unknown[];
  functionName: string;
  buildFunctionParams: (
    token: string,
    amount: string,
    chainId: number,
    userAddress: string
  ) => { functionParams: unknown[] };
}
