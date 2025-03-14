import { challenges, events, userChallenges, users } from "./config/schema";
import { ChallengeId, EventType, ReviewAction, UserRole } from "./config/types";

// Using Drizzle's inferred insert types to ensure seed data
// matches database schema requirements
export const seedUsers: (typeof users.$inferInsert)[] = [
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    role: UserRole.USER,
    createdAt: new Date(1679063274534),
    socialTwitter: "pabl0cks",
    socialTelegram: "pabl0cks",
  },
  {
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    role: UserRole.USER,
    createdAt: new Date(1664777161512),
    socialEmail: "ryuufarhan7@gmail.com",
    socialTwitter: "FarhanRyuu",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    role: UserRole.USER,
    createdAt: new Date(1672731143934),
    socialEmail: "gokulkesavan5005@gmail.com",
    socialTwitter: "meta_Goku",
    socialGithub: "kesgokul",
  },
  {
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    role: UserRole.USER,
    createdAt: new Date(1668050419502),
    socialEmail: "afo@wefa.app",
    socialTwitter: "Time_Is_Oba",
    socialGithub: "Oba-One",
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    role: UserRole.USER,
    createdAt: new Date(1679063274534),
    socialTwitter: "rinat_eth",
    socialTelegram: "rinat_eth",
  },
];

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
    id: ChallengeId.STABLECOINS,
    challengeName: "💰 Stablecoins",
    autograding: false,
    description:
      "🪙 Build your own decentralized stablecoin. Let's write a contract that takes collateral and issues MyUSD tokens based on the value of the collateral. What happens when the collateral changes in value? If it is higher, we will be able to borrow more tokens. If it is lower, we will also build a system for liquidating the MyUSD.",
    sortOrder: 5,
    previewImage: "/assets/challenges/stablecoins.svg",
    dependencies: [],
  },
  {
    id: ChallengeId.PREDICTION_MARKETS,
    challengeName: "📈 Prediction Markets",
    autograding: false,
    description:
      "🔮 Build a prediction market where users can create questions about future outcomes for others to bet on. Users can also participate in existing markets to speculate on event results. 📊 Outcome shares can be traded, with prices adjusting dynamically based on market belief. This is possible because the smart contract acts as an automated market maker (like in the DEX challenge) and adjusts odds based on supply and demand.",
    sortOrder: 6,
    previewImage: "/assets/challenges/predictionMarkets.svg",
    dependencies: [],
  },
  {
    id: ChallengeId.DEPLOY_TO_L2,
    challengeName: "⚡ Deploy to Layer 2",
    autograding: false,
    description:
      "🚀 Ethereum L2s make blockchain apps fast and cheap, bringing us closer to mainstream adoption! Most L2s are EVM compatible, meaning your app should work seamlessly across them with little to no changes—just deploy and go! In this challenge, you will deploy an app across multiple chains, including Optimism, Base, and Arbitrum, and experience the snappy, low-cost transactions while exploring how they make building scalable apps and games easier than ever.",
    sortOrder: 7,
    previewImage: "/assets/challenges/deployToL2.svg",
    dependencies: [],
  },
  {
    id: ChallengeId.STATE_CHANNELS,
    challengeName: "A State Channel Application",
    github: "scaffold-eth/se-2-challenges:challenge-5-state-channels",
    autograding: true,
    description:
      "🛣️ The Ethereum blockchain has great decentralization & security properties but these properties come at a price: transaction throughput is low, and transactions can be expensive. This makes many traditional web applications infeasible on a blockchain... or does it?  State channels look to solve these problems by allowing participants to securely transact off-chain while keeping interaction with Ethereum Mainnet at a minimum.",
    sortOrder: 8,
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
    sortOrder: 9,
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
    sortOrder: 10,
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

export const seedUserChallenges: (typeof userChallenges.$inferInsert)[] = [
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
    frontendUrl: "https://dreary-use.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0x7f918d7b7d0fe0d3a8de3c0570ed4e154c0096e0",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1679063312936),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: ChallengeId.DICE_GAME,
    frontendUrl: "https://aggressive-party.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0xd08b984c3ee4a880112d81de5a4a074c857b7f2f",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1679359244796),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: ChallengeId.DECENTRALIZED_STAKING,
    frontendUrl: "https://chunky-beam.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0xbF35fC995A2Cc4F1508B5F769922623dE7f220d6",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1679185806311),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: ChallengeId.TOKEN_VENDOR,
    frontendUrl: "https://nonstop-fiction.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0x57D312c3E4bF22F22d6A900Be8B38b5546b47C3f",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1679317471852),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
    frontendUrl: "http://simple-nft-ryuufarhan.surge.sh/",
    contractUrl: "https://goerli.etherscan.io/address/0x861346d67b728949bcb69595638a78723a2adae3",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1664778633262),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
    frontendUrl: "http://clumsy-week.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xe3DF14f1482074916A8Aeb40d84898C879b2B5f6",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1672831270556),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: ChallengeId.STATE_CHANNELS,
    frontendUrl: "https://pumped-parcel.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0x71F80197032c9a07b966D3f8eCAFE601Af244F35",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1673150820763),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: ChallengeId.DICE_GAME,
    frontendUrl: "https://busy-pizzas.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xEd2aF24B1a657000C9b4509BC91FCfA5E76D3d33",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1672974794575),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: ChallengeId.DECENTRALIZED_STAKING,
    frontendUrl: "https://tasteful-plough.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xf3384118b56827271979A879e2d5A4d28569eb48",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1672830084301),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: ChallengeId.MINIMUM_VIABLE_EXCHANGE,
    frontendUrl: "https://sour-snake.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0x0752d3847601b506cBFB10330172821B495e6bB0",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1673006384070),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: ChallengeId.TOKEN_VENDOR,
    frontendUrl: "https://speedrunethereum.com/challenge/token-vendor",
    contractUrl: "https://goerli.etherscan.io/address/0x9626C68Dd8d000BBB7B06f0782266976dEB91c35",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1672819901984),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
    frontendUrl: "https://kind-fifth.surge.sh/",
    contractUrl: "https://goerli.etherscan.io/address/0xb9487f8d9E336a9468fcbb50dAF39587D0EBCA63",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1668196973527),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    challengeId: ChallengeId.DECENTRALIZED_STAKING,
    frontendUrl: "https://stupid-beginner.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xd68edd04EbB81c6f187A526F3656C18dD0258cd8",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1668830120864),
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    challengeId: ChallengeId.TOKEN_VENDOR,
    frontendUrl: "https://sepolia-optimism.etherscan.io/address/0xad5e878a62D5B77277aCDC321614a9727815B4C8#code",
    contractUrl: "https://sepolia-optimism.etherscan.io/address/0xad5e878a62D5B77277aCDC321614a9727815B4C8#code",
    submittedAt: new Date(1736441361988),
    reviewComment:
      "<p>You have successfully passed challenge 2!</p><p>You have passed the first three challenges on SpeedRunEthereum and can now join the BuidlGuidl!</p>",
    reviewAction: ReviewAction.REJECTED,
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
    frontendUrl: "https://sepolia-optimism.etherscan.io/address/0x82b4935ebe7a5d802cf465a3495da1aff96f1153#code",
    contractUrl: "https://sepolia-optimism.etherscan.io/address/0x82b4935ebe7a5d802cf465a3495da1aff96f1153#code",
    submittedAt: new Date(1736437841322),
    reviewComment: "<p>You passed all tests on Challenge 0, keep it up!</p>",
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    challengeId: ChallengeId.DECENTRALIZED_STAKING,
    frontendUrl: "https://sepolia-optimism.etherscan.io/address/0x75CCfC494667c91F4926213A04619f93812885b2#code",
    contractUrl: "https://sepolia-optimism.etherscan.io/address/0x75CCfC494667c91F4926213A04619f93812885b2#code",
    submittedAt: new Date(1736440199150),
    reviewComment: "<p>You passed all tests on Challenge 1, keep it up!</p>",
    reviewAction: ReviewAction.SUBMITTED,
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    challengeId: ChallengeId.DICE_GAME,
    frontendUrl: "https://sepolia-optimism.etherscan.io/address/0xB30b4D0AD811De445656FA49d3CbfD26f24Fa20f#code",
    contractUrl: "https://sepolia-optimism.etherscan.io/address/0xB30b4D0AD811De445656FA49d3CbfD26f24Fa20f#code",
    submittedAt: new Date(1736455465938),
    reviewComment:
      "<p>This looks good! Demo site and contract code are solid and the dice only roll when it's a winner!</p>",
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    challengeId: ChallengeId.MINIMUM_VIABLE_EXCHANGE,
    frontendUrl: "https://sepolia-optimism.etherscan.io/address/0xFD893C93f44fdCd16D4673072D2a071578e6C7Ee#code",
    contractUrl: "https://sepolia-optimism.etherscan.io/address/0xFD893C93f44fdCd16D4673072D2a071578e6C7Ee#code",
    submittedAt: new Date(1736523426599),
    reviewComment: "<p>You have successfully passed the Dex Challenge! Great work!</p>",
    reviewAction: ReviewAction.ACCEPTED,
  },
  {
    userAddress: "0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1",
    challengeId: ChallengeId.STATE_CHANNELS,
    frontendUrl: "https://sepolia-optimism.etherscan.io/address/0x1BC437381EC1A36Eb30A0F3AfEFF1Fd5E0078256#code",
    contractUrl: "https://sepolia-optimism.etherscan.io/address/0x1BC437381EC1A36Eb30A0F3AfEFF1Fd5E0078256#code",
    submittedAt: new Date(1736524737219),
    reviewComment: "<p>You have successfully passed the State Channel Challenge! Great work!</p>",
    reviewAction: ReviewAction.ACCEPTED,
  },
];

export const seedEvents: (typeof events.$inferInsert)[] = [
  {
    eventType: EventType.CHALLENGE_SUBMIT,
    eventAt: new Date(1679063312936),
    signature:
      "0x7a808ee181d8655f38c48e0154903bea229b91e32f6062f6c23ad9da5fa25c3008238b07e367e7904200015157a43378b39244140c43ea35e5eea11c055a170500",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
      contractUrl: "https://sepolia.etherscan.io/address/0x7f918d7b7d0fe0d3a8de3c0570ed4e154c0096e0",
      frontendUrl: "https://dreary-use.surge.sh/",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1679063320289),
    signature:
      "0x7a808ee181d8655f38c48e0154903bea229b91e32f6062f6c23ad9da5fa25c3008238b07e367e7904200015157a43378b39244140c43ea35e5eea11c055a170500",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, nice work",
    },
  },
  {
    eventType: EventType.USER_CREATE,
    eventAt: new Date(1679063274533),
    signature:
      "0xe6d747b3e4760aa9ceb15ae8274366ab010d057136782bdf77ea755c9f148fc85046b2ed24bcd6a39720e6e62db5cfc52b476099126ef6d90985115d494b606a01",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    },
  },
  {
    eventType: EventType.CHALLENGE_SUBMIT,
    eventAt: new Date(1672974794575),
    signature:
      "0x4eca15955283c15c1f9565945c34638c9943a313a79301d73178b814e82e3e183e3d89aebdafa10a1012912cb820950fb6eea6ba76e58bf875f226bdc8257dc700",
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    payload: {
      challengeId: ChallengeId.DICE_GAME,
      contractUrl: "https://goerli.etherscan.io/address/0xEd2aF24B1a657000C9b4509BC91FCfA5E76D3d33",
      frontendUrl: "https://busy-pizzas.surge.sh",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1679185806311),
    signature:
      "0x78e60403c8f0d5e8094de16f059d169e8e3a92e3a2df940589f2ce9c2b556d5d0dc0230c421df265fa8975f6175d0a7881a58e0e51b31107c6de1ee4a55a9eb601",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: ChallengeId.DECENTRALIZED_STAKING,
      contractUrl: "https://sepolia.etherscan.io/address/0xbF35fC995A2Cc4F1508B5F769922623dE7f220d6",
      deployedUrl: "https://chunky-beam.surge.sh/",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1679185814845),
    signature:
      "0x78e60403c8f0d5e8094de16f059d169e8e3a92e3a2df940589f2ce9c2b556d5d0dc0230c421df265fa8975f6175d0a7881a58e0e51b31107c6de1ee4a55a9eb601",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: ChallengeId.DECENTRALIZED_STAKING,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, it's working great",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1679317478533),
    signature:
      "0x4e681d003b6310a604944bd334966cd10348b283d1797db0f93b6ce55f9c02d149b53e59a331362b7f6468528fe4dfee1cd8d923199fc9949ac8386ec633213a01",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: ChallengeId.TOKEN_VENDOR,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, it's working great",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1679359253588),
    signature:
      "0x4eca15955283c15c1f9565945c34638c9943a313a79301d73178b814e82e3e183e3d89aebdafa10a1012912cb820950fb6eea6ba76e58bf875f226bdc8257dc700",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: ChallengeId.DICE_GAME,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, it's working great",
    },
  },
  {
    eventType: EventType.USER_CREATE,
    eventAt: new Date(1664777161511),
    signature:
      "0x8d319d59ce02619610376d6ebb2aae2581935d4176ec3ba2228d2b2cab720d260b4d4499f0000ec63d029df5271c10c92ccd68333ddedf506878511f79dd7fad1b",
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    payload: {
      userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1664778651266),
    signature:
      "0xc6d7cd95c4baf16851aec5817b08a07ca52f1682f37548c57173d3432df734d17d4e6d810ce55f151dcc5272ae07991305b8d40b0863b4308d5bd74788b645471c",
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    payload: {
      autograding: true,
      challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, nice work",
    },
  },
  {
    eventType: EventType.USER_CREATE,
    eventAt: new Date(1668050419499),
    signature:
      "0x760bf0c7f94d6fdce07a72d07274e36a258ffe1c4386201b8d34ba7e14882c0432fbedfb77259cbf42599b9939db4fe4ba5a73a4deffef10aa99b757f6f5957e1c",
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    payload: {
      userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1668196991801),
    signature:
      "0x03699f6b44e96814d5bac9e4a8a53195216af7b3d4eb44a76206e75ccb7869594755cf526826153335a00e0b140ec3f498db454681bd34d245d801f065b4ccf91c",
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    payload: {
      autograding: true,
      challengeId: ChallengeId.SIMPLE_NFT_EXAMPLE,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, nice work",
    },
  },
  {
    eventType: EventType.CHALLENGE_AUTOGRADE,
    eventAt: new Date(1668830138768),
    signature:
      "0x40a5005851b26a87a1ed130da6b1eedcf938dda15703f6d7155db088f91cca42496cd84d53e949d0ecb89ed3ed82db3bae9705c6a91b9198693c646690d9dea01c",
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    payload: {
      autograding: true,
      challengeId: ChallengeId.DECENTRALIZED_STAKING,
      reviewAction: ReviewAction.ACCEPTED,
      reviewMessage: "Dummy review, it's working great",
    },
  },
];
