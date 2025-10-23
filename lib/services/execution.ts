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
import { ethers } from 'ethers';
import {
  INTENT_EXECUTOR_ABI,
  getIntentExecutorAddress,
  isContractDeployed,
  IntentAction,
  USDC_ADDRESSES
} from '@/lib/contracts/intentExecutor';

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

      // Process nodes with bridgeAndExecute optimization
      let i = 0;
      while (i < executionOrder.length) {
        const node = executionOrder[i];

        if (node.type === 'start') {
          i++;
          continue;
        }

        // Check if this is a bridge followed by execute (BridgeAndExecute pattern)
        const nextNode = i + 1 < executionOrder.length ? executionOrder[i + 1] : null;
        const isBridgeAndExecute =
          node.type === 'bridge' &&
          nextNode &&
          nextNode.type === 'execute' &&
          this.nexusService &&
          this.nexusService.isInitialized();

        if (isBridgeAndExecute && nextNode) {
          // Execute bridge + execute as a single operation
          const bridgeData = node.data as BridgeNodeData;
          const executeData = nextNode.data as ExecuteNodeData;

          execution.currentNodeId = node.id;

          const result = await this.executeBridgeAndExecute(
            node,
            nextNode,
            context,
            bridgeData,
            executeData
          );

          // Add results for both nodes with separate explorer URLs
          // Note: BridgeAndExecute is a single operation but may have separate URLs for bridge and execute
          execution.nodeResults.push({
            nodeId: node.id,
            success: result.success,
            transactionHash: (result as any).bridgeTransactionHash || result.transactionHash,
            explorerUrl: (result as any).bridgeExplorerUrl || result.explorerUrl,
            timestamp: Date.now(),
          });

          execution.nodeResults.push({
            nodeId: nextNode.id,
            success: result.success,
            transactionHash: (result as any).executeTransactionHash || result.transactionHash,
            explorerUrl: (result as any).executeExplorerUrl || result.explorerUrl,
            error: result.error,
            timestamp: Date.now(),
          });

          if (onProgress) {
            onProgress(node.id, execution.nodeResults[execution.nodeResults.length - 2]);
            onProgress(nextNode.id, execution.nodeResults[execution.nodeResults.length - 1]);
          }

          if (!result.success) {
            execution.status = 'failed';
            execution.endTime = Date.now();
            return execution;
          }

          // Update context
          context.currentChain = bridgeData.toChain;

          // Skip the next node since we already executed it
          i += 2;
        } else {
          // Normal execution
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

          i++;
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
      explorerUrl: this.getExplorerUrl(data.toChain, mockTxHash),
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
      explorerUrl: this.getExplorerUrl(currentChain, mockTxHash),
      timestamp: Date.now(),
    };
  }

  private async executeAction(node: FlowNode, context: FlowContext): Promise<ExecutionResult> {
    const data = node.data as ExecuteNodeData;

    // Check if swap action (not yet implemented)
    if (data.action === 'swap') {
      return {
        nodeId: node.id,
        success: false,
        error: 'Swap functionality coming soon',
        timestamp: Date.now(),
      };
    }

    // For standalone Execute nodes (not part of BridgeAndExecute),
    // require them to be preceded by a Bridge node
    console.log('[ExecutionService] Standalone Execute node detected');
    console.log('[ExecutionService] Note: For optimal execution, Execute nodes should follow a Bridge node to use BridgeAndExecute');

    // Use mock execution for standalone Execute nodes
    console.log('[ExecutionService] Using mock execute operation');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      nodeId: node.id,
      success: true,
      transactionHash: mockTxHash,
      explorerUrl: this.getExplorerUrl(context.currentChain, mockTxHash),
      timestamp: Date.now(),
    };
  }

  private async executeBridgeAndExecute(
    bridgeNode: FlowNode,
    executeNode: FlowNode,
    context: FlowContext,
    bridgeData: BridgeNodeData,
    executeData: ExecuteNodeData
  ): Promise<ExecutionResult> {
    if (!this.nexusService || !this.nexusService.isInitialized()) {
      return {
        nodeId: executeNode.id,
        success: false,
        error: 'Nexus SDK not initialized',
        timestamp: Date.now(),
      };
    }

    // Check if swap (not supported yet)
    if (executeData.action === 'swap') {
      return {
        nodeId: executeNode.id,
        success: false,
        error: 'Swap functionality coming soon',
        timestamp: Date.now(),
      };
    }

    try {
      console.log('[ExecutionService] Executing BridgeAndExecute for', executeData.action);

      const contractAddress = getIntentExecutorAddress(bridgeData.toChain);
      if (!contractAddress || !isContractDeployed(bridgeData.toChain)) {
        return {
          nodeId: executeNode.id,
          success: false,
          error: 'IntentExecutor contract not deployed on target chain',
          timestamp: Date.now(),
        };
      }

      const tokenAddress = USDC_ADDRESSES[bridgeData.toChain];
      if (!tokenAddress) {
        return {
          nodeId: executeNode.id,
          success: false,
          error: 'USDC not available on target chain',
          timestamp: Date.now(),
        };
      }

      // Determine action type
      const action = executeData.action === 'stake' ? IntentAction.STAKE : IntentAction.LEND;

      // Build BridgeAndExecute parameters
      // IMPORTANT: Use executeData.amount (total amount needed for execution)
      // Avail SDK will automatically determine how much to bridge based on existing balance on target chain
      const params = {
        token: context.token,
        amount: executeData.amount, // Use execute amount, not bridge amount
        toChainId: bridgeData.toChain,
        execute: {
          contractAddress: contractAddress,
          contractAbi: INTENT_EXECUTOR_ABI,
          functionName: 'deposit',
          buildFunctionParams: (
            token: string,
            amount: string,
            chainId: number,
            userAddress: string
          ) => {
            // Convert amount to proper units (6 decimals for USDC)
            // The 'amount' parameter here is the executeData.amount
            const amountWei = ethers.parseUnits(amount, 6);
            return {
              functionParams: [tokenAddress, amountWei, action],
            };
          },
          tokenApproval: {
            token: context.token,
            amount: executeData.amount, // Approve execute amount
          },
        },
        waitForReceipt: true,
      };

      console.log('[ExecutionService] BridgeAndExecute params:', params);

      const result = await this.nexusService.bridgeAndExecute(params as any);

      console.log('[ExecutionService] BridgeAndExecute result:', result);
      console.log('[ExecutionService] Result keys:', Object.keys(result));
      console.log('[ExecutionService] Execute TX hash:', (result as any).executeTransactionHash);
      console.log('[ExecutionService] Execute Explorer URL:', (result as any).executeExplorerUrl);
      console.log('[ExecutionService] Bridge TX hash:', (result as any).bridgeTransactionHash);
      console.log('[ExecutionService] Bridge Explorer URL:', (result as any).bridgeExplorerUrl);

      if (result.success) {
        return {
          nodeId: executeNode.id,
          success: true,
          transactionHash: (result as any).executeTransactionHash || (result as any).bridgeTransactionHash || undefined,
          explorerUrl: (result as any).executeExplorerUrl || (result as any).bridgeExplorerUrl || undefined,
          bridgeExplorerUrl: (result as any).bridgeExplorerUrl,
          bridgeTransactionHash: (result as any).bridgeTransactionHash,
          executeExplorerUrl: (result as any).executeExplorerUrl,
          executeTransactionHash: (result as any).executeTransactionHash,
          timestamp: Date.now(),
        };
      } else {
        return {
          nodeId: executeNode.id,
          success: false,
          error: (result as any).error || 'BridgeAndExecute failed',
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.error('[ExecutionService] BridgeAndExecute failed:', error);
      return {
        nodeId: executeNode.id,
        success: false,
        error: error instanceof Error ? error.message : 'BridgeAndExecute execution failed',
        timestamp: Date.now(),
      };
    }
  }

  private getExplorerUrl(chainId: number, txHash: string): string {
    const explorers: Record<number, string> = {
      11155111: 'https://sepolia.etherscan.io/tx/',
      421614: 'https://sepolia.arbiscan.io/tx/',
      84532: 'https://sepolia.basescan.org/tx/',
    };

    return `${explorers[chainId] || 'https://sepolia.etherscan.io/tx/'}${txHash}`;
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
