import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__JOIN_BATCH = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "description", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Join Batch",
    description: "I would like to request Telegram access for the batch program",
  },
} as const;

export const isValidEIP712JoinBatchSignature = async ({
  address,
  signature,
}: {
  address: string;
  signature: `0x${string}`;
}) => {
  return await isValidEip712Signature({ typedData: { ...EIP_712_TYPED_DATA__JOIN_BATCH, signature }, address });
};
