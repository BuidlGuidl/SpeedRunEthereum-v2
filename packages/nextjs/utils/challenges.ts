import { ChallengeId, ReviewAction } from "~~/services/database/config/types";

export const REVIEW_ACTION_BADGE_CLASSES: Record<ReviewAction, string> = {
  [ReviewAction.ACCEPTED]: "badge-success",
  [ReviewAction.REJECTED]: "badge-error dark:bg-[#6E2A2A] dark:text-gray-200",
  [ReviewAction.SUBMITTED]: "badge-warning",
} as const;

export const CHALLENGE_METADATA: Record<
  string,
  {
    title: string;
    description: string;
    guides?: { title: string; url: string }[];
  }
> = {
  [ChallengeId.SIMPLE_NFT_EXAMPLE]: {
    title: "Learn How to Create an NFT in Solidity",
    description:
      "Build your first NFT smart contract in Solidity. Step-by-step tutorial to mint and deploy NFTs on Ethereum using Scaffold-ETH.",
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
  },
  [ChallengeId.MINIMUM_VIABLE_EXCHANGE]: {
    title: "How to Build a Decentralized Exchange (DEX) in Solidity",
    description:
      "Step-by-step tutorial to build your own DEX with liquidity pools, token swapping, and automated market making in Solidity.",
    guides: [
      {
        title: "Flash Loan Exploits: A Developer's Guide to Securing Your DEX",
        url: "/guides/flash-loan-exploits",
      },
      {
        title: "Impermanent Loss Explained: The Math Behind DeFi's Hidden Risk",
        url: "/guides/impermanent-loss-math-explained",
      },
    ],
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
  [ChallengeId.STABLECOINS]: {
    title: "Build a Stablecoin in Solidity",
    description:
      "Learn how to create a stablecoin using Solidity smart contracts on Ethereum. Understand stability mechanisms and price oracles.",
  },
  [ChallengeId.PREDICTION_MARKETS]: {
    title: "Create a Prediction Market in Solidity",
    description:
      "Learn to build decentralized prediction markets using Solidity. Understand market creation, betting mechanics, and outcome resolution.",
  },
  [ChallengeId.DEPLOY_TO_L2]: {
    title: "Deploy Solidity Smart Contracts to Layer 2",
    description:
      "Learn how to deploy and interact with Solidity smart contracts on Ethereum Layer 2 solutions for better scalability and lower gas costs.",
  },
};
