import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { InferInsertModel } from "drizzle-orm";
import { users } from "~~/services/database/config/schema";
import {
  UserByAddress,
  UserUpdate,
  createUser,
  isUserRegistered,
  updateUser,
} from "~~/services/database/repositories/users";
import { isValidEIP712UserRegisterSignature } from "~~/services/eip712/register";
import { fetchOnchainData } from "~~/services/onchainData";
import { PlausibleEvent, trackPlausibleEvent } from "~~/services/plausible";
import { fetchSideQuestsSnapshot } from "~~/services/sideQuests";

type RegisterPayload = {
  address: string;
  signature: `0x${string}`;
  referrer: string | null;
  originalUtmParams?: Record<string, string>;
};

export async function POST(req: Request) {
  try {
    const { address, signature, referrer, originalUtmParams } = (await req.json()) as RegisterPayload;

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
      referrer,
      originalUtmParams,
    };

    const user = await createUser(userToCreate);

    // Background processing
    waitUntil(
      (async () => {
        try {
          await trackPlausibleEvent(
            PlausibleEvent.SIGNUP_SRE,
            {
              originalReferrer: referrer ?? undefined,
              originalUtmSource: originalUtmParams?.utm_source,
              originalUtmMedium: originalUtmParams?.utm_medium,
              originalUtmCampaign: originalUtmParams?.utm_campaign,
              originalUtmTerm: originalUtmParams?.utm_term,
              originalUtmContent: originalUtmParams?.utm_content,
            },
            req,
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.error(`Error tracking plausible event ${PlausibleEvent.SIGNUP_SRE} for user ${address}`);
        }
      })(),
    );

    waitUntil(
      (async () => {
        try {
          const { ensData } = await fetchOnchainData(address);

          // Update user with ENS data if we have any
          let updatedUser: NonNullable<UserByAddress> = user;
          if (ensData.name || ensData.avatar) {
            const updateData: UserUpdate = {
              ens: ensData.name ?? undefined,
              ensAvatar: ensData.avatar ?? undefined,
            };

            updatedUser = await updateUser(address, updateData);
            console.log(
              `ENS data updated for user ${address}: ${ensData.name ? `name: ${ensData.name}` : ""} ${ensData.avatar ? `avatar: ${ensData.avatar}` : ""}`,
            );
          }

          // Fetch Sidequests snapshot and save to user
          try {
            const snapshot = await fetchSideQuestsSnapshot(updatedUser);
            await updateUser(address, { sideQuestsSnapshot: snapshot });
            console.log(`Sidequests snapshot updated for user ${address}`);
          } catch (e) {
            console.error("Failed to fetch or store sidequests snapshot for", address, e);
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
