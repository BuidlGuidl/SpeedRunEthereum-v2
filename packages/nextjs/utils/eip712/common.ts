import { RecoverTypedDataAddressParameters, recoverTypedDataAddress } from "viem";

export const EIP_712_DOMAIN = {
  name: "SpeedRunEthereum",
  version: "1",
} as const;

export const isValidEip712Signature = async ({
  typedData,
  address,
}: {
  typedData: RecoverTypedDataAddressParameters;
  address: string;
}) => {
  const recoveredAddress = await recoverTypedDataAddress(typedData);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
};
