import { ChallengeId, ReviewAction } from "~~/services/database/config/types";

export const REVIEW_ACTION_BADGE_CLASSES: Record<ReviewAction, string> = {
  [ReviewAction.ACCEPTED]: "badge-success",
  [ReviewAction.REJECTED]: "badge-error dark:bg-[#6E2A2A] dark:text-gray-200",
  [ReviewAction.SUBMITTED]: "badge-warning",
} as const;

export const SKILL_LEVELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
} as const;

export type SkillLevel = (typeof SKILL_LEVELS)[keyof typeof SKILL_LEVELS];

type ChallengeStaticMetadata = {
  title: string;
  description: string;
  guides?: { title: string; url: string }[];
  skills?: string[];
  skillLevel?: SkillLevel;
  timeToComplete?: string;
  helpfulLinks?: { text: string; url: string }[];
};

export const CHALLENGE_METADATA: Record<string, ChallengeStaticMetadata> = {
  [ChallengeId.TOKENIZATION]: {
    title: "Learn How to Create an NFT in Solidity",
    description:
      "Build your first NFT smart contract in Solidity. Step-by-step tutorial to mint and deploy NFTs on Ethereum using Scaffold-ETH.",
    skills: [
      "Compile and deploy your first **smart contract**",
      "Use burner wallets, faucets and gas on localhost",
      "Mint and transfer NFTs; Understand **ownership** in the Ethereum context",
      "Deploy to Sepolia and ship a Next.js app",
    ],
    skillLevel: SKILL_LEVELS.BEGINNER,
    timeToComplete: "1 - 4 hours",
    helpfulLinks: [
      { text: "Blockchain Basics", url: "https://www.youtube.com/watch?v=MlJPjJQZtC8" },
      { text: "Web2 to Web3 Series", url: "https://www.youtube.com/playlist?list=PLJz1HruEnenAf80uOfDwBPqaliJkjKg69" },
    ],
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
  [ChallengeId.CROWDFUNDING]: {
    title: "Build a Crowdfunding Application in Solidity",
    description:
      "Learn to build a crowdfunding application with Solidity. Step-by-step tutorial to help adversarial parties to work together to fund a project using Solidity smart contracts on Ethereum.",
    skills: [
      "Design and implement a decentralized application (dApp) with a state machine",
      "Handle and send ETH in a smart contract using **payable** functions",
      "Interact with external smart contracts",
      "Use **events** to track and display onchain activity on the frontend",
    ],
    skillLevel: SKILL_LEVELS.BEGINNER,
    timeToComplete: "3 - 8 hours",
    helpfulLinks: [
      {
        text: "Previous Challenge",
        url: "/challenge/tokenization",
      },
      {
        text: "Solidity by Example",
        url: "https://solidity-by-example.org/",
      },
    ],
    guides: [
      {
        title: "Solidity Contract-to-Contract Interactions Guide",
        url: "/guides/solidity-contract-to-contract-interactions",
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
    skillLevel: SKILL_LEVELS.BEGINNER,
    timeToComplete: "3 - 8 hours",
    helpfulLinks: [
      {
        text: "Previous Challenge",
        url: "/challenge/crowdfunding",
      },
      {
        text: "ERC20 Token Standard",
        url: "https://ethereum.org/developers/docs/standards/tokens/erc-20/",
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
    title: "Exploit a Vulnerable Dice Game in Solidity",
    description:
      "Learn blockchain security by building an attack contract that exploits randomness vulnerabilities in a Solidity dice game. Hands-on security tutorial for developers.",
    skills: [
      "Understand why randomness is tricky on the blockchain",
      "Learn how to analyze a smart contract to **identify a vulnerability**",
      "Create an **attacking contract** to exploit a vulnerability in another contract",
    ],
    skillLevel: SKILL_LEVELS.BEGINNER,
    timeToComplete: "2 - 6 hours",
    helpfulLinks: [{ text: "Randomness in Solidity", url: "/guides/blockchain-randomness-solidity" }],
    guides: [
      {
        title: "Commit-Reveal Scheme in Solidity",
        url: "/guides/commit-reveal-scheme",
      },
      {
        title: "Chainlink VRF Implementation: Provably Fair Randomness for Smart Contracts",
        url: "/guides/chainlink-vrf-solidity-games",
      },
      {
        title: "Secure Randomness in Solidity: Beyond Block Variables",
        url: "/guides/blockchain-randomness-solidity",
      },
      {
        title: "Blockchain Game Security: Vulnerability Defense Tutorial",
        url: "/guides/blockchain-games-vulnerabilities",
      },
    ],
  },
  [ChallengeId.DEX]: {
    title: "How to Build a Decentralized Exchange (DEX) in Solidity",
    description:
      "Step-by-step tutorial to build your own DEX with liquidity pools, token swapping, and automated market making in Solidity.",
    skills: [
      "Build and understand an **Automated Market Maker (AMM)**",
      "Learn about **liquidity pools** and **impermanent loss**",
      "Design and build functions for **swapping tokens** and providing/withdrawing liquidity",
    ],
    skillLevel: SKILL_LEVELS.INTERMEDIATE,
    timeToComplete: "3 - 10 hours",
    helpfulLinks: [
      { text: "Video Overview", url: "https://www.youtube.com/watch?v=eP5w6Ger1EQ" },
      {
        text: "Original Tutorial",
        url: "https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90",
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
    skillLevel: SKILL_LEVELS.INTERMEDIATE,
    timeToComplete: "4 - 10 hours",
    helpfulLinks: [
      { text: "DeFiSaver (simulation)", url: "https://app.defisaver.com/aave" },
      { text: "Flash Loan Exploits", url: "/guides/flash-loan-exploits" },
    ],
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
    skillLevel: SKILL_LEVELS.ADVANCED,
    timeToComplete: "4 - 12 hours",
    helpfulLinks: [
      {
        text: "RAI Overview",
        url: "https://ameensol.medium.com/a-money-god-raises-rai-is-live-on-ethereum-mainnet-f9aff2b1d331",
      },
      {
        text: "LUSD Documentation",
        url: "https://docs.liquity.org/liquity-v1/faq/borrowing",
      },
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
    skillLevel: SKILL_LEVELS.ADVANCED,
    timeToComplete: "4 - 12 hours",
    helpfulLinks: [
      {
        text: "Terminology",
        url: "https://projects.iq.harvard.edu/files/yiling/files/ec-tutorial-prediction-markets-2007-1.pdf",
      },
      { text: "Polymarket", url: "https://polymarket.com/" },
    ],
  },
  [ChallengeId.ZK_VOTING]: {
    title: "Build a Privacy-Preserving ZK Voting dApp",
    description:
      "Learn how to build a privacy-preserving ZK voting dApp where members vote anonymously using zero-knowledge proofs, Merkle trees, and nullifier hashes to prevent double voting.",
    skills: [
      "Design a **commitment + nullifier** scheme to enforce one-person-one-vote",
      "Register voters in a **Lean Incremental Merkle Tree (LeanIMT)** and prove membership",
      "Write Noir **ZK circuits** and generate a **Solidity verifier** with Barretenberg",
      "Wire proofs to the contract and submit votes from a **burner wallet** to avoid linkage",
    ],
    skillLevel: SKILL_LEVELS.ADVANCED,
    timeToComplete: "6 - 16 hours",
    helpfulLinks: [
      { text: "Noir Docs (Getting Started)", url: "https://noir-lang.org/docs/getting_started/quick_start" },
      {
        text: "Vitalik: Blockchain Voting (limits & MACI context)",
        url: "https://vitalik.eth.limo/general/2021/05/25/voting2.html",
      },
    ],
  },
  [ChallengeId.ORACLES]: {
    title: "Build Decentralized Oracle Systems in Solidity",
    description:
      "Learn to build three fundamental oracle architectures: Whitelist, Staking, and Optimistic Oracles. Understand trade-offs between security, decentralization, and efficiency while implementing dispute resolution and economic incentive mechanisms.",
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
