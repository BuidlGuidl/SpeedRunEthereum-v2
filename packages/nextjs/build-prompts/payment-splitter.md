---
name: "Payment Splitter"
description: "Shared treasury that automatically tracks and splits incoming ETH among team members by percentage."
imageUrl: "/assets/challenges/tokenVendor.svg"
---

# 🏗️ SPEC: Payment Splitter

## 1. 🎯 Objective
A shared treasury contract that automatically tracks and splits incoming ETH among multiple team members based on pre-defined percentage shares.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `DEFAULT_PAYEES`: [Address1, Address2]
- `DEFAULT_SHARES`: [50, 50]
- `UI_THEME`: Clear financial charts, transparent accounting.

## 4. 📜 Smart Contract Spec
- **Architecture:** Initialization with an array of payees and shares. 
- **Core Functions:** Fallback/receive function to accept incoming ETH. `release()` function to pull owed funds.
- **Agent Autonomy:** Implement the splitting math calculating *total historical balance* to prevent accounting errors on partial withdrawals. You can base this on OpenZeppelin's PaymentSplitter logic.

## 5. 🖥️ Frontend Spec
- **Required Views:** Dashboard showing total received historically, each member's share, and claimable balances.
- **Agent Autonomy:** Build the `UI_THEME`. Use DaisyUI to make a clean financial dashboard. Consider using visual bars to represent ownership shares and claimed vs. unclaimed funds.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] ERC-20 token splitting.
- [ ] Dynamic share adjustment via DAO approval.
- [ ] Integration with an NFT contract for secondary market royalties.
