---
name: "Fractionalized NFT Vault"
description: "Lock a high-value NFT into a vault and issue ERC-20 tokens representing partial, tradable ownership."
imageUrl: "/assets/challenges/tokenization.svg"
---

# 🏗️ SPEC: Fractionalized NFT Vault

## 1. 🎯 Objective
A protocol that locks a high-value ERC-721 NFT into a vault and issues ERC-20 tokens representing partial, tradable ownership of that asset.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `TOTAL_FRACTIONS`: 10,000
- `UI_THEME`: Premium digital art gallery meets trading terminal.

## 4. 📜 Smart Contract Spec
- **Architecture:** Vault contract that receives/locks an ERC-721 token, linked to an ERC-20 contract.
- **Core Functions:**
  - `depositNFT()` — locks an ERC-721 and mints all ERC-20 fractions to the depositor.
  - `listFractionsForSale(amount, pricePerFraction)` — depositor/holder lists fractions at a fixed ETH price.
  - `buyFractions(amount)` payable — anyone buys listed fractions by sending the correct ETH.
  - `buyout()` — anyone deposits full ETH valuation to unlock the NFT.
  - `claimBuyout()` — fraction holders burn tokens for proportional ETH.
- **Agent Autonomy:** Manage the complex interface interactions (IERC721 receiver). Keep the buyout logic safe and simple.

## 5. 🖥️ Frontend Spec
- **Required Views:** Vault display showing the locked NFT, total shares, user balances, the fraction marketplace (buy/sell), and the buyout interface.
- **Agent Autonomy:** Build the `UI_THEME`. Make the distinction between the underlying NFT asset and the ERC-20 shares visually clear to the user.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Voting mechanism for shareholders to adjust the buyout price.
- [ ] Dividend distribution if the NFT generates yield.
- [ ] AMM integration to trade the fractions.
