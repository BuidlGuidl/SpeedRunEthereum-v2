---
name: "Multisig Wallet"
description: "Secure assets by requiring multiple accounts to 'vote' on transactions."
imageUrl: "/assets/challenges/multiSig.svg"
---

Build a Multisig Wallet dApp using Scaffold-ETH 2.

Check if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

Core idea: A smart contract wallet that requires multiple owners to approve transactions before execution. Users can submit, approve, and execute transactions with a configurable threshold.

Key features:

- Multi-owner wallet with configurable approval threshold (e.g., 2-of-3)
- Submit, approve, and execute ETH/token transfer transactions
- Owner management (add/remove owners, change threshold)
- Transaction history and status tracking in the UI
- Events for all wallet actions

Next iterations to consider:

- Support for ERC-20 token transfers
- Time-locked transactions (execution delay after approval)
- Batch transaction execution
- Off-chain signature collection (EIP-712)
- Recovery mechanism if an owner loses access
