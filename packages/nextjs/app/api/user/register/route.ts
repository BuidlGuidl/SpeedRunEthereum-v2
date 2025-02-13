import { NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { createUser, findUserByAddress } from "~~/services/database/respositories/users";
import { EIP_712_DOMAIN, EIP_712_TYPES__USER_REGISTER } from "~~/utils/eip712";

type RegisterPayload = {
  signerAddress?: string;
  signature?: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const { signerAddress, signature } = (await req.json()) as RegisterPayload;

    if (!signerAddress || !signature) {
      return new Response("Missing signer or signature", { status: 400 });
    }

    const signerData = await findUserByAddress(signerAddress);

    if (signerData.length > 0) {
      console.error("Unauthorized", signerAddress);
      return NextResponse.json({ error: "User already registered" }, { status: 401 });
    }

    let isValidSignature = false;
    const typedData = {
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__USER_REGISTER,
      primaryType: "Message",
      message: {
        action: "Register",
        description: "I would like to register as a builder in speedrunethereum.com signing this offchain message",
      },
      signature,
    } as const;

    const recoveredAddress = await recoverTypedDataAddress(typedData);
    isValidSignature = recoveredAddress === signerAddress;

    if (!isValidSignature) {
      console.error("Signer and Recovered address does not match");
      return NextResponse.json({ error: "Unauthorized in batch" }, { status: 401 });
    }

    await createUser({ userAddress: signerAddress });
    return NextResponse.json({ message: "User registered successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error when registering", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
