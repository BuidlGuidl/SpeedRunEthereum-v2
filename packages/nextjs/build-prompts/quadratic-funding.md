---
name: "Quadratic Funding Pool"
description: "Grant allocation system distributing matching funds based on unique contributor count, not just total raised."
imageUrl: "/assets/challenges/crowdfunding.svg"
---

# 🏗️ SPEC: Quadratic Funding Pool

## 1. 🎯 Objective
A grant allocation system where a central matching pool is distributed based on the *number* of unique contributors to a project, rather than just the total amount raised.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `MATCHING_POOL_AMOUNT`: Set dynamically by admin
- `UI_THEME`: Inspiring crowdfunding layout, dynamic math visualizations.

## 4. 📜 Smart Contract Spec
- **Architecture:** Projects registry, unique donor tracking, and Matching pool balance.
- **Core Functions:** `registerProject()`, `donate()`. Smart contract calculates matching using the square root sum formula.
- **Agent Autonomy:** Handling square roots on-chain is tricky; implement or mock a safe integer square root function. Handle potential precision loss intelligently.

## 5. 🖥️ Frontend Spec
- **Required Views:** A grid of active projects, a donation interface, and a real-time UI showing the estimated matching pool distribution.
- **Agent Autonomy:** Focus heavily on the UI math visualization. Show a dynamic "Estimated Match" calculation when a user types in a donation amount to make the quadratic math feel magical.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Sybil resistance mechanisms (crucial for QF, e.g., requiring specific NFTs).
- [ ] End-of-round distribution functions.
- [ ] Allowlist for approved projects.
