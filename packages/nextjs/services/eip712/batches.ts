import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__CREATE_BATCH = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "name", type: "string" },
      { name: "startDate", type: "string" },
      { name: "status", type: "string" },
      { name: "contractAddress", type: "string" },
      { name: "telegramLink", type: "string" },
      { name: "bgSubdomain", type: "string" },
      { name: "network", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Create batch",
  },
} as const;

export const isValidEIP712CreateBatchSignature = async ({
  address,
  signature,
  name,
  startDate,
  status,
  contractAddress,
  telegramLink,
  bgSubdomain,
  network,
}: {
  address: string;
  signature: `0x${string}`;
  name: string;
  startDate: string;
  status: string;
  contractAddress: string;
  telegramLink: string;
  bgSubdomain: string;
  network: string;
}) => {
  const typedData = {
    ...EIP_712_TYPED_DATA__CREATE_BATCH,
    message: {
      ...EIP_712_TYPED_DATA__CREATE_BATCH.message,
      name,
      startDate,
      status,
      contractAddress,
      telegramLink,
      bgSubdomain,
      network,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};

export const EIP_712_TYPED_DATA__UPDATE_BATCH = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "name", type: "string" },
      { name: "startDate", type: "string" },
      { name: "status", type: "string" },
      { name: "contractAddress", type: "string" },
      { name: "telegramLink", type: "string" },
      { name: "bgSubdomain", type: "string" },
      { name: "network", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Update batch",
  },
} as const;

export const isValidEIP712UpdateBatchSignature = async ({
  address,
  signature,
  name,
  startDate,
  status,
  contractAddress,
  telegramLink,
  bgSubdomain,
  network,
}: {
  address: string;
  signature: `0x${string}`;
  name: string;
  startDate: string;
  status: string;
  contractAddress: string;
  telegramLink: string;
  bgSubdomain: string;
  network: string;
}) => {
  const typedData = {
    ...EIP_712_TYPED_DATA__UPDATE_BATCH,
    message: {
      ...EIP_712_TYPED_DATA__UPDATE_BATCH.message,
      name,
      startDate,
      status,
      contractAddress,
      telegramLink,
      bgSubdomain,
      network,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};
