---
name: "Payment Splitter"
description: "Self-serve revenue splitting — create a split, share the address, and let team members claim their share on-chain."
imageUrl: "/assets/challenges/tokenVendor.svg"
---

# 🏗 SPEC: Payment Splitter

## 1. 🎯 Objective
A self-serve revenue splitting product (inspired by 0xSplits). Anyone can create a new split by choosing recipients and percentages, share the split's address to receive payments, and each member can connect their wallet to claim their owed funds.

## 2. 🛠 Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `UI_THEME`: Clean financial dashboard, transparent accounting, visual share breakdowns.

## 4. 📜 Smart Contract Spec
- **Architecture:** A **factory contract** (`SplitFactory`) that deploys individual `Split` contracts. Each `Split` stores its own payees, shares, and balance history.
- **Factory:** `createSplit(payees[], shares[])` — deploys a new `Split` contract and emits a `SplitCreated` event with the new contract address and creator.
- **Split Contract:**
  - `receive()` — accepts incoming ETH. Emits a `PaymentReceived` event with sender and amount.
  - `release(address payee)` — pull-based claim function. Calculates owed funds using *total historical balance* to prevent accounting errors on partial withdrawals. Emits a `FundsReleased` event.
  - `getPayees()`, `getShares()`, `getReleasable(address)` — view functions for the frontend.
- **Agent Autonomy:** Base the splitting math on OpenZeppelin's PaymentSplitter logic — track `totalReceived` and `alreadyReleased[payee]` to calculate owed amounts correctly.

## 5. 🖥 Frontend Spec
- **Create Split Page:** Form to add recipients (address + percentage), with validation that shares sum to 100%. Deploys via the factory. After creation, show the new split's address with a copy button and a link to its detail page.
- **Split Detail Page:** For a given split address, show:
  - **Split config:** List of recipients with their percentage shares (visual bars).
  - **Payment history:** Incoming payments log (from `PaymentReceived` events) — who sent, when, how much.
  - **Prominent split address** with copy button and a "Send payments here" call-to-action.
  - **Member claim section:** If the connected wallet is a payee, show their claimable balance with a prominent "Claim" button, plus their claim history.
- **My Splits View:** Connected wallet sees all splits they are a member of, with their claimable balance in each — one-click claim UX.
- **Agent Autonomy:** Focus on making the split detail page feel transparent and trustworthy. Financial UIs need clarity — use visual bars for share percentages and clear claimed vs. unclaimed breakdowns.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] ERC-20 token splitting.
- [ ] Mutable splits: update shares via multi-sig or admin approval.
- [ ] Integration with NFT contracts for automated royalty splitting.
