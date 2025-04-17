import { UserLocation } from "../database/repositories/users";
import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__UPDATE_LOCATION = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "location", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Update Location",
  },
} as const;

export const isValidEIP712UpdateLocationSignature = async ({
  address,
  signature,
  location,
}: {
  address: string;
  signature: `0x${string}`;
  location: UserLocation;
}) => {
  const typedData = {
    ...EIP_712_TYPED_DATA__UPDATE_LOCATION,
    message: {
      ...EIP_712_TYPED_DATA__UPDATE_LOCATION.message,
      location,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};
