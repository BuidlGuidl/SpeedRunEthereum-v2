---
title: "How to Build an Ethereum dApp with AI: The 2026 Workflow"
date: "2026-04-29"
description: "A practical workflow for building Ethereum dApps with AI: specs, Scaffold-ETH 2, smart contracts, frontend, security review, deployment, and launch."
image: "/assets/guides/how-to-build-dapps-with-ai-thumbnail1.jpg"
showNavigation: true
faqs:
  - question: "Do I need to know Solidity to build a dApp with AI?"
    answer: "You don't need to be a Solidity expert before you start, but you do need enough Ethereum fundamentals to review what the AI produces. AI assistants can generate syntax quickly; your job is to understand the architecture, risks, and trade-offs well enough to catch bad output."
  - question: "What's the best AI tool for Ethereum development in 2026?"
    answer: "The best tool is one that can work with repository context, terminal output, and project instructions. Claude Code, Cursor, Codex, and opencode are common choices. With Scaffold-ETH 2's AGENTS.md and Skills library, the specific model matters less than the quality of context you give it."
  - question: "How long does it take to build and deploy a dApp with AI assistance?"
    answer: "You can prototype a simple dApp in an afternoon. A secure, well-tested dApp that is ready for real users still takes longer because the hard work shifts to architecture, testing, security review, and deployment decisions."
  - question: "Is Scaffold-ETH 2 suitable for production dApps or just prototyping?"
    answer: "Scaffold-ETH 2 is suitable as a production foundation when you add the normal production work: tests, security review, deployment configuration, monitoring, and audits for contracts that hold value."
---

*The barrier to building on Ethereum isn't Solidity anymore. It's knowing how to give AI enough context to work without hallucinating, how to review what it produces, and which decisions to keep for yourself.*

---

## TL;DR: Building a dApp with AI

- **This is the index article.** It gives you the full 0-to-dApp workflow. The follow-up guides will go deeper on setup, specs, contracts, frontend, security, deployment, and launch.
- **Context beats model choice.** `AGENTS.md`, Scaffold-ETH 2 Skills, and live documentation tools give your AI assistant the project knowledge it needs to generate useful code.
- **Specs and review are the bottleneck.** AI can write syntax quickly. You still need to decide what should exist, define the architecture, review the output, and catch mistakes before they compound.
- **What you'll build toward:** environment setup -> ideation -> primitives -> scaffolding -> contracts -> frontend -> security -> deployment -> launch.
- **Stack:** Scaffold-ETH 2, Hardhat/Foundry, Solidity, OpenZeppelin v5, wagmi/viem, Next.js, and an agentic coding tool like Claude Code, Cursor, Codex CLI, or Antigravity.
- **Prerequisite:** Basic JavaScript and terminal familiarity. No prior Solidity experience required, but you should learn the primitives before shipping anything valuable.

---

## Workflow map

<table className="workflow-map-table">
  <thead>
    <tr>
      <th>Stage</th>
      <th>Goal</th>
      <th>Tooling</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Setup</strong></td>
      <td>Give the AI the right repo context</td>
      <td>Scaffold-ETH 2, <code>AGENTS.md</code>, Skills</td>
      <td>Working full-stack dApp scaffold</td>
    </tr>
    <tr>
      <td><strong>Research</strong></td>
      <td>Pick a viable thing to build</td>
      <td>Perplexity, Gemini Deep Research, NotebookLM, frontier models</td>
      <td>Idea with clear trade-offs</td>
    </tr>
    <tr>
      <td><strong>Spec</strong></td>
      <td>Turn the idea into buildable instructions</td>
      <td>Build Prompts, Claude/Cursor/Codex</td>
      <td>Project spec your agent can follow</td>
    </tr>
    <tr>
      <td><strong>Contracts</strong></td>
      <td>Implement the core rules</td>
      <td>Solidity, OpenZeppelin, Scaffold-ETH 2 Skills</td>
      <td>Tested smart contracts</td>
    </tr>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>Build and wire the user flow</td>
      <td>Next.js, wagmi/viem, Scaffold-ETH hooks</td>
      <td>Usable dApp UI</td>
    </tr>
    <tr>
      <td><strong>Review</strong></td>
      <td>Catch security and architecture issues</td>
      <td>Tests, Grumpy Carlos, PR review, human audit</td>
      <td>Safer launch candidate</td>
    </tr>
    <tr>
      <td><strong>Deploy</strong></td>
      <td>Ship to testnet and an L2</td>
      <td>Hardhat/Foundry, Sepolia, Base/Arbitrum/Optimism</td>
      <td>Live dApp</td>
    </tr>
    <tr>
      <td><strong>Launch</strong></td>
      <td>Explain and distribute the product</td>
      <td>Demo video, docs, automation</td>
      <td>Users can understand and try it</td>
    </tr>
  </tbody>
</table>

![End-to-end workflow for building an Ethereum dApp with AI, split into a human judgment lane and an AI execution lane across five phases](/assets/guides/ai-dapp-workflow.png)

---
## Before you start

### What is a dApp?

A decentralized application has two parts:
- **The backend is one or more smart contracts** running on Ethereum or other blockchains: they hold the application's state and enforce its rules, and once deployed, that logic is public and no single party (including you) can quietly change it.
- **The frontend** is a regular web app that reads contract state and sends transactions. You can host it like any other website, or on decentralized storage like [IPFS](https://docs.ipfs.tech/) so the interface has no single point of failure either.

The architecture looks like this:

![dApp architecture diagram: User wallet signs transactions, frontend sends them via RPC to the smart contract, which writes to blockchain state](/assets/guides/dapp-architecture.png)

Users interact with the dApp through a wallet. The wallet holds their private key and signs transactions with it. The signature proves they control their account and approves that specific action, and the key never leaves the wallet. The frontend just builds the transaction and sends the signed result to the network.

### Why build a dApp in 2026?

Layer 2s have made Ethereum cheap enough for more product ideas, and AI has made it easier to get a working prototype. That does not mean every app needs a token, a contract, or a DAO.

The honest test is still boring: does the product get better when users can verify the rules or hold the asset themselves? If the answer is no, a normal database will be faster, cheaper, and easier to maintain.

The dApps worth building usually have at least one of these properties:

- Users custody something valuable.
- Multiple parties need to coordinate around shared state.
- The rules should be public and hard to change quietly.
- Other builders should be able to compose with the system.
- A credible exit option matters if the interface or operator disappears.

That framing lines up with the [Ethereum Foundation's mandate](https://ethereum.org/foundation/mandate/) and its CROPS priorities: censorship resistance, open source, privacy, and security. Those words can sound abstract, but for a builder they turn into a practical question: what part of this product becomes more useful when it is verifiable?

### The bottleneck shift: specs and review

For most of 2025, AI coding had an awkward shape. Tools like Cursor and Claude Code could see the repo and run commands, which was a big upgrade from autocomplete, but you still had to babysit them. They could follow a small change, then hallucinate a file path, patch the wrong layer, or chase the same test failure in circles.

Around late November 2025, with models like [Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) and the next wave of frontier models, the workflow started to feel different. A good agent could inspect files, run tests, fix type errors, and make progress across a Scaffold-ETH repo without drifting as much. I still would not let it make architecture decisions on its own.

The failure mode is familiar if you have tried this with Ethereum code. It imports a hook that existed in an older wagmi example. It writes a contract that stores an array you should have emitted as events. It passes the happy-path test and misses the economic assumption that makes the feature unsafe.

So the bottleneck moved, but it did not disappear. Your job is now:

![The development bottleneck shifting from writing Solidity syntax to writing specs and reviewing AI output](/assets/guides/development-bottleneck-moved.png)

- Make the product decision before the agent starts generating files.
- Give it enough local context that it follows the repo's patterns.
- Read the tests and the contract together, not as separate artifacts.
- Stop it when the architecture is wrong, even if the code compiles.

This guide walks through that workflow. The follow-up deep dives will include the exact prompts, command output, and fixes instead of staying at the "AI can help" level.

### What you need to start

You don't need any prior Solidity experience to follow this playbook. You just need:

1. **A standard web dev environment:** Node.js, Git, Yarn and a terminal.
2. **An agentic AI coding tool:** [Claude Code](https://claude.com/product/claude-code), [Cursor](https://cursor.com), [Codex](https://openai.com/codex/), or [opencode](https://opencode.ai). Standard chat interfaces struggle with multi-file architectures.
3. **Scaffold-ETH 2:** the full-stack toolkit we'll use. It ships with the modern Ethereum stack pre-configured: Solidity, Next.js, Hardhat/Foundry, and wagmi/viem.

---

## Step 1: Ideation and research

With AI, it's dangerously easy to build the wrong thing very quickly, which is often worse than writing bad code. Before you create the project, you need to know *what to build*.

Don't just ask an LLM for "good dApp ideas", you will get generic, unviable junk. Instead, use AI as a synthesizer for real human friction, real problems that need a fix (and users willing to pay for it). Use AI to build custom scrapers for Crypto Twitter or Farcaster, then let it distill that noise into a list of real user frustrations. You can even have it stress-test the 'clunky' edges or missing features of giants like Uniswap or Hyperliquid, to find the gaps they've left behind.

**Technical Validation:** Once you have a spark, resist the urge to start generating code. Spend time using tools like [Perplexity](https://perplexity.ai) or [Gemini Deep Research](https://gemini.google/overview/deep-research/) for live technical research (e.g., ERC-4337 compatibility) and [NotebookLM](https://notebooklm.google.com) to chat with dense protocol documentation.

When you plan the architecture, use a frontier model to act as your protocol architect. Ask it to propose different approaches and explain the trade-offs of each implementation.

You want to understand the trade-offs before you commit to one approach, because a structural problem is much cheaper to fix at this stage.

---

## Step 2: Learn the primitives (even if you're using AI)

If you're new to Ethereum development, do not skip the primitives. AI can help you move faster, but it cannot review a contract for you if you do not understand what the contract is supposed to do.

The [Speedrun Ethereum challenges](https://speedrunethereum.com) give you a practical path through the basics: staking, tokens, NFTs, DEXs, and other patterns you will see again in real dApps. Each challenge has you write the contract, run the tests, deploy it, connect a frontend, and understand how the pieces fit together before you start directing an AI agent on a project of your own.

You can "speedrun your speedrun" by running `/start` in your agentic AI coding tool. You'll get the help of an AI tutor to guide you through the curriculum, providing concept explanations, knowledge checks, hints (not answers), and live code reviews.

<iframe src="https://www.youtube-nocookie.com/embed/-PmiWqxzBdo?rel=0&modestbranding=1&iv_load_policy=3&color=white&disablekb=1" title="Speedrun Ethereum AI Tutor Demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>

This is the fastest useful version of learning: you still do the work, but you get unstuck faster and get feedback while the concepts are fresh.

---

## Step 3: Plan your Ethereum dApp (spec first, not vibe first)

Before you ask an AI agent to build anything, turn the idea into a spec. That spec keeps the agent from guessing, it captures the main decisions upfront: features, design, architecture, business logic, and edge cases.

We built 12 **[Build Prompts](https://speedrunethereum.com/build-prompts)** for common Ethereum primitives: Multisig, Bonding Curve, DAO, Streaming Payments, Staking Pool, Token Launchpad, and more. Treat them as starting points, not magic prompts. Pick the closest one, edit the assumptions, and make it match the product you actually want to build.

![Build Prompts: AI-ready dApp specifications for Ethereum primitives like Multisig, DAO, Staking Pool and Token Launchpad](/assets/guides/build-prompts-clip.gif)

A useful spec should answer a few boring questions before code starts:

- Who are the users?
- What actions can they take?
- What state lives in the contract?
- What can stay off-chain?
- What should happen when something fails?
- What tests would prove the basic behavior works?

The Build Prompts already follow that shape. A simplified example:

```markdown
# SPEC: Token Staking Protocol

## 1. Objective
A DeFi mechanism where users lock up a base ERC-20 token to earn a second "Reward" ERC-20 token over time.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2...
```

If none of the existing prompts fit, write your own using the same structure: objective, actors, contract state, user flows, edge cases, tests, and deployment notes. The exact wording matters less than making the important decisions explicit.

Before you commit to the architecture, ask a strong reasoning model to attack the idea. I would use a prompt like this:

```text
Here's my project idea: [description]. What are the three most likely ways this
fails: technically, economically, and from a UX standpoint? What existing
protocols am I competing with, and what would need to be true for someone to
use mine instead?
```

Do not just look for encouragement. Look for the part of the idea that breaks: too much state on-chain, unclear incentives, bad UX, expensive transactions, or a product that already exists and wins on trust.

If the idea survives that review, then you have something useful to give your coding agent. If it does not, change the spec before you create a repo full of code around the wrong plan.

---

## Step 4: Let AI build your project using Scaffold-ETH 2

If you use a Build Prompt, the **Pre-flight & Context** section handles this for you. It tells the agent to check if the project is already scaffolded and, if not, uses the **Orchestrator Skill** (`https://docs.scaffoldeth.io/SKILL.md`) to set it up correctly.

If you wrote your own spec, just add that same check to the top of your prompt:

```text
Check if ./packages/nextjs/scaffold.config.ts exists. If not, follow https://docs.scaffoldeth.io/SKILL.md to scaffold the project first.
```

This forces the agent to use Scaffold-ETH 2's official structure instead of hallucinating its own folder structure and scripts. If the repo starts in the wrong shape, everything else (hooks, deploy scripts, ABIs) will break later.

---

## Step 5: Add your project context on top of AGENTS.md

When the Scaffold-ETH 2 project is created, the repo should include an `AGENTS.md` file. That file gives the coding agent the SE-2 defaults: commands, package layout, hook names, deploy flow, and the Skills/Agents index.

Do not stop there, add your specific project context the generated file cannot know:

- what the dApp does
- which users and roles exist
- which network you are targeting first
- which parts must stay onchain
- which parts can be handled by indexing or a backend

Once you start building your project features, if you notice the agent keeps making the same mistake, write the correction or the missing context into `AGENTS.md` instead of repeating it every session.

This will help the agent to stop making the same mistake in the future.

---

## Step 6: Build secure smart contracts with the Skills library

When your AI starts writing smart contracts, its biggest enemy is its own training data. If you ask it to build an Account Abstraction Paymaster from scratch, it will likely hallucinate deprecated `UserOperation` structs or miss critical validation loops.

You fix this by providing explicit knowledge files, or **Skills**, instead of hoping the model remembers the correct, up-to-date syntax. In a modern workflow, you should layer this knowledge at two levels:

**1. Ecosystem Knowledge (ethskills.com)**
Before writing any Solidity, your agent needs the base reality of Ethereum today. [ethskills.com](https://ethskills.com/) is an open-source library of AI skills covering current standards, security pitfalls, gas costs, L2s, and contract addresses. Depending on your AI coding tool, you can load this context by pointing the agent to a `SKILL.md` file, installing the skill, adding it to your agent instructions (`AGENTS.md`), or adding a reviewed copy to your repo. This prevents the agent from hallucinating fake addresses or using outdated standards.

**2. Local Implementation Skills**
While `ethskills` provides the global baseline, Scaffold-ETH 2 ships with local, project-specific skills for building distinct features (like SIWE, ERC-4337, or OpenZeppelin patterns). These are indexed in your project's `AGENTS.md`.

When you assign a task (like "build a paymaster"), the agent should find and load the right local skill on its own. Check that it actually did: you should see it read the skill file before it starts drafting. If it doesn't, ask for it explicitly ("Load the ERC-4337 Account Abstraction skill"). This gives you a starting point that uses the correct modern syntax and actually compiles before you begin your testing loop.

---

## Step 7: Add a backend when the contract isn't enough

Not everything needs to be on-chain. Computation is expensive on Ethereum, and some parts of the app can be handled by a traditional backend: complex queries, off-chain indexing, notifications, user authentication, and dashboard data.

The contract should handle the state that needs to be trustless and verifiable. The backend can handle the parts that need to be fast, cheap, searchable, or easier to change.

The most common hybrid patterns:

- **Event indexing:** your contract emits events, and a backend ([The Graph](https://thegraph.com/), [Ponder](https://ponder.sh), or [Envio](https://envio.dev)) reads them and builds queryable state. Querying an indexed database is much faster than reading thousands of historical events directly from the chain.
- **Gasless transactions:** ERC-4337 smart accounts, a paymaster, or a relayer can let users take an action without holding ETH first. The contract still enforces the rules; the backend helps with the transaction flow.
- **Off-chain computation, on-chain settlement:** compute the expensive part off-chain, then post the result, proof, or commitment on-chain. This is useful when the chain should settle the outcome, but does not need to run every calculation itself.

![What belongs on-chain versus off-chain, connected by hybrid patterns like event indexing and gasless transactions](/assets/guides/onchain-vs-offchain.png)

> **Practical check:** put something on-chain when users need to verify it or act on it. Put it off-chain when it is mostly for search, sorting, notifications, analytics, or a dashboard.

---

## Step 8: Build your dApp frontend (prototype fast, then wire it properly)

For a first version of the UI, asking your coding agent directly is usually enough. It already knows your contract, the repo structure, and the Scaffold-ETH 2 components, so you get a working interface wired to real data without leaving the session.

When you want a more custom design, a dedicated design tool helps you get past the blank-page phase. Describe the interface in [v0.dev](https://v0.dev), or ask Claude to design it first, then bring the generated React component into your repo. At that stage the design tool doesn't need to understand your Ethereum architecture. It just needs to give you a good starting point.

This is where Scaffold-ETH 2 hooks help. I would start with `useScaffoldReadContract` and `useScaffoldWriteContract` instead of asking the AI to write raw `wagmi` or `viem` code from memory. Those libraries change often enough that agents can still produce examples from an older API.

Before polishing the frontend, click through the flow on a local chain. Check that the UI is reading from the deployed contract data, not from hardcoded sample balances, duplicated addresses, or mock state the agent left behind.

If the assistant still gets a library pattern wrong, [Context7 MCP](https://context7.com/docs) can pull current docs into the session. That is useful when you do not have a dedicated Skill for the library you are using.

---

## Step 9: AI security review before you ship your dApp

AI review is useful before you ask another person to look at the code. I would use it to catch the obvious things first: missing access checks, suspicious state changes, untested branches, and code that does not match the spec. What I would not expect it to do is decide whether the protocol design or incentives make sense.

In Scaffold-ETH 2, the built-in **[Grumpy Carlos Reviewer](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/.agents/agents/grumpy-carlos-code-reviewer.md)** skill is a good first pass before you open a PR. It makes the agent switch from build mode to review mode and look for ways the contract could break.

Once you have that local pass, keep your normal PR review process. Tools like [CodeRabbit](https://docs.coderabbit.ai/) or [Qodo](https://docs.qodo.ai/code-review) can leave automated comments on the pull request and help catch stale patterns or smaller mistakes you missed locally.

I would still treat those tools as preparation for a real review, not as the review itself. They can miss economic attacks, upgrade risks, strange edge cases, and assumptions that only make sense if you understand the product.

If the contract will hold real value, plan for a human security review or audit. Ask that reviewer to look at the spec, tests, and threat model too, not only the Solidity.

---

## Step 10: Deploy (local -> Sepolia -> L2)

Deployment is easier if you do not jump straight from local code to production. I would first use a local Hardhat or Foundry chain while the contracts are still changing, then move to Sepolia, or to the testnet for the L2 you plan to use. That testnet step is where you check the full flow with a real wallet, RPC, block explorer, and deployed address.

For most new dApps, an L2 is the first production network I would consider. Base, Arbitrum, and Optimism use the same Solidity toolchain, but transactions are much cheaper than on Ethereum mainnet. In many projects, changing the target network is mostly configuration. The part that tends to go wrong is making sure the frontend, environment variables, explorer links, and deployment artifacts all point to the same place.

Before you deploy, check current fees on [L2Fees.info](https://l2fees.info). Fees move, and a network that is fine for one app may be too expensive for another.

Scaffold-ETH 2 already includes the commands for this whole ladder:

```bash
yarn chain                     # run a local network
yarn deploy                    # deploy your contracts to it
yarn start                     # frontend on http://localhost:3000

yarn deploy --network sepolia  # deploy to a testnet
yarn verify --network sepolia  # verify on the block explorer
```

The [deployment docs](https://docs.scaffoldeth.io/deploying/deploy-smart-contracts) cover the details: deployer accounts, network configuration, and shipping the frontend. If deployment fails, give the full error output to the agent, but ask it to explain the cause before it patches anything: wrong RPC, missing deployer funds, wrong chain id, bad constructor arguments, or the frontend still pointing at an old deployment.

---

## Step 11: Launch with real product assets

It is worth thinking about launch before the dApp is deployed. A technically working dApp still needs a clear demo, a short explanation, and a way for people to understand what happened onchain.

AI tools can help with that, but I would keep them close to the real product. Use the actual flow, screenshots, contract events, and the deployed app as the source material. You are not trying to fill every channel with generated content. You are trying to make the project easier to inspect and understand.

**Visuals and video:**
- [ChatGPT](https://help.openai.com/en/articles/11084440) or [Midjourney](https://midjourney.com) for image assets, branding ideas, hero images, and social assets
- [Sora](https://sora.com) or [Veo](https://deepmind.google/models/veo/) for short demo videos
- [Remotion](https://www.remotion.dev) for product videos you can regenerate when the UI changes

**Distribution and community automation:**
- [n8n](https://n8n.io) or [Make](https://make.com) for workflows like: contract event -> Discord post -> email notification -> lead capture
- A small automation can handle launch updates while you keep improving the product

This is especially useful because your contract already emits events: deposits, withdrawals, votes, mints, claims, or whatever matters in your app. If those events are useful for users, they can also be useful for launch updates and community signals.

---

## What actually makes this work

This workflow works because each tool gives the agent better context.

![Four tools bridging the gap between what an AI assistant assumes and what is true about your project: AGENTS.md, the Skills library, Context7, and SpeedRunEthereum](/assets/guides/context-gap-bridge-diagram.png)

`AGENTS.md` tells the assistant how the repo is structured. Skills give it better context for Ethereum standards. Context7 helps when a library or API has changed. Speedrun Ethereum teaches you the core Ethereum ideas, so you can notice when the agent writes something that looks right but is not. Tests and review show where the code breaks.

When the context is better, the code is usually easier to review, test, and maintain.

Once you have that base, come back with a spec and let your agent help you build something real.

---

## Ready to build?

- **Learn the primitives first:** run the first [Speedrun Ethereum challenge](https://speedrunethereum.com) before you touch a production scaffold.
- **Start from a real spec:** browse the [Build Prompts](https://speedrunethereum.com/build-prompts) and pick a dApp idea your AI assistant can execute.
- **Use this as your series map:** come back here as the follow-up deep dives publish for setup, specs, contracts, frontend, security, deployment, and launch.
