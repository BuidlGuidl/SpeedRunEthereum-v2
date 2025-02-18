import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__CHALLENGE_SUBMIT = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "challengeId", type: "string" },
      { name: "frontendUrl", type: "string" },
      { name: "contractUrl", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    // TODO: Maybe have beter message?
    action: "Submit Challenge",
  },
} as const;

export const isValidEIP712ChallengeSubmitSignature = async ({
  address,
  signature,
  challengeId,
  frontendUrl,
  contractUrl,
}: {
  address: string;
  signature: `0x${string}`;
  challengeId: string;
  frontendUrl: string;
  contractUrl: string;
}) => {
  const typedData = {
    ...EIP_712_TYPED_DATA__CHALLENGE_SUBMIT,
    message: {
      ...EIP_712_TYPED_DATA__CHALLENGE_SUBMIT.message,
      challengeId,
      frontendUrl,
      contractUrl,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};
