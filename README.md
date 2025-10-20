# IntentCompass - Visual Cross-Chain Intent Composer

> Design, simulate, and execute multi-step cross-chain DeFi flows with an intuitive visual canvas.

## 🎯 The Problem

Cross-chain DeFi operations are complex and opaque. Users don't know:
- How much a multi-step operation will cost
- Which route will be fastest/cheapest
- What will happen before they execute

Traditional interfaces treat each step separately, requiring multiple approvals and manual coordination.

## 💡 The Solution

**IntentCompass** is a visual canvas where users can:

1. **Design** complex cross-chain flows by dragging and connecting nodes
2. **Simulate** the entire flow to see costs, timing, and routes
3. **Execute** with one click using Avail Nexus SDK's atomic operations

### Example Flow
```
[Start: Base]
  100 USDC
     │
     ▼
[Bridge]
  Base → Optimism
  Cost: $2.50
     │
     ▼
[Execute: Aave Supply]
  Supply to Aave
  Cost: $0.80
     │
     ▼
[End: Optimism]
  Earning 8% APY

Total: $3.30, 35 seconds
```

## ✨ Key Features

### 1. 🎨 Visual Canvas Interface
- Drag-and-drop node-based design powered by React Flow
- Connect operations visually to create multi-step flows
- Real-time validation and suggestions

### 2. 🔍 Pre-Execution Simulation
- See exact costs before committing
- Compare different routes and strategies
- Understand timing and success rates

### 3. ⚡ Atomic Execution
- Execute entire flow in one transaction
- Powered by Avail Nexus SDK's `bridgeAndExecute()`
- No manual coordination between steps

### 4. 💾 Template System
- Save successful flows as templates
- Load pre-built strategies (stake on Aave, etc.)
- Share with the community

### 5. 📊 Rich Node Types
- **Bridge Node**: Move tokens between chains
- **Transfer Node**: Send to any address
- **Execute Node**: Interact with DeFi protocols (Stake, Lend, Swap)

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Canvas**: React Flow (@xyflow/react)
- **Web3**: wagmi, viem, RainbowKit
- **Cross-Chain**: Avail Nexus SDK
- **State**: Zustand

### How It Works

1. **User Designs Flow**: Drag nodes onto canvas, configure parameters, connect with edges
2. **Simulation**: IntentCompass calls Nexus SDK simulation APIs to get cost/time estimates
3. **Preview**: User sees detailed breakdown before execution
4. **Execution**: Flow converted to Nexus SDK calls (`bridge()`, `transfer()`, `bridgeAndExecute()`)
5. **Tracking**: Real-time progress updates as each step executes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Modern web browser
- MetaMask or compatible wallet
- Testnet tokens (see Faucets section)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/intent-compass
cd intent-compass

# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
# Navigate to http://localhost:3000
```

### Get Testnet Tokens

- **Sepolia ETH**: https://sepoliafaucet.com/
- **Base Sepolia ETH**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Avail Tokens**: https://faucet.avail.tools/

## 📖 Usage

### 1. Connect Wallet
Click "Connect Wallet" and authorize your wallet (MetaMask, WalletConnect, etc.)

### 2. Design Your Flow
- Drag nodes from the toolbar to the canvas
- Configure each node (chain, amount, parameters)
- Connect nodes with edges to create a flow

### 3. Simulate
- Click "Simulate" to preview the flow
- See cost breakdown, timing, and routes
- Adjust if needed

### 4. Execute
- Click "Execute" to run the entire flow
- Confirm in your wallet
- Watch real-time progress

### 5. Save as Template
- Click "Save Template" to reuse successful flows
- Name it and add description
- Load anytime from Template Library

## 🎯 Avail Nexus Integration

IntentCompass showcases advanced Nexus SDK features:

### Bridge Operations
```typescript
const result = await sdk.bridge({
  token: 'USDC',
  amount: 100,
  chainId: 84532, // Base Sepolia
});
```

### Bridge & Execute (Atomic Composition)
```typescript
const result = await sdk.bridgeAndExecute({
  toChainId: 10, // Optimism
  contractAddress: AAVE_POOL_ADDRESS,
  contractAbi: AAVE_POOL_ABI,
  functionName: 'supply',
  buildFunctionParams: (token, amount, chainId, userAddress) => {
    return {
      functionParams: [
        tokenAddress,
        parseUnits(amount, 6),
        userAddress,
        0
      ]
    };
  }
});
```

### Intent Preview Hook
```typescript
sdk.setOnIntentHook(({ intent, allow, deny, refresh }) => {
  // Show user preview with costs and details
  showPreview(intent);

  // User can approve or deny
  if (userApproved) allow();
  else deny();
});
```

## 📁 Project Structure

```
intent-compass/
├── app/
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main canvas page
├── components/
│   ├── examples/               # Example/demo components
│   ├── nodes/                  # Node type components
│   │   ├── StartNode.tsx
│   │   ├── BridgeNode.tsx
│   │   ├── TransferNode.tsx
│   │   ├── ExecuteNode.tsx
│   │   └── EndNode.tsx
│   ├── IntentCanvas.tsx        # Main React Flow canvas
│   ├── Toolbar.tsx             # Node dragging toolbar
│   ├── SimulationPanel.tsx     # Simulation results display
│   ├── ExecutionPanel.tsx      # Execution progress tracker
│   ├── TemplateLibrary.tsx     # Template browser
│   └── Header.tsx              # App header
├── contexts/
│   ├── Web3Provider.tsx        # Web3 context
│   └── NexusProvider.tsx       # Nexus SDK context
├── lib/
│   ├── services/
│   │   ├── nexusSDK.ts         # Core Nexus SDK integration
│   │   ├── simulation.ts       # Simulation engine
│   │   ├── execution.ts        # Execution engine
│   │   └── templates.ts        # Template storage/retrieval
│   └── wagmi.ts                # Wagmi configuration
└── types/
    └── flow.ts                 # Flow/node type definitions
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Connect wallet successfully
- [ ] Drag nodes onto canvas
- [ ] Configure node parameters
- [ ] Connect nodes with edges
- [ ] Simulate flow and see costs
- [ ] Execute flow end-to-end
- [ ] Save and load templates

## 🏆 Hackathon Bounties

### Avail Nexus General Track ($4,500)
- ✅ Comprehensive Nexus SDK integration
- ✅ Advanced features: Bridge & Execute, Intent Hooks
- ✅ Visual demonstration of multi-step compositions
- ✅ Unique concept: Visual intent design
- ✅ Production-ready code

## 🔧 Development

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build for production
npm run build
```

## 🐛 Troubleshooting

**Issue**: "Failed to connect wallet"
- **Solution**: Ensure you have a compatible wallet installed (MetaMask, etc.)

**Issue**: "Simulation failed"
- **Solution**: Check that you have sufficient testnet tokens and the nodes are properly configured

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Avail** team for the powerful Nexus SDK
- **React Flow** for the excellent canvas library
- **RainbowKit** for wallet connection UX

## 🔗 Links

- **Demo**: [Coming soon]
- **GitHub**: https://github.com/yourusername/intent-compass
- **Avail Nexus Docs**: https://docs.availproject.org/

---

**Built with ❤️ for the future of cross-chain DeFi**
