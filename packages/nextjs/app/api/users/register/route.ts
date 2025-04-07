import { NextResponse } from "next/server";
import { createUser, isUserRegistered } from "~~/services/database/repositories/users";
import { isValidEIP712UserRegisterSignature } from "~~/services/eip712/register";

type RegisterPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const { address, signature } = (await req.json()) as RegisterPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const userExist = await isUserRegistered(address);

    if (userExist) {
      return NextResponse.json({ error: "User already registered" }, { status: 401 });
    }

    const isValidSignature = await isValidEIP712UserRegisterSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const user = await createUser({ userAddress: address });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error during registration:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during registration";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
