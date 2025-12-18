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
  TOKENIZATION = "tokenization",
  CROWDFUNDING = "crowdfunding",
  TOKEN_VENDOR = "token-vendor",
  DICE_GAME = "dice-game",
  DEX = "dex",
  OVER_COLLATERALIZED_LENDING = "over-collateralized-lending",
  PREDICTION_MARKETS = "prediction-markets",
  STABLECOINS = "stablecoins",
  ZK_VOTING = "zk-voting",
  ORACLES = "oracles",
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

export type UTMParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
};

export enum BatchNetwork {
  ARBITRUM = "arbitrum",
  OPTIMISM = "optimism",
}
