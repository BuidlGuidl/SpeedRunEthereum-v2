import { challenges } from "./config/schema";
import { ChallengeId } from "./config/types";

// Using Drizzle's inferred insert types to ensure seed data
// matches database schema requirements
export const seedChallenges: (typeof challenges.$inferInsert)[] = [
  {
    id: ChallengeId.SIMPLE_NFT_EXAMPLE,
    challengeName: "Simple NFT Example",
    github: "scaffold-eth/se-2-challenges:challenge-0-simple-nft",
    autograding: true,
    description:
      "🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use 👷‍♀️ HardHat to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀",
    sortOrder: 0,
    previewImage: "/assets/challenges/simpleNFT.svg",
    dependencies: [],
  },
  {
    id: ChallengeId.DECENTRALIZED_STAKING,
    challengeName: "Decentralized Staking App",
    github: "scaffold-eth/se-2-challenges:challenge-1-decentralized-staking",
    autograding: true,
    description:
      "🦸 A superpower of Ethereum is allowing you, the builder, to create a simple set of rules that an adversarial group of players can use to work together. In this challenge, you create a decentralized application where users can coordinate a group funding effort. The users only have to trust the code.",
    sortOrder: 1,
    previewImage: "/assets/challenges/stakingToken.svg",
    dependencies: [],
  },
  {
    id: ChallengeId.TOKEN_VENDOR,
    challengeName: "Token Vendor",
    github: "scaffold-eth/se-2-challenges:challenge-2-token-vendor",
    autograding: true,
    description:
      '🤖 Smart contracts are kind of like "always on" vending machines that anyone can access. Let\'s make a decentralized, digital currency (an ERC20 token). Then, let\'s build an unstoppable vending machine that will buy and sell the currency. We\'ll learn about the "approve" pattern for ERC20s and how contract to contract interactions work.',
    sortOrder: 2,
    previewImage: "/assets/challenges/tokenVendor.svg",
    dependencies: [],
    icon: "/assets/key_icon.svg",
  },
  {
    id: ChallengeId.DICE_GAME,
    challengeName: "Dice Game",
    github: "scaffold-eth/se-2-challenges:challenge-3-dice-game",
    autograding: true,
    description:
      "🎰 Randomness is tricky on a public deterministic blockchain. The block hash is the result proof-of-work (for now) and some builders use this as a weak form of randomness.  In this challenge you will take advantage of a Dice Game contract by predicting the randomness in order to only roll winning dice!",
    sortOrder: 3,
    previewImage: "/assets/challenges/diceGame.svg",
    dependencies: [ChallengeId.SIMPLE_NFT_EXAMPLE, ChallengeId.DECENTRALIZED_STAKING, ChallengeId.TOKEN_VENDOR],
  },
  {
    id: ChallengeId.MINIMUM_VIABLE_EXCHANGE,
    challengeName: "Build a DEX",
    github: "scaffold-eth/se-2-challenges:challenge-4-dex",
    autograding: true,
    description:
      "💵 Build an exchange that swaps ETH to tokens and tokens to ETH. 💰 This is possible because the smart contract holds reserves of both assets and has a price function based on the ratio of the reserves. Liquidity providers are issued a token that represents their share of the reserves and fees...",
    sortOrder: 4,
    previewImage: "/assets/challenges/dex.svg",
    dependencies: [
      ChallengeId.SIMPLE_NFT_EXAMPLE,
      ChallengeId.DECENTRALIZED_STAKING,
      ChallengeId.TOKEN_VENDOR,
      ChallengeId.DICE_GAME,
    ],
  },
  {
    id: ChallengeId.STATE_CHANNELS,
    challengeName: "A State Channel Application",
    github: "scaffold-eth/se-2-challenges:challenge-5-state-channels",
    autograding: true,
    description:
      "🛣️ The Ethereum blockchain has great decentralization & security properties but these properties come at a price: transaction throughput is low, and transactions can be expensive. This makes many traditional web applications infeasible on a blockchain... or does it?  State channels look to solve these problems by allowing participants to securely transact off-chain while keeping interaction with Ethereum Mainnet at a minimum.",
    sortOrder: 5,
    previewImage: "/assets/challenges/state.svg",
    dependencies: [
      ChallengeId.SIMPLE_NFT_EXAMPLE,
      ChallengeId.DECENTRALIZED_STAKING,
      ChallengeId.TOKEN_VENDOR,
      ChallengeId.DICE_GAME,
    ],
  },
  {
    id: ChallengeId.MULTISIG,
    challengeName: "Multisig Wallet",
    github: "scaffold-eth/se-2-challenges:challenge-6-multisig",
    autograding: false,
    description:
      '👩‍👩‍👧‍👧 Using a smart contract as a wallet we can secure assets by requiring multiple accounts to "vote" on transactions. The contract will keep track of transactions in an array of structs and owners will confirm or reject each one. Any transaction with enough confirmations can "execute".',
    sortOrder: 6,
    previewImage: "/assets/challenges/multiSig.svg",
    dependencies: [
      ChallengeId.SIMPLE_NFT_EXAMPLE,
      ChallengeId.DECENTRALIZED_STAKING,
      ChallengeId.TOKEN_VENDOR,
      ChallengeId.DICE_GAME,
    ],
    externalLink: {
      link: "https://t.me/+zKllN8OlGuxmYzFh",
      claim: "Join the 👛 Multisig Build cohort",
    },
  },
  {
    id: ChallengeId.SVG_NFT,
    challengeName: "SVG NFT",
    github: "scaffold-eth/se-2-challenges:challenge-7-svg-nft",
    autograding: false,
    description:
      "🎨 Create a dynamic SVG NFT using a smart contract. Your contract will generate on-chain SVG images and allow users to mint their unique NFTs. ✨ Customize your SVG graphics and metadata directly within the smart contract. 🚀 Share the minting URL once your project is live!",
    sortOrder: 7,
    previewImage: "/assets/challenges/dynamicSvgNFT.svg",
    dependencies: [
      ChallengeId.SIMPLE_NFT_EXAMPLE,
      ChallengeId.DECENTRALIZED_STAKING,
      ChallengeId.TOKEN_VENDOR,
      ChallengeId.DICE_GAME,
    ],
    externalLink: {
      link: "https://t.me/+mUeITJ5u7Ig0ZWJh",
      claim: "Join the 🎁 SVG NFT 🎫 Building Cohort",
    },
  },
];