import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";
import { BatchUserStatus, UserRole } from "~~/services/database/config/types";

export const EIP_712_TYPED_DATA__UPDATE_USER = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "role", type: "string" },
      { name: "batchId", type: "string" },
      { name: "batchStatus", type: "string" },
      { name: "userAddress", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Update User",
  },
} as const;

export async function isValidEIP712UpdateUserSignature({
  address,
  signature,
  role,
  batchId,
  batchStatus,
  userAddress,
}: {
  address: string;
  signature: `0x${string}`;
  role?: UserRole;
  batchId?: number;
  batchStatus?: BatchUserStatus;
  userAddress: string;
}) {
  const typedData = {
    ...EIP_712_TYPED_DATA__UPDATE_USER,
    message: {
      ...EIP_712_TYPED_DATA__UPDATE_USER.message,
      role: role || "",
      batchId: batchId?.toString() || "",
      batchStatus: batchStatus || "",
      userAddress: userAddress || "",
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
}
