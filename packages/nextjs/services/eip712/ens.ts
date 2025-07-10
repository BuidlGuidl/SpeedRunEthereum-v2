import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__UPDATE_ENS = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "description", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Update ENS and ENS Avatar",
    description:
      "I would like to update my ENS name and ENS avatar in speedrunethereum.com signing this offchain message",
  },
} as const;

export const isValidEIP712UpdateEnsSignature = async ({
  address,
  signature,
}: {
  address: string;
  signature: `0x${string}`;
}) => {
  return await isValidEip712Signature({ typedData: { ...EIP_712_TYPED_DATA__UPDATE_ENS, signature }, address });
};
