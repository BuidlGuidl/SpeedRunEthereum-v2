---
name: "Multisig Wallet"
description: "Secure assets by requiring multiple accounts to 'vote' on transactions."
imageUrl: "/assets/build-prompts/multiSig.svg"
featured: true
---

# SPEC: Multisig Wallet

## 1. Objective

A smart contract wallet that requires multiple owners to approve transactions before execution. Users can submit, approve, revoke, and execute transactions with a configurable threshold.

## 2. Pre-flight & Context

- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)

- `INITIAL_OWNERS`: [Address1, Address2, Address3]
- `APPROVAL_THRESHOLD`: 2
- `UI_THEME`: High-security, enterprise-grade vault dashboard with status indicators. Update the SE-2 theme to match.

## 4. Smart Contract Spec

- **Architecture:** Multi-owner wallet tracking an array of owners, a threshold variable, and a mapping of `Transaction` structs (to, value, data, executed, numConfirmations). Include a `receive()` function to accept ETH deposits with event emission.
- **Core Functions:** `submitTransaction()`, `approveTransaction()`, `revokeApproval()`, and `executeTransaction()` for ETH and arbitrary contract call transactions. Owner management functions (`addOwner`, `removeOwner`, `changeThreshold`).
- **Agent Autonomy:** Implement robust security modifiers. **CRITICAL:** Ensure owner management functions can _only_ be called by the wallet contract itself (via a successful multisig execution), not by individual owners directly. Emit comprehensive events for all actions.

## 5. Frontend Spec

- **Required Views:** Dashboard showing wallet balance with deposit tracking, list of current owners, a form to submit new transactions, an owner management panel that auto-encodes calldata for self-targeted multisig proposals — add/remove owner, change threshold — and a queue displaying pending/executed transactions. After a transaction is executed, show the result and a link to the transaction detail. Users can revoke their own approval on pending transactions.
- **Agent Autonomy:** Design the `UI_THEME`. Visually distinguish between transactions that still need the connected user's approval, versus those that have met the threshold and are ready to be executed. Use visual progress bars (e.g., "1/2 Approvals").

## 6. Review

- Always review the generated code and use the grumpy-carlos-code-reviewer agent for that.

## 7. Next Iterations (Builder: ask the agent to add these later)

- [ ] Support for ERC-20 token transfers
- [ ] Time-locked transactions (execution delay after approval)
- [ ] Batch transaction execution
- [ ] Off-chain signature collection (EIP-712)
- [ ] Recovery mechanism if an owner loses access
