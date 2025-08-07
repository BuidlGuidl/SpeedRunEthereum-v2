import Safe, { hashSafeMessage } from "@safe-global/protocol-kit";
import { EIP712TypedData } from "@safe-global/safe-core-sdk-types";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

// Mapping of chainId to RPC chain name as used by Alchemy/Infura
export const RPC_CHAIN_NAMES: Record<number, string> = {
  [chains.mainnet.id]: "eth-mainnet",
  [chains.goerli.id]: "eth-goerli",
  [chains.sepolia.id]: "eth-sepolia",
  [chains.optimism.id]: "opt-mainnet",
  [chains.optimismGoerli.id]: "opt-goerli",
  [chains.optimismSepolia.id]: "opt-sepolia",
  [chains.arbitrum.id]: "arb-mainnet",
  [chains.arbitrumGoerli.id]: "arb-goerli",
  [chains.arbitrumSepolia.id]: "arb-sepolia",
  [chains.polygon.id]: "polygon-mainnet",
  [chains.polygonMumbai.id]: "polygon-mumbai",
  [chains.astar.id]: "astar-mainnet",
  [chains.polygonZkEvm.id]: "polygonzkevm-mainnet",
  [chains.polygonZkEvmTestnet.id]: "polygonzkevm-testnet",
  [chains.base.id]: "base-mainnet",
  [chains.baseGoerli.id]: "base-goerli",
  [chains.baseSepolia.id]: "base-sepolia",
};

export const getAlchemyHttpUrl = (chainId: number) => {
  return RPC_CHAIN_NAMES[chainId]
    ? `https://${RPC_CHAIN_NAMES[chainId]}.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`
    : undefined;
};

export const validateSafeSignature = async ({
  chainId,
  safeAddress,
  typedData,
  signature,
}: {
  chainId: number;
  safeAddress: string;
  typedData: EIP712TypedData;
  signature: string;
}) => {
  const protocolKit = await Safe.init({
    provider: getAlchemyHttpUrl(chainId) as string,
    safeAddress: safeAddress,
  });
  const safeMessage = hashSafeMessage(typedData);
  const isValidSignature = await protocolKit.isValidSignature(safeMessage, signature);
  return isValidSignature;
};
