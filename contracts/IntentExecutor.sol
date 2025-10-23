// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IntentExecutor
 * @notice Smart contract for executing DeFi intents (Stake, Lend, Swap)
 * @dev This contract allows users to deposit tokens for staking/lending and withdraw them later
 */
contract IntentExecutor is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Supported actions
    enum Action {
        STAKE,
        LEND,
        SWAP
    }

    // User deposit tracking
    struct Deposit {
        address token;
        uint256 amount;
        Action action;
        uint256 timestamp;
    }

    // Mapping from user address to their deposits
    mapping(address => Deposit[]) public userDeposits;

    // Mapping to track total deposits per token
    mapping(address => uint256) public totalDeposited;

    // Events
    event Deposited(
        address indexed user,
        address indexed token,
        uint256 amount,
        Action action,
        uint256 depositId
    );

    event Withdrawn(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 depositId
    );

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Deposit tokens for staking or lending
     * @param token Address of the ERC20 token to deposit
     * @param amount Amount of tokens to deposit
     * @param action The action to perform (STAKE or LEND)
     */
    function deposit(
        address token,
        uint256 amount,
        Action action
    ) external nonReentrant {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(
            action == Action.STAKE || action == Action.LEND,
            "Only STAKE and LEND are supported"
        );

        // Transfer tokens from user to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Record the deposit
        userDeposits[msg.sender].push(
            Deposit({
                token: token,
                amount: amount,
                action: action,
                timestamp: block.timestamp
            })
        );

        totalDeposited[token] += amount;

        uint256 depositId = userDeposits[msg.sender].length - 1;
        emit Deposited(msg.sender, token, amount, action, depositId);
    }

    /**
     * @notice Withdraw deposited tokens
     * @param depositId The ID of the deposit to withdraw
     */
    function withdraw(uint256 depositId) external nonReentrant {
        require(
            depositId < userDeposits[msg.sender].length,
            "Invalid deposit ID"
        );

        Deposit memory userDeposit = userDeposits[msg.sender][depositId];
        require(userDeposit.amount > 0, "Deposit already withdrawn");

        address token = userDeposit.token;
        uint256 amount = userDeposit.amount;

        // Mark as withdrawn by setting amount to 0
        userDeposits[msg.sender][depositId].amount = 0;
        totalDeposited[token] -= amount;

        // Transfer tokens back to user
        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, token, amount, depositId);
    }

    /**
     * @notice Withdraw all deposits for a specific token
     * @param token Address of the token to withdraw
     */
    function withdrawAll(address token) external nonReentrant {
        require(token != address(0), "Invalid token address");

        uint256 totalAmount = 0;
        uint256 depositsLength = userDeposits[msg.sender].length;

        // Calculate total amount and mark deposits as withdrawn
        for (uint256 i = 0; i < depositsLength; i++) {
            if (
                userDeposits[msg.sender][i].token == token &&
                userDeposits[msg.sender][i].amount > 0
            ) {
                totalAmount += userDeposits[msg.sender][i].amount;
                userDeposits[msg.sender][i].amount = 0;
            }
        }

        require(totalAmount > 0, "No deposits to withdraw");

        totalDeposited[token] -= totalAmount;

        // Transfer tokens back to user
        IERC20(token).safeTransfer(msg.sender, totalAmount);

        emit Withdrawn(msg.sender, token, totalAmount, type(uint256).max);
    }

    /**
     * @notice Swap functionality (Coming Soon)
     * @dev This function is not yet implemented
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external pure {
        revert("Swap functionality coming soon");
    }

    /**
     * @notice Get user's deposit count
     * @param user Address of the user
     * @return Number of deposits
     */
    function getDepositCount(address user) external view returns (uint256) {
        return userDeposits[user].length;
    }

    /**
     * @notice Get user's specific deposit details
     * @param user Address of the user
     * @param depositId ID of the deposit
     * @return Deposit details
     */
    function getDeposit(address user, uint256 depositId)
        external
        view
        returns (
            address token,
            uint256 amount,
            Action action,
            uint256 timestamp
        )
    {
        require(depositId < userDeposits[user].length, "Invalid deposit ID");
        Deposit memory d = userDeposits[user][depositId];
        return (d.token, d.amount, d.action, d.timestamp);
    }

    /**
     * @notice Get all active deposits for a user
     * @param user Address of the user
     * @return Array of deposits
     */
    function getUserDeposits(address user)
        external
        view
        returns (Deposit[] memory)
    {
        return userDeposits[user];
    }

    /**
     * @notice Emergency withdrawal by owner (safety mechanism)
     * @param token Address of the token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount)
        external
        onlyOwner
    {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
