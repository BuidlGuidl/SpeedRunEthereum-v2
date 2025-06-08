---
title: "How to Create an ERC20 Token: Complete Solidity Tutorial"
description: "Step-by-step guide to creating your own ERC20 token in Solidity. Learn the standard, write the contract, and deploy to Ethereum. Includes code, security tips, and best practices."
image: "/assets/guides/create-erc20-token.jpg"
---

Want to launch your own digital currency or utility token on the Ethereum blockchain? This guide provides a comprehensive walkthrough on **how to create an ERC20 token using Solidity**. An ERC20 token is the most widely adopted standard for fungible (interchangeable) tokens on Ethereum, making them essential building blocks for countless decentralized applications (dApps).

We'll cover the core concepts of the ERC20 standard, show you how to write the smart contract code using the secure OpenZeppelin library, and discuss how to get it onto the blockchain. This tutorial will equip you with the foundational knowledge needed before tackling more advanced projects, such as building a token vending machine (as in SpeedRunEthereum's [Token Vendor challenge](https://speedrunethereum.com/challenge/token-vendor)) or creating your own decentralized exchange ([Minimum Viable Exchange challenge](https://speedrunethereum.com/challenge/minimum-viable-exchange)).

## What Is an ERC20 Token?

An **ERC20 token** is a smart contract deployed on the Ethereum (or other EVM compatible) blockchain that adheres to a specific technical standard (ERC-20). This standard defines a common set of rules and functions that all compliant tokens must implement. "Fungible" means each token is identical to and interchangeable with any other token of the same type, like how one US dollar is the same as any other US dollar.

This standardization is incredibly powerful because it ensures interoperability. Any ERC20 token can be easily supported by Ethereum wallets (like MetaMask), crypto exchanges, and other dApps without requiring custom integrations for each new token. Popular examples include stablecoins like USDC and DAI, or utility tokens like Chainlink's LINK.

### Common use cases:

- Digital currencies (e.g., USDC, DAI)

- Utility tokens for dApps

- Governance tokens for DAOs

- Staking and rewards

### Key Features & Functions Defined by the ERC20 Standard:

- `name()` (Optional but Recommended): Returns the human-readable name of the token (e.g., "My Awesome Token").
- `symbol()` (Optional but Recommended): Returns the ticker symbol for the token (e.g., "MAT").
- `decimals()` (Optional but Recommended): Returns the number of decimal places the token uses. Typically 18, similar to Ether's divisibility (1 Ether \= 10<sup>18</sup> wei).
- `totalSupply()`: Returns the total amount of tokens in existence.
- `balanceOf(address account)`: Returns the token balance of a specified `account`.
- `transfer(address recipient, uint256 amount)`: Transfers `amount` tokens from the caller's (`msg.sender`) balance to the `recipient`. Must emit a `Transfer` event.
- `approve(address spender, uint256 amount)`: Allows the token owner (`msg.sender`) to authorize a `spender` (another address or contract) to withdraw up to `amount` tokens from their account. Must emit an `Approval` event.
- `allowance(address owner, address spender)`: Returns the remaining number of tokens the `spender` is still allowed to withdraw from the `owner`.
- `transferFrom(address sender, address recipient, uint256 amount)`: Allows an approved `spender` to transfer `amount` tokens from the `sender`'s account to a `recipient`. This is used after an `approve` call. Must emit a `Transfer` event.

**Events:**

- `Transfer(address indexed from, address indexed to, uint256 value)`: Emitted when tokens are transferred, including zero value transfers and minting/burning.
- `Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when an allowance is set by an `approve` call

## Good to have before starting

- A basic understanding of blockchain concepts and Ethereum.
- Familiarity with Solidity programming basics (variables, functions, contracts) will be helpful. Check solidity by example [here](https://solidity-by-example.org/).
- Node.js and npm/yarn installed if you choose a local development setup (see "Setting Up Your Environment" below).

## Crafting Your ERC20 Token: The Solidity Smart Contract

We'll use the OpenZeppelin Contracts library, which provides secure and battle-tested implementations of ERC standards.

Create a file named `YourToken.sol`. Here's the code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Optional: For owner-only functions like minting

/**
 * @title YourToken
 * @dev A simple ERC20 token with a fixed initial supply minted to the deployer.
 *      Optionally includes an owner-controlled minting function.
 */
contract YourToken is ERC20, Ownable {
    /**
     * @dev Constructor to set up the token.
     * @param name_ The name of the token (e.g., "My Awesome Token").
     * @param symbol_ The symbol of the token (e.g., "MAT").
     * @param initialSupply_ The total number of tokens to create initially (e.g., 1000000 for one million tokens).
     *        The deployer of the contract will receive all initial tokens.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        // The ERC20 standard typically uses 'decimals' to represent token divisibility.
        // OpenZeppelin's ERC20 contract defaults to 18 decimals.
        // To mint 'initialSupply_' whole tokens, we multiply by 10 raised to the power of 'decimals()'.
        // Example: If initialSupply_ is 1000 and decimals() is 18, we mint 1000 * (10**18) base units.
        _mint(msg.sender, initialSupply_ * (10 ** decimals()));
    }

    /**
     * @notice OPTIONAL: Allows the contract owner to mint more tokens.
     * @dev If you want a fixed supply, remove this function and the Ownable inheritance/constructor argument.
     * @param to The address that will receive the new tokens.
     * @param amount The amount of new tokens to mint (in whole units).
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** decimals()));
    }
}
```

**Code Breakdown:**

- `// SPDX-License-Identifier: MIT`: A license identifier, good practice for open source.

- `pragma solidity ^0.8.20;`: Specifies the Solidity compiler version. Use a recent, stable version compatible with your OpenZeppelin Contracts version.

- `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";`: Imports the standard ERC20 implementation from OpenZeppelin. This provides all the core functions and events.

- `import "@openzeppelin/contracts/access/Ownable.sol";`: (Optional) Imports OpenZeppelin's `Ownable` contract for managing administrative privileges. If you want a token with a strictly fixed supply determined at deployment, you can remove this import, the `Ownable` inheritance, the `Ownable(msg.sender)` call in the constructor, and the `mint` function.

- `contract YourToken is ERC20, Ownable { ... }`: Defines our contract `YourToken`, inheriting from `ERC20` (and `Ownable` if included). This means our contract gets all their features.

- **Constructor (`constructor(...)`)**:

  - This special function runs only once when the contract is deployed.

  - `ERC20(name_, symbol_)`: Calls the constructor of the parent `ERC20` contract, setting the token's name and symbol.

  - `Ownable(msg.sender)`: (If `Ownable` is used) Sets the address deploying the contract (`msg.sender`) as the initial owner, granting them permission to call `onlyOwner` functions.

  - `_mint(msg.sender, initialSupply_ * (10**decimals()));`: This is where the tokens are created.

    - `_mint`: An internal function from OpenZeppelin's `ERC20.sol` that creates new tokens and assigns them to an address. It should only be called from within the contract or its derivatives.
    - `msg.sender`: The address deploying the contract. They receive all the initially minted tokens.
    - `initialSupply_ * (10**decimals())`: This calculates the actual number of smallest token units. `decimals()` (from OpenZeppelin's `ERC20.sol`) usually returns 18. So, to mint 1,000,000 whole tokens, you're minting 1,000,000 times 10<sup>18</sup> base units. This is crucial for representing fractional tokens on-chain, as Solidity and the EVM only handle integers.

- **Optional `mint` function**:
  - `function mint(address to, uint256 amount) public onlyOwner { ... }`: If you included `Ownable`, this function allows the contract owner to create more tokens after initial deployment. The `onlyOwner` modifier restricts its use to the owner. If you want a fixed supply token, you should remove this function.

## Setting Up Your Development Environment

To compile, deploy, and test your `YourToken.sol` contract, you'll need a development environment. Here are a couple of popular options:

1. **Remix IDE:**
   - **What it is:** A powerful, browser-based IDE for Ethereum smart contract development. It's excellent for quickly writing, compiling, deploying, and debugging contracts without any local setup.
   - **How to use:** Visit [remix.ethereum.org](https://www.google.com/search?q=https://remix.ethereum.org). You can paste the `YourToken.sol` code (including the OpenZeppelin imports, which Remix can resolve) directly into a new file, compile it, and deploy it to various test networks or a simulated environment from the "Deploy & Run Transactions" tab.
   - **Great for:** Beginners, quick experiments, and direct testnet interaction.
2. **Local Development with Hardhat (e.g., via Scaffold-ETH 2):**
   - **What it is:** For more complex projects or a professional workflow, a local setup using Hardhat is common. Hardhat is an Ethereum development environment that facilitates compiling, deploying, testing, and debugging.
   - **Scaffold-ETH 2:** A great starting point, it bundles Hardhat with a pre-configured frontend (Next.JS) and many useful scripts, allowing you to get up and running quickly. [Scaffold-ETH 2 repository](https://github.com/scaffold-eth/scaffold-eth-2).
   - **How it works (general approach):** You'd typically place your .sol files in a contracts directory, write deployment scripts, and use command-line tasks to compile, deploy, and test.
   - **Quick setup with Scaffold-ETH 2:** The SpeedRunEthereum challenges, like the [Token Vendor challenge](https://speedrunethereum.com/challenge/token-vendor), provide excellent, step-by-step instructions on cloning and setting up a Scaffold-ETH 2 environment. It will speed up your development and learning process.

Choose the environment that best suits your current needs. For this tutorial, the Solidity code remains the same regardless of your choice.

## Compiling, Deploying, and Interacting with Your Token

Once you have your `YourToken.sol` code and an environment set up:

1. **Compilation:**
   - Your Solidity code needs to be compiled into Ethereum Virtual Machine (EVM) bytecode.
   - In Remix, this is done via the "Solidity compiler" tab.
   - In Scaffold-ETH 2, run `yarn compile` in your terminal.
2. **Deployment:**
   - This step pushes your compiled contract onto the blockchain (either a local testnet, a public testnet like Sepolia, or the Ethereum mainnet).
   - In Remix, you'd use the "Deploy & Run Transactions" tab, select your contract, provide constructor arguments (name, symbol, initial supply), and deploy. You'll need test Ether in your wallet if deploying to a public testnet.
   - In Scaffold-ETH 2, run `yarn deploy` in your terminal (after running your local blockchain with `yarn chain` in another terminal).
3. **Interaction:**
   - After deployment, you'll get a contract address.
   - **Remix:** You can interact with your deployed contract directly in Remix's "Deployed Contracts" section.
   - **Wallets:** Add the token to MetaMask (or another wallet) using its contract address to see your balance. You'll need to be on the correct network.
   - **Etherscan (or other block explorers):** On public testnets/mainnet, you can view your contract and its transactions on a block explorer like Etherscan by searching for its address.
   - **Scaffold-ETH 2 Frontend:** In a Scaffold-ETH 2 setup, the provided frontend allows interaction directly from the "Debug Contracts" tab.
   - You can also use [Abi Ninja](https://abi.ninja/) tool to interact with the contract.

## ERC20 Token Flow: How Transfers and Approvals Work

**Transfer:**

1. User calls `transfer(to, amount)`.

2. Contract checks sender’s balance.

3. Updates balances and emits a `Transfer` event.

**Approve/transferFrom:**

1. Owner calls `approve(spender, amount)`.

2. Spender calls `transferFrom(owner, to, amount)`.

3. Contract checks allowance and balances, updates them, and emits events.

## Important Tips and Best Practices

- **Use OpenZeppelin if you are not a solidity wizard:** For standard contracts like ERC20, rely on OpenZeppelin's audited and community-vetted implementations. This significantly reduces security risks.
- **Understand decimals:** The decimals property (defaulting to 18) is crucial. Remember that on-chain amounts are typically handled in their smallest unit (e.g., 1 token = 1 times 10<sup>18</sup> base units). User interfaces then use the decimals value for display.
- **Fixed Supply vs. Mintable:** Decide if your token needs a fixed supply created only at deployment, or if an owner should be able to mint more tokens later. Our example includes an optional mint function protected by Ownable. For a strictly fixed supply, remove the mint function and Ownable related code.
- **Ownership and Access Control:** If you have administrative functions (like mint), secure the owner account. For production systems, consider transferring ownership to a multisig wallet or a DAO to decentralize control and reduce single points of failure. You can also use [OpenZeppelin's Ownable](https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable) contract to manage ownership.
- **Thorough Testing:** Write comprehensive tests for your contract, especially if you add custom logic beyond the standard ERC20. Test all functions, edge cases, and interactions on a local blockchain and a public testnet.
- **Verify on Block Explorers:** When deploying to a public network (testnet or mainnet), verify your contract's source code on a block explorer like Etherscan. This builds trust and transparency, allowing users to inspect your code. With Scaffold-ETH 2, you can verify your contract on Etherscan by running `yarn verify` in your terminal.

🚀 **Ready to apply this knowledge?**

The ERC20 token you've designed is the perfect starting point for more advanced challenges on SpeedRunEthereum:

- [**Token Vendor Challenge**](https://speedrunethereum.com/challenge/token-vendor)**:** Take the token you just conceptualized and build a TokenVendor.sol smart contract. This vendor will act like a vending machine, selling your ERC20 tokens to users in exchange for ETH.
- [**Minimum Viable Exchange (DEX) Challenge**](https://speedrunethereum.com/challenge/minimum-viable-exchange)**:** Go even further by building a basic decentralized exchange. Users will be able to trade ETH for your token and your token back for ETH, learning about liquidity provision and automated market-making concepts.

These hands-on challenges will solidify your understanding and show you how ERC20 tokens are integrated into real-world decentralized applications. Happy coding!
