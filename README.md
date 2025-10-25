# IntentCompass - Visual Cross-Chain Intent Composer

> Design, simulate, and execute multi-step cross-chain DeFi flows with an intuitive visual canvas.

## Overview

IntentCompass is a visual interface for designing and executing complex cross-chain DeFi operations. Built with Avail Nexus SDK, it enables users to compose multi-step flows, preview costs and timing, and execute everything atomically in a single transaction.

## Key Features

### Visual Canvas Interface
- Drag-and-drop node-based design powered by React Flow
- Connect operations visually to create multi-step flows
- Real-time validation and flow composition

### Pre-Execution Simulation
- Preview exact costs before committing transactions
- Understand timing and execution flow
- Validate flow before execution

### Atomic Execution
- Execute entire flows in coordinated transactions
- Powered by Avail Nexus SDK's advanced features
- Single approval for multi-step operations

### Rich Node Types
- **Start Node**: Define initial chain and token
- **Bridge Node**: Move tokens between chains
- **Transfer Node**: Send tokens to any address
- **Execute Node**: Interact with smart contracts

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Canvas**: React Flow (@xyflow/react)
- **Web3**: wagmi, viem, RainbowKit
- **Cross-Chain**: Avail Nexus SDK & Widgets
- **State Management**: Zustand

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Modern web browser
- MetaMask or compatible Web3 wallet
- Testnet tokens for testing

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd unispend

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Get Testnet Tokens

- **Sepolia ETH**: https://sepoliafaucet.com/
- **Base Sepolia**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Arbitrum Sepolia**: https://faucet.quicknode.com/arbitrum/sepolia

## Usage

### 1. Connect Wallet
Click "Connect Wallet" in the header and authorize your Web3 wallet.

### 2. Design Your Flow
- Click on node types in the toolbar to add them to the canvas
- Double-click nodes to configure parameters (chain, amount, etc.)
- Drag from node handles to create connections between nodes

### 3. Simulate
- Click "Simulate Flow" to preview the execution
- Review estimated costs and timing
- Verify the flow structure

### 4. Execute
- Click "Execute Flow" to run the operation
- Confirm transactions in your wallet
- Monitor execution progress in real-time

## Avail Nexus Integration

IntentCompass leverages advanced Avail Nexus SDK features:

### Bridge Operations
```typescript
const result = await nexusService.bridge({
  token: 'USDC',
  amount: '100',
  toChainId: 84532, // Base Sepolia
});
```

### Bridge & Execute (Atomic Composition)
```typescript
const result = await nexusService.bridgeAndExecute({
  toChainId: 84532,
  bridge: {
    token: 'USDC',
    amount: '100',
    toChainId: 84532,
  },
  execute: {
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    functionName: 'deposit',
    buildFunctionParams: (token, amount) => ({
      functionParams: [tokenAddress, parseUnits(amount, 6), userAddress]
    })
  }
});
```

## Project Structure

```
unispend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main application page
│   └── globals.css             # Global styles
├── components/
│   ├── examples/               # Example components
│   ├── nodes/                  # Flow node components
│   │   ├── StartNode.tsx
│   │   ├── BridgeNode.tsx
│   │   ├── TransferNode.tsx
│   │   └── ExecuteNode.tsx
│   ├── ui/                     # UI components
│   ├── IntentCanvas.tsx        # Main React Flow canvas
│   ├── ExecutionPanel.tsx      # Execution tracking
│   ├── SimulationPanel.tsx     # Simulation results
│   └── UnifiedBalancePanel.tsx # Balance display
├── contexts/
│   ├── Web3Provider.tsx        # Web3 wallet context
│   └── NexusProvider.tsx       # Nexus SDK context
├── lib/
│   ├── services/
│   │   ├── nexusSDK.ts         # Nexus SDK service
│   │   ├── simulation.ts       # Flow simulation
│   │   └── execution.ts        # Flow execution
│   └── stores/
│       └── flowStore.ts        # Zustand flow state
└── types/
    └── flow.ts                 # Type definitions
```

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

## Troubleshooting

### Wallet Connection Issues
- Ensure MetaMask or compatible wallet is installed
- Check that you're on a supported network
- Try refreshing the page

### Simulation Failures
- Verify you have sufficient testnet tokens
- Check that node configurations are correct
- Ensure chains and tokens are compatible

### Execution Failures
- Confirm wallet has enough gas
- Check that all previous steps succeeded
- Review transaction details in wallet

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Avail team for the Nexus SDK and cross-chain infrastructure
- React Flow team for the excellent canvas library
- RainbowKit team for wallet connection components
