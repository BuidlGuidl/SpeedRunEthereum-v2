import { NextResponse } from "next/server";
import { isUserJoinedBG, updateUserJoinBG } from "~~/services/database/repositories/users";
import { isValidEIP712JoinBGSignature } from "~~/services/eip712/join-bg";

type JoinBGPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const { address, signature } = (await req.json()) as JoinBGPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const userJoinedBG = await isUserJoinedBG(address);

    if (userJoinedBG) {
      return NextResponse.json({ error: "User already joined Build Guild" }, { status: 401 });
    }

    const isValidSignature = isValidEIP712JoinBGSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const users = await updateUserJoinBG(address);

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
