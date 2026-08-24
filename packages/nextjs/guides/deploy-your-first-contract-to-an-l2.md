---
title: "Deploy Your First Smart Contract to an L2, with Scaffold-ETH 2"
date: "2026-08-05"
description: "Austin Griffith and Elliot Friedman take a counter contract from an empty folder to a live deployment on Arbitrum: scaffold, tinker locally, fund a deployer, deploy for a fraction of a cent, then bridging, the address table precompile, and forced transactions. Full video and edited transcript."
image: "/assets/guides/deploy-your-first-contract-to-an-l2.jpg"
showNavigation: true
faqs:
  - question: "How do I deploy my first smart contract so that I can interact with it?"
    answer: "Scaffold the project, get the contract working against a local chain, then point the same project at a live network. With Scaffold-ETH 2 that is npx create-eth@latest to scaffold, yarn chain and yarn deploy and yarn start to run it locally, yarn generate to create a deployer account, funding that account with a small amount of ETH, then yarn deploy --network <network>. Changing the target network in scaffold.config.ts moves the frontend over too, so the same UI you used locally is now talking to the deployed contract."
  - question: "How much does it cost to deploy a contract to an L2?"
    answer: "Very little. In this video the deployer wallet is funded with 25 cents of ETH on Arbitrum, which covers the deployment with room to spare, and each subsequent transaction costs a fraction of a cent. That is the practical reason to deploy to an L2 rather than Ethereum mainnet while you are learning: the cost of a mistake is measured in cents."
  - question: "Do I need a testnet, or can I deploy straight to a live L2?"
    answer: "Both work, and the video does both. Testnets are free but come with friction: bridging into an L2 testnet means waiting around 15 minutes for the deposit, and testnet faucets and wallets are often flaky. Because an L2 deployment costs cents, deploying straight to the live network is a reasonable choice once the contract behaves locally. Use a testnet when the contract will hold funds that matter, and keep your deployer key isolated with only what that one application needs."
  - question: "What is a Scaffold-ETH extension?"
    answer: "An extension packages only the changes your starter kit adds, rather than forking the whole framework. When someone installs it with create-eth, they get the latest Scaffold-ETH plus your additions, so the starter kit never drifts out of date the way a stale fork does. The Arbitrum extension in this video adds a bridge UI, an address table precompile page, and forced transaction signing."
  - question: "What is a forced transaction on an L2, and why does it matter?"
    answer: "An L2 uses a sequencer to order transactions before they reach L1. A forced transaction is the escape hatch if that sequencer refuses to include yours: you post the transaction on L1 instead, and after a delay you can execute it on the L2 whether the sequencer wants it or not. You pay mainnet gas and you wait, but it means your ability to withdraw funds does not depend on the sequencer's cooperation. That censorship resistance is part of what separates an L2 from a side chain."
---

Everything before your first live deployment is a rehearsal. The contract that only exists on a local chain has never paid gas, never dealt with a real wallet, and never had anyone else able to call it.

In this video Austin Griffith and Elliot Friedman close that gap twice. First with stock Scaffold-ETH 2: a counter contract from an empty folder to a live deployment on Arbitrum, for about a quarter of a dollar. Then with Elliot's Arbitrum extension, which adds the things that are specific to living on an L2: bridging, the address table precompile, and forced transactions.

The full video is below, followed by a timestamped outline and an edited transcript.

<iframe src="https://www.youtube.com/embed/3l2p2q3MaT8" title="Deploy Your First Smart Contract on Arbitrum, with Scaffold-ETH and the Extension Kit" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What's in this video

- [Extensions, and why they beat forking (00:00-01:33)](#extensions-and-why-they-beat-forking-0000-0133)
- [Scaffolding the project and writing a counter (01:33-04:09)](#scaffolding-the-project-and-writing-a-counter-0133-0409)
- [Running it locally, and burner wallets (04:09-05:42)](#running-it-locally-and-burner-wallets-0409-0542)
- [Reading the counter from the frontend (05:42-07:15)](#reading-the-counter-from-the-frontend-0542-0715)
- [The deployer account, and funding it (07:15-08:46)](#the-deployer-account-and-funding-it-0715-0846)
- [Pointing the whole app at the live network (08:46-10:20)](#pointing-the-whole-app-at-the-live-network-0846-1020)
- [Starting over with the Arbitrum extension (10:20-12:52)](#starting-over-with-the-arbitrum-extension-1020-1252)
- [Bridging in, and bridging back out (12:52-14:58)](#bridging-in-and-bridging-back-out-1252-1458)
- [The address table precompile (14:58-20:09)](#the-address-table-precompile-1458-2009)
- [Forced transactions, and why an L2 is not a side chain (20:09-24:19)](#forced-transactions-and-why-an-l2-is-not-a-side-chain-2009-2419)
- [Which one should you start with? (24:19-25:56)](#which-one-should-you-start-with-2419-2556)

## The deployment path, in short

The whole first half of the video is six commands and one config change:

- `npx create-eth@latest` scaffolds the monorepo. This build picks Hardhat for the contracts side.
- `yarn chain` starts a local blockchain, `yarn deploy` puts the contract on it, `yarn start` serves the frontend at `localhost:3000`.
- `yarn compile` on its own when you just want to check that the Solidity builds.
- `yarn generate` creates a deployer account, and `yarn account` shows its balance.
- Fund that deployer address with a small amount of ETH on your target network. 25 cents is enough here.
- `yarn deploy --network arbitrum` ships the contract.

Then change the target network in `scaffold.config.ts` from `hardhat` to `arbitrum`, and the frontend follows the contract onto the live network. Burner wallets stop applying at that point, because a real network means a real wallet.

The second half is specific to L2s and comes from the Arbitrum extension rather than stock Scaffold-ETH 2: a bridge UI, the address table precompile for cheaper call data, and forced transaction signing.

## Transcript

Edited from the video's captions for punctuation, length, and readability. Austin Griffith is driving; Elliot Friedman built the Arbitrum extension. Timestamps link to the corresponding point in the video above.

## Extensions, and why they beat forking (00:00-01:33)

**Austin:** Here I am with Elliot and we're working on an Arbitrum starter kit, or deploying your first contract to Arbitrum.

There are multiple starter kits for Arbitrum, and we'll show the one Elliot has created in a little bit. But Scaffold-ETH itself is already ready to go with Arbitrum, so I want to show a simple smart contract first. Let's put our very first contract on Arbitrum with stock Scaffold-ETH. Maybe we'll make a little counter contract, deploy it locally, then put it on Arbitrum, and then we'll use your starter kit.

The thing you've built is an extension of Scaffold. Do you want to talk about that a little?

**Elliot:** Extensions are great, because you get all the latest and greatest that Scaffold has to offer, and you build an extension that only has the necessary changes to add whatever you built. Then anyone who wants that same functionality loads the latest Scaffold-ETH with your extension in it.

So you never get the drift problem, where you built a branch, it gets outdated, and people try to use it but it's ancient and needs dependency updates and all of that. Your starter kit stays state of the art, that's my elevator pitch. You have your logic, and everything else comes from whatever the latest Scaffold is.

## Scaffolding the project and writing a counter (01:33-04:09)

**Austin:** We're just going to make a counter. Really simple. `npx create-eth@latest`. You get the option here, and since we're using Hardhat I'll pick Hardhat. This takes a minute to install.

Let's open it up with Cursor, or whatever your favorite editor is. You'll notice there's `hardhat` and `nextjs`, two packages. In Hardhat you'll find your contract, and that's where the greeter is. Simple enough, there's a little greeter contract.

We're building a counter though, so I'm going to knock some of this out. We don't want any console logs, for instance. We want to put a production app on Arbitrum.

So: `uint256 public count`, which starts at zero. And then a function, `incCount`, that does `count += 1`. There we go, we've got our counter.

## Running it locally, and burner wallets (04:09-05:42)

With Scaffold-ETH, while you're poking at your code you may want to compile first. You can `yarn compile`, and whether you're using Hardhat or Foundry underneath, it calls whatever command is needed. Looks like we're ready, so let's deploy the new contract and make sure it reaches the frontend.

Go to `localhost:3000` and you'll find your Scaffold-ETH app running. Go to Debug Contracts, and there's `count` and `incCount`.

Something's going on here: it's telling me to switch to Hardhat. I could do that, but I'm not even going to use my MetaMask. When you're on localhost it's often better to disconnect entirely, because Scaffold gives you burner wallets out of the box. Then we click this and suddenly we have all the money we need to poke around.

Let's hit this button and increment our counter. Look how fast that works. You just click it and it increments.

## Reading the counter from the frontend (05:42-07:15)

Let's say you've poked at your contract enough. Let's put the counter in the frontend too, to close the loop.

In your app you've got a page, and the Scaffold-ETH docs tell you how to interact with your contracts. Let's read what the counter is. We could put a button in to increment it too, but I'm just showing one hook here.

Watch this: it's going to know about `count`. I have to import it from Scaffold-ETH first. It knows about our contract, it even tries to autocomplete. That's what I wanted to show. When you're editing your frontend, it knows about your smart contracts and the values in them. When I hit control-space, it asks which variable I want out of my contract.

Now we have this `count` variable, and I can drop it in. When we look at our frontend it says Scaffold-ETH 2, and there's our count at eight for some reason. Increment a couple more and we see it go up on the front page.

## The deployer account, and funding it (07:15-08:46)

Let's get this out on Arbitrum. When we deploy we say `--network arbitrum`, and it's going to tell us we need a deployer account and some money. So let's generate that deployer account. It asks for a password.

Now we need to put some real ETH on this account. If I go to my wallet, put in this account, switch to USD, let's send 25 cents. Should be pretty cheap to deploy this contract to an L2. It sends almost instantly.

Now let's try again: `yarn deploy --network arbitrum`. Let's see if we can put our first contract on Arbitrum. Please work first try. Deploying. There it is.

## Pointing the whole app at the live network (08:46-10:20)

Some things have changed here. We're on Hardhat, so we need to edit our config to put the app on Arbitrum, and you do that in `scaffold.config`. Right now we just have `hardhat` as the network. Replace that with `arbitrum` and the whole app changes over.

That kicks us out of the burner wallet, so we have to connect MetaMask now, because we're on a real network.

And let's say we're accidentally on mainnet. What happens if someone arrives with their wallet on mainnet? Scaffold-ETH bumps them over to Arbitrum.

Let's increment the counter onchain. What's the count right now, zero? If I hit `incCount` it pops up a dialog and we pay a whole tenth of a penny. Watch this counter. That is fast. Let's do it a couple more times, it's a fraction of a cent. There's our counter incrementing.

So we were able to put our first contract out on Arbitrum, and there's the contract live on Arbiscan. Scaffold is great at that: you can quickly put an app with a frontend backed by a smart contract out on any EVM network, L2s, mainnet, whatever you want. Hardhat locally, Foundry locally, poke at it on local and send it up when you're ready.

You should spend a lot more time on your contract and a lot more time on your frontend, but this shows how to get your first contract out there and have something on Arbitrum making real transactions.

## Starting over with the Arbitrum extension (10:20-12:52)

Now let's lean into the extension. I'll close all this up, `cd` back to my main repo, and start from scratch.

Here's the command Elliot sent me. We're going to `npx create-eth` just like we did, but now with a beta version and an extension. We'll name it `arb-app`.

In this case we're not going to do any debugging on Hardhat or localhost. These features are testnet and mainnet only, is that right?

**Elliot:** Arbitrum Sepolia and Arbitrum, because it uses some precompiles that Arbitrum provides to developers building contracts. It showcases those and lets you use them, but as a result you can't use it on local Hardhat.

**Austin:** So we won't even fire up a chain. We can start our app: `cd arb-app`, then `yarn start` to bring up the frontend. But now there's no chain. Our frontend has localhost, but we can't really do anything there because of the precompiles.

If you're planning to spend a lot of time on localhost, probably just start with Scaffold-ETH. This starter kit is going to show the bridge, the address table, and forced transactions.

## Bridging in, and bridging back out (12:52-14:58)

I need to be on Sepolia first to bridge some funding in. So let's switch to Sepolia and go to the bridge feature. Stop me, Elliot, if I'm doing anything wild.

This is the bridge tab, and I should be able to send in one ETH and deposit it on Sepolia. Then we have to wait 15 minutes and I get some Arbitrum Sepolia. Let's switch over to Arbitrum Sepolia as if that already happened, because I sent some about 15 minutes ago so we'd be ready. Sorry, developer at home: you have to wait.

**Elliot:** You could go ahead and withdraw from the bridge, to show it works the other way.

**Austin:** If I wanted to pull money from Arbitrum Sepolia back to Sepolia, I'd initiate a withdrawal.

**Elliot:** Exactly. That takes a week to complete, because it goes through the fraud proof window where it waits to see if anyone contests that it isn't legitimate.

## The address table precompile (14:58-20:09)

**Austin:** Tell us about this address table. It saves us some gas?

**Elliot:** Exactly. This is something Arbitrum provides on their chain. It's a precompile, which means it's like a contract that already exists on the chain. It's a bit more in depth than that, but you can think about it that way.

What it enables is that instead of using the actual address, you use an index, which is a much smaller amount of call data. So if you have a large contract, or a large process sending call data around internally, that could be substantial gas savings.

First you need to make sure your address is registered.

**Austin:** [After some testnet wallet trouble] Let's quit poking at this testnet stuff and put it back on mainnet Arbitrum. `yarn deploy --network arbitrum`, and hopefully we just put this on mainnet and quit dealing with weird testnet wallet issues. There we go. Maybe it costs us a fraction of a cent, and now we have our contract. You can look at it on Arbiscan, way easier to deal with.

Let's go to our address table and look me up. I already have an index. So if we want to send a message to me, "hello Austin", and send a little money with my index. Instead of addressing me by my address, you address me by my index.

**Elliot:** In this small transaction it's barely saving you anything. But if you were using a lot more data and a lot more addresses, and you replaced those with indexes, you could save more.

**Austin:** There we go, we sent "hello Austin" and some value. If we look at the contract now there's money locked in it, that 25 cents. Let's look at the withdraw function. Anybody can come along, and if they have a balance, you zero out their balance and send them the money.

So I should be able to see I have a balance. Someone has left me 25 cents. That's enough to deploy a hundred contracts on Arbitrum. I click withdraw and the 25 cents comes out of the contract into my wallet. We confirm and it happens instantly. I love that, it's so fast.

So this is like a greeter contract where we pick an address, and instead of talking to them at the address, we talk to them at the index. We save a little money, lock up a little money on behalf of someone's index, send them a message, and they withdraw it.

## Forced transactions, and why an L2 is not a side chain (20:09-24:19)

**Austin:** What the heck is a forced transaction?

**Elliot:** This is one of the things that makes an L2 an L2, versus a side chain or something that can fiddle with your security.

Start with the sequencer. An L2 has a sequencer, and it uses that to sequence the transactions it receives and put them on the chain. Let's pretend the sequencer went rogue and decided it didn't want your transaction. Maybe you're trying to withdraw your ETH back to mainnet, and it has decided not to include the transaction that retrieves your ETH.

A way around that, because this is an L2, is that you can post that transaction on L1, and then 24 hours later you can execute it on the L2 whether or not the sequencer wants it there. It's a security measure that means you're able to withdraw your funds, or execute whatever you want on that chain, regardless.

**Austin:** That's a really cool property. Censorship resistance: even if Arbitrum doesn't want your transaction on Arbitrum, this mechanism lets you put it there. You'll pay mainnet gas and wait through some challenge periods, but it may well be worth it. Maybe you have a million dollars locked on Arbitrum and it's censoring your withdrawals. That's never going to happen, but it's a good property to have. Trust but verify.

**Elliot:** Exactly. Just the fact that you have that assurance is what makes you willing to trust the L2 with your funds, because you know you can retrieve them regardless of what happens.

**Austin:** So you've set up a script that signs a transaction?

**Elliot:** The reason we have a script is that we actually have to sign the transaction, and MetaMask doesn't let you just sign one. MetaMask forces you to also send it after signing.

Go to your Hardhat config and make sure it's talking to Arbitrum and not Arbitrum Sepolia. Since you used `--network`, you want the `hardhat.config` networks section set to Arbitrum.

**Austin:** There we go. And then when we sign that transaction it will be from mainnet.

## Which one should you start with? (24:19-25:56)

**Austin:** To recap: if you want to go to Arbitrum, poke around on localhost, and deploy a simple contract, you should probably just start with Scaffold-ETH. Go to scaffoldeth.io, run `npx create-eth`, and go.

If you want to go further, there are extensions, and Elliot has been building this Arbitrum extension that lets you do the extra things: bridge, use the address table precompile, and use forced transaction signing.

What is Arbitrum good for? There's a lot of DeFi liquidity, and I think more games. Maybe they're trying to do games and DeFi together, and that's probably the secret sauce. Use one of these precompiles, use liquidity that's already out there, and build a game on top of all of that that generates revenue for you. That's the kind of thing you should be thinking about as a builder.

## Build this yourself

The counter in this video is deliberately trivial, because the interesting part is the path, not the contract. Scaffold, tinker locally against a chain you control, generate and fund a deployer, deploy, then move the frontend onto the same network. Every larger dapp follows that path.

When you want a real spec to walk it with, the challenges give you one:

- [Simple NFT](/challenge/tokenization) is the closest to this video: deploy a contract, mint from it, then put it on a public network and verify it.
- [Crowdfunding](/challenge/crowdfunding) adds a contract that holds funds and has to hand them back safely.
- [Token Vendor](/challenge/token-vendor) introduces contract-to-contract calls and the approve pattern.

For the tooling, the [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io) cover the hooks, components, and network configuration. [Build a Working Ethereum App in 8 Minutes](/guides/build-an-ethereum-app-in-8-minutes) is the same deployment path on Base, and [How a Full-Stack Ethereum App Is Structured](/guides/how-a-full-stack-ethereum-app-is-structured) covers the architecture underneath it in more depth.
