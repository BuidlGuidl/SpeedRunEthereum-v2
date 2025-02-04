export const EIP_712_DOMAIN = {
  name: "SpeedRunEthereum",
  version: "1",
} as const;

export const EIP_712_TYPES__USER_REGISTER = {
  Message: [
    { name: "action", type: "string" },
    { name: "description", type: "string" },
  ],
};
