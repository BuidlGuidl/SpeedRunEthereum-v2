---
title: "Time-Weighted Staking Rewards & Dynamic APY in Solidity"
description: "Go beyond basic staking! Learn to implement time-weighted rewards to incentivize long-term stakers and dynamic APYs that respond to market conditions in your Solidity contracts. A practical guide for Web3 devs aiming for fairer and more sustainable tokenomics."
---

So, you've got a staking contract. Users lock up tokens, earn rewards. Cool. But let's ask some real questions:

- Is it fair that someone who stakes for 1 day gets proportionally the same daily rate as someone who has been loyal for a year?
- Is your fixed APY going to make sense next month? Or next year? What if market conditions change, or your protocol's revenue skyrockets (or dips)?

If you're nodding along, then it's time to level up your staking mechanisms! This guide explores two powerful concepts:

1. **Time-Weighted Rewards:** Making loyalty pay.
2. **Dynamic APY:** Creating rewards that adapt and make sense.

Let's dive in and see how you, as a Solidity dev, can build smarter, more engaging, and economically sound staking systems.

## 1. Time-Weighted Rewards - Making Loyalty Count!

The basic idea is simple: **reward users more for staking their tokens for longer periods.** This encourages long-term commitment, which is usually great for protocol stability and reduces token flipping.

### Common Ways to Implement Time-Weighting

#### 1. Duration Multipliers (Keep it Simple & Clear)

- **How it works:** The longer a user stakes, the higher a multiplier they get on their base reward rate.
- **Example (Tiered):**
  - Stake 1-30 days: 1x base reward
  - Stake 31-90 days: 1.5x base reward
  - Stake 90+ days: 2x base reward
- **Pros:** Easy for users to understand.
- **Cons:** Can create "cliff effects" where users might unstake and restake just to hit a new tier optimally.

#### 2. Share/Point Systems (Continuous & Fair - Think Synthetix StakingRewards.sol)

- **How it works:** Users earn "shares" or "points" based on _how much_ they stake AND _for how long_. Their slice of the total reward pie is based on their proportion of total shares/points.
- The well-known StakingRewards.sol contract (which implements the O(1) reward distribution pattern detailed in our guide on [Scalable Solidity Staking: O(1) Reward Distribution](/guides/scalable-gas-solidity-staking)) does this implicitly. A global `rewardPerTokenStored` value constantly grows. When you stake, your `userRewardPerTokenPaid` (a snapshot of the global value) is recorded. The longer you're staked, the larger the difference between the current `rewardPerTokenStored` and your snapshot, meaning more rewards.
- **Pros:** Very fair, rewards accrue smoothly, and it's gas-efficient for distributing rewards to many users (no loops!).
- **Cons:** The underlying math can be a bit more to wrap your head around initially.

#### 3. Time-Weighted Average Balance (TWAB - Advanced & Precise)

- **How it works:** Calculates a user's average staked balance over a specific reward period, considering any fluctuations. Think TWAP (Time-Weighted Average Price) from Uniswap, but for balances.
- **Pros:** Extremely fair if user balances change often.
- **Cons:** Can be more complex and potentially gas-heavy to implement fully on-chain if you need arbitrary period queries.

### Solidity Snippets: Key Data for Time-Weighting

You'll typically need a struct for each staker:

```solidity
struct StakerInfo {
    uint256 amountStaked;
    uint256 stakeTimestamp;         // When they first staked or last major update
    uint256 lastRewardClaimTimestamp;
    // For Synthetix-style:
    uint256 userRewardPerTokenPaid; // Snapshot of global reward index
    uint256 rewardsAccrued;         // Unclaimed rewards
    // For Multiplier style:
    // uint256 effectiveMultiplier; // Or calculate on the fly
}

mapping(address => StakerInfo) public stakers;
```

And for Synthetix-style, global variables:

```solidity
uint256 public rewardPerTokenStored;
uint256 public lastUpdateTime;
uint256 public rewardRate; // Rewards per second
uint256 public totalSupply;  // Total tokens staked
```

> **Quick Tip on Precision:** Solidity hates decimals! For rates or multipliers, multiply by a large number (e.g., 1e18 or 100 for percentages like 2.0x -> 200) to keep precision. Divide at the very end of the calculation.

## 2. Dynamic APY - Rewards That React

**APY (Annual Percentage Yield)** tells users their potential return over a year, with compounding. A **Dynamic APY** is one that isn't fixed; it changes based on various factors.

### Why Go Dynamic?

- **Sustainability:** Super high fixed APYs can inflate your token to death. Dynamic APYs can adjust to what the protocol can actually afford.
- **Adaptability:** Respond to market conditions. If DeFi yields elsewhere are 20%, your fixed 5% APY might not look too hot.
- **Incentive Alignment:** Encourage desired behavior (e.g., boost APY when TVL is low).

### What Makes an APY "Dynamic"?

1. **Total Value Locked (TVL) / Participation Rate:**
   - If the total reward pool is fixed, more staked tokens = lower APY per token (rewards are shared).
   - Some protocols might temporarily boost APY to attract more TVL.
2. **Protocol Revenue/Fees:**
   - Link APY to success! If your protocol earns more trading fees, a portion can go to stakers, increasing their APY.
3. **Price of Reward/Staked Tokens (via Oracles):**
   - If APY is targeted in USD, but rewards are in your volatile native token, the _quantity_ of reward tokens might need to adjust based on price feeds from oracles like Chainlink.
4. **Broader Market Conditions (via Oracles):**
   - APY could be influenced by benchmark DeFi lending rates (e.g., from Aave/Compound, accessible via Chainlink's DeFi Yield Index).
5. **Governance Decisions:**
   - The DAO can vote to adjust base reward rates, target APYs, or other parameters that feed into the APY calculation.

### Implementing Dynamic APY: On-Chain vs. Oracle-Driven

#### Purely On-Chain

APY is calculated using only data within your smart contract (e.g., `currentRewardRate / totalTokensStaked`).

**Example:** A simple `getCurrentAPY()` view function:

```solidity
// Simplified
uint256 public totalStaked;
uint256 public rewardRatePerSecond; // How many reward tokens drip per second
uint256 constant SECONDS_IN_YEAR = 365 days;
uint256 constant APY_PRECISION = 100; // For 5.25% -> 525

function getCurrentAPY() public view returns (uint256) {
    if (totalStaked == 0) return 0;
    uint256 rewardsPerYear = rewardRatePerSecond * SECONDS_IN_YEAR;
    // Assuming staked token and reward token have same decimals for simplicity here
    return (rewardsPerYear * APY_PRECISION) / totalStaked;
}
```

- **Pros:** Transparent, no external dependencies.
- **Cons:** Limited to on-chain data, complex math can be gas-heavy.

#### Oracle-Driven (e.g., using Chainlink)

Fetch external data (like token prices, DeFi yield benchmarks) via an oracle to influence APY.

**Example (Fetching a Price):**

```solidity
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.7; // Use a version compatible with the import

contract MyDynamicAPYContract {
    AggregatorV3Interface internal priceFeed;
    uint256 public baseAPY = 300; // 3.00%
    uint256 public currentAPY;
    uint256 constant MAX_DATA_AGE = 1 hours;
    address public owner;
    event APYUpdated(uint256 newAPY, int256 oraclePrice, uint256 oracleTimestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _priceFeedAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        owner = msg.sender;
    }

    function updateAPYBasedOnOracle() external onlyOwner {
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(block.timestamp - updatedAt < MAX_DATA_AGE, "Oracle data stale");
        require(price > 0, "Invalid oracle price");

        // Example: APY = baseAPY + bonus if price > threshold
        // This logic would be specific to your protocol's needs
        if (uint256(price) > 2000 * (10**8)) { // Assuming price in USD, 8 decimals
            currentAPY = baseAPY + 200; // Add 2.00% bonus
        } else {
            currentAPY = baseAPY;
        }
        emit APYUpdated(currentAPY, price, updatedAt);
    }
}
```

- **Pros:** APY can react to real-world market conditions.
- **Cons:** Adds oracle dependency (security, gas costs, data freshness is CRITICAL).

> **Oracle Safety:** Always check `updatedAt` for staleness. Have fallback mechanisms if oracles fail (e.g., pause, revert to a default safe APY).

## 3. Combining Time-Weighting & Dynamic APY (The Power Combo!)

This is where it gets really sophisticated. You can use both!

- **How it often works:** The **Dynamic APY mechanism** determines the _total size of the reward pool_ or the _overall reward rate_ (e.g., `rewardRate` in a Synthetix-style contract).
- Then, the **Time-Weighting mechanism** (like the Synthetix share system) determines how that dynamically-sized reward pie is _distributed_ among stakers based on their individual stake amount and duration.

**Example:**

1. Your contract uses an oracle to see the current average DeFi yield for ETH is 5%.
2. Governance decides your protocol should offer a competitive APY, so it adjusts parameters to target a `rewardRate` that would equate to roughly 5% APY for the current `totalStaked` amount.
3. This `rewardRate` is then fed into your time-weighted distribution system (e.g., Synthetix StakingRewards logic). Users who stake longer effectively get a larger share of these dynamically adjusted rewards.

> **Complexity Alert:** This is powerful but adds layers. Gas costs, state management, and especially making it clear to users how their rewards are calculated become even more important.

## Key Security & Best Practices

Building these advanced systems demands extra care:

- **Checks-Effects-Interactions:** Standard Solidity mantra. Validate inputs, change state, then interact externally.
- **Reentrancy Guards:** Use `nonReentrant` (e.g., from OpenZeppelin) on functions like `claimReward` or `withdraw`.
- **Safe Math (Solidity 0.8+ helps!):** Watch out for overflows/underflows in reward calculations.
- **Oracle Security is Paramount:**
  - If using oracles:
    - Check data for staleness and validity.
    - Use reputable, decentralized oracles (Chainlink is standard).
    - Have fallback plans if an oracle fails (pause, default APY).
- **Access Control:** Protect functions that change reward rates, APY parameters, or oracle addresses with `onlyOwner` or role-based access. For mainnet, this should be a multisig or DAO.
- **Gas Optimization:**
  - Minimize storage writes (SSTOREs are expensive!). The "lazy update" in Synthetix-style contracts is great for this.
  - Use memory for temporary calculations.
  - Avoid unbounded loops in user-facing functions.
- **Transparency is King:**
  - Emit events whenever APY parameters or the APY itself change.
  - Provide clear view functions so users (and frontends) can see how the current APY is calculated and what factors influence it.
- **Testing, Testing, Testing:** Unit tests, integration tests, and importantly, scenario-based tests that simulate time passing and various user interactions under different APY conditions. Audit your contracts!

---

## Further Resources

- **[OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/):** For secure, standard components.
- **[Chainlink Documentation](https://docs.chain.link/):** For all things oracles.
- **[Solidity by Example](https://solidity-by-example.org/):** For practical patterns.
- **[Speedrun Ethereum Staking challenge](https://speedrunethereum.com/challenge/decentralized-staking):** Keep building and learning!
