import type {
  FlowNode,
  FlowEdge,
  FlowExecution,
  ExecutionResult,
  BridgeNodeData,
  TransferNodeData,
  ExecuteNodeData,
  StartNodeData,
  Token,
  ChainId,
} from '@/types/flow';
import type { NexusService } from './nexusSDK';

interface FlowContext {
  token: Token;
  currentChain: ChainId;
}

export class ExecutionService {
  private nexusService: NexusService | null = null;

  init(nexusService: NexusService) {
    this.nexusService = nexusService;
  }

  async executeFlow(
    nodes: FlowNode[],
    edges: FlowEdge[],
    onProgress?: (nodeId: string, result: ExecutionResult) => void
  ): Promise<FlowExecution> {
    const execution: FlowExecution = {
      status: 'executing',
      nodeResults: [],
      startTime: Date.now(),
    };

    try {
      // Find start node
      const startNode = nodes.find((n) => n.type === 'start');
      if (!startNode) {
        throw new Error('Flow must have a start node');
      }

      // Check for at least one action node
      const hasActionNode = nodes.some((n) =>
        n.type === 'bridge' || n.type === 'transfer' || n.type === 'execute'
      );
      if (!hasActionNode) {
        throw new Error('Flow must have at least one action node (bridge, transfer, or execute)');
      }

      const startData = startNode.data as StartNodeData;
      const context: FlowContext = {
        token: startData.token,
        currentChain: startData.chain,
      };

      const executionOrder = this.getExecutionOrder(nodes, edges);

      for (const node of executionOrder) {
        if (node.type === 'start') {
          continue;
        }

        execution.currentNodeId = node.id;

        const result = await this.executeNode(node, context);
        execution.nodeResults.push(result);

        if (onProgress) {
          onProgress(node.id, result);
        }

        if (!result.success) {
          execution.status = 'failed';
          execution.endTime = Date.now();
          return execution;
        }

        // Update context after bridge node
        if (node.type === 'bridge') {
          const bridgeData = node.data as BridgeNodeData;
          context.currentChain = bridgeData.toChain;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      execution.status = 'completed';
      execution.endTime = Date.now();
      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.nodeResults.push({
        nodeId: 'error',
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        timestamp: Date.now(),
      });
      return execution;
    }
  }

  private async executeNode(node: FlowNode, context: FlowContext): Promise<ExecutionResult> {
    try {
      switch (node.type) {
        case 'bridge':
          return await this.executeBridge(node, context);
        case 'transfer':
          return await this.executeTransfer(node, context);
        case 'execute':
          return await this.executeAction(node, context);
        default:
          return {
            nodeId: node.id,
            success: false,
            error: 'Unknown node type',
            timestamp: Date.now(),
          };
      }
    } catch (error) {
      return {
        nodeId: node.id,
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        timestamp: Date.now(),
      };
    }
  }

  private async executeBridge(node: FlowNode, context: FlowContext): Promise<ExecutionResult> {
    const data = node.data as BridgeNodeData;
    const token = context.token;

    if (this.nexusService && this.nexusService.isInitialized()) {
      try {
        console.log('[ExecutionService] Using real Nexus SDK for bridge');

        const result = await this.nexusService.bridge({
          token: token,
          amount: data.amount,
          toChainId: data.toChain,
        });

        if (result.success) {
          return {
            nodeId: node.id,
            success: true,
            transactionHash: result.transactionHash || undefined,
            explorerUrl: result.explorerUrl || undefined,
            timestamp: Date.now(),
          };
        } else {
          return {
            nodeId: node.id,
            success: false,
            error: result.error || 'Bridge failed',
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.error('[ExecutionService] Real SDK bridge failed:', error);
        return {
          nodeId: node.id,
          success: false,
          error: error instanceof Error ? error.message : 'Bridge execution failed',
          timestamp: Date.now(),
        };
      }
    }

    console.log('[ExecutionService] Using mock bridge execution');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      nodeId: node.id,
      success: true,
      transactionHash: mockTxHash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${mockTxHash}`,
      timestamp: Date.now(),
    };
  }

  private async executeTransfer(node: FlowNode, context: FlowContext): Promise<ExecutionResult> {
    const data = node.data as TransferNodeData;
    const token = context.token;
    const currentChain = context.currentChain;

    if (this.nexusService && this.nexusService.isInitialized()) {
      try {
        console.log('[ExecutionService] Using real Nexus SDK for transfer');

        const result = await this.nexusService.transfer({
          token: token,
          amount: data.amount,
          toChainId: currentChain,
          recipient: data.recipient,
        });

        if (result.success) {
          return {
            nodeId: node.id,
            success: true,
            transactionHash: result.transactionHash || undefined,
            explorerUrl: result.explorerUrl || undefined,
            timestamp: Date.now(),
          };
        } else {
          return {
            nodeId: node.id,
            success: false,
            error: result.error || 'Transfer failed',
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.error('[ExecutionService] Real SDK transfer failed:', error);
        return {
          nodeId: node.id,
          success: false,
          error: error instanceof Error ? error.message : 'Transfer execution failed',
          timestamp: Date.now(),
        };
      }
    }

    console.log('[ExecutionService] Using mock transfer execution');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      nodeId: node.id,
      success: true,
      transactionHash: mockTxHash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${mockTxHash}`,
      timestamp: Date.now(),
    };
  }

  private async executeAction(node: FlowNode, context: FlowContext): Promise<ExecutionResult> {
    const data = node.data as ExecuteNodeData;

    console.log('[ExecutionService] Using mock execute operation');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      nodeId: node.id,
      success: true,
      transactionHash: mockTxHash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${mockTxHash}`,
      timestamp: Date.now(),
    };
  }

  private getExecutionOrder(
    nodes: FlowNode[],
    edges: FlowEdge[]
  ): FlowNode[] {
    const result: FlowNode[] = [];
    const visited = new Set<string>();

    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) {
      return nodes;
    }

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      visited.add(nodeId);
      result.push(node);

      const outgoing = edges.filter((e) => e.source === nodeId);
      for (const edge of outgoing) {
        visit(edge.target);
      }
    };

    visit(startNode.id);

    return result;
  }
}

export const executionService = new ExecutionService();
