---
title: "A Developer's Guide to Liquid Staking Tokens (LSTs)"
description: "Staked your ETH but miss using its value in DeFi? Discover Liquid Staking Tokens (LSTs)! This guide explains how LSTs like stETH and rETH work, the difference between rebasing and reward-bearing tokens, and their impact on DeFi. Essential for Solidity devs exploring advanced staking."
image: /assets/guides/liquid-staking-tokens.jpg
---

So, you've learned about staking, maybe even built a basic staking contract. You lock up your ETH (or other PoS assets) to help secure the network and earn rewards. Awesome! But there's a catch: while your crypto is staked, it's usually stuck – illiquid and unusable for anything else. What if you could earn those staking rewards _and_ still use the value of your staked assets in DeFi?

Enter **Liquid Staking Derivatives (LSDs)**, more commonly called **Liquid Staking Tokens (LSTs)**. These clever tokens are changing the game for stakers.

This guide will break down:

- What LSTs are and why they're a big deal.
- The basic mechanics: how you get an LST.
- The main "flavors" of LSTs you'll encounter (this is key for developers!).
- How LSTs are supercharging DeFi.
- Important risks to be aware of.

## What is Liquid Staking & Why Should You Care?

Traditional staking on Proof-of-Stake (PoS) networks like Ethereum means your assets are "locked up." They're busy validating the network, which is great, but you can't lend them, trade them, or use them as collateral in DeFi protocols. This is a big opportunity cost!

**Liquid Staking solves this illiquidity.**
When you stake your ETH through a liquid staking protocol, you receive a new token in return – an LST. This LST is a **tokenized representation of your staked ETH**. It proves you own that staked ETH and are entitled to the staking rewards it generates.

The magic? This LST is **liquid**! It's typically an ERC-20 token, so you can:

- Trade it on Decentralized Exchanges (DEXs).
- Use it as collateral in lending protocols (like Aave or MakerDAO).
- Put it to work in various yield farming strategies.
  ...all while your original ETH is still staked and earning baseline rewards! This is called **capital efficiency** – getting more mileage out of your assets.

## How Does Liquid Staking Work? The Basic Flow

While different protocols have their nuances, the general process looks like this:

1.  **Deposit:** You deposit your ETH into a liquid staking protocol's smart contract (e.g., Lido, Rocket Pool).
2.  **Staking by Protocol:** The protocol aggregates ETH from many users and stakes it with network validators. These validators do the work of securing the network.
3.  **Receive LST:** In return for your deposit, the protocol mints and sends you an LST. For example, if you stake ETH with Lido, you get `stETH`. With Rocket Pool, you get `rETH`.
4.  **Rewards Accrue:** As the underlying staked ETH earns staking rewards (from consensus and transaction fees/MEV), these rewards are reflected in the value or quantity of your LST.

## Meet the LST Flavors: Rebasing vs. Reward-Bearing (Crucial for Devs!)

This is where things get interesting, especially if you're building smart contracts that interact with LSTs. LSTs primarily come in two main flavors based on how they distribute rewards:

### 1. Rebasing LSTs (e.g., Lido's `stETH`)

- **How it works:** With a rebasing token, the _quantity_ of LSTs in your wallet changes automatically, usually daily. If you hold 10 `stETH` and rewards come in, your balance might magically increase to 10.01 `stETH`.
- **The Goal:** `1 stETH` aims to always represent (be pegged 1:1 to) 1 ETH. The rewards are given by increasing your `stETH` balance.
- **Lido's `stETH` Internals:** Lido's system is built on a concept of "shares." When you stake ETH, you receive a certain number of shares that remain constant (unless you stake more or unstake). The `balanceOf(user)` for `stETH` directly reflects the rebased amount of tokens you hold, which is calculated based on your proportion of the total shares (`stETH.sharesOf(user)`) relative to the `stETH.getTotalShares()`, and the total amount of ETH managed by the Lido pool (`stETH.getTotalPooledEther()`). As rewards accrue to the pool, increasing `totalPooledEther`, your `stETH` balance (derived from your fixed shares) also increases.
- **DeFi Integration Challenge:** This "magic balance change" can confuse DeFi protocols (like AMMs or lending platforms) that expect token balances to only change via explicit `transfer()` calls. This can lead to accounting issues or lost rewards for users.

### 2. Reward-Bearing LSTs (e.g., Rocket Pool's `rETH`, Coinbase's `cbETH`)

- **How it works:** With a reward-bearing token, the _quantity_ of LSTs in your wallet stays the same. Instead, the _exchange rate_ of the LST against the underlying asset (e.g., ETH) increases over time.
- **The Goal:** 1 `rETH` might initially be worth 1 ETH. As rewards accrue, that 1 `rETH` might become redeemable for 1.05 ETH, then 1.10 ETH, and so on, while you still just hold 1 `rETH`.
- **Value Calculation:** The value (Net Asset Value or NAV) is typically `Total ETH managed by protocol / Total LST supply`. For example, with `rETH`, its exchange rate against ETH is periodically updated by Rocket Pool's Oracle DAO (oDAO) to reflect accrued staking rewards. This rate is then used by DeFi protocols.
- **DeFi Integration Pro:** Much easier for DeFi protocols to handle because balances are stable and predictable. They just need a reliable price oracle for the LST's current ETH value.

### Bonus Flavor: Wrapped LSTs (e.g., Lido's `wstETH`)

- **The Problem Solver:** To fix the DeFi compatibility issues of rebasing tokens like `stETH`, wrapped versions were created.
- **How it works:** You "wrap" your `stETH` by depositing it into a `wstETH` smart contract. You receive `wstETH`.
  - Your `wstETH` balance remains constant.
  - The value of `wstETH` (its redemption value in `stETH`, and thus ETH) appreciates over time as the underlying `stETH` it represents continues to rebase and accrue rewards.
- **Benefit:** `wstETH` behaves like a reward-bearing token in DeFi, making it much easier to integrate.

**Key Takeaway for Devs:** If you're building a contract that will hold or account for LSTs, you _must_ know if it's rebasing or reward-bearing/wrapped to handle its balance and value correctly! For rebasing, directly using `balanceOf()` can be misleading; protocols often interact with the share mechanism or use the wrapped version.

## Who are the Big Players? (A Quick Look)

The LST space has several major protocols:

- **Lido (`stETH`, `wstETH`):** Currently the largest LST provider for Ethereum. It uses a set of permissioned (DAO-approved) professional node operators. `stETH` is rebasing, `wstETH` is its wrapped, reward-bearing version. ([Lido Finance](https://lido.fi/))
- **Rocket Pool (`rETH`):** Aims for more decentralization by allowing permissionless node operation. Node operators run "minipools" by bonding their own ETH (e.g., 8 or 16 ETH) and staking Rocket Pool's native `RPL` token as additional collateral. `rETH` is reward-bearing. ([Rocket Pool](https://rocketpool.net/))
- **Coinbase (`cbETH`):** A centralized exchange offering a liquid staking solution. `cbETH` is a reward-bearing token representing ETH staked through Coinbase. ([Coinbase Staking](https://www.coinbase.com/staking))
- **Others (e.g., StakeWise, EtherFi):** The space is always evolving. StakeWise moved from a dual-token model to a vault-based system with `osETH` (overcollateralized staked ETH). Newer protocols like EtherFi are integrating "native restaking" (e.g., with EigenLayer) from the get-go, meaning their `eETH` earns both staking rewards and potentially additional rewards from securing other protocols/services (though this also introduces new layers of risk).

## Using Your LSTs in DeFi: Unlocking Capital

The real power of LSTs shines when you use them in the broader DeFi ecosystem:

- **Lending & Borrowing:** Supply your `wstETH`, `rETH`, or `cbETH` as collateral on platforms like [Aave](https://aave.com/), [Compound](https://compound.finance/), or [MakerDAO](https://makerdao.com/) to borrow other assets (like stablecoins).
- **Liquidity Provision (LPing):** Add your LSTs to liquidity pools on DEXs (e.g., an `rETH`/`ETH` pool on [Curve](https://curve.fi/) or [Balancer](https://balancer.fi/)). You earn trading fees, but be aware of impermanent loss.
- **Leveraged Staking:** Some users recursively borrow against their LSTs to acquire more LSTs, amplifying their staking exposure (and risk!).
- **Other Yield Strategies:** The DeFi world is creative; LSTs can be plugged into many different strategies.

## Key Risks to Watch Out For: A Developer's Heads-Up

LSTs are powerful but come with their own set of risks. As a developer, being aware of these is crucial, especially if you're building protocols that integrate them.

- **Smart Contract Risk:** The LST protocol itself could have a bug. This is true for any smart contract. Always look for audits!
- **Oracle Risk:**
  - **Price Oracles:** DeFi protocols rely on oracles (like [Chainlink](https://chain.link/)) for LST/ETH prices. If these are manipulated or fail, it can lead to bad liquidations.
  - **Reward Oracles:** LST protocols themselves use oracles to report rewards and update LST values (e.g., Lido's committee, Rocket Pool's oDAO). Failures here can mess up LST valuation.
- **LST De-Peg Risk:** The market price of an LST can (and sometimes does) deviate from the value of the underlying staked ETH (e.g., `stETH` trading below 1 ETH). This can happen due to:
  - Low liquidity on DEXs.
  - Market panic or negative news.
  - Problems with the LST protocol or underlying staking risks.
  - If an LST de-pegs significantly while you're using it as collateral, you could get liquidated!
- **Slashing Risk:** Validators securing the PoS network can get "slashed" (lose some of their staked ETH) for misbehaving (e.g., going offline for too long or double signing).
  - LST protocols have mechanisms to absorb these losses (node operator bonds, insurance funds like Lido's, or Rocket Pool's RPL collateral).
  - However, if slashing is severe and widespread, and these protection mechanisms are exhausted, the loss could potentially be socialized among LST holders, reducing the LST's value.
- **Composability ("Money Lego") Risk:** When you combine different DeFi protocols, the risks can compound. A bug or issue in one protocol can cascade and affect others that integrate with it. This is especially true for widely used LSTs.
  - **Rebasing tokens** add specific composability headaches if not handled correctly by the integrating protocol.
- **Centralization & Governance Risks:**
  - Some LST protocols might have centralized elements (e.g., oracle committees, validator selection, upgradeable contracts via multisig).
  - Governance tokens could be concentrated, leading to risks of manipulation or decisions not in all users' best interests.

## Integrating LSTs? Key Tips for Developers

If you're building a DeFi protocol that will support LSTs:

1.  **Know Your LST Type:** Is it rebasing, reward-bearing, or wrapped? This is the #1 consideration. For rebasing tokens, avoid simple `balanceOf()` checks for accounting; interact with share mechanisms or strongly prefer wrapped versions (like `wstETH` over `stETH`).
2.  **Robust Oracle Integration:** For any LST that needs valuation (especially reward-bearing ones or for collateral), use reliable price oracles like [Chainlink](https://chain.link/). Check for data freshness, understand the oracle's methodology, and consider fallback mechanisms or circuit breakers for extreme oracle deviations.
3.  **Assess Liquidity & De-Peg Risk:** Before listing an LST, check its on-chain liquidity. Set conservative risk parameters (Loan-to-Value, liquidation thresholds) for it as collateral.
4.  **Study Existing Integrations:** Look at how major protocols like Aave or Compound handle different LSTs. They've often encountered and solved many integration challenges.

## Conclusion: LSTs are Unlocking a More Efficient DeFi

Liquid Staking Tokens are a cornerstone of modern DeFi, solving the critical problem of illiquid staked assets. They offer users significantly better capital efficiency and open up a world of possibilities for earning yield.

For Solidity developers, understanding the different types of LSTs (especially rebasing vs. reward-bearing) and their associated risks is crucial. Whether you're just using LSTs in DeFi or building protocols that integrate them, this knowledge will help you navigate this exciting and rapidly evolving part of the ecosystem.

Happy (liquid) staking!
