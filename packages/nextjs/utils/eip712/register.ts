import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__USER_REGISTER = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "description", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Register",
    description: "I would like to register as a builder in speedrunethereum.com signing this offchain message",
  },
} as const;

export const isValidEIP712UserRegisterSignature = async ({
  address,
  signature,
}: {
  address: string;
  signature: `0x${string}`;
}) => {
  return await isValidEip712Signature({ typedData: { ...EIP_712_TYPED_DATA__USER_REGISTER, signature }, address });
};
