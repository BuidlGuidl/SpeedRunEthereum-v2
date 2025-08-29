import {
  checkContractDeployed,
  checkEnsRegistered,
  checkMintedNFT,
  checkSentMainnetTx,
  checkSwappedOnDex,
  checkUsedL2,
} from "./checks";
import { SideQuestId, SideQuestMeta } from "./types";

export const SIDEQUEST_IDS = [
  "ensRegistered",
  "contractDeployed",
  "swappedOnDex",
  "usedL2",
  "sentMainnetTx",
  "mintedNFT",
] as const;

export const SIDEQUESTS: Record<SideQuestId, SideQuestMeta> = {
  ensRegistered: { id: "ensRegistered", name: "Register an ENS name", check: checkEnsRegistered },
  contractDeployed: { id: "contractDeployed", name: "Deploy a Contract", check: checkContractDeployed },
  swappedOnDex: { id: "swappedOnDex", name: "Swap on a DEX", check: checkSwappedOnDex },
  usedL2: { id: "usedL2", name: "Use an L2", check: checkUsedL2 },
  sentMainnetTx: { id: "sentMainnetTx", name: "Send a Mainnet TX", check: checkSentMainnetTx },
  mintedNFT: { id: "mintedNFT", name: "Mint an NFT", check: checkMintedNFT },
} as const;
