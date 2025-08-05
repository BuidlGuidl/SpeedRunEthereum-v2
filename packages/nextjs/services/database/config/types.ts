// Types to import from both schema/db and client
export enum ReviewAction {
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  SUBMITTED = "SUBMITTED",
}

export enum UserRole {
  USER = "USER",
  BUILDER = "BUILDER",
  ADMIN = "ADMIN",
}

export enum ChallengeId {
  SIMPLE_NFT_EXAMPLE = "simple-nft-example",
  DECENTRALIZED_STAKING = "decentralized-staking",
  TOKEN_VENDOR = "token-vendor",
  DICE_GAME = "dice-game",
  DEX = "dex",
  OVER_COLLATERALIZED_LENDING = "over-collateralized-lending",
  STABLECOINS = "stablecoins",
  PREDICTION_MARKETS = "prediction-markets",
  DEPLOY_TO_L2 = "deploy-to-l2",
  MULTISIG = "multisig",
  SVG_NFT = "svg-nft",
  STATE_CHANNELS = "state-channels",
}

export enum BatchStatus {
  CLOSED = "closed",
  OPEN = "open",
}

export enum BatchUserStatus {
  GRADUATE = "graduate",
  CANDIDATE = "candidate",
}

export enum BuildType {
  DAPP = "Dapp",
  INFRASTRUCTURE = "Infrastructure",
  CHALLENGE_SUBMISSION = "Challenge submission",
  CONTENT = "Content",
  DESIGN = "Design",
  OTHER = "Other",
}

export enum BuildCategory {
  DEFI = "DeFi",
  GAMING = "Gaming",
  NFTS = "NFTs",
  SOCIAL = "Social",
  DAOS_GOVERNANCE = "DAOs & Governance",
  DEV_TOOLING = "Dev Tooling",
  IDENTITY_REPUTATION = "Identity & Reputation",
  RWA_SUPPLY_CHAIN = "RWA & Supply Chain",
  AI_AGENTS = "AI Agents",
  PREDICTION_MARKETS = "Prediction Markets",
}

export const SUPPORTED_NETWORKS = {
  NONE: "",
  ARBITRUM: "arbitrum",
  OPTIMISM: "optimism",
} as const;
