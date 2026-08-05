---
title: "How a Full-Stack Ethereum App Is Structured, with Scaffold-ETH 2"
date: "2025-06-04"
description: "Austin Griffith walks through the anatomy of a full-stack Ethereum app at Devcon SEA: the two packages, the local chain, the tinker loop, and the Speedrun Ethereum curriculum that builds on it. Full video and edited transcript."
image: "/assets/guides/how-a-full-stack-ethereum-app-is-structured.jpg"
showNavigation: true
faqs:
  - question: "How is a full-stack Ethereum app structured?"
    answer: "Two packages and one contract between them. A contracts package holds your Solidity, your deploy scripts, and your tests, run by either Foundry or Hardhat. A Next.js package holds the frontend. The link between them is generated, not hand-written: when the contracts compile, the ABI and deployed addresses are injected into the frontend, so the app already knows every function and variable on your contract. Scaffold-ETH 2 ships this layout by default with Next.js, Wagmi, Viem, RainbowKit and TypeScript on the frontend side."
  - question: "What is the cleanest folder structure for contracts, frontend, and tests?"
    answer: "Keep the chain side and the app side in separate packages of one monorepo, and let the contract artifacts flow from the first into the second automatically. Tests live with the contracts, next to the Solidity they exercise, because they run against the same local chain your deploy scripts target. The mistake to avoid is hand-maintaining a copy of the ABI in your frontend: it goes stale the moment you change a function signature, and you lose the type-safety that makes the frontend autocomplete your own contract."
  - question: "Do I need Hardhat or Foundry to build with Scaffold-ETH 2?"
    answer: "You pick one when you scaffold the project and it becomes your contracts package. Both do the same job here: compile, deploy, test, and run a local chain. Foundry writes tests in Solidity and is fast; Hardhat writes them in TypeScript and has a longer plugin history. Either way the frontend side of the app is unchanged, so the choice is about which testing language you want to live in."
  - question: "How do I test contract logic before I build a frontend?"
    answer: "Use the Debug Contracts page. Scaffold-ETH 2 generates a UI for every function on your deployed contract, so you can call them, read state back, and confirm a revert message without writing any React. Combined with burner wallets, which are throwaway browser accounts you can fund from a local faucet, you can prove an access-control rule works by calling the function as the owner, then calling it again as a second account and watching it revert."
  - question: "Where should I start if I want to learn Ethereum development by building?"
    answer: "Start at speedrunethereum.com/start, which sets up your environment and takes you into the first challenge. From there the curriculum runs in order, and each challenge is autograded from your deployed contract and live frontend."
---

Most Ethereum tutorials show you a contract. Fewer show you the shape of the whole application: where the Solidity lives, where the React lives, what connects them, and which parts you should never write by hand.

In this Devcon SEA talk, Austin Griffith builds that shape live. The first fifteen minutes are the anatomy of a Scaffold-ETH 2 app and the tinker loop it enables. The rest walks the Speedrun Ethereum curriculum, writing a staking contract from scratch along the way, and finishes with audience questions about storage, IPFS, and re-entrancy.

The full video is below, followed by a timestamped outline and an edited transcript.

<iframe src="https://www.youtube.com/embed/_VWF2fiXDPQ" title="Intro to Scaffold-ETH 2 and SpeedRunEthereum, Austin Griffith at Devcon SEA" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What's in this video

- [What Scaffold-ETH 2 is, and how the app is laid out (00:55-04:15)](#what-scaffold-eth-2-is-and-how-the-app-is-laid-out-0055-0415)
  - [The two packages, and what connects them (02:07)](#the-two-packages-and-what-connects-them-0207)
- [The local loop: three commands, burner wallets, Debug Contracts (04:15-07:20)](#the-local-loop-three-commands-burner-wallets-debug-contracts-0415-0720)
  - [Debug Contracts, before you write any UI (05:47)](#debug-contracts-before-you-write-any-ui-0547)
- [Tinkering: add a variable, test an assumption (07:20-13:00)](#tinkering-add-a-variable-test-an-assumption-0720-1300)
  - [Testing an assumption with a second account (08:52)](#testing-an-assumption-with-a-second-account-0852)
  - [When you move to the frontend (11:26)](#when-you-move-to-the-frontend-1126)
- [Challenge 0: NFTs, IPFS, and how autograding works (13:00-23:18)](#challenge-0-nfts-ipfs-and-how-autograding-works-1300-2318)
  - [Running challenge 0: mint an NFT and send it (15:04)](#running-challenge-0-mint-an-nft-and-send-it-1504)
  - [Inside the NFT contract, and where the image lives (18:38)](#inside-the-nft-contract-and-where-the-image-lives-1838)
  - [Public networks, verification, and autograding (21:15)](#public-networks-verification-and-autograding-2115)
- [Staking as a coordination problem, and why contracts need poking (23:18-33:41)](#staking-as-a-coordination-problem-and-why-contracts-need-poking-2318-3341)
  - [Contracts are not automatic, so pay someone to poke them (26:25)](#contracts-are-not-automatic-so-pay-someone-to-poke-them-2625)
  - [Contract-to-contract interaction, and what the challenge gives you (29:35)](#contract-to-contract-interaction-and-what-the-challenge-gives-you-2935)
- [Writing the staking contract (33:41-48:41)](#writing-the-staking-contract-3341-4841)
  - [Deadlines, block timestamps, and the local-chain trick (39:22)](#deadlines-block-timestamps-and-the-local-chain-trick-3922)
  - [The execute branch, withdrawals, and re-entrancy (43:57)](#the-execute-branch-withdrawals-and-re-entrancy-4357)
- [Testing both paths, and the edge cases that trap funds (48:41-61:34)](#testing-both-paths-and-the-edge-cases-that-trap-funds-4841-6134)
  - [The happy path, and accepting ETH directly (52:17)](#the-happy-path-and-accepting-eth-directly-5217)
  - [The edge cases that decide whether funds get stuck (56:29)](#the-edge-cases-that-decide-whether-funds-get-stuck-5629)
- [Deploying to a live network (61:34-69:18)](#deploying-to-a-live-network-6134-6918)
- [The rest of the curriculum: vendor, dice, DEX, multisig (69:18-87:52)](#the-rest-of-the-curriculum-vendor-dice-dex-multisig-6918-8752)
  - [Challenge 2: the token vendor and the approve pattern (69:18)](#challenge-2-the-token-vendor-and-the-approve-pattern-6918)
  - [Challenge 3: randomness you can predict (74:56)](#challenge-3-randomness-you-can-predict-7456)
  - [Challenge 4: the DEX, reserves, and liquidity incentives (77:00)](#challenge-4-the-dex-reserves-and-liquidity-incentives-7700)
  - [State channels, multisigs, and onchain SVGs (82:40)](#state-channels-multisigs-and-onchain-svgs-8240)
- [Can I contribute my own challenges? (87:52-90:30)](#can-i-contribute-my-own-challenges-8752-9030)
- [Can you use the blockchain as a database? (90:30-93:07)](#can-you-use-the-blockchain-as-a-database-9030-9307)
- [Where does IPFS fit, and do I need an API key? (93:07-95:41)](#where-does-ipfs-fit-and-do-i-need-an-api-key-9307-9541)
- [Send, transfer, call, and the 2300 gas limit (95:41-99:23)](#send-transfer-call-and-the-2300-gas-limit-9541-9923)

## The architecture, in short

A Scaffold-ETH 2 app is a monorepo with two packages:

- **The contracts package** is either Foundry or Hardhat, chosen when you scaffold. It owns your Solidity, your deploy scripts, your tests, and the local chain you develop against.
- **The Next.js package** is the frontend: Next.js, RainbowKit, Wagmi, Viem, and TypeScript.

What makes the pair work is the generated link between them. When the contracts compile, their artifacts are injected into the frontend, so the app knows every contract, function, and variable you have. That is what makes the frontend autocomplete your own contract, and what makes a new public variable appear in the UI seconds after you add it to the Solidity.

Three commands carry local development:

- `yarn chain` starts a local blockchain.
- `yarn deploy` compiles your contracts and deploys them to it.
- `yarn start` serves the frontend at `localhost:3000`.

Two features make the loop fast. **Burner wallets** are throwaway accounts generated in the browser, funded from a local faucet, so you can send transactions without a wallet dialog on every click, and open an incognito window whenever you need a second identity. **Debug Contracts** is a generated UI for every function on your deployed contract, so you can exercise contract logic before a single line of frontend code exists.

## Transcript

Edited from the video's captions for punctuation, length, and readability. Timestamps link to the corresponding point in the video above.

## What Scaffold-ETH 2 is, and how the app is laid out (00:55-04:15)

We're going to look at Scaffold-ETH, then go through Speedrun Ethereum and talk through each of the learning moments you'll hit as you work through the curriculum.

Scaffold-ETH is a dapp developer tool. It's great for tinkering with your smart contracts, and it has an auto-adapting frontend that's really nice when you're iterating. It uses Next.js, RainbowKit, Wagmi and TypeScript, and you get a choice between Hardhat and Foundry on the contracts side. It's a great tool for prototyping: you can get something out the door quickly. I deployed an app earlier today in about 20 minutes and still had plenty of time left for questions.

### The two packages, and what connects them (02:07)

While that installs, let's look at the code. You have two main packages. There's either Foundry or Hardhat, which is your backend: your orchestration tool, your deploying and your testing. And there's Next.js, which is your frontend.

Scaffold-ETH does some really nice things here. When you compile in Foundry, it injects those artifacts into your app. That's what makes working on the frontend pleasant: it knows about all your smart contracts and all your variables, and it can autosuggest how to fill things in.

The contract we start with is a basic one. It's a greeter, and it carries a lot of the initial concepts: primitives, data types, events, constructors.

## The local loop: three commands, burner wallets, Debug Contracts (04:15-07:20)

Let's fire everything up. `yarn chain` spins up our local blockchain, and that's what we'll deploy to. `yarn start` brings up the frontend. Those two things working in symphony are the magic sauce of Scaffold-ETH. Then `yarn deploy` ships your contract to the local chain, compiling and deploying it.

The heart of Scaffold-ETH is that you can have your app in one window and your code in the other, make small changes to the code, and see them reflected in the frontend.

Now, the first concept: burner wallets. I just disconnected MetaMask on purpose. You'll use burners in development rather than production. They're really nice in dev because you can hit a button and it sends a transaction, without dialogs coming up and without getting your chain ID right in MetaMask every time. It's telling me I don't have gas, but if I click the faucet button, now I have some ETH.

### Debug Contracts, before you write any UI (05:47)

Let's look at the greeter contract. There's a greeting, and it gets set: you send in a string and it's stored. So let's do that. There we go, now we see "Hello World".

I always like to poke at this premium flag. There's a piece of code that says if you send in some value, it sets premium to true. So let's send in some ETH. Note there are no decimals, you need to convert to wei by multiplying by 10 to the 18, and there's a little button to do that. You don't want your users doing this, of course. This is a developer thing; in the frontend you'd handle it behind the scenes.

There we go, premium is true. We were able to send money in, there's money in the contract, and the greeting is set with the flag.

## Tinkering: add a variable, test an assumption (07:20-13:00)

The Debug tab is really nice, because now I can go add some code. What if we wanted a public address? Let's call it `beneficiary` and set it to another address.

When I hit save and deploy, watch what happens: we get a new beneficiary field over here. Sure enough, there it is. Notice how that just auto-adapted. All I did was add a line to my contract and deploy it, and the frontend recognized the new variable and displayed it. So you can really tinker with how you want your contract to work and test your assumptions.

### Testing an assumption with a second account (08:52)

Let's test some assumptions. There's a withdraw function that pulls ETH out of the contract, and it checks `isOwner`. I'm going to take that off and write a different require statement: require that `msg.sender` equals the beneficiary, or it reverts with "not the beneficiary".

Now I want to test this. I want to withdraw as the beneficiary, then try as a bad guy, and it should fail for the bad guy and work for the beneficiary.

So let's set the greeting and send in some money, so there's money in the contract. To create a new account you can do it quickly by opening an incognito window and going to localhost: notice I get a new address. Close it, do it again, and I get another new address.

Let's grab some faucet funds and try to withdraw. Hopefully it yells at me and says "not the beneficiary". Very nice. Now let's see if the beneficiary can withdraw. There we go, the money's out of the contract.

Like I said: testing your assumptions. I wrote a line of code that said only the beneficiary can call withdraw, and then I tried it as the beneficiary and as another account, and proved it only works for one. That's not exhaustive testing, of course. Eventually you'd want a more extensive test suite. But for figuring out how you want your contract to work, this is a really quick way to iterate.

### When you move to the frontend (11:26)

Scaffold-ETH is great for this kind of prototyping. Eventually you'll move over to the frontend and write some React.

Tomorrow we'll have a BuidlGuidl community-led session: intro to building on Ethereum in the morning, and a capture the flag in the afternoon. The guys at BuidlGuidl have built about 12 different challenges, starting easy and getting harder.

## Challenge 0: NFTs, IPFS, and how autograding works (13:00-23:18)

Scaffold-ETH is the underlying tool, but what I really want to show off is Speedrun Ethereum. It's a curriculum that takes you slowly through building your first five apps on Ethereum, starting with a simple NFT app.

In that first challenge you deploy an NFT contract, bring up the chain, and get a frontend. Gas and wallets we've covered: you're using burner wallets, going to the faucet for funds, and sending ETH around. There's no code in this first challenge. It's about calibrating your tooling and getting used to how Scaffold-ETH works. You go to the My NFTs tab, hit mint, and it mints you an NFT.

### Running challenge 0: mint an NFT and send it (15:04)

Let's follow the instructions. Clone it down, check out the `simple-nft` branch, `yarn install`. Then the same thing we do with Scaffold-ETH: `yarn chain` to run our local chain, `yarn deploy` to deploy the contract, `yarn start` for the frontend. It should look very familiar, because it is Scaffold-ETH.

Here's our app at localhost:3000, with the burner wallet. We hit the button to fund the wallet from the faucet.

I'd recommend going through each of these challenges properly on your own time. I'm going briefly here, and probably not slowly enough to get everything from it.

Let's mint. There's our first NFT. Let's mint another. Now the directions say to send them around, so we create an incognito window for a second account. There's a red-and-teal one and a green one, so let's send the buffalo to the green one. Copy his address, paste it in, fire the transaction. He got it.

### Inside the NFT contract, and where the image lives (18:38)

That's most of the first challenge: calibrating your tooling. You don't really have to write any Solidity, but let's look at the contract.

We import a bunch from OpenZeppelin to make the ERC-721 work, ownable and counters, and inherit those. There's a base URI. What happens is it stores a base URI for the NFT, the NFT itself goes into IPFS, and the hash goes in the contract. Here's `mintItem`: we mint, increment the counter, some before-transfer hooks, and that's it. And there's the `tokenURI`.

Let's debug that. We can check our balance, one. We can look at who owns token 1, that's the other account, and token 2 is us. Then let's get the token URI for token 2: it gives us an IPFS link, and following it gives a description of the NFT and an external link to the image.

So that lives in IPFS. The manifest is in IPFS too, and the hash of that goes onchain. That string is the unique identifier of the content.

### Public networks, verification, and autograding (21:15)

Next the challenge has you deploy to Sepolia instead of locally, and do the same thing on a public network. That's how the autograding works. When you're doing this at home you hit submit challenge, put in your deployed URL wherever your Vercel site is, and the link to your contract on Etherscan. We have an autograding system that grades your challenges and tells you if you got it right.

There's contract verification too, which is very cool: verify the contract so that when people see it on the block explorer they can actually read your code.

## Staking as a coordination problem, and why contracts need poking (23:18-33:41)

The decentralized staking app is where you'll have to write code.

This challenge is about building a contract that lets people who don't trust each other coordinate. In this case they're coordinating a group funding effort. Say you need to buy something for $500 and you need five of us to put in a hundred bucks each. The thing is, we don't trust each other, and it's important that you can't get griefed. If someone can figure out how to lock your money or steal it, that's really bad.

So you build the contract so that everyone stakes in, and if you get enough together it moves into a success state. If you don't get enough by the deadline, you need it to go into a withdraw state so people can get their money back. You have to think through all the ways this could play out if people don't coordinate.

The cool thing is that all anyone has to trust is the code in the contract. They don't have to trust the other players. Every player has to play by the rules of the contract. This is starting to show the kinds of things you might build on Ethereum. The NFT is a simple collectible, and honestly NFTs are more like passports, like digital credentials. The digitally scarce art thing wasn't as cool as we thought it was. I think NFTs were a little overhyped.

### Contracts are not automatic, so pay someone to poke them (26:25)

There's an interesting thing you learn going through this: contracts aren't automatic. You always have to make a transaction to make something happen. Thinking about the state machine, we're in the staking phase, and then either the success phase or the failure phase. To move between them, someone has to click the button. Someone has to pay for the transaction.

This brings up the idea of a web3 cron job. In web2 you might run a cron job to roll your logs every night. In web3 you might want to compound interest every night. You're not going to run a service that checks in to do it, because if that machine falls over, the whole system doesn't work. You're only as strong as your weakest link. If you have a hard, strong blockchain and then a service calling it that falls over and breaks everything, that's no good.

So what you do is write the rules correctly: anyone is allowed to check in once every 24 hours. Then, the key part, you incentivize someone to hit the button. That's a good aha moment when you're building these contracts. You write the rules so someone can only check in once, and you make sure they get paid for checking in. That's what creates a system where you can share the code and anyone can run it, and at least one person will, because they're financially incentivized.

If you want an automatic task to run on Ethereum, you don't run a computer that does it. You write the rules correctly and build incentives around those rules to get people to behave the way you want.

### Contract-to-contract interaction, and what the challenge gives you (29:35)

Challenge one is building this staking app, and it operates like a state machine: people stake money, and at the deadline we check whether we reached the threshold.

Let's deploy the contract and bring up the frontend. Here's the Staker app: some staking UI that lets people stake 0.5 ether, then either withdraw or execute, and all the events below. And just like Scaffold-ETH, you have the Debug Contracts page.

Now let's edit `Staker.sol`. By this point you'll need to know some Solidity syntax. It's not going to let you copy-paste values in. You have to know what you're doing, think for yourself, and actually build the thing.

There's an external contract in here that's just an example: it sets a bool to true so you know you've completed the challenge. We'll call it from the Staker contract. The Staker has some scaffolding and comments about what you're supposed to do, but the code isn't written yet.

There are a handful of learning moments here, and contract-to-contract interaction is a key one. That's what's going on: the Staker instantiates the example contract, and later calls a function on it.

## Writing the staking contract (33:41-48:41)

What do we need to do? Track individual balances. And we have a threshold constant: we need at least one ether in the contract to be successful. So we're keeping track of everyone's money, with a threshold to clear.

Now the stake function. Look at the first goal: we should see the balance of the staker go up. So let's create a function called `stake`, and it's payable. And we need the event. We define the event, and we emit it inside the function. Someone calls stake with some amount of money, it's payable so ETH can come in, we increment their balance by however much they sent, and we emit an event.

Let's test it. I'll use the Debug Contracts tab. I need money first, so faucet. Now let's stake 0.1 ETH. What we're testing is whether our balance is incremented by the value. Let's read the balance. There we go, it went up. Let's do it again and see it add up. Yes it does.

Now let's open an incognito window and stake as a second account. What I want to see is that the money in the contract goes up while we're tracking individual balances. That's the key. There we go: more money in the contract, and it's tracking balances per address separately. This account has 0.1, the other has 0.02.

And the events? There they are, both of them.

### Deadlines, block timestamps, and the local-chain trick (39:22)

Now the challenge starts talking about the contract as a state machine and how timing works.

`block.timestamp` is the time the block was mined or validated, so you can get the current time of the chain. We'll set a deadline of the current time plus 30 seconds. And then we're going to need a require statement. This is where it talks about the contract not doing anything automatically: someone has to poke it.

So we need an execute function that checks whether the deadline has expired. Let's write just that: a public function with a require statement that the current time is after the deadline. That's all. I just want to test this one piece of code. This is nice with Scaffold-ETH, because you've got it all locally. You're on your own block explorer, on your own blockchain, and you can poke around all you want.

There's one tricky thing with `block.timestamp` here. When you deploy to a live network there are blocks every 12 seconds or so, so time keeps moving. But on your local chain there are no blocks happening, so we can't get the time. The trick I use is to hit the faucet button, which forces a block to get mined and updates your timestamp.

Now execute works. Let's redeploy with a reset so we're on a fresh contract, and try again. It should fail, because we're not past the 30 seconds. Yep: deadline not met.

That's what I wanted to test. Does this thing keep track of time correctly, and does it only run the function once the time has passed? It does.

### The execute branch, withdrawals, and re-entrancy (43:57)

`address(this).balance` gives the balance of the contract, and what we want to know is whether it's over the threshold by the deadline. If it is, we call out to the external contract. That's the contract call, and it's really cool: it's calling the `complete` function on the other contract and sending all of its money.

So if the balance is greater than or equal to the threshold, and you can't get past the require statement unless the deadline has passed, then we call complete on the example contract. And if not, if we weren't able to get a threshold's worth of ETH, we need a different mode. Thinking about our state machine, it's not a success, it's open-for-withdraw. So we set `openForWithdraw` to true, which means we need a bool up top that starts out false.

Now we need a withdraw function. It requires that open-for-withdraw is true, sends the balance to the user, and zeros out the balance.

This should give you goosebumps in terms of re-entrancy. The trick is to create a temporary variable, zero out the amount, and then transfer the money. That makes sure the balance is zero by the time you call transfer. Otherwise you could set up an attacker contract that, when it receives the ETH, goes back in and calls again. You could withdraw multiple times and drain the contract. Say there's five ETH in the contract and your balance is only half an ETH: you could use that half ETH and withdraw multiple times by re-entering. A weird little attack, but zeroing first prevents it.

## Testing both paths, and the edge cases that trap funds (48:41-61:34)

Let's add a `timeLeft` function too, that looks like a nice function to have. If the timestamp is greater than the deadline we return zero; if not we return deadline minus timestamp. That gives us a report on how much time is left in the round.

Now we can see time left in the UI. It won't change unless we cause a block to get mined, and then it ticks down. And I can't call execute yet, it says the deadline isn't met, because we're waiting for this. Now time left goes to zero. So it's correctly reading how much time is left.

Let's test the failure case. If we're not able to coordinate, we put money in and the time expires, can we get our money out? Deploy a fresh contract, stake 0.1, wait for the timer.

We've staked money in, and when I call execute it should set open-for-withdraw to true, because we didn't reach the threshold. Then we call withdraw, and hopefully we get our money back. Money's gone from there, money's back here.

So we've tested the sad case: we staked, we weren't able to get enough together, it went into withdraw mode, and users can get their money back. It's not going to get stuck.

### The happy path, and accepting ETH directly (52:17)

Now the happy path. We want enough people to stake by the deadline, then hit execute, and it should work.

Fresh contract, another player in an incognito window, faucet, and we both stake 0.5 ether. Now we have the full amount, so when we hit execute it should not go into withdraw mode. It should send the money on to the other contract. There we go. Look at the contract balances: the Staker is empty, the example contract has the one ETH, and completed is true.

So we were able to get the threshold together, hit execute by the deadline, and it sent the money on and called complete. Both the happy state and the sad state check out. Can you see time left? Yes. If enough ETH is staked, does it work? Yes. If the threshold isn't met, can you withdraw? Yes.

Next: to improve the user experience, set the contract up so it accepts ETH directly. This is the `receive` function, like a fallback. Normally we're calling stake and sending money in. This way you can send money straight to the address and it will still track it for you, by having receive call stake.

Let's test it. Deploy again, and I'll just send 0.5 ETH straight to the contract address from the faucet, without calling the function. It was successful, the money's in there, and it's tracking the balance for that user.

That's a nice piece of UX. Instead of calling a function, you could give people an ENS name. It could be `stake.buidlguidl.eth`, and anyone can just send ETH to it. Someone still has to hit the execute button, but as I said, if you figure out a way to incentivize that, you can make it work in a decentralized way.

### The edge cases that decide whether funds get stuck (56:29)

Can execute get called more than once? This is an interesting one, and you really have to think about all the edge cases.

Say the deadline has passed, no one has called execute yet, and there's not enough money in the contract. If someone calls execute, it opens withdrawals. But what if someone called execute again after the balance went over the threshold? You could end up in a weird state where both of those are true.

So let's make a variable, `completed`. We set completed to true in execute, and we require not completed at the top. That means we only ever go into that function once. There's probably a more elegant way, but it's straightforward.

Next: make sure your funds can't get trapped in the contract. What happens if you send ETH after you've executed? Basically, the staking is done and we've moved into a complete state, but that doesn't stop someone sending money to the contract. We don't want money getting locked in there. So in the staking function we also require not completed. That fixes it. Once the game is over, no one's allowed to put more money in.

Let's triple-check. Run the whole thing through, stake twice to reach the threshold, wait for the timer, execute. The money goes into the other contract. Now try to send money to the address: it should fail. Yes, already completed.

So our contract is pretty solid. We've worked through the edge cases and protected ourselves.

## Deploying to a live network (61:34-69:18)

Now let's deploy. `yarn generate` gives us a deployer account, and `yarn account` tells us about it. I need to send it some testnet ETH.

[The Sepolia deploy fails repeatedly: the funds don't show up on the deployer account and the RPC appears to be misbehaving.]

Quick fix: I'm going to put this on a live network and pay real money. So I want to adjust the threshold down to something tiny, because this money is going to be gone forever and I only want to spend a few cents. Let's deploy to Optimism. And by the way, if you're doing this at home, use Optimism Sepolia. That's what we recommend, so you're not burning real funds like I'm doing right now.

We deployed our Staker, and it's live. Now I want to edit the scaffold config where we set the network. Change it from Hardhat to Optimism, hit save, and the whole app moves over to Optimism.

Let's stake. I have to be careful not to spend real money, so 0.001. What does it cost us? 34 cents. There goes the money, locked in the contract. Now we wait for the time period. Time left is zero, so let's execute.

The 34 cents should disappear from here, completed goes true, this should be empty, and the external contract should have the funds. And anyone in the world can call this button right now and make 34 cents. I'll go ahead and do it before anybody else gets to it. I can't get front-run here, because it's a centralized sequencer. Otherwise, if it went to the mempool and someone was watching, they could copy my transaction, turn the gas up a little, front-run me and take the money.

That's the staking challenge: a simple but powerful coordination mechanism. When you do this properly you'll deploy the contract, ship the frontend with `yarn vercel`, and submit both.

## The rest of the curriculum: vendor, dice, DEX, multisig (69:18-87:52)

### Challenge 2: the token vendor and the approve pattern (69:18)

Let's go through the rest of the challenges faster.

Challenge two is a token vendor. You have one contract that acts as your token, and another contract you send the token into that will buy and sell it. Smart contracts are like always-on vending machines that anyone can access. So: make a decentralized digital currency, then build an unstoppable vending machine that will buy and sell it. You learn about the approve pattern in ERC-20s and how contract-to-contract interactions work.

You create the token first and check that balance and transfer work, so you can send the token around. Then you build the vendor as a second contract, with an exchange rate in tokens per ETH. If you put in one ETH you get a hundred tokens back. You write a `buyTokens` function that looks at `msg.value`, does the calculation, and transfers the right amount of tokens to you. There's an event emitted too.

The hardest part of this challenge is building the vendor to buy the tokens back, and the reason it's hard is the approve pattern. The way ERC-20s work, if a contract needs to accept your token, you don't just send the token to it, which would make a lot more sense. You approve the contract to take your tokens, then call a function on it, and it goes and gets them. It's a weird pattern. You get used to it after a while, and this challenge gets you over that first hump.

So it's two transactions. Buying is easy: you send ETH in and get tokens back. Selling means calling approve on the token in one transaction, then a second transaction that tells the vendor it's been approved and it can take them.

### Challenge 3: randomness you can predict (74:56)

Challenge three is a dice game. Randomness is particularly tricky on a public, deterministic blockchain, because the chain shows everything. A weak form of randomness is to use the previous block hash, and the problem with that is you can set up an attacker contract.

That's what you'll do here. There's a dice game where you pay to roll: if you win you win money, if you lose the money stays locked. You attack it by building a second contract that looks at the same source of randomness the game looks at, works out whether it would win, and only pays to roll on winning numbers.

So you sit there calling roll on the attacker contract, and it waits until the block hash is just right. You only ever roll on winning rolls. That's not good, obviously, if you wanted real randomness. But it teaches you how this falls apart, how to build an attacker contract, and how randomness can be predicted.

### Challenge 4: the DEX, reserves, and liquidity incentives (77:00)

The DEX is probably one of the most important builds you'll make in Speedrun Ethereum.

With the token and the vendor, we could mint a token, put it in a contract, and let people buy it. But what if you wanted people to swap, put in tokens and get back ETH, with a variable price?

A DEX keeps reserves of both assets. It holds a bunch of your token and a bunch of ETH, at a ratio that tells you the price. If the token were exactly one-for-one with ETH you'd have 50% of each. If the token is worth ten times ETH, you'd have ten ETH and one token. Those reserves are what let you do the swaps, and for the first time you can do it in a decentralized way. You used to need an order book or some centralized choke point that could fall over. Here it's fully decentralized and all onchain.

There are downsides like impermanent loss, and you'll have to dig in to learn that properly. The short version is that reserves matter: the more reserves you have, the cheaper the swap, the less slippage. So you want to incentivize people to be liquidity providers. Someone puts in ETH and tokens, and every time there's a swap, a tiny bit is left behind. The contract gains value as people swap back and forth, and that's what pays the liquidity providers.

This is also expansive, which brings up a really cool concept: hyperstructures, from Jacob at Zora. Hyperstructures are unstoppable, free, valuable, expansive. Expansive is what I'm talking about here: the protocol itself incentivizes people to provide liquidity, so the more money you put in the more you make. If you build it correctly and put it out there, people will provide liquidity because they're financially incentivized to. It's permissionless, positive-sum, credibly neutral.

In the challenge you'll write swap functions in both directions, functions to add and remove liquidity, and an init function that seeds the initial liquidity and sets the starting price. There's a lot of detail here I'm not getting into, like the constant product. Go take on the DEX challenge on your own time. It's one of the neatest contracts, and the autograder will swap tokens on your DEX to make sure everything works.

Everything after this is dessert. If you can build a DEX you can build a lot of different things. It's a good "am I ready yet" test.

### State channels, multisigs, and onchain SVGs (82:40)

There are three more challenges.

State channels are really cool because they use signatures. You don't always have to put everything onchain: sometimes you can do things between parties with just signatures, and have a contract those signatures settle to. You learn about how scaling can work.

Then the multisig. A multisig is a contract you send money into where multiple people need to sign to send it out, three of five signatures, say. You keep track of signers, you can add and remove them, and there's an `executeTransaction` function. You pass in an address, a value, some data, and the signatures. It validates the signatures, and if you have enough valid ones, it executes whatever arbitrary call data you gave it.

Multisigs are handy, especially for storing large amounts of money, like a DAO treasury. A Safe is the same idea: it's much safer, because if you have three accounts and one leaks, you just remove the leaked account and add a new one. Whereas if that leaked account held the money directly, the money's gone.

Underneath is ECDSA. There's a `recover` function in here. You can sign any arbitrary message, then pass in what you signed plus the signature, and recover gives you back the address that signed it. That's a really powerful tool, and it leads to things like meta transactions.

The last challenge is the SVG NFT. Those NFTs at the beginning went to IPFS: the image sits in IPFS and the hash of it is stored in the contract. With an SVG NFT you put the contents onchain, the actual instructions for how to draw it, so the contract itself renders the SVG.

## Can I contribute my own challenges? (87:52-90:30)

**Can I open a PR to add more challenges? I work with SNARKs, so maybe an example verifying a SNARK.**

Possibly. State channels was actually made by someone else who contributed it. But it's more likely you'd fork Speedrun Ethereum and make your own version. I think someone did that exact thing.

Related: go to buidlguidl.com and scroll to the bottom, and there's a Tech Tree link. It's a bit buried, but it has all sorts of challenges beyond the SpeedRun ones, all sorts of things you can build onchain, including a whole section on zero knowledge. There's a Circom starter kit in there. The people who made Dark Forest are here today, and that's one of the coolest games ever made onchain, using ZK.

## Can you use the blockchain as a database? (90:30-93:07)

**I'm trying to understand storing on the chain, using the chain as a database instead of a normal one. How does it work, and which parts should you store onchain?**

This is a moving target. A few years ago I'd have said you're making a mistake if you're using it like a database. It's a very expensive, slow, asynchronous database. But the needle has moved. L2s exist now and they're super cheap, so it starts to make sense again.

You do have to be careful, because this is all public. Everything that goes in is visible to everyone. Medical records, no way. Anything that could dox someone, like connecting an account to an address, no. There's a lot you don't want onchain purely for privacy.

But you can store strings, you can store numbers, and it works kind of like a database. On an L2 it's much cheaper. Blobs will get a bit more expensive, but the direction of travel is cheaper.

**So should I not treat the blockchain as a database, or can I?**

I think you can, yes. If you wanted to make Uber onchain you'd have a very hard time, and that's a constant thing we see at hackathons. It's not practical. But there are other places where using it like a database makes sense. It comes down to the application, how sensitive the data is, and how much you're willing to pay to store it. Thanks to L2s, I think the answer is yes again.

## Where does IPFS fit, and do I need an API key? (93:07-95:41)

**On challenge zero, you said the image was still on IPFS. Where does the interaction between the contract and IPFS happen? Do I need an API key to put my image on IPFS?**

You have a manifest, which is a JSON object with the name and the image link, and inside it the image link we use to render. That goes into IPFS and you get a hash. So the image itself isn't stored onchain: the hash is. You go to the chain, get the hash, then use that hash to fetch the content from IPFS.

IPFS is a distributed storage system, and it's content addressable. When an image goes into IPFS it isn't going to the cloud somewhere, it's going to some machine somewhere. So you have to run an IPFS node and pin your images on that node to keep them there. You can upload things to IPFS, but you have no guarantee they'll stay. You usually end up running your own pinner, which is just an IPFS node you add files to.

## Send, transfer, call, and the 2300 gas limit (95:41-99:23)

**On the staking challenge you implemented protection against a re-entrancy attack. I read that the send function is subject to a 2300 gas limit.**

Yes. The best place to look this up is Solidity by Example, which has a good section on sending ether. That 2300 gas you're talking about: if you use `transfer` or `send`, it's locked at that much gas. So if you want some other execution to happen on the other end of the transfer, say you're transferring to a contract that then executes more code, you'll run out of gas.

What you do instead is use `call`. You do `toAddress.call` and send the value in. It's a weird-looking thing, like you're calling a function on the contract when you're just sending money, but that's how you do it if you want to forward along all your gas, for cases where the receiver needs to spend gas on execution.

**So when I use call, should I not implement re-entrancy protection?**

It depends on the application. The re-entrancy issue is different from this one. This is just about how to send. You need re-entrancy protection if someone can re-enter your app and attack it. What we did to mitigate it was store the balance in a variable, zero out the balance, then send the money, so by the time the money reaches them their balance is already zero and they can't re-enter.

So it has nothing to do with whether you're calling send or transfer. It's everything to do with how the code is structured, and whether that structure is vulnerable to re-entrancy.

## Build this yourself

The architecture in this talk is the same one every challenge below uses. Contracts package, frontend package, generated artifacts between them, a local chain, burner wallets, and Debug Contracts for testing assumptions before any UI exists.

The curriculum walks the same path Austin does here:

- [Simple NFT](/challenge/tokenization) is challenge 0, and it exists to calibrate the tooling rather than to teach Solidity.
- [Crowdfunding](/challenge/crowdfunding) is the staking app written live above, from `stake` through the deadline logic, withdrawals, and the edge cases. It was called Decentralized Staking when this talk was recorded.
- [Token Vendor](/challenge/token-vendor) is where the approve pattern and contract-to-contract calls land.
- [Dice Game](/challenge/dice-game) is the attacker contract and predictable randomness.
- [Minimum Viable Exchange](/challenge/dex) is the DEX, and the "am I ready" test.

For the tooling itself, the [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io) cover the hooks, components and configuration. [Build a Working Ethereum App in 8 Minutes](/guides/build-an-ethereum-app-in-8-minutes) is the same architecture at demo speed, and [How to Build an Ethereum dApp with AI](/guides/how-to-build-dapp-ethereum-ai-workflow) covers the workflow with an AI assistant in the loop.
