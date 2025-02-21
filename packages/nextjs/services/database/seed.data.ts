import { challenges, events, userChallenges, users } from "./config/schema";

// Using Drizzle's inferred insert types to ensure seed data
// matches database schema requirements
export const seedUsers: (typeof users.$inferInsert)[] = [
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    role: "USER",
    createdAt: new Date(1679063274534),
    socialTwitter: "pabl0cks",
    socialTelegram: "pabl0cks",
  },
  {
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    role: "USER",
    createdAt: new Date(1664777161512),
    socialEmail: "ryuufarhan7@gmail.com",
    socialTwitter: "FarhanRyuu",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    role: "USER",
    createdAt: new Date(1672731143934),
    socialEmail: "gokulkesavan5005@gmail.com",
    socialTwitter: "meta_Goku",
    socialGithub: "kesgokul",
  },
  {
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    role: "USER",
    createdAt: new Date(1668050419502),
    socialEmail: "afo@wefa.app",
    socialTwitter: "Time_Is_Oba",
    socialGithub: "Oba-One",
  },
];

export const seedChallenges: (typeof challenges.$inferInsert)[] = [
  {
    id: "simple-nft-example",
    challengeName: "Simple NFT Example",
    github: "scaffold-eth/se-2-challenges:challenge-0-simple-nft",
    autograding: true,
  },
  {
    id: "decentralized-staking",
    challengeName: "Decentralized Staking App",
    github: "scaffold-eth/se-2-challenges:challenge-1-decentralized-staking",
    autograding: true,
  },
  {
    id: "token-vendor",
    challengeName: "Token Vendor",
    github: "scaffold-eth/se-2-challenges:challenge-2-token-vendor",
    autograding: true,
  },
  {
    id: "dice-game",
    challengeName: "Dice Game",
    github: "scaffold-eth/se-2-challenges:challenge-3-dice-game",
    autograding: true,
  },
  {
    id: "minimum-viable-exchange",
    challengeName: "Build a DEX",
    github: "scaffold-eth/se-2-challenges:challenge-4-dex",
    autograding: true,
  },
  {
    id: "state-channels",
    challengeName: "A State Channel Application",
    github: "scaffold-eth/se-2-challenges:challenge-5-state-channels",
    autograding: true,
  },
  {
    id: "multisig",
    challengeName: "Multisig Wallet",
    github: "scaffold-eth/se-2-challenges:challenge-6-multisig",
    autograding: false,
  },
  {
    id: "svg-nft",
    challengeName: "SVG NFT",
    github: "scaffold-eth/se-2-challenges:challenge-7-svg-nft",
    autograding: false,
  },
];

export const seedUserChallenges: (typeof userChallenges.$inferInsert)[] = [
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: "simple-nft-example",
    frontendUrl: "https://dreary-use.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0x7f918d7b7d0fe0d3a8de3c0570ed4e154c0096e0",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1679063312936),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: "dice-game",
    frontendUrl: "https://aggressive-party.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0xd08b984c3ee4a880112d81de5a4a074c857b7f2f",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1679359244796),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: "decentralized-staking",
    frontendUrl: "https://chunky-beam.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0xbF35fC995A2Cc4F1508B5F769922623dE7f220d6",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1679185806311),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    challengeId: "token-vendor",
    frontendUrl: "https://nonstop-fiction.surge.sh/",
    contractUrl: "https://sepolia.etherscan.io/address/0x57D312c3E4bF22F22d6A900Be8B38b5546b47C3f",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1679317471852),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    challengeId: "simple-nft-example",
    frontendUrl: "http://simple-nft-ryuufarhan.surge.sh/",
    contractUrl: "https://goerli.etherscan.io/address/0x861346d67b728949bcb69595638a78723a2adae3",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1664778633262),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: "simple-nft-example",
    frontendUrl: "http://clumsy-week.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xe3DF14f1482074916A8Aeb40d84898C879b2B5f6",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1672831270556),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: "state-channels",
    frontendUrl: "https://pumped-parcel.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0x71F80197032c9a07b966D3f8eCAFE601Af244F35",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1673150820763),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: "dice-game",
    frontendUrl: "https://busy-pizzas.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xEd2aF24B1a657000C9b4509BC91FCfA5E76D3d33",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1672974794575),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: "decentralized-staking",
    frontendUrl: "https://tasteful-plough.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xf3384118b56827271979A879e2d5A4d28569eb48",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1672830084301),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: "minimum-viable-exchange",
    frontendUrl: "https://sour-snake.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0x0752d3847601b506cBFB10330172821B495e6bB0",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1673006384070),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    challengeId: "token-vendor",
    frontendUrl: "https://speedrunethereum.com/challenge/token-vendor",
    contractUrl: "https://goerli.etherscan.io/address/0x9626C68Dd8d000BBB7B06f0782266976dEB91c35",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1672819901984),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    challengeId: "simple-nft-example",
    frontendUrl: "https://kind-fifth.surge.sh/",
    contractUrl: "https://goerli.etherscan.io/address/0xb9487f8d9E336a9468fcbb50dAF39587D0EBCA63",
    reviewComment: "Dummy review, nice work",
    submittedAt: new Date(1668196973527),
    reviewAction: "ACCEPTED",
  },
  {
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    challengeId: "decentralized-staking",
    frontendUrl: "https://stupid-beginner.surge.sh",
    contractUrl: "https://goerli.etherscan.io/address/0xd68edd04EbB81c6f187A526F3656C18dD0258cd8",
    reviewComment: "Dummy review, it's working great",
    submittedAt: new Date(1668830120864),
    reviewAction: "ACCEPTED",
  },
];

export const seedEvents: (typeof events.$inferInsert)[] = [
  {
    eventType: "CHALLENGE_SUBMIT",
    eventAt: new Date(1679063312936),
    signature:
      "0x7a808ee181d8655f38c48e0154903bea229b91e32f6062f6c23ad9da5fa25c3008238b07e367e7904200015157a43378b39244140c43ea35e5eea11c055a170500",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      challengeId: "simple-nft-example",
      contractUrl: "https://sepolia.etherscan.io/address/0x7f918d7b7d0fe0d3a8de3c0570ed4e154c0096e0",
      frontendUrl: "https://dreary-use.surge.sh/",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1679063320289),
    signature:
      "0x7a808ee181d8655f38c48e0154903bea229b91e32f6062f6c23ad9da5fa25c3008238b07e367e7904200015157a43378b39244140c43ea35e5eea11c055a170500",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: "simple-nft-example",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, nice work",
    },
  },
  {
    eventType: "USER_CREATE",
    eventAt: new Date(1679063274533),
    signature:
      "0xe6d747b3e4760aa9ceb15ae8274366ab010d057136782bdf77ea755c9f148fc85046b2ed24bcd6a39720e6e62db5cfc52b476099126ef6d90985115d494b606a01",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    },
  },
  {
    eventType: "CHALLENGE_SUBMIT",
    eventAt: new Date(1672974794575),
    signature:
      "0x4eca15955283c15c1f9565945c34638c9943a313a79301d73178b814e82e3e183e3d89aebdafa10a1012912cb820950fb6eea6ba76e58bf875f226bdc8257dc700",
    userAddress: "0x014EC6296B3493f0f59a3FE90E0FFf377fb8826a",
    payload: {
      challengeId: "dice-game",
      contractUrl: "https://goerli.etherscan.io/address/0xEd2aF24B1a657000C9b4509BC91FCfA5E76D3d33",
      frontendUrl: "https://busy-pizzas.surge.sh",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1679185806311),
    signature:
      "0x78e60403c8f0d5e8094de16f059d169e8e3a92e3a2df940589f2ce9c2b556d5d0dc0230c421df265fa8975f6175d0a7881a58e0e51b31107c6de1ee4a55a9eb601",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: "decentralized-staking",
      contractUrl: "https://sepolia.etherscan.io/address/0xbF35fC995A2Cc4F1508B5F769922623dE7f220d6",
      deployedUrl: "https://chunky-beam.surge.sh/",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1679185814845),
    signature:
      "0x78e60403c8f0d5e8094de16f059d169e8e3a92e3a2df940589f2ce9c2b556d5d0dc0230c421df265fa8975f6175d0a7881a58e0e51b31107c6de1ee4a55a9eb601",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: "decentralized-staking",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, it's working great",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1679317478533),
    signature:
      "0x4e681d003b6310a604944bd334966cd10348b283d1797db0f93b6ce55f9c02d149b53e59a331362b7f6468528fe4dfee1cd8d923199fc9949ac8386ec633213a01",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: "token-vendor",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, it's working great",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1679359253588),
    signature:
      "0x4eca15955283c15c1f9565945c34638c9943a313a79301d73178b814e82e3e183e3d89aebdafa10a1012912cb820950fb6eea6ba76e58bf875f226bdc8257dc700",
    userAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
    payload: {
      autograding: true,
      challengeId: "dice-game",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, it's working great",
    },
  },
  {
    eventType: "USER_CREATE",
    eventAt: new Date(1664777161511),
    signature:
      "0x8d319d59ce02619610376d6ebb2aae2581935d4176ec3ba2228d2b2cab720d260b4d4499f0000ec63d029df5271c10c92ccd68333ddedf506878511f79dd7fad1b",
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    payload: {
      userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1664778651266),
    signature:
      "0xc6d7cd95c4baf16851aec5817b08a07ca52f1682f37548c57173d3432df734d17d4e6d810ce55f151dcc5272ae07991305b8d40b0863b4308d5bd74788b645471c",
    userAddress: "0x000084821704d731438d2D06f4295e1AB0ace7D8",
    payload: {
      autograding: true,
      challengeId: "simple-nft-example",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, nice work",
    },
  },
  {
    eventType: "USER_CREATE",
    eventAt: new Date(1668050419499),
    signature:
      "0x760bf0c7f94d6fdce07a72d07274e36a258ffe1c4386201b8d34ba7e14882c0432fbedfb77259cbf42599b9939db4fe4ba5a73a4deffef10aa99b757f6f5957e1c",
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    payload: {
      userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1668196991801),
    signature:
      "0x03699f6b44e96814d5bac9e4a8a53195216af7b3d4eb44a76206e75ccb7869594755cf526826153335a00e0b140ec3f498db454681bd34d245d801f065b4ccf91c",
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    payload: {
      autograding: true,
      challengeId: "simple-nft-example",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, nice work",
    },
  },
  {
    eventType: "CHALLENGE_AUTOGRADE",
    eventAt: new Date(1668830138768),
    signature:
      "0x40a5005851b26a87a1ed130da6b1eedcf938dda15703f6d7155db088f91cca42496cd84d53e949d0ecb89ed3ed82db3bae9705c6a91b9198693c646690d9dea01c",
    userAddress: "0x01B2686Bd146bFc3F4B3DD6F7F86f26ac7c2f7Fd",
    payload: {
      autograding: true,
      challengeId: "decentralized-staking",
      reviewAction: "ACCEPTED",
      reviewMessage: "Dummy review, it's working great",
    },
  },
];
