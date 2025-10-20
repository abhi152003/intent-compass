'use client';

import { NexusSDK, type BridgeParams, type BridgeResult, type TransferParams, type TransferResult, type ExecuteParams, type ExecuteResult, type BridgeAndExecuteParams, type BridgeAndExecuteResult, type SimulationResult, type UserAsset, type ExecuteSimulation, type BridgeAndExecuteSimulationResult, type OnIntentHook, type OnAllowanceHook, type EthereumProvider } from '@avail-project/nexus-core';

class NexusService {
  private sdk: NexusSDK | null = null;
  private initialized = false;

  async initialize(provider: EthereumProvider): Promise<void> {
    if (this.initialized && this.sdk) {
      console.log('[NexusService] SDK already initialized, skipping...');
      return;
    }

    try {
      console.log('[NexusService] Starting SDK initialization...');
      console.log('[NexusService] Provider type:', typeof provider);
      console.log('[NexusService] Provider has .on:', typeof provider.on === 'function');
      console.log('[NexusService] Provider has .request:', typeof provider.request === 'function');

      if (!this.sdk) {
        console.log('[NexusService] Creating new NexusSDK instance...');
        this.sdk = new NexusSDK({
          network: 'testnet',
        });
        console.log('[NexusService] NexusSDK instance created');
      } else {
        console.log('[NexusService] Reusing existing NexusSDK instance');
      }

      console.log('[NexusService] localStorage keys before init:', Object.keys(localStorage).filter(k =>
        k.includes('arcana') || k.includes('siwe') || k.includes('ca-') || k.includes('session')
      ));

      console.log('[NexusService] Calling sdk.initialize()...');
      await this.sdk.initialize(provider);
      this.initialized = true;

      console.log('[NexusService] localStorage keys after init:', Object.keys(localStorage).filter(k =>
        k.includes('arcana') || k.includes('siwe') || k.includes('ca-') || k.includes('session')
      ));

      console.log('✅ [NexusService] SDK initialized successfully');
    } catch (error) {
      console.error('[NexusService] Failed to initialize Nexus SDK:', error);
      console.error('[NexusService] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      this.initialized = false;
      this.sdk = null;
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.sdk !== null;
  }

  async getUnifiedBalances(): Promise<UserAsset[]> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.getUnifiedBalances();
  }

  async getUnifiedBalance(symbol: string): Promise<UserAsset | undefined> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    return await this.sdk.getUnifiedBalance(symbol);
  }

  async bridge(params: {
    token: string;
    amount: string;
    toChainId: number;
  }): Promise<BridgeResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    console.log('[NexusService] Bridge parameters:', {
      token: params.token,
      amount: params.amount,
      toChainId: params.toChainId,
    });

    const bridgeParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
    };

    console.log('[NexusService] Sending to Nexus SDK:', bridgeParams);

    try {
      const result = await this.sdk.bridge(bridgeParams as BridgeParams);
      console.log('[NexusService] Bridge response:', result);
      return result;
    } catch (error) {
      console.error('[NexusService] Bridge error:', {
        message: error instanceof Error ? error.message : String(error),
        error,
      });
      throw error;
    }
  }

  async getSupportedRoutes(): Promise<unknown> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    try {
      console.log('[NexusService] 🔍 Starting comprehensive route diagnostics...');
      
      const utils = this.getUtils();
      console.log('[NexusService] SDK utilities available:', utils);

      const adapter = (utils as any).adapter;
      if (adapter) {
        console.log('[NexusService] ✅ ChainAbstractionAdapter found');
        console.log('[NexusService] Adapter properties:', Object.keys(adapter));

        if (adapter.bridgeService) {
          console.log('[NexusService] ✅ BridgeService found');
          console.log('[NexusService] BridgeService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(adapter.bridgeService)));
          
          if (typeof (adapter.bridgeService as any).getSupportedRoutes === 'function') {
            const routes = await (adapter.bridgeService as any).getSupportedRoutes();
            console.log('[NexusService] 📋 Supported routes from bridgeService:', routes);
            return { source: 'bridgeService.getSupportedRoutes', data: routes };
          }

          if ((adapter.bridgeService as any).universes) {
            console.log('[NexusService] 📋 Universes from bridgeService:', (adapter.bridgeService as any).universes);
            return { source: 'bridgeService.universes', data: (adapter.bridgeService as any).universes };
          }

          console.log('[NexusService] BridgeService full object:', adapter.bridgeService);
        }

        if (typeof utils.getTestnetTokenMetadata === 'function') {
          console.log('[NexusService] ✅ getTestnetTokenMetadata found');
          try {
            const usdcMeta = utils.getTestnetTokenMetadata('USDC');
            const usdtMeta = utils.getTestnetTokenMetadata('USDT');
            const ethMeta = utils.getTestnetTokenMetadata('ETH');
            console.log('[NexusService] 📋 Testnet token metadata:', { USDC: usdcMeta, USDT: usdtMeta, ETH: ethMeta });
            return { source: 'testnetTokenMetadata', data: { USDC: usdcMeta, USDT: usdtMeta, ETH: ethMeta } };
          } catch (e) {
            console.log('[NexusService] Error getting token metadata:', e);
          }
        }

        if (typeof utils.getChainMetadata === 'function') {
          console.log('[NexusService] ✅ getChainMetadata found');
          try {
            const chains: any[] = [11155111, 84532, 421614];
            const metadata = chains.map(chainId => ({
              chainId,
              meta: (utils.getChainMetadata as any)(chainId)
            }));
            console.log('[NexusService] 📋 Chain metadata:', metadata);
            return { source: 'chainMetadata', data: metadata };
          } catch (e) {
            console.log('[NexusService] Error getting chain metadata:', e);
          }
        }
      }

      console.log('[NexusService] Trying direct SDK properties...');
      const sdkKeys = Object.getOwnPropertyNames(this.sdk).slice(0, 20);
      console.log('[NexusService] SDK keys (first 20):', sdkKeys);
      
      if ((this.sdk as any).routes) {
        console.log('[NexusService] 📋 Routes found on SDK:', (this.sdk as any).routes);
        return { source: 'sdk.routes', data: (this.sdk as any).routes };
      }

      if ((this.sdk as any).config) {
        console.log('[NexusService] 📋 Config found on SDK:', (this.sdk as any).config);
        return { source: 'sdk.config', data: (this.sdk as any).config };
      }

      console.log('[NexusService] ⚠️ No standard route/support methods found on SDK');
      console.log('[NexusService] Full SDK object (for advanced debugging):', this.sdk);
      return { source: 'none', data: 'No standard methods found - check console for full SDK object' };
    } catch (error) {
      console.error('[NexusService] Error getting routes:', error);
      console.error('[NexusService] Full error:', { message: error instanceof Error ? error.message : String(error), error });
      throw error;
    }
  }

  async simulateBridge(params: {
    token: string;
    amount: string;
    toChainId: number;
  }): Promise<SimulationResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const bridgeParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
    };

    console.log('[NexusService] Simulating bridge with params:', bridgeParams);

    try {
      return await this.sdk.simulateBridge(bridgeParams as BridgeParams);
    } catch (error) {
      console.error('[NexusService] Simulation error:', error);
      throw error;
    }
  }

  async transfer(params: {
    token: string;
    amount: string;
    toChainId: number;
    recipient: string;
  }): Promise<TransferResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const transferParams: TransferParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
      recipient: params.recipient as `0x${string}`,
    } as TransferParams;

    return await this.sdk.transfer(transferParams);
  }

  async simulateTransfer(params: {
    token: string;
    amount: string;
    toChainId: number;
    recipient: string;
  }): Promise<SimulationResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const transferParams: TransferParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
      recipient: params.recipient as `0x${string}`,
    } as TransferParams;

    return await this.sdk.simulateTransfer(transferParams);
  }

  async execute(params: ExecuteParams): Promise<ExecuteResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.execute(params);
  }

  async simulateExecute(params: ExecuteParams): Promise<ExecuteSimulation> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.simulateExecute(params);
  }

  async bridgeAndExecute(params: BridgeAndExecuteParams): Promise<BridgeAndExecuteResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.bridgeAndExecute(params);
  }

  async simulateBridgeAndExecute(params: BridgeAndExecuteParams): Promise<BridgeAndExecuteSimulationResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.simulateBridgeAndExecute(params);
  }

  setOnIntentHook(callback: OnIntentHook): void {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    this.sdk.setOnIntentHook(callback);
  }

  setOnAllowanceHook(callback: OnAllowanceHook): void {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    this.sdk.setOnAllowanceHook(callback);
  }

  onProgress(callback: (event: string, data: unknown) => void): void {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    this.sdk.nexusEvents.on('expected_steps', (steps) => {
      callback('expected_steps', steps);
    });

    this.sdk.nexusEvents.on('step_complete', (step) => {
      callback('step_complete', step);
    });

    this.sdk.nexusEvents.on('bridge_execute_expected_steps', (steps) => {
      callback('bridge_execute_expected_steps', steps);
    });

    this.sdk.nexusEvents.on('bridge_execute_completed_steps', (step) => {
      callback('bridge_execute_completed_steps', step);
    });
  }

  getUtils() {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return this.sdk.utils;
  }

  async testSupportedRoutes(): Promise<{
    testedRoutes: Array<{ from: number; to: number; token: string; success: boolean; error?: string }>;
    workingRoutes: Array<{ from: number; to: number; token: string }>;
  }> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const testedRoutes: Array<{ from: number; to: number; token: string; success: boolean; error?: string }> = [];
    const workingRoutes: Array<{ from: number; to: number; token: string }> = [];

    const chains = [
      { id: 11155111, name: 'Sepolia' },
      { id: 84532, name: 'Base Sepolia' },
      { id: 421614, name: 'Arbitrum Sepolia' },
    ];

    const tokens = ['USDC', 'USDT', 'ETH'];

    console.log('[NexusService] 🧪 Starting route discovery tests...');
    console.log(`[NexusService] Testing ${chains.length} chains × ${tokens.length} tokens = ${chains.length * chains.length * tokens.length} combinations`);

    for (const fromChain of chains) {
      for (const toChain of chains) {
        if (fromChain.id === toChain.id) continue;

        for (const token of tokens) {
          const testRoute = {
            from: fromChain.id,
            to: toChain.id,
            token,
            success: false as boolean,
            error: undefined as string | undefined,
          };

          try {
            console.log(
              `[NexusService] Testing: ${fromChain.name}(${fromChain.id}) → ${toChain.name}(${toChain.id}), ${token}`
            );

            const result = await this.sdk.simulateBridge({
              token,
              amount: 1,
              chainId: toChain.id,
              sourceChainId: fromChain.id,
            } as any);

            if (result && (result as any).success !== false) {
              testRoute.success = true;
              workingRoutes.push({ from: fromChain.id, to: toChain.id, token });
              console.log(`[NexusService] ✅ ROUTE WORKS: ${fromChain.name} → ${toChain.name} (${token})`);
            } else {
              testRoute.error = (result as any).error || 'Unknown error';
              console.log(`[NexusService] ❌ Route failed: ${testRoute.error}`);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            testRoute.error = errorMsg;
            console.log(`[NexusService] ❌ Route test error: ${errorMsg}`);
          }

          testedRoutes.push(testRoute);
        }
      }
    }

    console.log('[NexusService] 🧪 Route discovery complete!');
    console.log(`[NexusService] 📊 Found ${workingRoutes.length} working routes:`, workingRoutes);

    return { testedRoutes, workingRoutes };
  }

  async deinit(): Promise<void> {
    if (this.sdk) {
      await this.sdk.deinit();
      this.sdk = null;
      this.initialized = false;
    }
  }
}

// Singleton instance
let nexusServiceInstance: NexusService | null = null;

export function getNexusService(): NexusService {
  if (!nexusServiceInstance) {
    nexusServiceInstance = new NexusService();
  }
  return nexusServiceInstance;
}

export { NexusService };
