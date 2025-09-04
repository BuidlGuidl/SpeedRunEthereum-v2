import { ChallengeId, ReviewAction, SkillLevel } from "~~/services/database/config/types";

export const REVIEW_ACTION_BADGE_CLASSES: Record<ReviewAction, string> = {
  [ReviewAction.ACCEPTED]: "badge-success",
  [ReviewAction.REJECTED]: "badge-error dark:bg-[#6E2A2A] dark:text-gray-200",
  [ReviewAction.SUBMITTED]: "badge-warning",
} as const;

type ChallengeStaticMetadata = {
  title: string;
  description: string;
  guides?: { title: string; url: string }[];
  skills?: string[];
  skillLevel?: SkillLevel;
  timeToComplete?: string;
  prerequisites?: { text: string; url?: string }[];
};

export const CHALLENGE_METADATA: Record<string, ChallengeStaticMetadata> = {
  [ChallengeId.SIMPLE_NFT_EXAMPLE]: {
    title: "Learn How to Create an NFT in Solidity",
    description:
      "Build your first NFT smart contract in Solidity. Step-by-step tutorial to mint and deploy NFTs on Ethereum using Scaffold-ETH.",
    skills: [
      "Compile and deploy your first **smart contract**",
      "Use burner wallets, faucets and gas on localhost",
      "Mint and transfer NFTs; Understand **ownership** in the Ethereum context",
      "Deploy to Sepolia and ship a Next.js app",
    ],
    skillLevel: SkillLevel.BEGINNER,
    timeToComplete: "30 - 60 minutes",
    prerequisites: [{ text: "Basic web3 concepts", url: "https://www.youtube.com/watch?v=MlJPjJQZtC8" }],
    guides: [
      {
        title: "ERC721 vs. ERC1155: Key Differences, Use Cases & How to Choose",
        url: "/guides/erc721-vs-erc1155",
      },
      {
        title: "Mastering ERC721: Developer Guide to NFT Metadata & Best Practices",
        url: "/guides/mastering-erc721",
      },
      {
        title: "NFTs in Web3: Understanding Use Cases Beyond Digital Art",
        url: "/guides/nft-use-cases",
      },
      {
        title: "Solidity NFT Security: 10 Best Practices to Protect Your Collectibles",
        url: "/guides/solidity-nft-security",
      },
    ],
  },
  [ChallengeId.DECENTRALIZED_STAKING]: {
    title: "Build a Decentralized Staking Application in Solidity",
    description:
      "Learn to build a decentralized staking application with Solidity. Create smart contracts for coordinating group funding on Ethereum.",
    skills: [
      "Design and implement a decentralized application (dApp) with a state machine",
      "Handle and send ETH in a smart contract using **payable** functions",
      "Interact with external smart contracts",
      "Use **events** to track and display onchain activity on the frontend",
    ],
    skillLevel: SkillLevel.BEGINNER,
    timeToComplete: "30 - 60 minutes",
    prerequisites: [
      {
        text: "Previous challenge",
      },
    ],
    guides: [
      {
        title: "Beyond APY: Building Sustainable Tokenomics for Your Staking Protocol",
        url: "/guides/sustainable-tokenomics-staking-protocols",
      },
      {
        title: "Time-Weighted Staking Rewards: Aligning Incentives in DeFi Protocols",
        url: "/guides/time-weighted-staking-rewards",
      },
      {
        title: "Scalable Solidity Staking: O(1) Reward Distribution",
        url: "/guides/scalable-gas-solidity-staking",
      },
      {
        title: "A Developer's Guide to Liquid Staking Tokens (LSTs)",
        url: "/guides/liquid-staking-tokens",
      },
    ],
  },
  [ChallengeId.TOKEN_VENDOR]: {
    title: "Create an ERC20 Token and Vendor Contract in Solidity",
    description:
      "Learn to create your own ERC20 token and build a decentralized vending machine using Solidity smart contracts on Ethereum.",
    skills: [
      "Build a custom token on the **ERC20** standard",
      "Learn how to perform secure contract-to-contract token transfers",
      "Design and build a **token vending machine** that can buy and sell custom tokens",
      "See how to confirm token balances onchain and offchain",
    ],
    skillLevel: SkillLevel.BEGINNER,
    timeToComplete: "30 - 60 minutes",
    prerequisites: [
      {
        text: "Previous challenge",
      },
    ],
    guides: [
      {
        title: "How to Create a ERC20 Token: Complete Solidity Tutorial",
        url: "/guides/how-to-create-erc20",
      },
      {
        title: "Solidity Contract-to-Contract Interactions",
        url: "/guides/solidity-contract-to-contract-interactions",
      },
      {
        title: "ERC20 Approve Pattern: Secure Token Allowances Guide",
        url: "/guides/erc20-approve-pattern",
      },
      {
        title: "Solidity Bonding Curves & Dynamic Token Pricing Explained",
        url: "/guides/solidity-bonding-curves-token-pricing",
      },
      {
        title: "Sustainable ERC20 Supply Models: Tokenomics Best Practices",
        url: "/guides/sustainable-erc20-supply-models",
      },
    ],
  },
  [ChallengeId.DICE_GAME]: {
    title: "Solidity Randomness and Security: Build a Dice Game",
    description:
      "Learn about randomness challenges in blockchain and exploit vulnerabilities in a Solidity dice game. Essential security concepts for blockchain developers.",
    skills: [
      "Understand why randomness is tricky on the blockchain",
      "Learn how to analyze a smart contract to **identify a vulnerability**",
      "Create an **attacking contract** to exploit a vulnerability in another contract",
    ],
    skillLevel: SkillLevel.BEGINNER,
    timeToComplete: "30 - 60 minutes",
    prerequisites: [{ text: "Previous challenge" }],
  },
  [ChallengeId.DEX]: {
    title: "How to Build a Decentralized Exchange (DEX) in Solidity",
    description:
      "Step-by-step tutorial to build your own DEX with liquidity pools, token swapping, and automated market making in Solidity.",
    skills: [
      "Build and understand an **Automated Market Maker (AMM)**",
      "Learn about liquidity pools and impermanent loss",
      "Design and build functions for swapping tokens and providing/withdrawing liquidity",
    ],
    skillLevel: SkillLevel.INTERMEDIATE,
    timeToComplete: "1-3 hours",
    prerequisites: [
      {
        text: "All previous challenges",
      },
      {
        text: "Grit",
      },
    ],
    guides: [
      {
        title: "Automated Market Makers (AMMs): Math, Risks & Solidity Code",
        url: "/guides/automated-market-makers-math",
      },
      {
        title: "Flash Loan Exploits: A Developer's Guide to Securing Your DEX",
        url: "/guides/flash-loan-exploits",
      },
      {
        title: "Impermanent Loss Explained: The Math Behind DeFi's Hidden Risk",
        url: "/guides/impermanent-loss-math-explained",
      },
      {
        title: "Front-Running & MEV Mitigation: A DEX Developer's Guide",
        url: "/guides/front-running-mev-mitigation",
      },
    ],
  },
  [ChallengeId.OVER_COLLATERALIZED_LENDING]: {
    title: "Build an Over-Collateralized Lending Platform in Solidity",
    description:
      "Learn how to create an over-collateralized lending platform using Solidity smart contracts on Ethereum.",
    skills: [
      "Understand how over-collateralized lending works",
      "Build a **money market** protocol for borrowing assets",
      "Develop a **liquidation mechanism** to maintain the protocol's solvency",
      "Create and execute **flash loans**, a unique on-chain financial primitive",
    ],
    skillLevel: SkillLevel.INTERMEDIATE,
    timeToComplete: "2-4 hours",
    prerequisites: [{ text: "All previous challenges" }, { text: "Determination" }],
  },
  [ChallengeId.STABLECOINS]: {
    title: "Build a Stablecoin in Solidity",
    description:
      "Learn how to create a stablecoin using Solidity smart contracts on Ethereum. Understand stability mechanisms and price oracles.",
    skills: [
      "Understand how collateralization levels and liquidations work together in an **algorithmic stablecoin** system",
      "Build the main engine that helps to provide **incentives** for maintaining a stablecoin's peg",
      "Learn how to manage supply and demand using dynamic interest rates",
      "Implement a **share-based system** for efficient interest calculation",
    ],
    skillLevel: SkillLevel.ADVANCED,
    timeToComplete: "2-4 hours",
    prerequisites: [
      { text: "Over-Collateralized Lending", url: "/challenge/over-collateralized-lending" },
      { text: "Fervor" },
    ],
  },
  [ChallengeId.PREDICTION_MARKETS]: {
    title: "Create a Prediction Market in Solidity",
    description:
      "Learn to build decentralized prediction markets using Solidity. Understand market creation, betting mechanics, and outcome resolution.",
    skills: [
      "Design and build a complete onchain **prediction market** from creation to settlement",
      "Implement a simple **oracle** to report real-world event outcomes on-chain",
      "Use **ERC20 tokens** to represent shares in probabilistic outcomes",
      "Develop a pricing mechanism where token prices reflect the **implied probability** of an event",
    ],
    skillLevel: SkillLevel.ADVANCED,
    timeToComplete: "2-4 hours",
    prerequisites: [{ text: "All previous challenges" }, { text: "Endurance" }],
  },
  [ChallengeId.DEPLOY_TO_L2]: {
    title: "Deploy Solidity Smart Contracts to Layer 2",
    description:
      "Learn how to deploy and interact with Solidity smart contracts on Ethereum Layer 2 solutions for better scalability and lower gas costs.",
  },
  [ChallengeId.MULTISIG]: {
    title: "Build a Multisignature Wallet in Solidity",
    description:
      "Learn to build a multisignature wallet in Solidity that requires multiple approvals for transactions. Essential security pattern for Ethereum developers.",
  },
  [ChallengeId.SVG_NFT]: {
    title: "Create On-Chain SVG NFTs with Solidity",
    description:
      "Learn to generate on-chain SVG graphics and create fully on-chain NFTs using Solidity smart contracts. Advanced NFT development tutorial.",
  },
};
