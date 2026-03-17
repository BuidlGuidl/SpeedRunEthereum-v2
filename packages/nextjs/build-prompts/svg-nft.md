---
name: "SVG NFT"
description: "Tinker around with cutting edge smart contracts that render SVGs in Solidity."
imageUrl: "/assets/challenges/dynamicSvgNFT.svg"
---

# SPEC: SVG NFT

## 1. Objective
A smart contract that generates and renders SVG artwork entirely on-chain. Each NFT's metadata and image are stored in the contract, with no external dependencies.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `COLLECTION_NAME`: "OnChainArt"
- `COLLECTION_SYMBOL`: "OCA"
- `UI_THEME`: Creative, gallery-style, artistic showcase.

## 4. Smart Contract Spec
- **Architecture:** ERC-721 NFT contract that generates SVG images natively in Solidity.
- **Core Functions:** Mint function with unique generative properties per token. On-chain metadata using base64-encoded JSON (`tokenURI` returns data URI).
- **Agent Autonomy:** You have complete creative freedom over the internal SVG generation logic. Use `abi.encodePacked` or OpenZeppelin Strings to assemble dynamic attributes (colors, shapes, text) based on the Token ID. Ensure the final Base64 JSON and SVG strings are formatted perfectly without breaking newlines.

## 5. Frontend Spec
- **Required Views:** Frontend to mint, view, and transfer NFTs. A personal gallery view to see owned or all minted NFTs.
- **Agent Autonomy:** Build the `UI_THEME` to let the art shine. The frontend MUST correctly fetch, decode, and parse the base64 data URIs from `tokenURI()` so the SVGs render natively and beautifully in the DOM as images without broken links.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Randomized traits using block data or Chainlink VRF
- [ ] Interactive NFTs that change based on on-chain events
- [ ] Composable SVG layers (combine multiple NFTs)
- [ ] On-chain marketplace integration
- [ ] Animation using SVG animate elements
