import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { InferInsertModel } from "drizzle-orm";
import { users } from "~~/services/database/config/schema";
import { createUser, isUserRegistered, updateUser } from "~~/services/database/repositories/users";
import { isValidEIP712UserRegisterSignature } from "~~/services/eip712/register";
import { PlausibleEvent, trackPlausibleEvent } from "~~/services/plausible";
import { publicClient } from "~~/utils/short-address-and-ens";

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

    const userToCreate: InferInsertModel<typeof users> = {
      userAddress: address,
    };

    const user = await createUser(userToCreate);

    // Background processing
    waitUntil(
      (async () => {
        try {
          await trackPlausibleEvent(PlausibleEvent.SIGNUP_SRE, {}, req);

          let ensName: string | null = null;
          try {
            ensName = await publicClient.getEnsName({ address });
          } catch (error) {
            console.error(`Error getting ENS name for user ${address}:`, error);
          }

          let ensAvatar: string | null = null;
          if (ensName) {
            try {
              ensAvatar = await publicClient.getEnsAvatar({ name: ensName });
            } catch (error) {
              console.error(`Error getting ENS avatar for user ${address}:`, error);
            }
          }

          // Update user with ENS data if we have any
          if (ensName || ensAvatar) {
            const updateData: { ens?: string; ensAvatar?: string } = {};
            if (ensName) updateData.ens = ensName;
            if (ensAvatar) updateData.ensAvatar = ensAvatar;

            await updateUser(address, updateData);
            console.log(
              `ENS data updated for user ${address}: ${ensName ? `name: ${ensName}` : ""} ${ensAvatar ? `avatar: ${ensAvatar}` : ""}`,
            );
          }
        } catch (error) {
          console.error(`Error in background processing for user ${address}:`, error);
        }
      })(),
    );

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
