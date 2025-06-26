import { notFound, redirect } from "next/navigation";
import { UserChallengesTable } from "./_components/UserChallengesTable";
import { UserProfileCard } from "./_components/UserProfileCard";
import { BuildCard } from "./_components/builds/BuildCard";
import { SubmitNewBuildButton } from "./_components/builds/SubmitNewBuildButton";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { getBatchById } from "~~/services/database/repositories/batches";
import { getBuildsByUserAddress } from "~~/services/database/repositories/builds";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress, getUserByEns } from "~~/services/database/repositories/users";
import { getShortAddressAndEns } from "~~/utils/short-address-and-ens";

type Props = {
  params: {
    addressOrEns: string;
  };
};

async function getCanonicalAddress(addressOrEns: string) {
  const isValidAddress = isAddress(addressOrEns);
  const isEns = addressOrEns.endsWith(".eth");

  if (isValidAddress) {
    return { canonicalAddress: addressOrEns, isEns: false };
  }

  let canonicalAddress = null;
  if (isEns) {
    const userByEns = await getUserByEns(addressOrEns);
    if (userByEns) {
      canonicalAddress = userByEns.userAddress;
    }
  }
  return { canonicalAddress, isEns };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const addressOrEns = params.addressOrEns;

  const { canonicalAddress } = await getCanonicalAddress(addressOrEns);
  if (!canonicalAddress) {
    return {
      title: "User Not Found",
    };
  }
  const { shortAddress } = await getShortAddressAndEns(canonicalAddress);
  const title = shortAddress;

  // Base URL - replace with your actual domain in production
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  const ogImageUrl = `${baseUrl}/api/og?address=${canonicalAddress}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    alternates: {
      canonical: `${baseUrl}/builders/${canonicalAddress}`,
    },
    openGraph: {
      title,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `QR Code for ${canonicalAddress}`,
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

export default async function BuilderPage({ params }: { params: { addressOrEns: string } }) {
  const { addressOrEns } = params;
  const { canonicalAddress, isEns } = await getCanonicalAddress(addressOrEns);

  if (isEns && canonicalAddress) {
    redirect(`/builders/${canonicalAddress}`);
  }

  const userAddress = addressOrEns;

  const challenges = await getLatestSubmissionPerChallengeByUser(userAddress);
  const user = await getUserByAddress(userAddress);
  let userBatch;
  if (user?.batchId) {
    userBatch = await getBatchById(user.batchId);
  }
  const builds = await getBuildsByUserAddress(userAddress);

  if (!user) {
    notFound();
  }

  return (
    <>
      <RouteRefresher />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-14">
          <div className="lg:col-span-1">
            <UserProfileCard user={user} batch={userBatch} />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-14">
            {/* Challenges */}
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Challenges</h2>
              {challenges.length > 0 ? (
                <UserChallengesTable challenges={challenges} />
              ) : (
                <div className="bg-base-100 p-8 text-center rounded-lg text-neutral">
                  This builder hasn&apos;t completed any challenges.
                </div>
              )}
            </div>
            {/* Builds */}
            <div className="w-full">
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
