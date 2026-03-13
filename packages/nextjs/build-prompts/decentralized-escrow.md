---
name: "Decentralized Escrow"
description: "Hold funds securely between buyer and seller with arbiter-based dispute resolution."
imageUrl: "/assets/challenges/multiSig.svg"
---

# 🏗️ SPEC: Decentralized Escrow

## 1. 🎯 Objective
A smart contract that holds funds securely between a buyer and a seller until the buyer confirms receipt of goods/services, with a designated arbiter to resolve disputes.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `ASSET_TYPE`: Native ETH
- `FEE_PERCENTAGE`: 0%
- `UI_THEME`: Clean, trust-inspiring, modern financial dashboard.

## 4. 📜 Smart Contract Spec
- **Architecture:** Escrow mapping tracking buyer, seller, arbiter addresses, locked amount, and status.
- **Core Functions:** `deposit()` (buyer locks ETH), `approve()` (buyer releases to seller), `refund()` (arbiter resolves to buyer).
- **Agent Autonomy:** You have full creative freedom over the exact state tracking (e.g., using Enums for Status), internal variable names, and event definitions. Ensure strict access control modifiers and reentrancy protections.

## 5. 🖥️ Frontend Spec
- **Required Views:** A creation dashboard to initialize new escrows. A view to manage active, completed, and disputed escrows.
- **Agent Autonomy:** You have full creative freedom over the UI/UX. Use Tailwind CSS and DaisyUI to build the `UI_THEME`. Implement role-based UI (e.g., conditionally render the 'Refund' button only if the connected wallet is the Arbiter).

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Arbiter fee percentage on resolution.
- [ ] Support for ERC-20 tokens instead of just ETH.
- [ ] Time-based auto-release if no dispute is raised.
