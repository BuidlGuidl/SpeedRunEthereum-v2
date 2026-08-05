---
title: "How to Build a DEX on Ethereum: Step-by-Step Solidity Tutorial"
date: "2026-08-03"
description: "Build a working decentralized exchange in Solidity: constant-product pricing with a 0.3% fee, ETH/token swaps, and liquidity deposits, using Scaffold-ETH 2 from install to testnet."
image: "/assets/guides/how-to-build-a-dex.jpg"
showNavigation: true
faqs:
  - question: "How does a DEX work under the hood?"
    answer: "A constant-product DEX holds reserves of two assets in one smart contract and prices every trade with the formula x * y = k. When you buy one asset, its reserve shrinks and the price moves against you automatically. No order book and no counterparty is needed: the pool itself is always the counterparty, and liquidity providers earn the trading fee in exchange for funding the reserves."
  - question: "Do I need to fork Uniswap to build a DEX?"
    answer: "No. The core of a Uniswap-v2-style exchange is around 100 lines of Solidity: a pricing function, two swap functions, and deposit/withdraw for liquidity. Building it yourself is the best way to understand what production DEXs add on top (routing, slippage protection, LP tokens, oracles). For real funds you would use audited contracts, but for learning you should write it from scratch."
  - question: "What stack should I use to build and test a DEX locally?"
    answer: "This guide uses Scaffold-ETH 2: it gives you a local chain, one-command deploys, and a Debug Contracts UI so you can call your swap functions from a browser without writing a frontend first. Any Hardhat or Foundry setup works, but you will write more plumbing yourself."
  - question: "Why does my token swap revert with an allowance error?"
    answer: "Swapping tokens for ETH calls transferFrom, so the DEX contract needs an allowance first. You must call approve on the token contract (with the DEX address and amount) before calling the swap. This two-step pattern trips up almost everyone at least once. Our ERC20 approve pattern guide covers it in depth."
---

*Every DEX interaction you have ever made, every swap, every pool deposit, comes down to about 100 lines of Solidity. In this guide you write those lines yourself, run them on a local chain, and end with a working exchange you can trade against from a browser.*

## TL;DR: Building a DEX

- A minimal DEX is **one contract holding two reserves** (ETH and a token) that prices trades with the **constant-product formula (x\*y=k)** and charges a 0.3% fee that accrues to liquidity providers.
- You will build it with **[Scaffold-ETH 2](https://scaffoldeth.io)**: local chain, hot-reload deploys, and a Debug Contracts UI to test every function without writing frontend code.
- The build order that keeps you sane: **pricing function first**, then swaps, then liquidity deposit/withdraw. Each step is testable on its own.
- This is a learning build. At the end we cover exactly what separates it from production (slippage protection, LP tokens, MEV), and where to go next.

## What you're building

A single-pair exchange between ETH and an ERC20 token we'll call Balloons (BAL). Anyone can:

- swap ETH for BAL and BAL for ETH, priced by the pool's reserves,
- deposit ETH + BAL together to become a liquidity provider and earn fees,
- withdraw their share of the reserves at any time.

The math behind this design has its own guide: if you want the derivation of x\*y=k, price impact, and why arbitrage keeps pool prices honest, read [Automated Market Makers: Math, Risks & Solidity Code](/guides/automated-market-makers-math) first. Here we take the formula as given and spend our time turning it into a working contract.

One rule of thumb before we start, because it explains most of the code: **the contract never stores the price**. The price is always computed from the current reserves at trade time. That is what makes an AMM self-operating: there's no order book to match and no oracle to consult, the contract just does arithmetic on two balances.

## Step 1: Set up the project

You need [Node (v20.18.3 or later)](https://nodejs.org/en/download/), [Yarn](https://classic.yarnpkg.com/en/docs/install/), and [Git](https://git-scm.com/downloads). Open a terminal and create a fresh Scaffold-ETH 2 project:

```sh
npx create-eth@latest dex-tutorial
```

This downloads the starter project into a new `dex-tutorial` folder and installs all its dependencies, so it can take a few minutes. When it asks which Solidity framework you want, pick **Hardhat** (everything below works with Foundry too, the file paths just differ). Then move into the folder:

```sh
cd dex-tutorial
```

You'll want three terminal windows open, all inside the `dex-tutorial` folder. In the first one, start a local blockchain that runs only on your machine:

```sh
yarn chain
```

Leave it running. In a second terminal, compile and deploy the sample contract to that local chain:

```sh
yarn deploy
```

And in a third, start the web app:

```sh
yarn start
```

Open http://localhost:3000 in your browser and click the **Debug Contracts** tab at the top. This page reads whatever contracts are deployed and gives you a form for every function, so you can call your contract from the browser while you're still building it. We'll use it to test everything before writing a line of frontend code.

## Step 2: The token

The DEX trades ETH against an ERC20 token, so we need one. In your editor, create a new file named `Balloons.sol` in the `packages/hardhat/contracts` folder, next to the sample `YourContract.sol` that's already there. Here's the code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Balloons is ERC20 {
    constructor() ERC20("Balloons", "BAL") {
        _mint(msg.sender, 1000 ether);
    }
}
```

OpenZeppelin ships with Scaffold-ETH 2's Hardhat package, so the import resolves out of the box. `1000 ether` here just means 1000 * 10^18: `ether` is a unit suffix, handy for any 18-decimal token, not only ETH.

For the next few steps we are only writing contract files. Nothing new will show up in the browser until we deploy in Step 8, so don't worry that the app looks unchanged for a while.

## Step 3: The DEX skeleton

Create a second file named `MiniDEX.sol` in the same `packages/hardhat/contracts` folder, with the state we need and nothing else:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MiniDEX {
    IERC20 public immutable token;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    event SwappedEthForTokens(address indexed trader, uint256 ethIn, uint256 tokensOut);
    event SwappedTokensForEth(address indexed trader, uint256 tokensIn, uint256 ethOut);
    event LiquidityAdded(address indexed provider, uint256 minted, uint256 ethIn, uint256 tokensIn);
    event LiquidityRemoved(address indexed provider, uint256 burned, uint256 ethOut, uint256 tokensOut);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }
}
```

A few things to notice before we add any logic:

- **The ETH reserve is the contract's own balance** (`address(this).balance`) and the token reserve is `token.balanceOf(address(this))`. We don't keep copies in storage. The balances themselves are the source of truth.
- `totalLiquidity` and the `liquidity` mapping track each provider's share of the pool. Production DEXs mint an ERC20 LP token for this. A mapping teaches the same accounting with less code.
- Events on every state change. The frontend (and any indexer) reconstructs pool history from these.

## Step 4: The pricing function

The heart of the exchange. Given an input amount and the two reserves, how much output does the trader get? Constant product says reserves must satisfy x\*y=k before and after the trade, and we skim a 0.3% fee off the input first. Add this function inside `MiniDEX.sol`, right below the constructor:

```solidity
function price(
    uint256 xInput,
    uint256 xReserves,
    uint256 yReserves
) public pure returns (uint256 yOutput) {
    uint256 xInputWithFee = xInput * 997;
    uint256 numerator = xInputWithFee * yReserves;
    uint256 denominator = (xReserves * 1000) + xInputWithFee;
    return numerator / denominator;
}
```

Multiplying the input by 997 and the reserve by 1000 is the integer-math way of taking 99.7% of the input, since Solidity has no decimals. The fee never leaves the pool: it stays in the reserves, which is exactly how liquidity providers earn.

Run the numbers once by hand so the formula stops being abstract. Say the pool holds 5 ETH and 5000 BAL, and you swap in 1 ETH:

- fee-adjusted input: 0.997 ETH
- output: (0.997 × 5000) / (5 + 0.997) ≈ **831 BAL**

The spot price was 1000 BAL per ETH, but you received 831. That gap is price impact: your own trade moved the price, and a 1 ETH trade against a 5 ETH pool is a whale-sized trade. The bigger the reserves relative to the trade, the closer you get to spot. This single property explains why liquidity depth matters more than anything else in DEX design.

Note the function is `pure`: it touches no state, so you can test it exhaustively from the Debug tab (or a unit test) before any real assets are involved. That is why we build it first.

## Step 5: Seeding the pool

An empty pool cannot price anything (x\*y=k with x = 0 is degenerate), so someone has to deposit both assets once to set the opening ratio. Add `init` below `price`:

```solidity
function init(uint256 tokens) public payable returns (uint256) {
    require(totalLiquidity == 0, "MiniDEX: already initialized");
    totalLiquidity = address(this).balance;
    liquidity[msg.sender] = totalLiquidity;
    require(token.transferFrom(msg.sender, address(this), tokens), "MiniDEX: token transfer failed");
    return totalLiquidity;
}
```

The function is `payable`, so the ETH you send with the call becomes the ETH reserve, and `transferFrom` pulls in the tokens. Whatever ratio you seed **is** the opening price: 5 ETH against 500 BAL declares 1 ETH = 100 BAL. If that ratio is off-market, arbitrage traders will profitably correct it, at the seeder's expense, so real pools are seeded at market price.

`transferFrom` only works if the token holder has approved the DEX first. This is the classic two-step ERC20 dance, and it will come back in every function that pulls tokens in. If allowances are fuzzy for you, the [ERC20 approve pattern guide](/guides/erc20-approve-pattern) is the prerequisite worth reading now, because the next step will revert without it.

## Step 6: Swaps, both directions

First, the ETH-to-tokens direction. Add this below `init`:

```solidity
function swapEthForTokens() public payable returns (uint256 tokenOutput) {
    require(msg.value > 0, "MiniDEX: zero ETH sent");
    uint256 ethReserve = address(this).balance - msg.value;
    uint256 tokenReserve = token.balanceOf(address(this));

    tokenOutput = price(msg.value, ethReserve, tokenReserve);

    require(token.transfer(msg.sender, tokenOutput), "MiniDEX: token transfer failed");
    emit SwappedEthForTokens(msg.sender, msg.value, tokenOutput);
}
```

The one subtle line is the first reserve calculation. By the time your function body runs, `msg.value` has **already been added** to the contract's balance. Price the trade against the post-deposit balance and you get the wrong (worse) rate, and your pool leaks value with every swap. Subtracting `msg.value` recovers the pre-trade reserve. Almost everyone writes this bug on their first DEX.

Tokens in, ETH out is the mirror image, with one ordering rule: read the reserves **before** pulling the tokens in. Add it below `swapEthForTokens`:

```solidity
function swapTokensForEth(uint256 tokenInput) public returns (uint256 ethOutput) {
    require(tokenInput > 0, "MiniDEX: zero tokens sent");
    uint256 tokenReserve = token.balanceOf(address(this));

    ethOutput = price(tokenInput, tokenReserve, address(this).balance);

    require(token.transferFrom(msg.sender, address(this), tokenInput), "MiniDEX: token transfer failed");
    (bool sent, ) = payable(msg.sender).call{ value: ethOutput }("");
    require(sent, "MiniDEX: ETH transfer failed");
    emit SwappedTokensForEth(msg.sender, tokenInput, ethOutput);
}
```

If you called `transferFrom` first, the token reserve would already include the trader's input when you price the trade, and the same wrong-rate bug appears on the token side. Reading state first and changing it after is the same discipline (checks-effects-interactions) that defends against reentrancy in bigger systems, and it is worth making a habit now.

## Step 7: Liquidity in, liquidity out

Anyone can join the pool after `init`, but they must deposit **both assets at the current ratio**, otherwise they would be moving the price for free. Add `addLiquidity` below the swap functions:

```solidity
function addLiquidity() public payable returns (uint256 tokensDeposited) {
    require(msg.value > 0, "MiniDEX: zero ETH sent");
    uint256 ethReserve = address(this).balance - msg.value;
    uint256 tokenReserve = token.balanceOf(address(this));

    uint256 tokenDeposit = ((msg.value * tokenReserve) / ethReserve) + 1;
    uint256 liquidityMinted = (msg.value * totalLiquidity) / ethReserve;

    liquidity[msg.sender] += liquidityMinted;
    totalLiquidity += liquidityMinted;

    require(token.transferFrom(msg.sender, address(this), tokenDeposit), "MiniDEX: token transfer failed");
    emit LiquidityAdded(msg.sender, liquidityMinted, msg.value, tokenDeposit);
    return tokenDeposit;
}
```

You send ETH, and the contract computes the matching token amount from the current ratio and pulls it in. The `+ 1` rounds the required deposit up so integer division always favors the pool rather than the depositor. Tiny rounding leaks compound when a function runs thousands of times. Liquidity shares are minted pro rata: deposit 10% of the existing ETH reserve, receive 10% of the existing shares.

Withdrawing burns shares for a proportional slice of **both** reserves. Add `removeLiquidity` last:

```solidity
function removeLiquidity(uint256 amount) public returns (uint256 ethOut, uint256 tokensOut) {
    require(liquidity[msg.sender] >= amount, "MiniDEX: not enough liquidity");
    uint256 ethReserve = address(this).balance;
    uint256 tokenReserve = token.balanceOf(address(this));

    ethOut = (amount * ethReserve) / totalLiquidity;
    tokensOut = (amount * tokenReserve) / totalLiquidity;

    liquidity[msg.sender] -= amount;
    totalLiquidity -= amount;

    (bool sent, ) = payable(msg.sender).call{ value: ethOut }("");
    require(sent, "MiniDEX: ETH transfer failed");
    require(token.transfer(msg.sender, tokensOut), "MiniDEX: token transfer failed");
    emit LiquidityRemoved(msg.sender, amount, ethOut, tokensOut);
}
```

Notice you rarely get back the exact amounts you put in. The ratio of the reserves drifts with every trade, so your slice comes back in a different mix, and if the price moved a lot you may be worth less than if you had just held both assets. That effect has a name, impermanent loss, and [its own guide with the math](/guides/impermanent-loss-math-explained). Every prospective LP should understand it before depositing real value.

## Step 8: Wire up the deploy and test it

Time to put it all on your local chain. Open `packages/hardhat/deploy/00_deploy_your_contract.ts`. This is the script that `yarn deploy` runs. Keep the imports at the top, and replace the deployment section so it deploys the token first, then the DEX pointing at the token's address:

```ts
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const balloons = await env.deploy("Balloons", {
      account: deployer,
      artifact: artifacts.Balloons,
    });

    await env.deploy("MiniDEX", {
      account: deployer,
      artifact: artifacts.MiniDEX,
      args: [balloons.address],
    });
  },
  { tags: ["MiniDEX"] },
);
```

If the sample script in your project looks slightly different, keep its shape and just swap in these two deployments. Now run `yarn deploy` again from the `dex-tutorial` folder.

Head back to the Debug Contracts tab in your browser. You should now see **Balloons** and **MiniDEX** listed, each showing its address at the top of its card, with a copy icon next to it. Grab the MiniDEX address, then walk the full lifecycle by hand:

1. On the **Balloons** card, call `approve`: paste the MiniDEX address as the spender and enter 500 as the amount. Token amounts are always in the token's smallest unit (18 decimals), so the real number is 500 followed by 18 zeros. Click the ∗ button next to the input field and it does that multiplication for you.
2. On the **MiniDEX** card, call `init`. Payable functions show an extra value field for the ETH you send along: put 5 ETH there, and 500 (times 10^18 again) as `tokens`. Our worked example in Step 4 used 5000 BAL for round numbers, but you only minted 1000, and it makes no difference: the ratio sets the price, not the size. You have just declared 1 ETH = 100 BAL.
3. Call `swapEthForTokens` with 0.1 ETH as the value, then check `balanceOf` your address on the Balloons card to see the tokens arrive.
4. `approve` again, then `swapTokensForEth` to go the other way.
5. `addLiquidity`, then `removeLiquidity`, and check the amounts against what you now expect from the math.

Break things here. Swap something huge, try to withdraw more liquidity than you own, and read the revert messages. This is the cheapest place you will ever get to experiment with an exchange.

## Step 9: A minimal frontend touch

Scaffold-ETH 2 generates typed hooks for every deployed contract, so a swap button is a few lines in any component. Try it in `packages/nextjs/app/page.tsx`:

```tsx
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// inside your component:
const { writeContractAsync: swap } = useScaffoldWriteContract({ contractName: "MiniDEX" });

<button
  className="btn btn-primary"
  onClick={() => swap({ functionName: "swapEthForTokens", value: parseEther("0.1") })}
>
  Swap 0.1 ETH
</button>
```

The hooks wrap [wagmi](https://wagmi.sh) with your contract's types, so `functionName` autocompletes and a typo is a compile error, not a runtime revert. Building out a full swap UI (input fields, balances, price preview) is a good standalone exercise. Every read you need is a `useScaffoldReadContract` call away.

## Step 10: Deploy to a testnet

When the local version behaves, you can put it on Sepolia, Ethereum's public test network. From the `dex-tutorial` folder:

```sh
yarn generate          # creates a deployer account
yarn account           # check its (empty) balance, fund it from a Sepolia faucet
yarn deploy --network sepolia
```

Then point the frontend at Sepolia in `packages/nextjs/scaffold.config.ts` (`targetNetworks`), and you have a public DEX anyone can trade against with test funds.

## What this build leaves out (on purpose)

Being honest about the gap between a learning DEX and production is most of the value of having built one:

- **Slippage protection.** Real swap functions take a `minOutput` and a `deadline`, so a trade reverts rather than filling at a manipulated price. Without them, anyone watching the mempool can sandwich your trades. The [front-running and MEV guide](/guides/front-running-mev-mitigation) covers the attack and the defenses.
- **LP tokens.** Our mapping works, but production pools mint an ERC20 for shares so positions are transferable and composable with other protocols.
- **Reentrancy hardening.** We follow checks-effects-interactions, which covers this contract's ETH sends, but production code adds explicit guards and gets audited. Non-standard tokens (fee-on-transfer, missing return values) also break naive `transferFrom` accounting.
- **Multiple pools and routing.** Uniswap is a factory of pairs plus a router that path-finds through them. Each pool is still the ~100 lines you just wrote.
- **Price oracles.** Reserves-derived prices can be manipulated inside one transaction. Protocols that consume DEX prices use time-weighted averages, not spot.

None of these are exotic. Each one is a manageable extension of the contract you just wrote.

## Keep building

You just built the machine that moves most of DeFi's volume. Two natural next steps:

**Want the guided version with checkpoints, automated grading, and a submission flow? [Take the DEX challenge on Speedrun Ethereum](/challenge/dex).** It walks this same constant-product build with side quests (like calling the DEX from another contract) and a testnet deliverable you submit for review.

**Want the theory you just implemented, derived properly? Read the [AMM math guide](/guides/automated-market-makers-math)**, then stress-test your understanding against the [impermanent loss math](/guides/impermanent-loss-math-explained).
