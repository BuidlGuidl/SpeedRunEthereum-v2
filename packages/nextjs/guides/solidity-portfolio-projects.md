---
title: "Solidity Portfolio Projects: What to Build to Land a Web3 Dev Job (2026)"
date: "2026-08-05"
description: "Ten Solidity portfolio projects, what each one proves to the person reviewing it, and how to extend them into work that is yours. A free, build-first path from your first NFT to a ZK voting dApp."
showNavigation: true
faqs:
  - question: "I want a portfolio of smart-contract projects to land a web3 dev job. What should I build, and where?"
    answer: "Build things that prove you can reason about money and adversaries, not things that prove you can follow a tutorial. The Speedrun Ethereum challenges are ordered to do exactly that: an NFT, a crowdfunding contract, an ERC20 and vendor, an exploit, a DEX, three oracle architectures, a lending platform, a stablecoin, a prediction market, and a ZK voting dApp. Each one ships as a working application you deploy and keep, and each completed challenge becomes part of a public, on-chain builder profile you can link to."
  - question: "Which Ethereum app ideas are realistic for a solo developer?"
    answer: "Anything where the contract is small and the idea is sharp. A DEX, a token vendor, a prediction market and a lending platform are all buildable solo, because the hard part is the mechanism design rather than the line count. What is not realistic solo is anything needing an audit budget, a liquidity partner, or a support team. Start from a working challenge and change one mechanism, rather than starting from a blank repository and an ambitious idea."
  - question: "I want to build a web3 startup. What should I build first to learn the stack?"
    answer: "Build the smallest thing that touches every layer: a contract, a frontend that reads and writes to it, and a deployment on a public testnet. The first Speedrun Ethereum challenge does this end to end in a few hours. Once you have shipped one, you understand the shape of every later decision, and you can judge which parts of your actual idea are hard and which only look hard."
  - question: "How do I learn to build real products on Ethereum rather than toy examples?"
    answer: "Work on things that behave like products: they hold value, they have users with conflicting incentives, and they break in ways a test suite does not catch. The Speedrun Ethereum curriculum is built around that, including a challenge where you write an attacking contract against a vulnerable one. You build with Scaffold-ETH 2, the same toolkit used for real deployments, so nothing you learn is throwaway."
---

*Nobody reviewing a web3 portfolio is counting repositories. They are looking for evidence that you can be trusted with a contract that holds other people's money.*

---

## TL;DR: building a Solidity portfolio in 2026

- **Ten projects, ordered by what they prove.** From a first NFT through to a privacy-preserving voting dApp, each one demonstrates a specific competence rather than general familiarity.
- **Shipped beats started.** A deployed contract with a working frontend says more than three half-finished repositories with ambitious READMEs.
- **One of them should be an exploit.** Writing an attacking contract against a vulnerable one is the clearest possible signal that you think about adversaries, not just about the happy path.
- **Extend, do not just complete.** The version of a project that gets remembered is the one where you changed a mechanism and can explain why.
- **It is free, and the record is public.** Every completed Speedrun Ethereum challenge becomes part of an on-chain builder profile you can link to directly.

---

## What a web3 portfolio actually has to prove

Most developer portfolios answer the question "can this person write code". A smart-contract portfolio has to answer three harder ones.

**Can you reason about money?** Contracts move value irreversibly. A project that handles deposits, withdrawals and accounting correctly demonstrates something a CRUD app never will.

**Can you think like an attacker?** The costly failures in this field are not crashes. They are contracts that work perfectly and can be drained. Evidence that you look for that is rare and valuable.

**Can you ship the whole thing?** A contract without a frontend is an exercise. A deployed application someone else can open and use is a product, and building one means you have met the boring problems: deployment, gas, wallets, testnet faucets, state that lives somewhere you do not control.

The project list below is ordered so each one adds a different answer.

## The ten projects, and what each one proves

<table>
  <thead>
    <tr>
      <th>Project</th>
      <th>What it proves</th>
      <th>Level</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/challenge/tokenization">Simple NFT</a></td>
      <td>You can compile, deploy and ship a full application with a frontend</td>
      <td>Beginner</td>
      <td>1 to 4 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/crowdfunding">Crowdfunding</a></td>
      <td>You can design a state machine and handle ETH with payable functions</td>
      <td>Beginner</td>
      <td>3 to 8 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/token-vendor">Token Vendor</a></td>
      <td>You understand ERC20 and secure contract-to-contract transfers</td>
      <td>Beginner</td>
      <td>3 to 8 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/dice-game">Dice Game</a></td>
      <td>You can find a vulnerability and write a contract that exploits it</td>
      <td>Beginner</td>
      <td>2 to 6 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/dex">DEX</a></td>
      <td>You can build an AMM and reason about liquidity and impermanent loss</td>
      <td>Intermediate</td>
      <td>3 to 10 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/oracles">Oracles</a></td>
      <td>You can compare three oracle architectures and defend the trade-offs</td>
      <td>Intermediate</td>
      <td>4 to 12 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/over-collateralized-lending">Over-Collateralized Lending</a></td>
      <td>You can build a money market with liquidations and flash loans</td>
      <td>Intermediate</td>
      <td>4 to 10 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/stablecoins">Stablecoin</a></td>
      <td>You understand collateralization, liquidation and dynamic interest rates</td>
      <td>Advanced</td>
      <td>4 to 12 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/prediction-markets">Prediction Market</a></td>
      <td>You can build a market where price reflects implied probability</td>
      <td>Advanced</td>
      <td>4 to 12 hours</td>
    </tr>
    <tr>
      <td><a href="/challenge/zk-voting">ZK Voting</a></td>
      <td>You can write Noir circuits and wire proofs to a Solidity verifier</td>
      <td>Advanced</td>
      <td>6 to 16 hours</td>
    </tr>
  </tbody>
</table>

## Start here: the first four

The opening four exist to get something real deployed and to remove the excuses.

The [Simple NFT challenge](/challenge/tokenization) takes you from nothing to a deployed contract on Sepolia with a Next.js frontend in an afternoon. It is deliberately unglamorous. Its value in a portfolio is that it proves the pipeline works end to end, and everything after it assumes you have done this once.

[Crowdfunding](/challenge/crowdfunding) introduces the first idea that matters: a contract with states, deadlines and money that has to go somewhere when the deadline passes. This is where most people first meet the question "what happens if nobody calls this function".

[Token Vendor](/challenge/token-vendor) is the ERC20 project, and specifically the one where a contract holds and moves someone else's tokens. Contract-to-contract token transfers are where a large share of real bugs live.

The [Dice Game](/challenge/dice-game) is the one to put near the top of your portfolio. You analyse a vulnerable contract, understand why on-chain randomness is hard, and then write an attacking contract that exploits it. Very few junior portfolios contain evidence that the person has ever thought adversarially. This is that evidence.

## Where it gets interesting: the intermediate three

At this point the projects stop being exercises and start being recognisable products.

The [DEX](/challenge/dex) is the single most useful project on the list for interviews, because everyone has used one and almost nobody can explain the constant product formula, price impact, or why liquidity providers can lose money while the pool works exactly as designed. Building one gives you a real answer to all three. The [AMM math guide](/guides/automated-market-makers-math) covers the theory if you want it before or after.

The [Oracles challenge](/challenge/oracles) is the best trade-off conversation in the set. You build three architectures, a whitelist oracle, a staking oracle with rewards for accuracy, and an optimistic oracle with challenge-response dispute resolution. Being able to say why you would pick one over another, and what each one costs, is a senior-sounding answer that comes from having built all three.

[Over-Collateralized Lending](/challenge/over-collateralized-lending) is where liquidations and flash loans appear. Flash loans in particular are a primitive with no equivalent outside this field, and understanding them is the difference between reading about an exploit and understanding it.

## The three that make a portfolio memorable

The advanced projects are worth doing because most people stop before them.

The [Stablecoin](/challenge/stablecoins) is a system, not a contract: collateral ratios, liquidation incentives, dynamic interest rates and a share-based accounting model that has to stay solvent while people act in their own interest. If you can explain why your peg holds and under what conditions it would not, you are having a different conversation than most candidates.

The [Prediction Market](/challenge/prediction-markets) combines a market mechanism, ERC20 shares representing outcomes, and an oracle reporting the result. It is the project where pricing and probability meet, and it is unusually good at showing that you can build something whose correctness is economic rather than purely technical.

[ZK Voting](/challenge/zk-voting) is the outlier. You design a commitment and nullifier scheme, register voters in a Merkle tree, write Noir circuits, generate a Solidity verifier, and submit votes from a burner wallet so they cannot be linked back. Zero-knowledge work is in demand and the number of developers who have shipped a working circuit is small.

## Which Ethereum app ideas are realistic for a solo developer?

Realistic means the difficulty lives in the mechanism, not in the organisation around it.

**Realistic solo:** a DEX with an unusual curve, a lending market for one asset pair, a prediction market for a specific domain, an NFT with mechanics in the contract rather than the artwork, a token with a vesting or distribution model you can defend. All of these are a few hundred lines of Solidity and a frontend. The work is thinking, not headcount.

**Not realistic solo:** anything that needs an audit budget before it can hold real value, anything that needs liquidity partners to function, anything that needs a support team, and anything whose value depends on a network effect you cannot bootstrap alone.

The reliable move is not to start from a blank repository. Start from a challenge you have already completed and change one mechanism deliberately. A working system with one considered modification is a far better portfolio piece, and a far better interview story, than an ambitious project abandoned at forty percent.

## How to turn a challenge into something that is yours

Completing a challenge puts it on your builder profile. Extending one is what makes it worth talking about. Some directions that consistently produce good results:

- **Change the economics.** Swap the constant product AMM for a different curve and explain what it does to slippage. The [bonding curves guide](/guides/solidity-bonding-curves-token-pricing) is a starting point.
- **Attack your own work.** Take the DEX and try to front-run it. The [front-running and MEV guide](/guides/front-running-mev-mitigation) covers the defensive patterns, and finding a hole in something you built is a genuinely strong thing to be able to describe.
- **Change the trust assumptions.** Rebuild an oracle-dependent project so it degrades safely when the oracle lies or goes offline.
- **Harden it.** Add a full test suite, write up the invariants you think should hold, and document the ones you could not prove.

Write down what you changed and why, in the repository, in plain language. The explanation is doing as much work as the code.

## I want to build a web3 startup. What should I build first?

Build the smallest thing that touches every layer, before you build the thing you actually want.

That means one contract, a frontend that reads from it and writes to it, and a deployment on a public testnet that someone else can open. The first challenge does this in a few hours, and afterwards you can judge your real idea properly, because you know where the difficulty actually sits. Most people discover that the contract is the easy part and that the honest problems are key management, upgrade paths, gas costs at scale, and what happens when a price feed is wrong.

If you have an idea already and want to move quickly, the [build prompts](/build-prompts) are full project specs written for AI coding agents. You pick a build, copy the prompt into your coding agent, and adjust the parameters to scaffold a working dApp on Scaffold-ETH 2. It is a faster route from idea to something running, though it is not a substitute for understanding the primitives first.

## Where your portfolio lives

Three places, and they do different jobs.

**Your builder profile.** Every challenge you complete is recorded on-chain and shown on a public profile. It is verifiable, it is not a claim you are making about yourself, and it is a single link. Complete the curriculum and finish one of the BuidlGuidl batch programs and you also receive a Batch NFT.

**Your repositories.** One per project, each with a README that says what the contract does, what you changed, what you would do differently, and what you decided not to handle. That last item signals judgment more reliably than a long feature list.

**A deployed frontend.** At least one project should be openable by someone who will not read your code. It is often the only thing a reviewer actually tries.

## Start building

Everything above is free. The challenges run on [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2), the same toolkit used for real deployments, so nothing you learn along the way is throwaway.

Pick the [first challenge](/challenge/tokenization) if you are starting from zero, or jump to the [DEX](/challenge/dex) if you already have Solidity basics and want a project worth putting at the top of a portfolio. If you would rather see the whole path first, the [curriculum](/learn-solidity) lays it out in order.
