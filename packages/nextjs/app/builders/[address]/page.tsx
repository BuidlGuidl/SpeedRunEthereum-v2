import { notFound } from "next/navigation";
import { GroupedChallenges } from "./_components/GroupedChallenges";
import { UserProfileCard } from "./_components/UserProfileCard";
import { BuildCard } from "./_components/builds/BuildCard";
import { SubmitNewBuildButton } from "./_components/builds/SubmitNewBuildButton";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { getBatchById } from "~~/services/database/repositories/batches";
import { getBuildsByUserAddress } from "~~/services/database/repositories/builds";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { getShortAddressAndEns } from "~~/utils/short-address-and-ens";

type Props = {
  params: {
    address: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;

  if (!isAddress(address)) {
    return {
      title: "User Not Found",
    };
  }
  const { shortAddress } = await getShortAddressAndEns(address);
  const title = shortAddress;

  // Base URL - replace with your actual domain in production
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  const ogImageUrl = `${baseUrl}/api/og?address=${address}`;

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
  const { address } = params;

  const challenges = await getAllChallenges();
  const userChallenges = await getLatestSubmissionPerChallengeByUser(address);
  const user = await getUserByAddress(address);
  let userBatch;
  if (user?.batchId) {
    userBatch = await getBatchById(user.batchId);
  }
  const builds = await getBuildsByUserAddress(address);

  if (!user) {
    notFound();
  }

  return (
    <>
      <RouteRefresher />
      <div className="max-w-[1440px] w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div>
            <UserProfileCard user={user} batch={userBatch} />
          </div>
          <div className="xl:col-span-3">
            {/* Challenges */}
            <GroupedChallenges challenges={challenges} userChallenges={userChallenges} />
            {/* Builds */}
            <div className="mt-12">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Builds</h2>
                <SubmitNewBuildButton />
              </div>
              {builds.length > 0 ? (
                <div className="flex flex-wrap items-stretch w-full gap-5">
                  {builds.map(build => (
                    <div key={build.build.id} className="flex-grow-0 flex-shrink-0">
                      <BuildCard
                        ownerAddress={build.ownerAddress}
                        build={build.build}
                        likes={build.likes}
                        coBuilders={build.coBuilders}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-base-100 p-8 text-center rounded-lg text-neutral">
                  This builder hasn&apos;t submitted any builds yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
