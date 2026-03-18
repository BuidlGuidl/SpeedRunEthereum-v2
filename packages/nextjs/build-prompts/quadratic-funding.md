---
name: "Quadratic Funding Pool"
description: "Grant allocation system distributing matching funds based on unique contributor count, not just total raised."
---

# SPEC: Quadratic Funding Pool

## 1. Objective
An always-open grant allocation system where a central matching pool is distributed to projects based on the *number* of unique contributors, not just the total amount raised. Anyone can register a project, anyone can donate, and an admin can trigger matching fund distribution at any time.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `MATCHING_POOL_AMOUNT`: Set dynamically by admin via funding the contract.
- `UI_THEME`: Inspiring crowdfunding layout, dynamic math visualizations.

## 4. Smart Contract Spec
- **Architecture:** Projects registry (with metadata), unique donor tracking per project, matching pool balance, and admin-triggered distribution.
- **Project Registration:** `registerProject(name, description, imageURI)`: stores on-chain metadata and sets `msg.sender` as the project recipient.
- **Donations:** `donate(projectId)`: tracks each donor address per project (for unique contributor count) and the individual amounts. Emits a `Donation` event with donor, projectId, and amount.
- **Matching Distribution:** `distributeMatching()`: admin-only function that calculates each project's share using the square root sum formula and transfers matching funds to project recipients. Resets the matching pool and donor tracking for the next cycle.
- **Matching Pool Funding:** The contract accepts ETH via `fundMatchingPool()` or `receive()`. The admin (and anyone) can add to the matching pool at any time.
- **Agent Autonomy:** Handling square roots on-chain is tricky; implement or mock a safe integer square root function. Handle potential precision loss intelligently.

## 5. Frontend Spec
- **Projects Grid:** Cards showing each project's name, description, image, total raised, unique donor count, and estimated match amount.
- **Project Detail Page:** Full project info, a donate form, and a scrollable donation history showing each contributor and their amount (read from contract events).
- **Live Match Estimator:** When a user types a donation amount, dynamically show how the matching distribution would change. Make the quadratic math feel magical.
- **Admin Panel:** Simple view for the admin to fund the matching pool and trigger `distributeMatching()`. Show current pool balance and a summary of what each project would receive.
- **Agent Autonomy:** Focus heavily on the match estimation UI and the donation history to make the app feel transparent and alive.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Sybil resistance mechanisms (crucial for QF, e.g., requiring specific NFTs or a Passport score).
- [ ] Allowlist / approval flow for project registration.
- [ ] Cart UX: donate to multiple projects in a single transaction.
