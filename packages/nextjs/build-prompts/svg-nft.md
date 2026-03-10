---
name: "SVG NFT"
description: "Tinker around with cutting edge smart contracts that render SVGs in Solidity."
imageUrl: "/assets/challenges/dynamicSvgNFT.svg"
---

Build an SVG NFT dApp using Scaffold-ETH 2.

Check if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

Core idea: A smart contract that generates and renders SVG artwork entirely on-chain. Each NFT's metadata and image are stored in the contract, with no external dependencies.

Key features:

- ERC-721 NFT contract that generates SVG images in Solidity
- On-chain metadata using base64-encoded JSON (tokenURI returns data URI)
- Mint function with unique generative properties per token
- Frontend to mint, view, and transfer NFTs
- SVG rendering with dynamic attributes (colors, shapes, text)

Next iterations to consider:

- Randomized traits using block data or Chainlink VRF
- Interactive NFTs that change based on on-chain events
- Composable SVG layers (combine multiple NFTs)
- On-chain marketplace integration
- Animation using SVG animate elements
