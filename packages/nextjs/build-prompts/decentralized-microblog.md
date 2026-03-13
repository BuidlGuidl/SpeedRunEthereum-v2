---
name: "Decentralized Microblogging"
description: "Censorship-resistant social feed where short messages are stored permanently on the blockchain."
imageUrl: "/assets/challenges/state.svg"
---

# 🏗️ SPEC: Decentralized Microblogging

## 1. 🎯 Objective
A censorship-resistant social feed where short messages are stored permanently on the Ethereum blockchain.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `MAX_CHARS`: 280
- `UI_THEME`: Minimalist, clean Twitter/X clone.

## 4. 📜 Smart Contract Spec
- **Architecture:** Minimal state variables.
- **Core Functions:** `createPost(string content)` function. A `tipAuthor()` payable function.
- **Agent Autonomy:** Keep the contract ultra-lean. Rely entirely on emitting Events (`NewPost`) for storage rather than state variable arrays to save massive amounts of gas.

## 5. 🖥️ Frontend Spec
- **Required Views:** Chronological feed of posts and an input form for new posts.
- **Agent Autonomy:** Use viem/wagmi hooks to index and display past events efficiently on load. Include a "Tip" button on each mapped post. Format timestamps nicely.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] IPFS integration for storing longer posts or images.
- [ ] Replying and thread functionality.
- [ ] Profile metadata mapping to addresses.
