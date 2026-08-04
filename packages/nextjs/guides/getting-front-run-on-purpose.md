---
title: "Getting Front-Run on Purpose: What the Mempool Really Exposes"
date: "2026-08-04"
description: "Austin Griffith deliberately ships a front-runnable commit-reveal contract to mainnet to find out whether MEV bots are watching. Optimism ignores it. Ethereum mainnet takes the money in one block. Full video and edited transcript."
image: "/assets/guides/getting-front-run-on-purpose.jpg"
showNavigation: true
faqs:
  - question: "What does front-running actually look like on Ethereum?"
    answer: "Your transaction sits in the public mempool before it is included in a block, and everything in it is readable, including any secret you are passing as an argument. A bot watching the mempool can read those arguments, submit the identical call from its own address with higher gas, and have its version mined first. In this experiment the attacking transaction landed roughly twelve seconds ahead of the original, and the block explorer shows the value splitting between the attacker and the block builder."
  - question: "Why does a commit-reveal scheme fail if the reveal is public?"
    answer: "Commit-reveal protects the commit phase, not the reveal. Committing a hash hides your secret while it sits on chain. But the reveal transaction has to carry the plaintext secret as an argument, and that transaction passes through the public mempool like any other. Anyone watching can lift the secret out of the pending transaction and submit their own reveal with more gas. The scheme only holds if the reveal cannot profit somebody else, or if it never touches a public mempool."
  - question: "Did the same attack work on an L2?"
    answer: "No, and the difference is instructive. The same contract with the same bait on Optimism was not front-run. Most L2s run a single centralized sequencer that orders transactions itself, so there is no public mempool for bots to watch and no gas auction to win. That removes this class of attack, at the cost of trusting the sequencer to order fairly. On Ethereum mainnet, where the mempool is public and anyone can bid, the money was gone almost immediately."
  - question: "How do I test whether my own contract is front-runnable?"
    answer: "Reason about it locally first, then confirm on a live network with an amount you are willing to lose. Locally you can prove the mechanic works by calling the vulnerable function from a second burner wallet, which is how this contract was checked before deployment. But a local chain has no competitive mempool, so it can never tell you whether real bots would take the opportunity. That answer only comes from mainnet, which is why the experiment here uses about a hundred dollars of real money."
  - question: "Is the contract in this video safe to copy?"
    answer: "No, and it is not meant to be. It was written to be exploitable so the exploit could be observed, and it carries other known holes beyond the front-running one. Treat it as a demonstration of what the mempool exposes, not as a pattern. For defensive implementations, see the commit-reveal and MEV mitigation guides linked at the end of this page."
---

You can read about front-running, or you can put a hundred dollars on a public chain in a contract designed to be robbed and watch what happens.

In this Bow Tie Friday stream, Austin Griffith does the second one. The day before, he had built a commit-reveal contract to demonstrate the mechanic, and made a mistake that accidentally made it safe. Here he fixes it so anyone can claim anyone else's commitment, ships it to Optimism, then to Ethereum mainnet, and waits to see whether the bots watching the mempool are paying attention.

On Optimism, nothing. On mainnet, the money was gone in one block.

The full video is below, followed by a timestamped outline and an edited transcript.

<iframe src="https://www.youtube.com/embed/ntf4tzjhFUQ" title="Let's get front-run on purpose: will bots watching the Ethereum mempool steal $100 from us?" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What's in this video

- [The bug that made it safe by accident (00:00-01:31)](#the-bug-that-made-it-safe-by-accident-0000-0131)
- [How the commit-reveal contract works (04:12-05:42)](#how-the-commit-reveal-contract-works-0412-0542)
- [Proving the mechanic locally, with two burner wallets (05:42-08:44)](#proving-the-mechanic-locally-with-two-burner-wallets-0542-0844)
- [Shipping the bait to a live network (08:44-31:42)](#shipping-the-bait-to-a-live-network-0844-3142)
- [Watching the mempool, and the payoff (31:42-34:00)](#watching-the-mempool-and-the-payoff-3142-3400)
- [Reading the attack on the block explorer (34:00-35:31)](#reading-the-attack-on-the-block-explorer-3400-3531)
- [What the experiment settled (35:31-36:17)](#what-the-experiment-settled-3531-3617)

## What this actually demonstrates

The contract is a commitment scheme. You take a secret, hash it, and put the hash on chain along with some ETH. Later, anyone who submits the matching secret can withdraw the funds.

The vulnerability is not in the commit. It is in the reveal. That transaction has to carry the plaintext secret as an argument, and it sits in the public mempool before it is mined, where its call data is readable by anyone. A bot can lift the secret, resubmit the identical call from its own address with a higher gas bid, and get mined first.

Three results, in order:

- **Locally:** the mechanic works. A second burner wallet reveals someone else's commitment and takes the funds. This proves the contract is exploitable, but a local chain has no competing bots, so it proves nothing about the real world.
- **Optimism:** no front-running. A single centralized sequencer orders transactions, so there is no public mempool to watch and no gas auction to win.
- **Ethereum mainnet:** front-run almost immediately, for roughly a hundred dollars, by a bot that was not watching the stream and simply saw an opportunity in the pending transaction.

The contract was written to be exploitable and has other holes besides. It is a demonstration of what the mempool exposes, not a pattern to copy.

## Transcript

Edited from the video's captions for punctuation and length, with waiting and setup compressed. Timestamps link to the corresponding point in the video above.

## The bug that made it safe by accident (00:00-01:31)

Let's get front-run on purpose. Happy Bow Tie Friday.

Yesterday I did a presentation, and I messed up. The contract wasn't right, so I wasn't able to actually front-run myself. Today we're going to make a quick fix, deploy it, and see if we can get front-run.

The problem is right here in the reveal function. It was funny, because on the livestream people were asking whether I like Copilot. I love Copilot, and I let it fill some of this in, and I should not have. What it did was only let `msg.sender` do the commit, so you could only reveal your own commits. That made it impossible to front-run.

So what we need is to accept an address, and let anyone reveal for anybody else's commit. I'll make a commit with a secret, I'll give that secret to someone else, they'll submit it, and if everything goes right they get the money. But if they get front-run, because it's totally front-runnable, someone watching the mempool can take their secret and submit it with more gas and get the money instead.

That's what we're trying to discover here. We should get front-run. I'm pretty sure there are general front-running bots that will happily take our hundred dollars. We're going to go find out.

## How the commit-reveal contract works (04:12-05:42)

What we wanted to show off yesterday is that you can prototype quickly with Scaffold-ETH. It's an app building tool and an education tool, but also a tool for shipping to production. It's not just for prototyping.

What we have is a contract with a commit mapping. Any address can commit some money behind a secret. They take a secret, hash it, and put the hash on chain with a little money. Anybody who submits the secret that hashes to the committed value can withdraw those funds.

There are all sorts of holes in this. You could over-commit, you could recommit, there are a bunch of things. But the point is that you should be able to get front-run, and I want to see on different networks whether I do. Starting with mainnet Optimism, because we tried that yesterday and it failed.

So I've changed the reveal function. Before, it revealed for `msg.sender`. Now you submit the address of whoever committed the funds.

## Proving the mechanic locally, with two burner wallets (05:42-08:44)

Let's deploy that locally and test it. Back into the Scaffold-ETH config to switch to Foundry, so we're on our local Anvil chain. Disconnect, and connect with a burner wallet.

We come up with a secret. Hello world is always a good example. We take that to bytes, and then get the hash of it. There's a read function in the contract called `getHash` that hashes the address plus the reveal, so it salts it with the address and you don't get hash collisions.

We get the hash for our secret, then anybody can open a commitment by pasting in that hash along with some value. We'll do 0.01 locally. Now there's less money in our wallet and money in the contract, and anyone can do the reveal. To reveal, you put in the address of the person who committed and the secret. Get all that right and you get the money.

The key is that this transaction lands in the mempool, and if anybody is watching, they can see this person submitting the secret, take it, and submit it with more gas.

Here's the thing I should have tested yesterday: can a random address do this? Watch, this shows burner wallets off really well. I go to localhost 3000 in another window and get a different address. Let's use this new address to do the reveal and make sure a new address can steal it.

So the secret is "hey hey", we get the commit hash, we put it in with 0.01, and then we use this other account to reveal it with the first account's address. This should bring the money in. It did. Good enough. Let's YOLO it.

## Shipping the bait to a live network (08:44-31:42)

Now we go to mainnet. In Scaffold-ETH you make a small change to your config to point at whatever network you need, plus you deploy to that network.

[Deployment, funding the deployer, and waiting for confirmations take up most of this stretch, along with getting the stream link out. The contract goes to Optimism first, where the reveal is not front-run, and then to Ethereum mainnet with roughly a hundred dollars behind the commitment.]

## Watching the mempool, and the payoff (31:42-34:00)

Am I going to get front-run for a hundred dollars? We're about to find out. Here's the payoff.

Let's watch the transaction. It has landed in the mempool at this point, and it doesn't have very aggressive gas, so it will probably sit there for a while. If anybody is just looking through the mempool, you could have the slowest bot in the world. Here's the call data this person wants to send, here are the arguments, there's their address, and then the secret. You can see it right there. That's the secret.

So all they have to do is submit this exact thing from their own address with extra gas, and they get the money.

Did we get front-run? It looks like the transaction went through, but it doesn't look like any value moved. Let me look closer. First of all, the money is not in the contract anymore. Did it come back to me or not? It's hard to tell from Etherscan. There are three transactions here: here's where the money comes in, and here's where the money goes out.

## Reading the attack on the block explorer (34:00-35:31)

Oh. Yes. That's what happened. Look at that. The builder got paid some, and the front-runner got paid.

Somebody definitely front-ran. I definitely got front-run. There's my transaction that went a minute ago, and then there's this other internal transaction that went at the same time. Look at this: this is at 35 seconds, this is at 23 seconds. So this one executed just before mine.

It's from this address, going to our contract, telling it to transfer the funds to this address, and from there it splits out to the builder and the attacker. One of these is the attacker, one is the MEV bot. But we absolutely got front-run. Someone got our money.

I'm glad for your front-running. Good job. I don't think you were watching this. I'm pretty sure that secret was secret, and I'm pretty sure we just got front-run on mainnet.

## What the experiment settled (35:31-36:17)

I think we did it. I'm calling this one a victory.

If you want to check out Scaffold-ETH, it's easy to find. Check out Scaffold-ETH 2, it's a good way to play around like you've seen today. We built an app yesterday in 30 minutes and deployed it and it wasn't quite right, so we got it today. We updated the reveal function, put it on mainnet Optimism and didn't get front-run, then put it on mainnet Ethereum and we definitely did get front-run. And they got our hundred dollars.

## Build this yourself

The lesson generalizes past this contract. Any argument you pass to a function is public before it is mined, so a scheme is only safe if knowing what is pending does not let someone else profit by acting first. That is why the reveal half of a commit-reveal scheme is the fragile half, and why the difference between mainnet and a single-sequencer L2 changed the outcome without a line of code changing.

Two guides here cover the defensive side of the same ground:

- [Commit-Reveal Scheme in Solidity](/guides/commit-reveal-scheme) is the implementation done properly, with the two-phase pattern and the security considerations.
- [Front-Running and MEV Mitigation](/guides/front-running-mev-mitigation) covers the mitigations available to you as a developer.

To build the underlying skills against real specs, [Dice Game](/challenge/dice-game) is the challenge where you write the attacker contract that predicts on-chain randomness and only plays when it wins, and [Minimum Viable Exchange](/challenge/dex) is where ordering and price impact start to matter. The [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io) cover the local chain and burner wallets used to prove the exploit before it went anywhere near mainnet.
