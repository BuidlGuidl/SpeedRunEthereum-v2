import { NextRequest, NextResponse } from "next/server";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";
import { createBuild } from "~~/services/database/repositories/builds";
import { isValidEIP712SubmitBuildSignature } from "~~/services/eip712/builds";

export type SubmitBuildPayload = {
  address: string;
  signature: `0x${string}`;
} & BuildFormInputs;

export async function POST(request: NextRequest) {
  try {
    const { address, signature, ...build } = (await request.json()) as SubmitBuildPayload;

    if (!address || !signature || !build.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712SubmitBuildSignature({
      address,
      signature,
      build,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const createdBuild = await createBuild(build);

    return NextResponse.json({ build: createdBuild }, { status: 200 });
  } catch (error) {
    console.error("Error during build submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
