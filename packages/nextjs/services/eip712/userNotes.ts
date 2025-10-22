import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";

export const EIP_712_TYPED_DATA__CREATE_USER_NOTE = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "userAddress", type: "string" },
      { name: "comment", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Create User Note",
  },
} as const;

export const EIP_712_TYPED_DATA__DELETE_USER_NOTE = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "action", type: "string" },
      { name: "noteId", type: "string" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Delete User Note",
  },
} as const;

export async function isValidEIP712CreateUserNoteSignature({
  address,
  signature,
  userAddress,
  comment,
}: {
  address: string;
  signature: `0x${string}`;
  userAddress: string;
  comment: string;
}) {
  const typedData = {
    ...EIP_712_TYPED_DATA__CREATE_USER_NOTE,
    message: {
      ...EIP_712_TYPED_DATA__CREATE_USER_NOTE.message,
      userAddress,
      comment,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
}

export async function isValidEIP712DeleteUserNoteSignature({
  address,
  signature,
  noteId,
}: {
  address: string;
  signature: `0x${string}`;
  noteId: number;
}) {
  const typedData = {
    ...EIP_712_TYPED_DATA__DELETE_USER_NOTE,
    message: {
      ...EIP_712_TYPED_DATA__DELETE_USER_NOTE.message,
      noteId: noteId.toString(),
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
}
