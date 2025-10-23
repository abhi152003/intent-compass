import type {
  FlowNode,
  FlowEdge,
  FlowSimulation,
  SimulationResult,
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

export class SimulationService {
  private nexusService: NexusService | null = null;

  init(nexusService: NexusService) {
    this.nexusService = nexusService;
  }

  async simulateFlow(
    nodes: FlowNode[],
    edges: FlowEdge[]
  ): Promise<FlowSimulation> {
    if (nodes.length === 0) {
      throw new Error('Flow must have at least one node');
    }

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

    const nodeResults: SimulationResult[] = [];
    let totalCost = 0;
    let totalTime = 0;

    // Get execution order following the edges
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
        // Simulate bridge + execute as a single operation
        const bridgeData = node.data as BridgeNodeData;
        const executeData = nextNode.data as ExecuteNodeData;

        const result = await this.simulateBridgeAndExecute(
          node,
          nextNode,
          context,
          bridgeData,
          executeData
        );

        // Add results for both nodes with distinct routes
        const bridgeResult: SimulationResult = {
          nodeId: node.id,
          success: result.success,
          estimatedCost: result.estimatedCost,
          estimatedTime: Math.floor(result.estimatedTime / 2), // Half time for bridge
          route: [`Bridge ${context.token} from Chain ${context.currentChain} → ${bridgeData.toChain}`],
        };

        const executeResult: SimulationResult = {
          nodeId: nextNode.id,
          success: result.success,
          estimatedCost: '0', // Cost already included in combined result
          estimatedTime: Math.floor(result.estimatedTime / 2), // Half time for execute
          route: [`${executeData.action.toUpperCase()} ${executeData.amount} ${context.token} on Chain ${bridgeData.toChain}`],
          error: result.error,
        };

        nodeResults.push(bridgeResult, executeResult);

        if (result.success) {
          totalCost += parseFloat(result.estimatedCost);
          totalTime += result.estimatedTime;
        }

        // Update context
        context.currentChain = bridgeData.toChain;

        // Skip the next node since we already simulated it
        i += 2;
      } else {
        // Normal simulation
        const result = await this.simulateNode(node, context);
        nodeResults.push(result);

        if (result.success) {
          totalCost += parseFloat(result.estimatedCost);
          totalTime += result.estimatedTime;
        }

        // Update context after bridge node
        if (node.type === 'bridge') {
          const bridgeData = node.data as BridgeNodeData;
          context.currentChain = bridgeData.toChain;
        }

        i++;
      }
    }

    const successRate = nodeResults.every((r) => r.success) ? 0.98 : 0;

    return {
      totalCost: totalCost.toFixed(2),
      totalTime,
      successRate,
      nodeResults,
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

  private async simulateNode(node: FlowNode, context: FlowContext): Promise<SimulationResult> {
    try {
      switch (node.type) {
        case 'bridge':
          return await this.simulateBridge(node, context);
        case 'transfer':
          return await this.simulateTransfer(node, context);
        case 'execute':
          return await this.simulateExecute(node, context);
        default:
          return {
            nodeId: node.id,
            success: false,
            estimatedCost: '0',
            estimatedTime: 0,
            error: 'Unknown node type',
          };
      }
    } catch (error) {
      return {
        nodeId: node.id,
        success: false,
        estimatedCost: '0',
        estimatedTime: 0,
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }

  private async simulateBridge(node: FlowNode, context: FlowContext): Promise<SimulationResult> {
    const data = node.data as BridgeNodeData;
    const fromChain = context.currentChain;
    const token = context.token;

    if (this.nexusService && this.nexusService.isInitialized()) {
      try {
        console.log('[SimulationService] Using real Nexus SDK for bridge simulation');

        const simulation = await this.nexusService.simulateBridge({
          token: token,
          amount: data.amount,
          toChainId: data.toChain,
        });

        const fees = (simulation as any).intent?.fees || {};
        const totalFee = fees.total || fees.gasSupplied || '0';
        const estimatedCost = typeof totalFee === 'string'
          ? totalFee
          : (Number(totalFee) / 1e18).toFixed(2);

        const estimatedTime = Math.floor(30 + Math.random() * 30);

        return {
          nodeId: node.id,
          success: true,
          estimatedCost,
          estimatedTime,
          route: [`${fromChain}`, 'Avail Nexus', `${data.toChain}`],
        };
      } catch (error) {
        console.error('[SimulationService] Real SDK simulation failed:', error);
      }
    }

    console.log('[SimulationService] Using mock bridge simulation');
    const baseCost = 2.5;
    const amountMultiplier = parseFloat(data.amount) / 100;
    const estimatedCost = (baseCost * (1 + amountMultiplier * 0.1)).toFixed(2);
    const estimatedTime = Math.floor(20 + Math.random() * 20);

    return {
      nodeId: node.id,
      success: true,
      estimatedCost,
      estimatedTime,
      route: [`${fromChain}`, 'Avail Nexus', `${data.toChain}`],
    };
  }

  private async simulateTransfer(node: FlowNode, context: FlowContext): Promise<SimulationResult> {
    const data = node.data as TransferNodeData;
    const currentChain = context.currentChain;
    const token = context.token;

    if (this.nexusService && this.nexusService.isInitialized()) {
      try {
        console.log('[SimulationService] Using real Nexus SDK for transfer simulation');

        const simulation = await this.nexusService.simulateTransfer({
          token: token,
          amount: data.amount,
          toChainId: currentChain,
          recipient: data.recipient,
        });

        const fees = (simulation as any).intent?.fees || {};
        const totalFee = fees.total || fees.gasSupplied || '0';
        const estimatedCost = typeof totalFee === 'string'
          ? totalFee
          : (Number(totalFee) / 1e18).toFixed(2);

        const estimatedTime = Math.floor(5 + Math.random() * 5);

        return {
          nodeId: node.id,
          success: true,
          estimatedCost,
          estimatedTime,
          route: [`Transfer on chain ${currentChain}`],
        };
      } catch (error) {
        console.error('[SimulationService] Real SDK transfer simulation failed:', error);
      }
    }

    console.log('[SimulationService] Using mock transfer simulation');
    const estimatedCost = (0.5 + Math.random() * 0.5).toFixed(2);
    const estimatedTime = Math.floor(5 + Math.random() * 5);

    return {
      nodeId: node.id,
      success: true,
      estimatedCost,
      estimatedTime,
      route: [`Transfer on chain ${currentChain}`],
    };
  }

  private async simulateExecute(node: FlowNode, context: FlowContext): Promise<SimulationResult> {
    const data = node.data as ExecuteNodeData;
    const currentChain = context.currentChain;

    // Swap is not yet implemented
    if (data.action === 'swap') {
      return {
        nodeId: node.id,
        success: false,
        estimatedCost: '0',
        estimatedTime: 0,
        error: 'Swap functionality coming soon',
      };
    }

    // For standalone Execute nodes, use mock simulation
    console.log('[SimulationService] Standalone Execute node detected');
    console.log('[SimulationService] Note: For optimal execution, Execute nodes should follow a Bridge node to use BridgeAndExecute');
    console.log('[SimulationService] Using mock execute simulation');

    const actionCosts = {
      stake: 0.8,
      lend: 1.0,
      swap: 1.5,
    };

    const baseCost = actionCosts[data.action] || 1.0;
    const estimatedCost = (baseCost + Math.random() * 0.5).toFixed(2);
    const estimatedTime = Math.floor(5 + Math.random() * 10);

    return {
      nodeId: node.id,
      success: true,
      estimatedCost,
      estimatedTime,
      route: [`Execute ${data.action} on chain ${currentChain}`],
    };
  }

  private async simulateBridgeAndExecute(
    bridgeNode: FlowNode,
    executeNode: FlowNode,
    context: FlowContext,
    bridgeData: BridgeNodeData,
    executeData: ExecuteNodeData
  ): Promise<SimulationResult> {
    if (!this.nexusService || !this.nexusService.isInitialized()) {
      return {
        nodeId: executeNode.id,
        success: false,
        estimatedCost: '0',
        estimatedTime: 0,
        error: 'Nexus SDK not initialized',
      };
    }

    // Check if swap (not supported yet)
    if (executeData.action === 'swap') {
      return {
        nodeId: executeNode.id,
        success: false,
        estimatedCost: '0',
        estimatedTime: 0,
        error: 'Swap functionality coming soon',
      };
    }

    try {
      console.log('[SimulationService] Simulating BridgeAndExecute for', executeData.action);

      const contractAddress = getIntentExecutorAddress(bridgeData.toChain);
      if (!contractAddress || !isContractDeployed(bridgeData.toChain)) {
        // Fallback to combined mock simulation
        return this.mockBridgeAndExecuteSimulation(bridgeData, executeData, context);
      }

      const tokenAddress = USDC_ADDRESSES[bridgeData.toChain];
      if (!tokenAddress) {
        return this.mockBridgeAndExecuteSimulation(bridgeData, executeData, context);
      }

      // Determine action type
      const action = executeData.action === 'stake' ? IntentAction.STAKE : IntentAction.LEND;

      // Build BridgeAndExecute parameters
      // IMPORTANT: Use executeData.amount (total amount needed for execution)
      // Avail SDK will automatically determine how much to bridge
      const params = {
        token: context.token,
        amount: executeData.amount, // Use execute amount, not bridge amount
        toChainId: bridgeData.toChain,
        execute: {
          contractAddress: contractAddress,
          contractAbi: INTENT_EXECUTOR_ABI,
          functionName: 'deposit',
          buildFunctionParams: (
            _token: string,
            amount: string,
            _chainId: number,
            _userAddress: string
          ) => {
            // Convert amount to proper units (6 decimals for USDC)
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
      };

      console.log('[SimulationService] BridgeAndExecute simulation params:', params);

      const result = await this.nexusService.simulateBridgeAndExecute(params as any);

      console.log('[SimulationService] BridgeAndExecute simulation result:', result);

      // Extract cost and time from simulation
      let totalCost = '5.0';

      // Handle different result structures
      if (typeof (result as any).totalEstimatedCost === 'object' && (result as any).totalEstimatedCost?.total) {
        // SDK returns {total: string, breakdown: {...}}
        totalCost = (result as any).totalEstimatedCost.total;
        console.log('[SimulationService] Extracted total cost:', totalCost);
        console.log('[SimulationService] Cost breakdown:', (result as any).totalEstimatedCost.breakdown);
      } else if (typeof (result as any).totalEstimatedCost === 'string') {
        totalCost = (result as any).totalEstimatedCost;
      } else if (typeof (result as any).totalEstimatedCost === 'number') {
        totalCost = (result as any).totalEstimatedCost.toString();
      } else if ((result as any).metadata?.totalEstimatedCost) {
        totalCost = (result as any).metadata.totalEstimatedCost.toString();
      } else if ((result as any).steps) {
        // Calculate from steps if available
        const steps = (result as any).steps;
        console.log('[SimulationService] Calculating cost from steps:', steps);
      }

      const estimatedTime = Math.floor(40 + Math.random() * 20); // 40-60 seconds

      return {
        nodeId: executeNode.id,
        success: true,
        estimatedCost: totalCost,
        estimatedTime,
        route: [
          `Bridge + ${executeData.action.toUpperCase()} ${executeData.amount} ${context.token} on Chain ${bridgeData.toChain}`
        ],
      };
    } catch (error) {
      console.error('[SimulationService] BridgeAndExecute simulation failed:', error);
      // Fallback to mock
      return this.mockBridgeAndExecuteSimulation(bridgeData, executeData, context);
    }
  }

  private mockBridgeAndExecuteSimulation(
    bridgeData: BridgeNodeData,
    executeData: ExecuteNodeData,
    context: FlowContext
  ): SimulationResult {
    console.log('[SimulationService] Using mock BridgeAndExecute simulation');

    // Combined cost estimation
    const bridgeCost = 2.5 + (parseFloat(bridgeData.amount) / 100) * 0.1;
    const executeCost = executeData.action === 'stake' ? 0.8 : 1.0;
    const totalCost = (bridgeCost + executeCost).toFixed(2);

    const estimatedTime = Math.floor(40 + Math.random() * 20);

    return {
      nodeId: executeData.action,
      success: true,
      estimatedCost: totalCost,
      estimatedTime,
      route: [
        `Bridge ${bridgeData.amount} ${context.token} to Chain ${bridgeData.toChain}`,
        `${executeData.action.toUpperCase()} on target chain`
      ],
    };
  }

  canOptimizeWithBridgeAndExecute(
    nodes: FlowNode[],
    edges: FlowEdge[]
  ): boolean {
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];

      if (currentNode.type === 'bridge' && nextNode.type === 'execute') {
        const connected = edges.some(
          (edge) =>
            edge.source === currentNode.id && edge.target === nextNode.id
        );

        if (connected) {
          return true;
        }
      }
    }

    return false;
  }
}

export const simulationService = new SimulationService();
