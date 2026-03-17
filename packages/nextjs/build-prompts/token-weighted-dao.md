---
name: "Token-Weighted DAO"
description: "Decentralized governance where token holders submit proposals and vote with automatic execution."
imageUrl: "/assets/challenges/zkVoting.svg"
---

# SPEC: Token-Weighted DAO

## 1. Objective
A decentralized organization where token holders can submit proposals and vote on them, with the contract automatically executing passing proposals.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `PROPOSAL_THRESHOLD`: 100 Tokens
- `VOTING_PERIOD_BLOCKS`: 100
- `UI_THEME`: Serious, forum-like, governance-focused (like Snapshot).

## 4. Smart Contract Spec
- **Architecture:** Governance ERC-20 token and a DAO execution contract.
- **Core Functions:** `createProposal(target, value, calldata)`, `castVote(For/Against)` weighted by token balance, and `execute()`.
- **Agent Autonomy:** You handle the vote tallying logic safely to prevent double-voting. Use `.call` securely for execution.

## 5. Frontend Spec
- **Required Views:** Interface to mint test tokens, view active/past proposals, cast votes, and execute passed proposals.
- **Agent Autonomy:** Design the `UI_THEME`. Use visual indicators (like DaisyUI progress bars) to show For vs. Against vote weights clearly on each proposal card. Decode the calldata so users know what they are voting on.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Timelock controller for execution delays.
- [ ] Quadratic voting mechanics.
- [ ] Vote delegation (liquid democracy).
