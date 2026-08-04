---
title: "AI Agents and Ethereum: x402 Payments, ERC-8004, and Building the App"
date: "2026-08-04"
description: "Austin Griffith's Columbia University guest lecture on where AI agents and Ethereum meet: the x402 payment standard with a working client, server and facilitator, the ERC-8004 agent registry, and a full Scaffold-ETH 2 build deployed to Arbitrum. Full video and edited transcript."
image: "/assets/guides/ai-agents-ethereum-x402-erc8004.jpg"
showNavigation: true
faqs:
  - question: "What is x402?"
    answer: "x402 is a payment standard built on the long-unused HTTP 402 Payment Required status code. A client requests a resource, the server answers 402 with an address and an amount instead of the content, the client signs a payment and resends the request with that signature in the header, and the server releases the resource once payment is confirmed. It matters for agents because it lets a machine pay for a single API call without an account, an API key, or a subscription, using a standard HTTP round trip."
  - question: "What is ERC-8004?"
    answer: "ERC-8004 is a proposed standard for a trustless agent registry: a place where AI agents publish what they can do, and where the record of how well they did it accumulates. The comparison used in the lecture is a phone book that also carries reviews. An agent that needs copy written or images generated looks up candidates in the registry, checks their reputation, and hires one. Reputation has to be weighted by the reputation of whoever leaves the feedback, otherwise anyone could spin up a thousand agents to upvote themselves."
  - question: "How can an AI agent pay for something without holding ETH for gas?"
    answer: "Through a facilitator. In the x402 flow demonstrated here there are three parties: a client that holds only USDC, a server that wants to be paid, and a facilitator that holds ETH. The client signs a transfer authorization rather than sending a transaction, the server passes that signature to the facilitator, and the facilitator submits it on chain and pays the gas. The client never needs a gas balance, which matters when you are spinning up agents that should only ever hold the value they are meant to spend."
  - question: "Can you change or fix a smart contract after it is deployed?"
    answer: "Essentially no, and that is the point. Once deployed, the code is there permanently, and the ability to self-destruct a contract was removed. You can build an upgrade system where a contract delegates execution to another contract so the address stays constant while the code behind it changes, but that cuts against the immutability that makes contracts trustworthy, so upgrade rights are normally locked behind a multisig. The usual migration path is simply to deploy v2 and let people move to it, leaving v1 running exactly as deployed."
  - question: "How do I start building on Ethereum?"
    answer: "Run npx create-eth@latest to scaffold a project with a local chain, a contracts package, and a frontend already wired together. For a guided curriculum with real specs to build against, start at speedrunethereum.com/start. The final third of this lecture walks that path end to end and deploys the result to Arbitrum."
---

The interesting question about AI agents and blockchains is not whether they belong together. It is what an agent actually needs that a normal web stack cannot give it: a way to find services it has never heard of, a way to judge whether those services are any good, and a way to pay for a single call without an account, an API key, or a human in the loop.

In this Columbia University guest lecture, Austin Griffith works through all three. ERC-8004 is the discovery and reputation layer. x402 is the payment layer, demonstrated with a client, a server, and a facilitator moving real USDC on Base. Around them sits the groundwork: what a smart contract is, how transactions and signatures work, what gas is buying, and a live Scaffold-ETH 2 build deployed to Arbitrum at the end.

The full video is below, followed by a timestamped outline and an edited transcript.

<iframe src="https://www.youtube.com/embed/Xsp5RWqibTo" title="Agentics and Blockchain, Columbia University guest lecture by Austin Griffith" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What's in this video

- [A smart contract, and the one holding 9.2 billion dollars (00:00-03:05)](#a-smart-contract-and-the-one-holding-92-billion-dollars-0000-0305)
- [The curriculum in four minutes, and the liquidation insight (03:05-06:56)](#the-curriculum-in-four-minutes-and-the-liquidation-insight-0305-0656)
- [How you actually interact with a contract (06:56-14:30)](#how-you-actually-interact-with-a-contract-0656-1430)
  - [Public keys, private keys, and what an address really is (10:41)](#public-keys-private-keys-and-what-an-address-really-is-1041)
  - [Signing is not encrypting (13:44)](#signing-is-not-encrypting-1344)
- [The three kinds of transaction (14:30-16:03)](#the-three-kinds-of-transaction-1430-1603)
- [Zero knowledge, and the bouncer who learns nothing (16:03-17:35)](#zero-knowledge-and-the-bouncer-who-learns-nothing-1603-1735)
- [From Solidity to bytecode, and what gas is bidding for (17:35-20:38)](#from-solidity-to-bytecode-and-what-gas-is-bidding-for-1735-2038)
- [ERC-8004: a phone book for agents, with reviews (20:38-28:58)](#erc-8004-a-phone-book-for-agents-with-reviews-2038-2858)
- [What if you deploy a contract and then find a bug? (28:58-31:59)](#what-if-you-deploy-a-contract-and-then-find-a-bug-2858-3159)
- [Audits, re-entrancy, and the Lindy test (31:59-38:47)](#audits-re-entrancy-and-the-lindy-test-3159-3847)
- [x402: the payment error code that finally got used (38:47-45:39)](#x402-the-payment-error-code-that-finally-got-used-3847-4539)
  - [The client, the server, and the facilitator (45:39)](#the-client-the-server-and-the-facilitator-4539)
  - [What the facilitator actually put on chain (49:28)](#what-the-facilitator-actually-put-on-chain-4928)
- [Why decentralization, demonstrated with a rigged vote (52:30-57:01)](#why-decentralization-demonstrated-with-a-rigged-vote-5230-5701)
- [Building the app: tinker, then break it on purpose (57:01-65:32)](#building-the-app-tinker-then-break-it-on-purpose-5701-6532)
  - [Everything is atomic, including the revert (63:59)](#everything-is-atomic-including-the-revert-6359)
- [Vibe-coding a voting app and shipping it to Arbitrum (65:32-78:32)](#vibe-coding-a-voting-app-and-shipping-it-to-arbitrum-6532-7832)
  - [Why throughput is limited, and what L2s do about it (67:51)](#why-throughput-is-limited-and-what-l2s-do-about-it-6751)

## The two standards, in short

**ERC-8004** answers discovery and trust. It is a registry where agents publish capabilities and accumulate reputation, so an agent that needs a job done can find a counterparty it has never met and form a view on whether to trust it. The hard part is not the registry, it is making reputation resistant to an attacker who spins up a thousand agents to endorse themselves, which means feedback has to be weighted by the standing of whoever leaves it.

**x402** answers payment. HTTP reserved status code 402 for "payment required" decades ago and never used it. The flow: request, `402` with an address and amount, sign, resend with the signature in the header, receive the resource. Three parties make it work without the client holding gas:

- The **client** holds only USDC and signs a transfer authorization.
- The **server** wants payment before doing work, and hands the signature onward.
- The **facilitator** submits the transaction, pays the gas in ETH, and confirms to the server that value moved.

The demo pays one cent on Base for a generated vanity address, and the on-chain record shows the facilitator calling `transferWithAuthorization` on the USDC contract. The transaction cost the facilitator a fraction of a cent.

Everything else in the lecture is the substrate underneath: signatures as the basis of every interaction, gas as a bid for block space, immutability as the reason contracts can be trusted, and L2s as the reason any of this is affordable.

## Transcript

Edited from the video's captions for punctuation, length, and readability. Audience questions are marked. Timestamps link to the corresponding point in the video above.

## A smart contract, and the one holding 9.2 billion dollars (00:00-03:05)

I'm on tour, I go to a lot of universities and teach this kind of thing. If you run a blockchain club and you want us to come do a presentation like this, hit me up.

Let me show this off. This is a smart contract, and here is the code. It's pretty simple Solidity that does whatever it's programmed to do. When you build something in a smart contract, it does exactly what it's programmed to do. Nobody can tamper with it, nobody can take it down. Ethereum has been up for ten years without a single second of downtime. When you deploy something to Ethereum, it's always up.

We can read this code as programmers and see exactly what is happening. There's balance storage for an address, and we increment it by whatever value they sent in. It's a payable function, so people can send money and we track it per sender. Deposit and withdraw: it accepts money, gives you a token, then takes the token back and gives you the money.

What's interesting is the amount of money in this one contract. It holds 9.2 billion dollars. This is the wrapped Ether contract. You take Ether, the native asset, and turn it into WETH, which is an ERC-20 token. A lot of protocols want you to swap token for token rather than Ether for token, so to make everything on the protocol use ERC-20s you sometimes wrap your Ether. I wanted to show that this small chunk of code has an address on Ethereum just like any user, and it has 9.2 billion dollars in it.

## The curriculum in four minutes, and the liquidation insight (03:05-06:56)

I'm Austin at BuidlGuidl. We do a lot of teaching, building and funding, and our main curriculum is Speedrun Ethereum. If you're a technical developer looking to learn how to build on Ethereum, it takes you through tokenization, staking apps, and building a token that sells through a vending machine contract.

Then it looks at randomness on chain and how to produce it, and it sets you up so you can attack that randomness and build your own contract that only plays the dice game when it's going to win.

Then a DEX. Once we have tokens and can send them around, the thing we want is to swap one for another. A DEX lets you do that in a fully decentralized way, meaning it never goes down, you can always swap, and nobody can tamper with it or steal your money. It all works on code alone.

Then lending. You can't just lend value to anybody on the internet, they will take your money and run. So you need over-collateralized lending: they lock up two hundred dollars of collateral and borrow a hundred and fifty of some other token. They can repay and get their collateral back at any time, so the collateral is always still theirs.

The bad case is when the collateral becomes worth less than what was borrowed. Then you need a liquidation mechanism, and here's the aha moment about smart contract apps: **anyone can run the liquidation**. Not the platform, anyone. And not just anyone, but anyone who is incentivized, because whoever runs the liquidation gets paid.

Even if the platform ran a fleet of machines everywhere checking in and running liquidations, that's still not as good as letting any account in the world do it for a reward. When you create a mechanism like that, you guarantee it runs. The protocol stays whole because if collateral is ever worth less than what was borrowed, someone anywhere in the world can liquidate it and wants to. That's a real lesson about how you build things on a blockchain: provide incentives, and let anyone poke it to make it run.

We also cover stablecoins and the tensions between borrow rates and the rate paid for locking one up. And prediction markets, which are hot right now. It's basically two tokens with an oracle that guarantees it will rug one for the other. Will this person win the election, yes or no. Buy the yeses or the nos, and when it resolves, the losing pool goes to the winning one.

## How you actually interact with a contract (06:56-14:30)

**Audience question: how exactly does someone interact with a smart contract? Is that doable through Etherscan?**

Let's talk about how a transaction works. Everyone on Ethereum has an ECDSA key pair. If you want an address where people can send money, you generate a large private key, and an address is derived from it.

What the private key does is sign messages. Plug the private key in, take a message, say "hello world", and sign it. What goes across the internet is your message and your signature. Anyone on the other side can use cryptography to plug in that message and that signature, and what comes out is the address that signed it. We can see the two match.

That's the key concept behind how you interact with blockchains. You have a private key, it signs a message, and later anyone can cryptographically recover which address signed it.

So Alice wants to send money to Bob. She says "I want to send five tokens to Bob" and signs it. Across the network everyone sees that Alice wants to send five tokens to Bob and that she signed it, and we can prove it's her address. There's a whole ledger and a consensus process, but that's the essence.

Calling a contract is the same shape. Instead of "I want to send five tokens to Bob", you sign "I want to call the increment function on the counter contract with these arguments". That gets mined into the blockchain like any other transaction, all the nodes run it, and that's how a function gets called. Same as sending money, with extra information about what to call and with which arguments.

**Audience question: is that a text field, or an object?**

There's a `to` address and a data field, and the data field is hexadecimal. All of that information is encoded into it.

## Public keys, private keys, and what an address really is (10:41)

**Audience question: when do you use the public versus the private key?**

The public one you can share with anyone. Technically there's a private key and a public key, and then we hash the public key and take the last characters of it, and that's what we call the address. Think of your address as your public identity.

Your private key you never share. This is really important. If you lose it, your money is gone forever. If you leak it, someone will take it and send themselves everything in the account.

What's interesting is we could sit here generating private keys all day and never find an account with money in it. There's enough entropy in that hex string that with all the compute power in the world you're not going to find one. All of that changes with quantum computing, and Ethereum is working toward being quantum safe in the next five years, but at current CPU power we could generate keys forever and never hit one.

## Signing is not encrypting (13:44)

**Audience question: is it string encryption, or something else?**

It's ECDSA signatures, and it isn't exactly encryption. You can encrypt too: take someone's public key, encrypt a message, send the encrypted object across the network, and only their private key can decrypt it.

But that's a different operation. What we're doing here is signing. You use the private key to sign a message, and then anyone in the world with the message and the signature can recover who signed it. Message signing, not message encrypting.

## The three kinds of transaction (14:30-16:03)

We've talked about sending value from one person to another, and about calling functions on a contract. There's one more kind: deploying a contract.

You sign a transaction with no `to` address. It's just data, and that data is the contract encoded as hex. A transaction with no `to` address means "I have this data, I want to deploy this contract, and I want it to live at a new address". An address gets derived, the contract lands there, and from then on anybody can call functions on it.

## Zero knowledge, and the bouncer who learns nothing (16:03-17:35)

I know this is an agentics class, but alongside AI and blockchain there's another really cool technology here, which is zero knowledge. Go learn how you can use math to prove something without leaking any information about it, and how someone else can use math to verify it.

Just like we had that sign-and-recover box, imagine a prove-and-verify box. You put information into the prover, it gives you a receipt, you hand the receipt to the verifier, and the verifier confirms the thing is true without ever seeing the information.

The fun example is getting into a bar. You have to prove you're 21, but when the bouncer sees your ID he learns where you live and a lot else you'd rather he didn't have. A ZK proof system lets you put your ID into a box that generates a proof that you're 21. You hand that proof to the bouncer, his box lights up green, and he never sees the ID.

## From Solidity to bytecode, and what gas is bidding for (17:35-20:38)

**Audience question: when you deploy a contract, is it compiled hex that gets saved to the new address?**

Exactly. The Solidity is compiled down to something like machine code. You can write assembly inline in your Solidity and that also gets compiled down. What lives on the blockchain is machine code.

If we go back to that WETH contract, the explorer gives us the readable code, but what's actually deployed looks like this: the deployed bytecode. All of that is the contract in machine code. You can go learn all the opcodes, and each one has a gas cost.

Gas is a rabbit hole, but the short version: blocks are produced every twelve or thirteen seconds, and only so much fits in one. Looking at the explorer, one block has 248 transactions, another 109, another 205. That's roughly the limit of execution per block.

The miners take all the possible transactions from the mempool and load a block in the greediest way, so they make the most on gas. There's a limit on block space, so when you want your transaction included, you pay gas. It's a bid. It's an auction. Whoever bids highest gets in, so when the network is congested you have to bid higher for your transaction to land.

## ERC-8004: a phone book for agents, with reviews (20:38-28:58)

Now let's get to agents. What would we use Ethereum for in an agentic world?

We're realizing that pretty soon my computer is going to be smarter than I am. There will be agents doing tasks everywhere, and AI may become the new UI. Instead of going to Google, I'll talk to my agent and it will go do things for me.

What Ethereum ends up being in that world is a registry. A phone book might not be the right analogy for an audience younger than me, but you could arrive in a new town, open a phone book, find a name, and call them. Now imagine the phone book also had reputation, so you could see that this person is a plumber with four stars out of five. That's closer to what this registry aims to be.

You discover agents, see what each one can do, and see some valid reputation for how well it did that thing. Imagine one agent that writes copy and another that generates images. Say we want to run a marketing campaign with a thousand different ads over a week to see which perform. We tell an agent to go run a thousand things. That agent needs copy and images, so it looks up agents that provide them, checks which have the best reputation, and hires them. If the work is good, it can leave positive feedback on their reputation.

That's what ERC-8004 is about: letting agents discover each other and carry some kind of reputation validation, so you can see how many endorsements an agent has and how often it has done its job correctly.

**Audience question: so if an agent does a good job, another agent that interacted with it leaves the equivalent of a thumbs up?**

Yes. And the agent leaving the feedback needs its own reputation too, otherwise you could Sybil attack this by spinning up a thousand agents and having them all endorse you. The value of an endorsement has to depend on the standing of whoever gives it.

There are deeper details I can't answer as well as the people writing the standard, so go look up 8004 and follow the discussion around it.

## What if you deploy a contract and then find a bug? (28:58-31:59)

**Audience question: what if you deploy a smart contract and later discover a bug? How do you invalidate the old contract?**

The short answer is that you can't. Once you deploy a contract, it's there forever. You used to be able to destroy a contract, and people said wait, we don't want that, so it was taken out entirely.

You can program in an upgrade system. There's a pattern where a contract delegates all its execution to another contract, so the address stays the same while the code behind it gets swapped. But this cuts against the ethos of immutable contracts in the first place, so be very careful with upgradeable contracts. People do it, and the upgrade rights are usually locked down to a multisig where five of ten people from the company have to sign.

Really, a good smart contract can't be upgraded. You deploy it and it does exactly what it needs to do. Take that WETH contract: if a bug were discovered in it, that 9.2 billion would get stolen. What we'd do is deploy another WETH contract and everyone would start using the new one. That's usually what happens.

The way you migrate is to create v2 of your platform. People start using v2, and if you want new things you create v3. If v2 was deployed correctly it stays up forever doing exactly what it's supposed to do, and people migrate if the new one is better. There are no forced upgrades.

Think about a game or app you're playing. If the developers want to, they can rug it, upgrade it, add features, destroy all the old stuff, and you're at their mercy. On a blockchain it doesn't work that way. The app is deployed forever, you can't change it and you can't take it down. Not even the person who deployed it can take it down.

## Audits, re-entrancy, and the Lindy test (31:59-38:47)

**Audience question: are there certifications for dapps, to ensure contracts do what they claim?**

Not exactly. The code gets posted, but there's no certification stamp on the page. It doesn't say anywhere that it was audited by so and so, though it probably was. There are auditing firms that review the code, put their stamp on it, and charge you half a million dollars. A lot of protocols do this before they deploy.

Even then, hacks still happen. If you go to Solidity by Example they list the hacks, and I'd recommend it. Take re-entrancy. In your contract, say you're sending money to someone while tracking their balance. What you want is to subtract from their balance first and then send. If instead you send first and subtract after, they can have their contract catch that and re-execute back into yours before it reaches the next line. Think of recursion: execution happens, and then it unrolls. You re-enter before your balance has been reduced, do the same thing again, get sent more money, and drain the contract.

So as the developer you know to do all your checks and effects before you send anything. Bob is withdrawing five dollars, so subtract five from Bob's balance, then send Bob the five. Then even if he re-enters, his balance is already updated and he can't get more.

But here's the best certification that the WETH contract is secure: that number. 9.2 billion dollars. Once you deploy a contract it's out there forever for everyone to attack, and everyone has access to it at all times. This has been deployed for many years, holds 9.2 billion, and nobody has figured out how to get the money out. That's the strongest stamp of approval there is. The Lindy effect of a smart contract: how long has it been out there, how many people use it, how much value is locked in it.

Obviously there are protocols holding millions that get hacked, and some of them had three audits that missed something. There's always the possibility something happens. But the longer it's out there and the more people poke at it trying everything they can to get the money out, the more you know.

## x402: the payment error code that finally got used (38:47-45:39)

Before x402, one more useful thing: MCP servers. There's a Blockscout MCP server you can connect to Claude or Cursor, and it can go out to the blockchain and fetch information. I was writing agents that do value transfer and debugging one that wasn't working, and it went out to the actual chain, looked at the transaction, worked out what was going wrong, came back and fixed my code. Full loop.

Now, error codes. You've hit a 404 before, and a 400, but you've probably never received a 402. It was reserved for future use. They always wanted it to exist as part of the web and never figured out how to do it. A lot of people tried. I think we've got it figured out now, and that's the x402 standard.

You make an HTTP request, whether you're a human, a client, a script or an agent, and you get back a 402 that says payment required. If you want what's behind this query, you have to pay. The response carries an address, an amount, and some metadata. You sign a transaction, put it in the header of your request, and send it again. On the other side the server receives it, takes your transaction, and runs it through a validator that confirms the money moved. That validator is called a facilitator.

## The client, the server, and the facilitator (45:39)

Let me show it. I built a service that generates Ethereum vanity addresses, meaning addresses with a chosen pattern like leading zeros. Finding one takes real work: you generate accounts until you hit the pattern, which is exactly how proof of work works. Two leading zeros costs a penny, three costs ten cents, four costs a dollar.

Imagine an agent that needs a vanity address to use some other service. First it goes to the 8004 contract and asks whether any agent can generate one. An agent that has registered says it can. The requesting agent checks its reputation, decides it's good, and goes to talk to it.

There are three identities here. The **client** is a wallet holding 49 cents of USDC. The **server** is an address that receives USDC on Base. The **facilitator** is a third account holding about 25 dollars, and it pays the gas in ETH.

I request three leading zeros from the browser and get an error back. Looking at the network tab, it's a 402: pay USDC on Base mainnet to this address, and we'll generate the product. So I need to create a transaction sending money to that address, sign it, and send it with the next request.

Now from a client script instead of the browser. The client requests two leading zeros, which costs a penny, and they negotiate. Sending transaction. Settling payment. Transferring value. The client gets back an address with two leading zeros, and its private key. We paid one penny for the server to generate that key, and it took 1.46 seconds. Dropping the key in confirms it: an address with leading zeros.

## What the facilitator actually put on chain (49:28)

Looking at the facilitator's transactions on the explorer, one landed a minute ago. It called a function on the USDC contract called `transferWithAuthorization`. So the facilitator put a transaction on chain that used a signed message from the client to move money from the client to the server. It verifies that, makes sure it gets mined, and then sends an HTTP request back to the server saying this person paid, so the server can do the work. Then the result goes back to the client.

The client only ever needs USDC. It doesn't need gas, which is really cool. The facilitator pays the gas and moves the money, and the server earns it. So I could set up a server that generates vanity addresses and money just starts flowing in as people use it.

But then, how do people discover these services? That's what we're using the blockchain for: a registry of services with a reputation layer, plus the rails to move the value. You don't strictly need the chain for payment, you could use a normal payment processor. This is agnostic to chain and token. Here we're on Base using USDC.

I vibe coded this in about 30 minutes, starting from a repo from someone in the Ethereum space, pointing Claude at it and saying learn all this, then asking for a server that generates vanity addresses and a client that pays for them. The keys live in environment files, not in the code.

## Why decentralization, demonstrated with a rigged vote (52:30-57:01)

Why do we need a blockchain at all? Here's a vibe check for you. Scan this QR code and vote on how the vibes are.

We've got eight good vibes. It's all good vibes. Now, there's a reason for that. I vibe coded this and said build me a voting app that asks how's the vibe, they can vote good or bad, **but if you vote bad it gives them an error**. Technical difficulties. Our servers are allergic to cosmic interference.

That's censorship. When we talk about censorship resistance it can be hard to grasp. Imagine I'm on YouTube and someone deplatforms me and I lose the account. That's a bummer. If I post something and the platform takes it down, that's censorship. If I'm in a country they don't want viewing this, they can block it. All of that happens with a centralized system, and what you get out the other end is not the truth. You aren't getting a real vote here, you're getting a fake one.

There's a second problem too. I have a server, and I'm SSH'd into it. What if I just stop the server? Or it falls over on its own? Now nobody can get to the thing. That's the other reason decentralization is nice: it never goes down. I can't fat-finger the service and clear the votes. It can't be knocked over by everyone arriving at once.

That doesn't happen on Ethereum. When you deploy a contract, it's always up. Anyone can read from it by asking any node on the network, and anyone can write by paying gas through the bidding system. So anyone in the world could read the vote count from any peer, and anyone could vote by paying a little money.

## Building the app: tinker, then break it on purpose (57:01-65:32)

Let's build. I already ran `npx create-eth@latest`, which took about 30 seconds to install.

You `cd` in and run a few things. First your own local blockchain. This is really cool: it does everything Ethereum does, mines blocks, sends money, deploys contracts, and it gives you accounts and private keys loaded with millions. Then a frontend, which auto-detects changes to your contract.

So we have our own blockchain and an app, we deploy a contract to the chain, and we interface with it from the application. That's a full-stack Ethereum build. Scaffold-ETH builds a debug page, and it autogenerates that page from whatever is in your contract.

The stock contract is a greeter: you send a string in, it keeps track of a greeting. I chose Hardhat, though Foundry is the other option. Both are great, and it all works the same with Scaffold-ETH. If you want to write your tests in Solidity and have them run fast in Rust, you'll probably use Foundry.

`yarn deploy` puts the contract on the local chain for free. Nobody can see it, it's all localhost, we're just learning how this works. The debug page shows the greeting, how much money is in the contract, the global variables, and the read and write functions.

Let's update the string to hello world. That fails, because I don't have money. To transact I need a wallet with funds. Normally you'd have a browser extension, but in Scaffold-ETH you want to make transactions fast, so the private key lives in local storage. There's a burner wallet built into the browser, so I can click and it transacts. That loaded me up with eleven thousand dollars. Now hello world updates the greeting. Each click is a transaction. On localhost it's instant, so we can play around and make sure things work the way we want.

Now something interesting. In the set-greeting function, let's `require` that `msg.sender` is me, with the error "not Austin". I pasted my own address in and required that whoever calls it has to be that address. If it isn't, everything reverts.

Redeploy, and the happy case works. Now for a bad guy: an incognito window generates a new burner wallet. Grab some money, try to set the string, and he gets the error, "not Austin". That require statement threw him out of the function.

## Everything is atomic, including the revert (63:59)

By the way, it's all atomic. I can move that require statement to the very bottom of the function and it works exactly the same way. It increments the counter, sets the greeting, then hits the require, finds it false, and rolls everything back.

The ordering does get tricky with the re-entrancy bug I mentioned, and if you're sending money in the middle you want your checks and effects first. But technically it doesn't make much difference where the require goes, other than costing a little extra gas, because it executes through and then undoes.

So if you enter a function that sends five dollars to Alice and ten to Bob and then hits a require that reverts, it pulls that money back from Alice and Bob. You can say collect five from Alice, collect five from Bob, pay ten into this new thing, and if anything reverts, everyone gets their money back. That's the nice atomic nature of these transactions.

## Vibe-coding a voting app and shipping it to Arbitrum (65:32-78:32)

When you want your frontend talking to your contracts, you write hooks. There are two important ones, `useScaffoldReadContract` and `useScaffoldWriteContract`, which read from and write to your contract. But I'm not going to write any code. Let's build that voting app on chain instead.

I'll prompt Cursor: build a voting app that asks how's the vibe, answers good or bad, no owner of the contract and no way to reset it, and users can see the vote count and vote from the front page.

Scaffold ships cursor rules, and it's nice because the contract and the frontend are both there and already wired together, so the AI pattern matches well. Scaffold-ETH is good at one-shotting these apps.

## Why throughput is limited, and what L2s do about it (67:51)

**Audience question: one block every 15 seconds with about 300 transactions seems like low bandwidth compared to a conventional transaction processing system.**

That's absolutely right. The bandwidth of the Ethereum network is very constrained, and as soon as people flood it, there's one lane and it gets expensive. I've deployed a contract that cost me as much as my laptop. So "always on" carries the caveat that when a lot of people are using it, it costs more.

The reason for the limit is security and decentralization. We want the EVM to be simple, and we want many simple machines to be able to run it. Think of it as a settlement layer for other things.

That's where L2s come in. An L2 is a copy of Ethereum that settles to Ethereum. Arbitrum, Base, Optimism, Linea, zkSync, Starknet, Unichain, Scroll: they're all baby Ethereums that batch their processing into blobs and settle to L1. And crucially, if everything on that network goes wrong and everyone is trying to steal your money, you can make a transaction on L1 and get your money out of the L2.

So L1 Ethereum is likely to be a global settlement layer rather than the place every single transaction lands. You'll deploy a very important contract to L1, and a lot of things run on L2 and settle to it. On an L2 a transaction costs a fraction of a cent, and deploying the same contract costs a penny or two instead of real money.

Back to the app. It deployed. Looking at the contract: vote good, vote bad, get votes, and a withdraw. It gave it an owner, which I didn't ask for. Normally I'd prompt it again and say get rid of that. But someone can vote good, someone can vote bad, it checks you haven't voted before, and it tracks both counts.

Let's vote good, that works. Incognito window on another port for the bad guy, and he can vote bad. You can vote good, you can vote bad, there's no censorship, you can't delete this thing, it's up forever.

Now deploy to a live network. Generate an account with a password, which creates a private key. Send that address some Arbitrum ETH, about 41 cents, which is more than we need. Then `yarn deploy --network arbitrum`. There's the transaction. We just deployed a contract live to Arbitrum with real money.

Now the Scaffold-ETH config is still on Hardhat, so tell it we're on Arbitrum and hit save. The whole app reloads onto Arbitrum. Connect the wallet, switch networks, and spend real money to vote.

Let's verify the contract. Before verification it's just bytecode. You upload your code to the block explorer, they compile it and compare against the bytecode, and once it's verified everyone can read the code and see it's counting votes exactly as claimed.

Last, upload the frontend. `yarn ipfs` puts it on IPFS, so the app is stored peer to peer. Then anyone with the URL can connect a wallet and vote for a fraction of a cent. The app is live, and there's the QR code for it.

So go to eth.build to learn these concepts, go to ethereum.org, go to Solidity by Example, and there's our curriculum at speedrunethereum.com. There's a lot of good Ethereum education out there. And for the agentic side, go look up x402 and ERC-8004. There are so many neat things happening at the intersection of AI and blockchain.

## Build this yourself

The build at the end of this lecture is the same shape as every dapp: a contract, a local chain to tinker against, burner wallets so you can act as two people, and a frontend that already knows about your contract. The agent material on top of it needs exactly the same foundations, because an agent paying for an API call is still signing a message and still paying gas through a facilitator.

The curriculum Austin walks through in the first five minutes is the direct path:

- [Simple NFT](/challenge/tokenization) starts you off, and calibrates the tooling rather than teaching Solidity.
- [Token Vendor](/challenge/token-vendor) is the vending machine, and where the approve pattern lands.
- [Dice Game](/challenge/dice-game) is on-chain randomness, and building the attacker contract that beats it.
- [Minimum Viable Exchange](/challenge/dex) is the DEX.
- [Over-Collateralized Lending](/challenge/over-collateralized-lending) is the lending and liquidation mechanic described above.
- [Prediction Markets](/challenge/prediction-markets) and [Stablecoins](/challenge/stablecoins) round out the DeFi primitives.

For the tooling, the [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io) cover the hooks, components, and network config. [How a Full-Stack Ethereum App Is Structured](/guides/how-a-full-stack-ethereum-app-is-structured) goes deeper on the architecture, and [How to Build an Ethereum dApp with AI](/guides/how-to-build-dapp-ethereum-ai-workflow) covers the AI-assisted workflow used for the voting app here.
