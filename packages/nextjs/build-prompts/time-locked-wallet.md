---
name: "Time-Locked Savings Wallet"
description: "Smart contract vault where deposited funds are strictly locked until a specific timestamp has passed."
imageUrl: "/assets/challenges/multiSig.svg"
---

# 🏗️ SPEC: Time-Locked Savings Wallet

## 1. 🎯 Objective
A smart contract vault where a user can deposit funds that strictly cannot be withdrawn until a specific block timestamp has passed.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `DEFAULT_LOCK_TIME`: 30 Days
- `UI_THEME`: Secure bank vault, prominent countdown timers.

## 4. 📜 Smart Contract Spec
- **Architecture:** Mapping of user address to balance, mapping of user address to unlock timestamp.
- **Core Functions:** `deposit()`, `lock()` (sets the release timestamp), `withdraw()`.
- **Agent Autonomy:** The withdrawal must strictly revert if `block.timestamp` is less than the release time. Handle edge cases (e.g. multiple deposits).

## 5. 🖥️ Frontend Spec
- **Required Views:** Deposit interface, lock-duration selector, and a withdrawal view.
- **Agent Autonomy:** Implement a highly visual live countdown timer for locked balances using JavaScript dates. Disable the withdraw button visually until the timer hits exactly zero.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Adding ERC-20 and ERC-721 support.
- [ ] "Dead man's switch" functionality (sends to an heir if the owner doesn't ping the contract periodically).
- [ ] Emergency withdrawal with a heavy percentage fee burned.
