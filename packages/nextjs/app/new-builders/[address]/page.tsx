import { notFound } from "next/navigation";
import { CHALLENGES } from "../dummy-data";
import { UserChallenge } from "./_components/UserChallenge";
import { UserProfileCard } from "./_components/UserProfileCard";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { getBatchById } from "~~/services/database/repositories/batches";
// import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { getEnsOrAddress } from "~~/utils/ens-or-address";

type Props = {
  params: {
    address: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;
  const isValidAddress = isAddress(address);

  const { ensName, shortAddress } = await getEnsOrAddress(address);

  // Default title and description
  const title = `${ensName || shortAddress} | Speed Run Ethereum`;

  // Base URL - replace with your actual domain in production
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  // OG image URL
  const ogImageUrl = isValidAddress
    ? `${baseUrl}/api/og?address=${address}`
    : `${baseUrl}/api/og?address=0x0000000000000000000000000000000000000000`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    openGraph: {
      title,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `QR Code for ${address}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogImageUrl],
    },
  };
}

export default async function BuilderPage({ params }: { params: { address: string } }) {
  const { address: userAddress } = params;
  // const challenges = await getLatestSubmissionPerChallengeByUser(userAddress);
  const user = await getUserByAddress(userAddress);
  let userBatch;
  if (user?.batchId) {
    userBatch = await getBatchById(user.batchId);
  }

  if (!user) {
    notFound();
  }

  return (
    <>
      <RouteRefresher />
      <div className="max-w-[1440px] w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <UserProfileCard user={user} batch={userBatch} />
          <div className="xl:mt-9 xl:col-span-3">
            <div>
              <div className="mb-8 p-4 bg-base-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold m-0">Challenges</h2>
                  <p className="m-0 text-gray-400 dark:text-gray-200">3 / 10 Completed</p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
                  {CHALLENGES.map(challenge => (
                    <UserChallenge key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
