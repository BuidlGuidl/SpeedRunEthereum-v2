---
name: "Token Faucet"
description: "Utility system dripping ERC-20 tokens to users with a strict cooldown timer to prevent abuse."
imageUrl: "/assets/challenges/tokenVendor.svg"
---

# 🏗️ SPEC: Token Faucet

## 1. 🎯 Objective
A utility system that drips a specific amount of custom ERC-20 tokens to users, implementing a strict cooldown timer mapping to prevent abuse.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `DRIP_AMOUNT`: 100 Tokens
- `COOLDOWN_HOURS`: 24
- `UI_THEME`: Utilitarian, clear countdowns, big buttons.

## 4. 📜 Smart Contract Spec
- **Architecture:** Mapping of user addresses to their `lastClaimTime`.
- **Core Functions:** Dispense fixed amount per request. Record timestamp. Admin functions to fund the faucet and adjust cooldowns.
- **Agent Autonomy:** Revert gracefully if a user tries to claim again before their cooldown expires. 

## 5. 🖥️ Frontend Spec
- **Required Views:** A simple, centered landing page with a large "Claim" button.
- **Agent Autonomy:** If the user is on cooldown, dynamically disable the Claim button and show a live countdown timer until their next eligible claim to prevent failed transactions.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Variable drip amounts based on user wallet age.
- [ ] Require users to hold a specific NFT to claim.
- [ ] Sybil resistance via ENS integration.
