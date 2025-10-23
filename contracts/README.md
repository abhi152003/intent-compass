# IntentExecutor Smart Contract Deployment Guide

This guide explains how to deploy the IntentExecutor contract to testnets using Remix IDE.

## Overview

The `IntentExecutor` contract enables users to:
- **Stake tokens** (deposits funds for staking simulation)
- **Lend tokens** (deposits funds for lending simulation)
- **Withdraw funds** (retrieve deposited tokens)
- **View deposits** (check deposit history)

The Swap functionality is marked as "Coming Soon" and will revert if called.

## Prerequisites

### 1. Install MetaMask
- Install [MetaMask](https://metamask.io/) browser extension
- Create a wallet if you don't have one

### 2. Get Testnet ETH
You'll need testnet ETH on the following networks:

**Sepolia:**
- Faucet: https://sepoliafaucet.com/
- Chain ID: 11155111

**Arbitrum Sepolia:**
- Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Chain ID: 421614

**Base Sepolia:**
- Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Chain ID: 84532

### 3. Get Testnet USDC
Get some testnet USDC tokens for testing:

**Sepolia USDC:**
- Address: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- Use Circle's faucet or Uniswap testnet

**Arbitrum Sepolia USDC:**
- Address: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

**Base Sepolia USDC:**
- Address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Contract Dependencies

The contract uses OpenZeppelin contracts. Make sure you have these imports available:
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`
- `@openzeppelin/contracts/security/ReentrancyGuard.sol`
- `@openzeppelin/contracts/access/Ownable.sol`

## Deployment Steps

### 1. Open Remix IDE
Go to [Remix IDE](https://remix.ethereum.org/)

### 2. Create Contract File
1. In the File Explorer, create a new file: `IntentExecutor.sol`
2. Copy the contract code from `contracts/IntentExecutor.sol`
3. Paste it into Remix

### 3. Install Dependencies
Remix will automatically import OpenZeppelin contracts. If you see import errors:
1. Go to the "File Explorer" tab
2. Click on the ".deps" folder
3. Remix should auto-download the dependencies

### 4. Compile Contract
1. Go to the "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.20`
3. Enable "Optimization": 200 runs
4. Click "Compile IntentExecutor.sol"
5. Verify there are no errors

### 5. Deploy on Sepolia

1. **Configure MetaMask:**
   - Switch to Sepolia network
   - Ensure you have testnet ETH

2. **Deploy:**
   - Go to "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Contract: Select "IntentExecutor"
   - Click "Deploy"
   - Confirm transaction in MetaMask

3. **Save Address:**
   - Copy the deployed contract address
   - Save it for later

### 6. Deploy on Arbitrum Sepolia

1. **Add Network to MetaMask** (if not added):
   - Network Name: Arbitrum Sepolia
   - RPC URL: https://sepolia-rollup.arbitrum.io/rpc
   - Chain ID: 421614
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.arbiscan.io

2. **Deploy:**
   - Switch to Arbitrum Sepolia in MetaMask
   - Follow same deployment steps as Sepolia
   - Save the contract address

### 7. Deploy on Base Sepolia

1. **Add Network to MetaMask** (if not added):
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

2. **Deploy:**
   - Switch to Base Sepolia in MetaMask
   - Follow same deployment steps
   - Save the contract address

## Post-Deployment Configuration

After deploying to all three networks, update the contract addresses in your project:

### 1. Create Environment File
Create or update `.env.local` in your project root:

```env
# Sepolia
NEXT_PUBLIC_INTENT_EXECUTOR_SEPOLIA=0xYourSepoliaContractAddress

# Arbitrum Sepolia
NEXT_PUBLIC_INTENT_EXECUTOR_ARBITRUM_SEPOLIA=0xYourArbitrumSepoliaAddress

# Base Sepolia
NEXT_PUBLIC_INTENT_EXECUTOR_BASE_SEPOLIA=0xYourBaseSepoliaAddress
```

### 2. Verify Configuration
The addresses will be automatically loaded from the environment variables in `lib/contracts/intentExecutor.ts`.

## Verify Contracts on Block Explorers (Optional)

### Verify on Sepolia Etherscan:
1. Go to https://sepolia.etherscan.io/
2. Search for your contract address
3. Click "Contract" → "Verify and Publish"
4. Select "Solidity (Single file)"
5. Compiler version: 0.8.20
6. Optimization: Yes, 200 runs
7. Paste the flattened contract code
8. Submit

Repeat for Arbitrum Sepolia (https://sepolia.arbiscan.io/) and Base Sepolia (https://sepolia.basescan.org/).

## Testing the Contract

### Using Remix:

1. **Approve USDC Spending:**
   - Load the USDC contract at the USDC address
   - Call `approve(spender, amount)`
   - spender: Your IntentExecutor contract address
   - amount: Amount in USDC (with 6 decimals)

2. **Deposit Tokens:**
   - Call `deposit(token, amount, action)`
   - token: USDC address
   - amount: Amount in smallest unit (e.g., 100 USDC = 100000000)
   - action: 0 for STAKE, 1 for LEND

3. **Check Deposits:**
   - Call `getDepositCount(user)`
   - Call `getUserDeposits(user)`

4. **Withdraw:**
   - Call `withdraw(depositId)`
   - Or `withdrawAll(token)` to withdraw all deposits

### Using Your App:

1. Connect your wallet
2. Create a flow with:
   - Start node (select chain and token)
   - Bridge node (optional)
   - Execute node (select "Stake" or "Lend")
3. Run simulation to see estimated costs
4. Execute the flow
5. The app will:
   - Approve USDC spending
   - Call the IntentExecutor contract
   - Deposit your tokens

## Contract Functions Reference

### Write Functions:
- `deposit(token, amount, action)` - Deposit tokens for staking/lending
- `withdraw(depositId)` - Withdraw specific deposit
- `withdrawAll(token)` - Withdraw all deposits for a token
- `swap(...)` - Not yet implemented (will revert)

### Read Functions:
- `getDepositCount(user)` - Get number of user deposits
- `getDeposit(user, depositId)` - Get specific deposit details
- `getUserDeposits(user)` - Get all user deposits
- `totalDeposited(token)` - Get total deposited for a token

### Owner Functions:
- `emergencyWithdraw(token, amount)` - Emergency withdrawal (owner only)

## Security Considerations

1. **Testnet Only:** These contracts are for testnet use only
2. **No Real Value:** Never use real mainnet tokens
3. **Audits:** This is a demo contract and has not been audited
4. **Emergency Withdrawal:** The owner can emergency withdraw (you should be the owner)

## Troubleshooting

### "Insufficient allowance" Error:
- Approve USDC spending first using the USDC contract

### "Invalid token address" Error:
- Ensure you're using the correct USDC address for the network

### Transaction Fails:
- Check you have enough ETH for gas
- Ensure you have USDC tokens
- Verify the contract is deployed on the correct network

### Contract Not Showing in App:
- Verify environment variables are set correctly
- Restart your development server
- Check browser console for errors

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all addresses are correct
3. Ensure you're on the correct network
4. Check MetaMask connection

## Next Steps

After deployment:
1. Test deposits and withdrawals in Remix
2. Verify the app can interact with the contract
3. Test the complete flow: Connect → Create Flow → Simulate → Execute
4. Monitor transactions on block explorers

## Future Enhancements

The Swap functionality is marked as "Coming Soon". To implement:
1. Integrate with a DEX aggregator (e.g., 1inch, Uniswap)
2. Add swap routing logic
3. Update the `swap()` function
4. Deploy updated contracts
5. Update contract addresses in the app
