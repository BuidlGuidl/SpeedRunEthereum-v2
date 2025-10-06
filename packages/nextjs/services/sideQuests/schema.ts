import {
  checkContractDeployed,
  checkEnsAvatarSet,
  checkEnsRegistered,
  checkMintedNFT,
  checkSentMainnetTx,
  checkSwappedOnDex,
  checkUsedL2,
} from "./checks";
import { SideQuestId, SideQuestMeta } from "./types";

export const SIDEQUEST_IDS = [
  "ensRegistered",
  "ensAvatarSet",
  "contractDeployed",
  "swappedOnDex",
  "usedL2",
  "sentMainnetTx",
  "mintedNFT",
] as const;

export const SIDEQUESTS: Record<SideQuestId, SideQuestMeta> = {
  ensRegistered: {
    id: "ensRegistered",
    name: "Register an ENS name",
    check: checkEnsRegistered,
    link: "/guides/register-ens-domain-set-avatar",
  },
  ensAvatarSet: {
    id: "ensAvatarSet",
    name: "Set an ENS avatar",
    check: checkEnsAvatarSet,
    link: "/guides/register-ens-domain-set-avatar",
  },
  contractDeployed: {
    id: "contractDeployed",
    name: "Deploy a Contract",
    check: checkContractDeployed,
    link: "https://www.youtube.com/watch?v=AUwYGRkxm_8",
  },
  swappedOnDex: {
    id: "swappedOnDex",
    name: "Swap on a DEX",
    check: checkSwappedOnDex,
    link: "https://ethereum.org/guides/how-to-swap-tokens",
  },
  usedL2: {
    id: "usedL2",
    name: "Use an L2",
    check: checkUsedL2,
    link: "https://ethereum.org/guides/how-to-use-a-bridge/",
  },
  sentMainnetTx: {
    id: "sentMainnetTx",
    name: "Send a Mainnet TX",
    check: checkSentMainnetTx,
    link: "https://ethereum.org/guides/how-to-use-a-wallet/",
  },
  mintedNFT: {
    id: "mintedNFT",
    name: "Mint an NFT",
    check: checkMintedNFT,
    link: "https://chain.link/tutorials/how-to-mint-an-nft",
  },
} as const;
