---
name: "Dynamic NFT (Tamagotchi)"
description: "Interactive NFT whose metadata and on-chain SVG artwork change based on user interactions over time."
imageUrl: "/assets/challenges/dynamicSvgNFT.svg"
---

# 🏗️ SPEC: Dynamic NFT (Tamagotchi)

## 1. 🎯 Objective
An interactive NFT whose metadata and artwork change based on on-chain interactions or specific conditions over time.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `INTERACTION_FEE`: 0.001 ETH
- `UI_THEME`: Playful, gamified, retro 8-bit aesthetic.

## 4. 📜 Smart Contract Spec
- **Architecture:** ERC-721 contract storing metadata entirely on-chain (base64 encoded JSON and SVG).
- **Core Functions:** A public `interact()` function (e.g., feed/train) requiring a fee. `tokenURI()` override.
- **Agent Autonomy:** You have full creative freedom to generate inline SVG artwork natively in Solidity. Write logic to dynamically return different SVG strings based on the NFT's state/level.

## 5. 🖥️ Frontend Spec
- **Required Views:** Interactive gallery and a detailed view with action buttons to "feed" or "train" the NFT.
- **Agent Autonomy:** Ensure the frontend cleanly decodes and renders the base64 SVG returned from the contract. Add CSS animations to make interactions feel responsive.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Automating state degradation (e.g., "getting hungry") using block timestamps.
- [ ] Changing metadata based on off-chain data via Oracles.
- [ ] Breeding mechanics.
