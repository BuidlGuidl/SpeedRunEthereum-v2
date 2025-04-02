import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__JOIN_BG = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "description", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Join BuidlGuidl",
    description: "I would like to join the BuidlGuidl signing this offchain message",
  },
} as const;

export const isValidEIP712JoinBGSignature = async ({
  address,
  signature,
}: {
  address: string;
  signature: `0x${string}`;
}) => {
  return await isValidEip712Signature({ typedData: { ...EIP_712_TYPED_DATA__JOIN_BG, signature }, address });
};
