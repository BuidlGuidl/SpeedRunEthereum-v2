import { EIP_712_DOMAIN } from "./common";
import { recoverTypedDataAddress } from "viem";

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
  const recoveredAddress = await recoverTypedDataAddress({
    ...EIP_712_TYPED_DATA__USER_REGISTER,
    signature,
  });
  return recoveredAddress.toLowerCase() === address.toLowerCase();
};
