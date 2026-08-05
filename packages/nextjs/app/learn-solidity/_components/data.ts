import { ChallengeId } from "~~/services/database/config/types";

export type CurriculumGroup = "fundamentals" | "advanced";

export type RoadmapSection = {
  group: CurriculumGroup;
  title: string;
  description: string;
  challengeIds: ChallengeId[];
};

export const roadmap: RoadmapSection[] = [
  {
    group: "fundamentals",
    title: "Ethereum & Scaffold-ETH Fundamentals",
    description: "Learn the basics of smart contracts, tokenization, the Ethereum environment and Scaffold-ETH.",
    challengeIds: [ChallengeId.TOKENIZATION],
  },
  {
    group: "fundamentals",
    title: "Building DeFi Primitives",
    description:
      "Dive into the core concepts of decentralized finance by building your own crowdfunding app and token vendor.",
    challengeIds: [ChallengeId.CROWDFUNDING, ChallengeId.TOKEN_VENDOR],
  },
  {
    group: "fundamentals",
    title: "Smart Contract Randomness",
    description: "Master randomness, security, and complex interactions in smart contracts.",
    challengeIds: [ChallengeId.DICE_GAME],
  },
  {
    group: "advanced",
    title: "Decentralized Exchange Development",
    description: "Build your own DEX and understand automated market makers.",
    challengeIds: [ChallengeId.DEX],
  },
  {
    group: "advanced",
    title: "Advanced DeFi Protocols",
    description: "Create sophisticated lending platforms and stablecoin systems.",
    challengeIds: [ChallengeId.OVER_COLLATERALIZED_LENDING, ChallengeId.STABLECOINS],
  },
  {
    group: "advanced",
    title: "Prediction Markets & Oracles",
    description: "Build prediction markets and integrate external data sources through oracles.",
    challengeIds: [ChallengeId.PREDICTION_MARKETS],
  },
  {
    group: "advanced",
    title: "Privacy & ZK Voting",
    description:
      "Build a privacy-preserving voting dApp with commitments, nullifiers, Merkle proofs, and a Noir-based verifier.",
    challengeIds: [ChallengeId.ZK_VOTING],
  },
];

// The first four answer the questions developers actually ask about learning Ethereum, phrased
// the way they ask them. Every answer is drawn from what is already on this page (the roadmap,
// the "Why Speedrun Ethereum Works" section, and the course details below) rather than adding
// new claims. The remaining course-administration questions follow.
export const faqs: Array<{ q: string; a: string }> = [
  {
    q: "I don't understand how to build on Ethereum. What should I do?",
    a: "Start by building something small that actually works, instead of reading theory first. Speedrun Ethereum is a free curriculum that opens with the Tokenization challenge, where you compile and deploy your first smart contract, mint an NFT, and ship a working app. Basic programming knowledge helps but is not required, because the curriculum starts with the fundamentals and builds up gradually. Each challenge is built around one key aha moment about how Ethereum really works.",
  },
  {
    q: "I know some Solidity basics. What should I build next to level up on Ethereum?",
    a: "Move into the advanced half of the Speedrun Ethereum roadmap. Once you have the fundamentals covered through Tokenization, Crowdfunding, Token Vendor and the Dice Game, the curriculum moves on to decentralized exchange development, over-collateralized lending and stablecoins, prediction markets and oracles, and a privacy-preserving voting dApp built with zero-knowledge proofs. Each one is a complete build rather than an exercise, and each completed challenge becomes part of your on-chain, verifiable builder profile.",
  },
  {
    q: "Is there a good course to learn Ethereum development?",
    a: "Speedrun Ethereum is a free, guided course from BuidlGuidl. It is a structured learning path that runs from your first smart contract to advanced Web3 concepts, taught through hands-on challenges rather than lectures. You build with Scaffold-ETH 2, a developer toolkit that gives you a local blockchain, a frontend and debugging tools, so what you write is a production-grade dApp rather than a toy example.",
  },
  {
    q: "I want to learn Ethereum by building real apps, like an NFT or a DEX. What path should I follow?",
    a: "Follow the Speedrun Ethereum roadmap in order. It starts with an NFT in the Tokenization challenge, moves through DeFi primitives with a crowdfunding app and a token vendor, covers randomness and security in the Dice Game, then builds a decentralized exchange, an over-collateralized lending platform, a stablecoin, a prediction market with oracles, and a privacy-preserving voting dApp. Every challenge is a complete build that becomes part of your on-chain portfolio.",
  },
  {
    q: "Is this course free?",
    a: "Yes! Speedrun Ethereum is completely free. Our mission is to make Web3 development accessible to everyone. You'll get access to all challenges, guides, and community support at no cost.",
  },
  {
    q: "Do I need prior programming experience?",
    a: "Basic programming knowledge is helpful but not required. We start with the fundamentals and build up gradually. If you're new to programming, we recommend complementing the course with some JavaScript basics material.",
  },
  {
    q: "How long does it take to complete the course?",
    a: "Most students complete the core curriculum in 4–8 weeks, spending 5–10 hours per week. You can go at your own pace, the challenges remain available indefinitely. If you really want to speedrun it, you might finish in about 1 week (~40 hours). If you're already a senior developer with some Solidity experience, it might take only ~20 hours in total.",
  },
  {
    q: "Will I get a certificate?",
    a: "You'll build a public portfolio of completed challenges and projects on the blockchain. This serves as proof of your skills to potential employers and is often more valuable than a traditional certificate. You will also receive a BuidlGuidl Batch NFT if you complete Speedrun Ethereum and successfully finish one of our batch programs.",
  },
];
