---
title: "Scalable Solidity Staking: O(1) Reward Distribution"
description: "Master scalable Solidity staking with O(1) reward distribution. This guide details gas-efficient techniques using per-token accumulated values for fair, low-cost DeFi rewards, perfect for optimizing your smart contracts."
---

So, you're building a decentralized staking contract – maybe as part of the [Speedrun Ethereum "Decentralized Staking" challenge](https://speedrunethereum.com/challenge/decentralized-staking) or for your own DeFi project. You want users to stake their tokens and earn rewards. Simple, right?

Well, what happens when you have thousands, or even millions, of stakers? If you try to loop through everyone to distribute rewards, your gas costs will go through the roof! 🤯 This is known as an O(n) problem – the more users, the more gas. It's just not sustainable.

This is where a much smarter approach comes in: the **Lazy Reward Calculation Pattern**. It's a widely-used technique in major DeFi protocols because it allows reward calculations to happen with **O(1) complexity**. That means the gas cost stays roughly constant, whether you have 10 stakers or 10,000!

Let's dive into how this pattern works and why it's a game-changer for your Solidity projects.

## The Problem with Simple Loops (The "Eager" Approach)

Imagine every time a reward needs to be distributed, your contract has to:

1. Get a list of all stakers.
2. For each staker:
   - Calculate their share of the reward.
   - Update their reward balance.

This is "eager" because it tries to do everything for everyone, all at once. For a few users, it's fine. For many, it's a gas nightmare. Each user added makes the loop longer and more expensive.

## The Lazy Reward Pattern: Calculate Only When Needed

The "lazy" pattern flips this on its head. Instead of the contract proactively calculating everyone's rewards all the time, it keeps track of information globally, and an individual user's precise reward amount is only calculated when _they_ interact with the contract (like staking more, withdrawing, or claiming).

Think of it like a bakery. Instead of trying to deliver a slice of cake to every customer every hour, the bakery just notes "for every hour the shop is open, each customer who signed up gets one slice." When you, a customer, finally walk in to claim your cake, the baker looks at when you last collected, sees how many hours have passed, and gives you all your deserved slices at once. Much more efficient for the baker!

## Key Ingredients of Lazy Rewards

To make this magic happen, we primarily need two types of variables:

1.  **`rewardPerTokenStored` (The Global Tracker):**

    - **What it is:** This is a global variable that accumulates the total amount of rewards that _one single unit_ of a staked token would have earned if it had been staked since the very beginning (or since the last major update).
    - **How it updates:** Its value is updated by a function (often called within `updateReward`) which calculates new rewards accrued per token since the last update (based on time passed or new reward deposits) and adds this to the existing `rewardPerTokenStored`.
    - **Think of it as:** The "total reward slices available per share so far."

2.  **`userRewardPerTokenPaid[userAddress]` (Your Personal Scoreboard):**
    - **What it is:** For every user who stakes, the contract stores a snapshot of the global `rewardPerTokenStored` _at the exact moment of that user's last interaction_ (like their last stake, withdrawal, or claim).
    - **Purpose:** This acts as a personal baseline for each user. It tells the contract, "Okay, this user has already been accounted for up to _this_ point in the global reward timeline."
    - **Think of it as:** "The 'total reward slices per share' I was already aware of when I last visited the bakery."

### The Magic Formula: Calculating Earned Rewards

When a user interacts with the contract (say, to claim rewards), their earnings since their last interaction are calculated like this:

`newly_earned_rewards = user_staked_balance * (current_rewardPerTokenStored - userRewardPerTokenPaid[userAddress])`

Let's break that down:

- `user_staked_balance`: How many tokens the user currently has staked.
- `current_rewardPerTokenStored`: The up-to-the-second value of our global tracker.
- `userRewardPerTokenPaid[userAddress]`: The value of the global tracker _the last time this specific user interacted_.

The difference `(current_rewardPerTokenStored - userRewardPerTokenPaid[userAddress])` tells us how much reward _each individual token_ has earned since the user's last "checkpoint." Multiply that by how many tokens they have, and voilà, you get their newly earned rewards!

Often, there's also a `rewards[userAddress]` mapping that accumulates these `newly_earned_rewards` until the user explicitly claims them. So the total they can claim is:

`total_claimable_rewards = rewards[userAddress] + newly_earned_rewards`

**A Quick Note on Precision (The `1e18` Trick):**
Solidity only works with integers and truncates decimals. If `rewardPerTokenStored` involves division (like `new_rewards / total_staked_tokens`), you might lose precision. To combat this, a common trick is to multiply the numerator by a large factor (like `1e18` for tokens with 18 decimals) _before_ the division, and then divide by that same factor when calculating the final user reward.

`rewardPerTokenStored += (new_reward_amount * 1e18) / total_tokens_staked;`
`earned = (user_balance * (rewardPerToken() - userRewardPerTokenPaid[msg.sender])) / 1e18;`

## How It Works in Practice: A Simplified Flow

Let's walk through the common user actions. Most staking contracts will have a modifier or an internal function (often called `updateReward(address user)` or similar) that performs the reward calculation and state updates. This is called before the main logic of `stake`, `withdraw`, or `getReward`.

**The `updateReward(address user)` Logic (Conceptual):**

- Calculate the latest `rewardPerTokenStored`. This involves determining rewards accrued per token since the last update (e.g., based on rewards added to the contract or time elapsed at a defined reward rate) and adding this to the stored `rewardPerTokenStored` value.
- If a specific `user` is provided:
  - Calculate `newly_earned = user.balance * (rewardPerTokenStored - user.userRewardPerTokenPaid)`.
  - Add this to `user.rewards_claimable += newly_earned`.
  - Set `user.userRewardPerTokenPaid = rewardPerTokenStored` (this is crucial – update their baseline!).

Here's how this logic is typically integrated into the main user actions of a staking contract:

### 1. Staking More Tokens (`stake(uint256 amount)`)

- Call `updateReward(msg.sender)`: This calculates any rewards `msg.sender` earned with their _previous_ balance and updates their `userRewardPerTokenPaid` to the current global `rewardPerTokenStored`.
- Add `amount` to `msg.sender`'s staked balance (`_balances[msg.sender] += amount`).
- Increase `_totalSupply` of staked tokens.

### 2. Claiming Rewards (`getReward()`)

- Call `updateReward(msg.sender)`: This ensures all pending rewards for `msg.sender` are calculated and stored in `rewards[msg.sender]`, and their `userRewardPerTokenPaid` is updated.
- Get the `uint256 reward_amount = rewards[msg.sender]`.
- If `reward_amount > 0`:
  - Set `rewards[msg.sender] = 0` (reset their claimable balance).
  - Transfer `reward_amount` of the reward token to `msg.sender`.

### 3. Withdrawing Stake (`withdraw(uint256 amount)`)

- Call `updateReward(msg.sender)`: Calculates pending rewards based on their balance _before_ withdrawing and updates their `userRewardPerTokenPaid`.
- (Optional but good practice: if any rewards were calculated and credited to `rewards[msg.sender]` by `updateReward`, transfer them now, or ensure `getReward` is called).
- Subtract `amount` from `msg.sender`'s staked balance (`_balances[msg.sender] -= amount`).
- Decrease `_totalSupply`.
- Transfer `amount` of the staking token back to `msg.sender`.

## Why This Pattern is Awesome for Your Staking Contract

- **Super Gas Efficient O(1):** The cost of `stake`, `withdraw`, and `getReward` doesn't depend on the total number of stakers. This is the biggest win!
- **Scalable:** Your contract can handle a massive number of users without grinding to a halt due to gas fees.
- **Fair:** Rewards are calculated proportionally based on the user's stake amount and how long it has been staked relative to reward distributions.
- **Battle-Tested:** This isn't some new, experimental idea. It's used by some of the largest and most successful DeFi protocols (like Synthetix and Sushiswap's original MasterChef).

## Things to Keep in Mind

While powerful, implementing this pattern correctly requires attention to detail:

- **Precision is Key:** As mentioned, handle division carefully to avoid losing reward fractions. Use scaling factors (like `1e18`) appropriately.
- **Order of Operations:** Always calculate and credit a user's pending rewards _before_ you change their staked balance or update their `userRewardPerTokenPaid` snapshot for the current transaction. The sequence in the `updateReward` modifier is critical.
- **Reentrancy Guards:** If your functions make external token transfers, be mindful of reentrancy. Using a [`nonReentrant` modifier (like from OpenZeppelin)](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard) on `stake`, `withdraw`, and `getReward` is a good safety measure. Always follow the [Checks-Effects-Interactions pattern](https://docs.soliditylang.org/en/latest/security-considerations.html#use-the-checks-effects-interactions-pattern).
- **Initialization:** Ensure `rewardPerTokenStored` and `userRewardPerTokenPaid` are initialized sensibly (usually to 0).

## Conclusion: Stake Smarter, Not Harder!

The Lazy Reward Calculation Pattern is an essential tool in any DeFi Solidity developer's arsenal. It directly addresses the scalability and gas cost issues inherent in naive reward distribution methods. By understanding how `rewardPerTokenStored` and `userRewardPerTokenPaid` work together, you can build staking systems that are fair, efficient, and capable of supporting a large, vibrant community. By mastering this O(1) approach, you can significantly enhance the viability and user experience of your staking contracts.

As you continue your journey with Solidity, especially if you're working through challenges like Speedrun Ethereum's Decentralized Staking, integrating this pattern can elevate your contracts from simple examples to production-grade solutions.

---

**Further Exploration:**
Want to see this pattern in the wild? You can explore contracts like:

- [Synthetix's `StakingRewards.sol`](https://github.com/Synthetixio/synthetix/blob/develop/contracts/StakingRewards.sol) (often used for single-asset staking).
- [Sushiswap's original `MasterChef.sol`](https://github.com/sushiswap/masterchef/blob/master/contracts/MasterChef.sol) (for multi-pool yield farming).
  _(Note: These can be complex, but you'll recognize the core principles we discussed!)_
