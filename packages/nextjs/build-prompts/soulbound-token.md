---
name: "Soulbound Token (SBT)"
description: "Non-transferable NFTs representing permanent identity, credentials, or reputation on-chain."
imageUrl: "/assets/challenges/tokenization.svg"
---

# 🏗️ SPEC: Soulbound Token (SBT)

## 1. 🎯 Objective
Non-transferable NFTs used to represent permanent identity, credentials, or reputation on-chain.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `CREDENTIAL_NAME`: "Builder Badge"
- `UI_THEME`: Digital diploma, prestige badge showcase.

## 4. 📜 Smart Contract Spec
- **Architecture:** Standard ERC-721 contract mapping.
- **Core Functions:** Admin-only minting to issue credentials. `burn()` function allowing a user to destroy their own SBT.
- **Agent Autonomy:** Explicitly override `transferFrom` and `safeTransferFrom` to revert transactions, enforcing the non-transferable nature.

## 5. 🖥️ Frontend Spec
- **Required Views:** Admin panel to award credentials, and a public "Profile Page" for users to view them.
- **Agent Autonomy:** Design the UI to look like a digital passport or badge showcase. Use Tailwind to make the badges look prestigious (metallic, glowing, etc.).

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Expiration dates for temporary credentials.
- [ ] EIP-5192 standard compliance.
- [ ] User applications/requests for SBTs in the UI.
