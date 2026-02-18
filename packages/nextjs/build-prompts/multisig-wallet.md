---
name: "Multisig Wallet"
description: "Secure assets by requiring multiple accounts to 'vote' on transactions."
imageUrl: "/assets/challenges/multiSig.svg"
---

Build a Multisig Wallet dApp using Scaffold-ETH 2.

Core idea: A smart contract wallet that requires multiple owners to approve transactions before execution. Users can submit, approve, and execute transactions with a configurable threshold.

Key features:

- Multi-owner wallet with configurable approval threshold (e.g., 2-of-3)
- Submit, approve, and execute ETH/token transfer transactions
- Owner management (add/remove owners, change threshold)
- Transaction history and status tracking in the UI
- Events for all wallet actions

Extensions to consider:

- Support for ERC-20 token transfers
- Time-locked transactions (execution delay after approval)
- Batch transaction execution
- Off-chain signature collection (EIP-712)
- Recovery mechanism if an owner loses access
