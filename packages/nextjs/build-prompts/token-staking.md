---
name: "Token Staking Protocol"
description: "Lock ERC-20 tokens to earn yield rewards over time with a DeFi staking mechanism."
imageUrl: "/assets/build-prompts/token-staking.png"
---

# SPEC: Token Staking Protocol

## 1. Objective
A DeFi mechanism where users lock up a base ERC-20 token to earn a second "Reward" ERC-20 token over time.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `STAKING_TOKEN_NAME`: "StakeCoin"
- `REWARD_TOKEN_NAME`: "YieldCoin"
- `UI_THEME`: Dark mode DeFi aesthetic with neon accents.

## 4. Smart Contract Spec
- **Architecture:** Two ERC-20 token contracts (Staking and Reward).
- **Core Functions:** `stake()`, `withdraw()`, and `claimRewards()`.
- **Testing UX:** The Staking token must include a public `mint(address to, uint256 amount)` function so any user can mint tokens for testing. No access control needed (this is a testnet/demo contract).
- **Agent Autonomy:** You have creative freedom to design the math for the emission rate using `block.timestamp`. Use OpenZeppelin standards. Ensure math prevents precision loss.

## 5. Frontend Spec
- **Required Views:** Dashboard showing user balances for both tokens, staked amount, and real-time accumulating rewards.
- **Claim UX:** After a successful `claimRewards` transaction, the pending rewards display must immediately reset to 0 and the Reward token balance must refetch from the chain. Don't wait for the next polling cycle. Reset the ticker's reference timestamp so it starts accumulating cleanly from 0.
- **Agent Autonomy:** Build a sleek `UI_THEME`. Use an interval on the frontend to visually increment the "pending rewards" counter in real-time for a satisfying, magical user experience.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Lock-up periods with early withdrawal penalties.
- [ ] Dynamic APY based on total pool size.
- [ ] Auto-compounding interest functionality.
