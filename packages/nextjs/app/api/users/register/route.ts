import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { createUser, isUserRegistered } from "~~/services/database/repositories/users";
import { isValidEIP712UserRegisterSignature } from "~~/services/eip712/register";
import { PlausibleEvent, trackPlausibleEvent } from "~~/services/plausible";

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

    waitUntil(trackPlausibleEvent(PlausibleEvent.SIGNUP_SRE, {}, req));

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
