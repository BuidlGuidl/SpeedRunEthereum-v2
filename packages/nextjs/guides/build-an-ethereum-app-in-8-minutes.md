---
title: "Build a Working Ethereum App in 8 Minutes with Scaffold-ETH 2"
date: "2026-08-03"
description: "Austin Griffith builds and ships a full Ethereum app in eight minutes: scaffold the project, write the contract, wire up the frontend with Scaffold-ETH 2 hooks and components, then deploy to Base. Full video and timestamped transcript."
image: "/assets/guides/build-an-ethereum-app-in-8-minutes.jpg"
showNavigation: true
faqs:
  - question: "What is the fastest way to build a working Ethereum app?"
    answer: "Start from a scaffold rather than wiring the stack yourself. Running npx create-eth@latest gives you a local chain, a contracts package, a Next.js frontend, and deploy scripts already connected to each other. From there the loop is: edit the Solidity, run yarn deploy, and watch the change appear in the Debug Contracts UI. In the video above that loop takes about a minute, and the whole app reaches a live network in eight."
  - question: "Do I need to build a frontend before I can test my smart contract?"
    answer: "No. Scaffold-ETH 2 ships a Debug Contracts page that reads and writes every function on your deployed contract without you writing any UI. You can add a function, redeploy, call it, and confirm a revert message like 'not the owner' before a single line of frontend code exists. Build the UI once the contract behaves the way you want."
  - question: "How do I test that only the owner can call a function?"
    answer: "Use the burner wallets that Scaffold-ETH 2 generates in the browser. Each one is a separate address you can fund from the built-in faucet, so you can call the function as the owner and watch it succeed, then switch to a second burner and watch the same call revert. That is the check demonstrated at 02:35 in the video."
  - question: "How much does it cost to deploy this to a real network?"
    answer: "Very little on an L2. In the video the deployer wallet is funded with 25 cents of ETH on Base, which is enough to deploy the contract, and each subsequent transaction costs a fraction of a cent. Keep the deployer key isolated and funded with only what that one application needs."
---

Eight minutes, one contract, one frontend, and a live app on Base at the end of it. In this video Austin Griffith builds a small delegation app with [Scaffold-ETH 2](https://scaffoldeth.io), from `npx create-eth@latest` to a deployed contract and a hosted site, without skipping the parts that usually break.

The full video is below, followed by a timestamped outline and the complete transcript.

<iframe src="https://www.youtube.com/embed/AUwYGRkxm_8" title="Build an app on Ethereum in 8 minutes" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What's in this video

- [00:00-00:18: What you are building](#0000-0018-what-you-are-building)
- [00:18-00:53: Spinning up the project with create-eth](#0018-0053-spinning-up-the-project-with-create-eth)
- [00:53-01:33: Debug Contracts and the tinker loop](#0053-0133-debug-contracts-and-the-tinker-loop)
- [01:33-02:35: Adding setDelegate and locking it to the owner](#0133-0235-adding-setdelegate-and-locking-it-to-the-owner)
- [02:35-02:59: Testing access control with a burner wallet](#0235-0259-testing-access-control-with-a-burner-wallet)
- [02:59-03:48: The frontend, and reading the contract](#0259-0348-the-frontend-and-reading-the-contract)
- [03:48-05:11: The Address and AddressInput components](#0348-0511-the-address-and-addressinput-components)
- [05:11-05:48: Writing to the contract from a button](#0511-0548-writing-to-the-contract-from-a-button)
- [05:48-06:50: Pointing the app at Base and funding the deployer](#0548-0650-pointing-the-app-at-base-and-funding-the-deployer)
- [06:50-07:18: Deploying the contract to Base](#0650-0718-deploying-the-contract-to-base)
- [07:18-07:45: Shipping the frontend to Vercel or IPFS](#0718-0745-shipping-the-frontend-to-vercel-or-ipfs)
- [07:45-08:10: Where to go next](#0745-0810-where-to-go-next)

## What you build

A delegation app: a contract that stores a single `delegate` address, plus a `setDelegate` function that only the contract owner can call, and a frontend where anyone can read the current delegate and the owner can set a new one.

The commands that carry the whole build:

- `npx create-eth@latest` scaffolds the monorepo. This build picks Foundry for the contracts side.
- `yarn chain` starts a local blockchain, `yarn deploy` puts the contract on it, `yarn start` serves the frontend on `localhost:3000`.
- `yarn deploy --network base` ships the contract to Base once the local version behaves.
- `yarn vercel:yolo --prod` puts the frontend online, or `yarn ipfs` publishes it to IPFS.

Two Scaffold-ETH 2 hooks do the contract plumbing: `useScaffoldReadContract` to read the delegate, and `useScaffoldWriteContract` to set it. Two components handle the addresses: `Address` to display one, `AddressInput` to accept one.

## Transcript

Lightly edited from the video's captions for punctuation and readability. Timestamps link to the corresponding point in the video above.

## 00:00-00:18: What you are building

Let's build an app on Ethereum in 8 minutes. We'll use Scaffold-ETH, a handy framework for shipping onchain apps quickly. It lets you tinker with Solidity, then build out your smart contracts while you iterate on the UX in your frontend. Then you'll deploy a contract and a website as a full decentralized application.

## 00:18-00:53: Spinning up the project with create-eth

To get started, let's run `npx create-eth@latest`. Paste that in. We're going to create a delegator, we're going to call it delegate-funds, and let's go with Foundry. All right, it'll take a little bit to install.

And then we're going to need to run a few commands here. So we `cd` into delegate-funds. The first command is `yarn chain`, that's going to bring up our local blockchain. Then we're going to `yarn deploy` our smart contract to our local blockchain. And then we're going to `yarn start`, and that brings up our frontend on localhost at 3000.

## 00:53-01:33: Debug Contracts and the tinker loop

Let's get a look at Scaffold-ETH. It looks great. All right, now let's go to Debug Contracts. We can see our contract, we can read from our contract, we can write to our contract, and we see some global variables there.

Let's get into Cursor and start editing. We see our packages: we've got Foundry and Next.js. Let's do Foundry and get into the contracts. You can write anything, but let's just make a fake delegate thing here where we have `address public delegate`. Maybe it's someone who's getting royalties, or something. Let's copy and paste our address in.

Okay, so we've got this delegate. It's kind of arbitrary, but let's just see that it's working. `yarn deploy`, and let's see there, there's our delegate. So you're kind of just in this tinker loop with Scaffold-ETH where you're making changes.

## 01:33-02:35: Adding setDelegate and locking it to the owner

Now let's add a new one. Let's do `setDelegate`. Let's make a new function, make it public, and we'll make it so only the owner can run it. And we're going to have to test that out, but let's deploy it and see that we get a new contract. And we're not the owner, so this should fail with "not the owner". Okay, cool.

So who is the owner? Well, let's go look at the deploy script and see that it gets passed in here. So it's probably in the constructor here. So really, we can set whoever we want right here. Let's just, yep, so let's copy our address from the frontend and paste it in. And let's hit deploy and see what happens. We should be the owner. Come on, pink guy. There he is. Sure enough, pink guy's the owner and the delegate.

And now let's see if we can set it. And one more thing, it's going to fail again. We need some gas. Hit the gas station, let's hit the faucet. We've got gas. We are the owner. We hit send. And Vitalik is now the delegate.

## 02:35-02:59: Testing access control with a burner wallet

Okay, so the good guy as the owner can set it. Let's try a bad guy. Scaffold makes it really easy with burner wallets. We've got this teal guy right here. He can hit the faucet, grab some money, and if he tries to set the delegate to some scoundrel like Austin Griffith, then hit send, it's going to say "not the owner" because teal guy is not the owner. All right, so bad guys can't set it, good guys can set it.

## 02:59-03:48: The frontend, and reading the contract

I'm happy with the backend, the smart contract looks nice. Let's get to the frontend. We're going to go to `app/page.tsx`. Let's set an initial title here. What are we making? "I hereby declare that this is the delegate app." Okay, and we got it, it looks nice.

Now we can use these nice Address components from Scaffold-ETH. They've got everything over here in their docs. Let's go to the scaffoldeth.io docs, where we can get components and hooks. But this hook right here is super important: `useScaffoldReadContract`. We'll install that in, and now it knows about our contracts and can read any values we need, like perhaps the delegate. Give us the delegate please. Thank you. All right, and save that as `delegate`.

## 03:48-05:11: The Address and AddressInput components

So now we just have `delegate` in our frontend anywhere we need it. We've got the delegate address. Let's just display it raw now and see how it looks. Delegate looks like this. Okay, that is an ugly address.

And let's get rid of all this HTML. Cutting up the HTML. You div, you div, you're out of here, div. All right, there we go. Delegate looks good. It doesn't look good, but it's there.

To make it look good, we're going to use an Address component. So if you just open up that and put `Address`, and say `address` equals `delegate`, and then close that thing. Yep, we're writing HTML tags, but it's working. Looking good. Let's add a little top margin there to make it look real good. Center div like a genius. All right, looking great.

All right, now we will need another div so we can set up an AddressInput. This will let us receive an address, right? Someone can type an address in and we'll track on change. We do a value that's going to be `newDelegate`, and then on change we do `setNewDelegate`, and then Copilot's got our back. There we go, nice. We'll install `useState`. But there we go, so now this `newDelegate` is tracked. Little weird thing here, we need to put the little quote boys right there. There we go. Okay, all good. Everyone's happy, everyone's centered. It looks good, I'm happy.

## 05:11-05:48: Writing to the contract from a button

We need a button. We need to write to our smart contract, so we're going to need `useScaffoldWriteContract`. It's an async contract writer, right? You only need one for each contract, but you set one up and then you can run it whenever you need down here in a button.

So let's throw in another div and another button. We're going to set delegate. And so that knows about our function. What's the function? `setDelegate` is the function. And what are the args? It's our `newDelegate`. And we're not going to send in any value. We're ready to go. Set delegate on our local chain, make a transaction, boom. I am the local delegate. It's working.

## 05:48-06:50: Pointing the app at Base and funding the deployer

Now our app says it's on the wrong network, so we've got to go to `scaffold.config` and set up Base. Yep, okay. Oh shoot, I need me to be the address, so I need to paste in my address.

Now, talk about deploying to Base. Well, we're going to need to set up a deployer address. And you need to keep that thing isolated and only put enough money in it that just deploys the contract, right? And it's just used for this application right here. So here's the address of this guy. He doesn't have any money in there. If we try to deploy, it's going to say, you know, not enough money.

So then let's throw some funds in here. So we'll grab this address, jump over to the wallet, go to Base, hit send. Send in 25 cents. Don't spend it all in one place. So we sent 25 cents of ETH on Base. Now this dude has enough to deploy.

## 06:50-07:18: Deploying the contract to Base

And here we go. There. Is it there? Is it there? Yes. Okay, so it's got money. Here we go: `yarn deploy --network base`. Ship it. Ship it. Deploying on Base. Yes. Okay, so it's out there.

Okay, now everything's on Base. If we click on an address, it just takes us to BaseScan now, right? All right, here we go. So here's our delegator app. Can we set Vitalik? Set delegate. We're going to pay a fraction of a cent onchain talking to our smart contract. And Vitalik is now the delegate.

## 07:18-07:45: Shipping the frontend to Vercel or IPFS

Okay, so this is working on localhost. Let's put it on Vercel: `yarn vercel:yolo --prod`. You can also do `yarn ipfs` to put it on IPFS, and then you're going to get that URL there. And we can go to the URL and look at this. It's a live app talking to a live smart contract on Base, an Ethereum L2. And I'm going to set the delegate. Anybody can connect their MetaMask and set the delegate. There it is, he's the delegate. We just did it. We built a whole app onchain, and you can too.

## 07:45-08:10: Where to go next

You can go to scaffoldeth.io to get started with the tooling. And then once you've got that and you're like, what do I build? Go to speedrunethereum.com and learn about all the cool things that you can build onchain. Go build the future.

## Build this yourself

The app in this video is deliberately small, and that is the point: the shape of it is the same as every larger dapp you will write. Contract, deploy script, read hook, write hook, address components, network config.

When you want the same loop with a real spec to build against, the challenges walk you through progressively larger versions of it:

- [Tokenization](/challenge/tokenization) is the first challenge, and the closest to what happens here.
- [Token Vendor](/challenge/token-vendor) adds a contract that holds and moves funds.
- [Minimum Viable Exchange (DEX)](/challenge/dex) is where the contract logic starts getting interesting.

If you want more detail on the pieces used above, the [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io) cover the hooks and components, and [How to Build an Ethereum dApp with AI](/guides/how-to-build-dapp-ethereum-ai-workflow) covers the same workflow with an AI assistant in the loop.
