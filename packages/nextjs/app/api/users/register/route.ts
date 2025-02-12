import { NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { createUser, isUserPresent } from "~~/services/database/respositories/users";
import { EIP_712_DOMAIN, EIP_712_TYPES__USER_REGISTER } from "~~/utils/eip712";

type RegisterPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const { address, signature } = (await req.json()) as RegisterPayload;
    console.log("registerUser", address, signature);

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const userExist = await isUserPresent(address.toLowerCase());

    if (userExist) {
      return NextResponse.json({ error: "User already registered" }, { status: 401 });
    }

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
    const isValidSignature = recoveredAddress.toLowerCase() === address.toLowerCase();

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const users = await createUser({ id: address.toLowerCase() });

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
