import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";
import { UserSocials } from "~~/services/database/repositories/users";

export const EIP_712_TYPED_DATA__UPDATE_SOCIALS = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "socialTelegram", type: "string" },
      { name: "socialX", type: "string" },
      { name: "socialGithub", type: "string" },
      { name: "socialInstagram", type: "string" },
      { name: "socialDiscord", type: "string" },
      { name: "socialEmail", type: "string" },
      { name: "socialFarcaster", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Update Socials",
  },
} as const;

export const isValidEIP712UpdateSocialsSignature = async ({
  address,
  signature,
  socials,
}: {
  address: string;
  signature: `0x${string}`;
  socials: UserSocials;
}) => {
  const socialsWithDefaults = {
    socialTelegram: "",
    socialX: "",
    socialGithub: "",
    socialInstagram: "",
    socialDiscord: "",
    socialEmail: "",
    socialFarcaster: "",
    ...socials,
  };

  const typedData = {
    ...EIP_712_TYPED_DATA__UPDATE_SOCIALS,
    message: {
      ...EIP_712_TYPED_DATA__UPDATE_SOCIALS.message,
      ...socialsWithDefaults,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};
