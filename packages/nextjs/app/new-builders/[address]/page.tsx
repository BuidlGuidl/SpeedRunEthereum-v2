import Image from "next/image";
import { notFound } from "next/navigation";
import { UserProfileCard } from "./_components/UserProfileCard";
import { BuildCard } from "./_components/builds/BuildCard";
import { SubmitNewBuildButton } from "./_components/builds/SubmitNewBuildButton";
import clsx from "clsx";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { getBatchById } from "~~/services/database/repositories/batches";
import { getBuildsByUserAddress } from "~~/services/database/repositories/builds";
// import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { getEnsOrAddress } from "~~/utils/ens-or-address";

const CHALLENGES = [
  {
    id: 1,
    title: "Simple NFT Example",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
    completed: true,
  },
  {
    id: 2,
    title: "Decentralized Staking App",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
    completed: true,
  },
  {
    id: 3,
    title: "Token Vendor",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
    completed: false,
  },
  {
    id: 4,
    title: "Dice Game",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
    completed: false,
  },
  {
    id: 5,
    title: "Build a DEX",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
    completed: false,
  },
  {
    id: 6,
    title: "SVG NFT",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
    completed: false,
  },
];

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
  const builds = await getBuildsByUserAddress(userAddress);

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
              {/* Challenges */}
              <div>
                <div className="mb-8 p-4 bg-base-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold m-0">Challenges</h2>
                    <p className="m-0 text-gray-500">2 / 10 Completed</p>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CHALLENGES.map(challenge => (
                      <div
                        key={challenge.id}
                        className={clsx(
                          "aspect-square flex items-center justify-center bg-base-200 mask mask-hexagon-2",
                          {
                            "opacity-50": !challenge.completed,
                          },
                        )}
                      >
                        <Image
                          src={`/assets/achievements/trophy-${challenge.id}.svg`}
                          alt={`Trophy for ${challenge.id}`}
                          className="w-16 h-auto"
                          width={100}
                          height={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Builds */}
              <div className="mt-12 w-full">
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
      </div>
    </>
  );
}
