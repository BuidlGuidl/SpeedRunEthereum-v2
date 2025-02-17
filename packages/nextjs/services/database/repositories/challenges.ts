const fakeChallenges = [
  {
    id: "simple-nft",
    github: "scaffold-eth/se-2-challenges:challenge-0-simple-nft",
    label: "🚩 Challenge 0: 🎟 Simple NFT Example",
    disabled: false,
    description:
      "🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use 👷‍♀️ HardHat to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀",
    previewImage: "/assets/challenges/simpleNFT.svg",
    dependencies: [],
    sortOrder: 0,
  },
  {
    id: "decentralized-staking",
    github: "scaffold-eth/se-2-challenges:challenge-1-decentralized-staking",
    label: "🚩 Challenge 1: 🔏 Decentralized Staking App ",
    disabled: false,
    description:
      "🦸 A superpower of Ethereum is allowing you, the builder, to create a simple set of rules that an adversarial group of players can use to work together. In this challenge, you create a decentralized application where users can coordinate a group funding effort. The users only have to trust the code.",
    previewImage: "/assets/challenges/stakingToken.svg",
    dependencies: [],
    sortOrder: 1,
  },
  {
    id: "token-vendor",
    github: "scaffold-eth/se-2-challenges:challenge-2-token-vendor",
    label: "🚩 Challenge 2: 🏵 Token Vendor",
    icon: "/assets/key_icon.svg",
    disabled: false,
    description:
      '🤖 Smart contracts are kind of like "always on" vending machines that anyone can access. Let\'s make a decentralized, digital currency (an ERC20 token). Then, let\'s build an unstoppable vending machine that will buy and sell the currency. We\'ll learn about the "approve" pattern for ERC20s and how contract to contract interactions work.',
    previewImage: "/assets/challenges/tokenVendor.svg",
    dependencies: [],
    sortOrder: 2,
  },
  {
    id: "dice-game",
    github: "scaffold-eth/se-2-challenges:challenge-3-dice-game",
    label: "🚩 Challenge 3: 🎲 Dice Game",
    disabled: false,
    description:
      "🎰 Randomness is tricky on a public deterministic blockchain. The block hash is the result proof-of-work (for now) and some builders use this as a weak form of randomness.  In this challenge you will take advantage of a Dice Game contract by predicting the randomness in order to only roll winning dice!",
    previewImage: "/assets/challenges/diceGame.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor"],
    sortOrder: 3,
  },
  {
    id: "minimum-viable-exchange",
    github: "scaffold-eth/se-2-challenges:challenge-4-dex",
    label: "🚩 Challenge 4: ⚖️ Build a DEX",
    disabled: false,
    description:
      "💵 Build an exchange that swaps ETH to tokens and tokens to ETH. 💰 This is possible because the smart contract holds reserves of both assets and has a price function based on the ratio of the reserves. Liquidity providers are issued a token that represents their share of the reserves and fees...",
    previewImage: "assets/challenges/dex.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
    sortOrder: 4,
  },
  {
    id: "state-channels",
    github: "scaffold-eth/se-2-challenges:challenge-5-state-channels",
    label: "🚩 Challenge 5: 📺 A State Channel Application",
    disabled: false,
    description:
      "🛣️ The Ethereum blockchain has great decentralization & security properties but these properties come at a price: transaction throughput is low, and transactions can be expensive. This makes many traditional web applications infeasible on a blockchain... or does it?  State channels look to solve these problems by allowing participants to securely transact off-chain while keeping interaction with Ethereum Mainnet at a minimum.",
    previewImage: "assets/challenges/state.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
    sortOrder: 5,
  },
  {
    id: "learn-multisig",
    github: "scaffold-eth/se-2-challenges:challenge-6-multisig",
    label: "👛 Multisig Wallet Challenge",
    disabled: false,
    description:
      '👩‍👩‍👧‍👧 Using a smart contract as a wallet we can secure assets by requiring multiple accounts to "vote" on transactions. The contract will keep track of transactions in an array of structs and owners will confirm or reject each one. Any transaction with enough confirmations can "execute".',
    previewImage: "assets/challenges/multiSig.svg",
    // Challenge locked until the builder completed these challenges
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
    // Once the dependencies are completed, lock the challenge until
    // This will make the challenge to link to the externalLink, instead of the challenge detail view.
    externalLink: {
      link: "https://t.me/+zKllN8OlGuxmYzFh",
      claim: "Join the 👛 Multisig Build cohort",
    },
    sortOrder: 6,
  },
  {
    id: "nft-cohort",
    github: "scaffold-eth/se-2-challenges:challenge-7-svg-nft",
    label: "🎁 SVG NFT 🎫 Challenge",
    disabled: false,
    description:
      "🎨 Create a dynamic SVG NFT using a smart contract. Your contract will generate on-chain SVG images and allow users to mint their unique NFTs. ✨ Customize your SVG graphics and metadata directly within the smart contract. 🚀 Share the minting URL once your project is live!",
    previewImage: "assets/challenges/dynamicSvgNFT.svg",
    // Challenge locked until the builder completed these challenges
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
    // Once the dependencies are completed, lock the challenge until
    // This will make the challenge to link to the externalLink, instead of the challenge detail view.
    externalLink: {
      link: "https://t.me/+mUeITJ5u7Ig0ZWJh",
      claim: "Join the 🎁 SVG NFT 🎫 Building Cohort",
    },
    sortOrder: 7,
  },
];

// TODO. Query the database
export async function findChallengeById(id: string) {
  return fakeChallenges.find(challenge => challenge.id === id);
}

// TODO. Query the database
export async function getAllChallenges() {
  return fakeChallenges.sort((a, b) => a.sortOrder - b.sortOrder);
}
