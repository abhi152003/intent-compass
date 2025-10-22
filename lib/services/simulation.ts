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

    for (const node of executionOrder) {
      if (node.type === 'start') {
        continue;
      }

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
