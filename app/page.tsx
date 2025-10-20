'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { IntentCanvas } from '@/components/IntentCanvas';
import { Toolbar } from '@/components/Toolbar';
import { SimulationPanel } from '@/components/SimulationPanel';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { UnifiedBalancePanel } from '@/components/UnifiedBalancePanel';
import { TemplateSaveDialog } from '@/components/TemplateSaveDialog';
import { TemplateLibrary } from '@/components/TemplateLibrary';
import { useFlowStore } from '@/lib/stores/flowStore';
import { simulationService } from '@/lib/services/simulation';
import { executionService } from '@/lib/services/execution';
import { useNexus } from '@/contexts/NexusProvider';

export default function Home() {
  const { isConnected } = useAccount();
  const { nodes, edges, setSimulation, setExecution, updateExecutionStatus, updateNode } = useFlowStore();
  const { nexusService, isInitialized, isInitializing, initializeIfNeeded } = useNexus();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (nexusService) {
      simulationService.init(nexusService);
      executionService.init(nexusService);
    }
  }, [nexusService]);

  const handleSimulate = async () => {
    if (nodes.length === 0) {
      alert('Add some nodes to your flow first!');
      return;
    }

    if (isConnected && !isInitialized && !isInitializing) {
      try {
        await initializeIfNeeded();
      } catch (error) {
        console.error('SDK initialization failed:', error);
      }
    }

    setIsSimulating(true);
    try {
      const simulation = await simulationService.simulateFlow(nodes, edges);
      setSimulation(simulation);

      simulation.nodeResults.forEach((result) => {
        updateNode(result.nodeId, {
          estimatedCost: result.estimatedCost,
          estimatedTime: result.estimatedTime,
        } as any);
      });
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed. Please check your flow configuration.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExecute = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    if (nodes.length === 0) {
      alert('Add some nodes to your flow first!');
      return;
    }

    if (!isInitialized && !isInitializing) {
      try {
        await initializeIfNeeded();
      } catch (error) {
        console.error('SDK initialization failed:', error);
        alert('Failed to initialize Nexus SDK. Using mock execution for demo.');
      }
    }

    setIsExecuting(true);
    updateExecutionStatus('executing');

    try {
      const execution = await executionService.executeFlow(
        nodes,
        edges,
        (nodeId, result) => {
          updateNode(nodeId, {
            status: result.success ? 'completed' : 'failed',
          } as any);
          setExecution({
            ...execution,
            currentNodeId: nodeId,
            nodeResults: [...(execution?.nodeResults || []), result],
          } as any);
        }
      );

      setExecution(execution);
    } catch (error) {
      console.error('Execution failed:', error);
      updateExecutionStatus('failed');
      alert('Execution failed. Please check the console for details.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />

      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-6">
          <h2 className="text-4xl font-bold text-center text-white">
            Welcome to IntentCompass
          </h2>
          <p className="text-xl text-gray-400 text-center max-w-2xl">
            Design, simulate, and execute cross-chain DeFi flows with a visual canvas
          </p>
          <p className="text-gray-500 text-center">
            Connect your wallet to get started
          </p>
        </div>
      ) : (
        <>
          <Toolbar
            onSimulate={isSimulating ? undefined : handleSimulate}
            onExecute={isExecuting ? undefined : handleExecute}
            onSaveTemplate={() => setShowSaveDialog(true)}
            onLoadTemplate={() => setShowLibrary(true)}
          />

          <div className="flex-1 flex">
            <div className="flex-1 relative">
              <IntentCanvas />
            </div>
            <div className="w-96 bg-gray-950 border-l border-gray-800 p-4 space-y-4 overflow-y-auto">
              <UnifiedBalancePanel />
              <SimulationPanel />
              <ExecutionPanel />
            </div>
          </div>
        </>
      )}
      <TemplateSaveDialog isOpen={showSaveDialog} onClose={() => setShowSaveDialog(false)} />
      <TemplateLibrary isOpen={showLibrary} onClose={() => setShowLibrary(false)} />
    </div>
  );
}
