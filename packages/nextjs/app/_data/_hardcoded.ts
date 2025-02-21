export type ChallengeData = {
  id: string;
  label: string;
  previewImage: string;
  dependencies: string[];
  icon?: string;
  externalLink?: {
    link: string;
    claim: string;
  };
};

// TODO: Think where to move this
export const challengesData: ChallengeData[] = [
  {
    id: "simple-nft-example",
    label: "🚩 Challenge 0: 🎟 Simple NFT Example",
    previewImage: "/assets/challenges/simpleNFT.svg",
    dependencies: [],
  },
  {
    id: "decentralized-staking",
    label: "🚩 Challenge 1: 🔏 Decentralized Staking App ",
    previewImage: "/assets/challenges/stakingToken.svg",
    dependencies: [],
  },
  {
    id: "token-vendor",
    label: "🚩 Challenge 2: 🏵 Token Vendor",
    icon: "/assets/key_icon.svg",
    previewImage: "/assets/challenges/tokenVendor.svg",
    dependencies: [],
  },
  {
    id: "dice-game",
    label: "🚩 Challenge 3: 🎲 Dice Game",
    previewImage: "/assets/challenges/diceGame.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor"],
  },
  {
    id: "minimum-viable-exchange",
    label: "🚩 Challenge 4: ⚖️ Build a DEX",
    previewImage: "assets/challenges/dex.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
  },
  {
    id: "state-channels",
    label: "🚩 Challenge 5: 📺 A State Channel Application",
    previewImage: "assets/challenges/state.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
  },
  {
    id: "multisig",
    label: "👛 Multisig Wallet Challenge",
    previewImage: "assets/challenges/multiSig.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
    externalLink: {
      link: "https://t.me/+zKllN8OlGuxmYzFh",
      claim: "Join the 👛 Multisig Build cohort",
    },
  },
  {
    id: "svg-nft",
    label: "🎁 SVG NFT 🎫 Challenge",
    previewImage: "assets/challenges/dynamicSvgNFT.svg",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor", "dice-game"],
    externalLink: {
      link: "https://t.me/+mUeITJ5u7Ig0ZWJh",
      claim: "Join the 🎁 SVG NFT 🎫 Building Cohort",
    },
  },
];
