---
name: "Decentralized Bounty Board"
description: "Permissionless job board where task creators lock ETH as bounties and workers submit proof of completion."
imageUrl: "/assets/challenges/crowdfunding.svg"
---

# 🏗️ SPEC: Decentralized Bounty Board

## 1. 🎯 Objective
A permissionless job board where task creators lock ETH as a bounty, workers submit proof of completion, and creators release funds.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `PLATFORM_FEE`: 0%
- `UI_THEME`: Kanban-style, gig-economy marketplace.

## 4. 📜 Smart Contract Spec
- **Architecture:** Bounty tracking struct (creator, description, amount, status, winner).
- **Core Functions:** `createBounty()` locking ETH. `submitWork()` providing a URL/text proof. `acceptWork()` to transfer ETH to the worker.
- **Agent Autonomy:** Implement an intuitive status tracking system (e.g., Open, In Progress, Under Review, Completed). Ensure only the creator can accept work.

## 5. 🖥️ Frontend Spec
- **Required Views:** A public board displaying open bounties, a detail view for submissions, and management tools for the creator.
- **Agent Autonomy:** Build the `UI_THEME` using Tailwind. Emphasize clear state indicators (e.g., Green badges for Open, Gray for Paid).

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Decentralized dispute resolution.
- [ ] On-chain reputation/rating system (SBTs) for workers.
- [ ] Partial payments or milestone tracking.
