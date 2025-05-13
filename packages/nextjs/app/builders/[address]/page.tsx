import { notFound } from "next/navigation";
import { UpgradedToBGCard } from "./_components/UpgradedToBGCard";
import { UserChallengesTable } from "./_components/UserChallengesTable";
import { UserProfileCard } from "./_components/UserProfileCard";
import { BuildCard } from "./_components/builds/BuildCard";
import { SubmitNewBuildBtn } from "./_components/builds/SubmitNewBuildBtn";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { isBgMember } from "~~/services/api-bg/builders";
import { getBuildsByUserAddress } from "~~/services/database/repositories/builds";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
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
  const challenges = await getLatestSubmissionPerChallengeByUser(userAddress);
  const user = await getUserByAddress(userAddress);
  const bgMemberExists = await isBgMember(userAddress);
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
            <UserProfileCard user={user} address={userAddress} />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-14">
            {bgMemberExists && <UpgradedToBGCard user={user} />}
            {/* Builds */}
            <div className="w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Builds</h2>
                <SubmitNewBuildBtn />
              </div>
              <div className="flex flex-wrap items-stretch w-full gap-5">
                {builds.length > 0 &&
                  builds.map(build => (
                    <div key={build.build.id} className="flex-grow-0 flex-shrink-0">
                      <BuildCard build={build.build} likes={build.likes} coBuilders={build.coBuilders} />
                    </div>
                  ))}
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </>
  );
}
