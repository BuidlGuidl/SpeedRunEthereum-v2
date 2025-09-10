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
    description: "Learn the basics of smart contracts, NFTs, and the Ethereum environment.",
    challengeIds: [ChallengeId.SIMPLE_NFT_EXAMPLE],
  },
  {
    group: "fundamentals",
    title: "Building DeFi Primitives",
    description:
      "Dive into the core concepts of decentralized finance by building your own staking app and token vendor.",
    challengeIds: [ChallengeId.DECENTRALIZED_STAKING, ChallengeId.TOKEN_VENDOR],
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
];

export const faqs: Array<{ q: string; a: string }> = [
  {
    q: "Is this course free?",
    a: "Yes! SpeedRunEthereum is completely free. Our mission is to make Web3 development accessible to everyone. You'll get access to all challenges, guides, and community support at no cost.",
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
    q: "What tools do I need?",
    a: "You'll use Scaffold-ETH 2, which provides everything you need: a local blockchain, frontend, and debugging tools. We'll guide you through the setup in Challenge #0.",
  },
  {
    q: "Will I get a certificate?",
    a: "You'll build a public portfolio of completed challenges and projects on the blockchain. This serves as proof of your skills to potential employers and is often more valuable than a traditional certificate. You will also receive a BuidlGuidl Batch NFT if you complete SpeedRunEthereum and successfully finish one of our batch programs.",
  },
];
