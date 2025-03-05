// Types to import from both schema/db and client
export enum ReviewAction {
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  SUBMITTED = "SUBMITTED",
}

export enum EventType {
  CHALLENGE_SUBMIT = "CHALLENGE_SUBMIT",
  CHALLENGE_AUTOGRADE = "CHALLENGE_AUTOGRADE",
  USER_CREATE = "USER_CREATE",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ChallengeId {
  SIMPLE_NFT_EXAMPLE = "simple-nft-example",
  DECENTRALIZED_STAKING = "decentralized-staking",
  TOKEN_VENDOR = "token-vendor",
  DICE_GAME = "dice-game",
  MINIMUM_VIABLE_EXCHANGE = "minimum-viable-exchange",
  STATE_CHANNELS = "state-channels",
  MULTISIG = "multisig",
  SVG_NFT = "svg-nft",
}
