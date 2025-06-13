import Link from "next/link";
import { notFound } from "next/navigation";
import { UserProfileCard } from "./_components/UserProfileCard";
import { BuildCard } from "./_components/builds/BuildCard";
import { SubmitNewBuildButton } from "./_components/builds/SubmitNewBuildButton";
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
  },
  {
    id: 2,
    title: "Decentralized Staking App",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
  },
  {
    id: 3,
    title: "Token Vendor",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
  },
  {
    id: 4,
    title: "Dice Game",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
  },
  {
    id: 5,
    title: "Build a DEX",
    description:
      "Make a decentralized, digital currency and build an unstoppable vending machine that will buy and sell the currency.",
    link: "/challenge/decentralized-staking",
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
        <UserProfileCard user={user} batch={userBatch} />
        <div className="mt-12">
          <div>
            {/* Challenges */}
            <div className="w-full">
              {/* <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Challenges</h2> */}
              <div className="mb-8 bg-base-100 rounded-xl border">
                <div className="grid grid-cols-1 divide-y lg:divide-y-0 lg:divide-x lg:grid-cols-2">
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-3xl rounded-full bg-base-200">
                        💰
                      </div>
                      <h2 className="m-0 font-semibold text-lg lg:text-xl">DeFi Challenges</h2>
                    </div>
                    <p className="mb-0">
                      A series of challenges to further your understanding of decentralized finance. Explore digital
                      currencies, build a decentralized exchange, deep dive into stablecoins, and much more!
                    </p>
                    <div className="mt-6 px-4 py-3 border rounded-xl">
                      <p className="mt-0 font-medium">
                        Achievements -{" "}
                        <span className="text-gray-400 font-normal dark:text-gray-300">2/5 Completed</span>
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 space-y-5 divide-y max-h-80 overflow-x-hidden overflow-y-scroll">
                    {CHALLENGES.map(challenge => (
                      <div key={challenge.id} className="pt-5 flex gap-4">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-lg font-semibold rounded-full bg-base-200 border">
                          {challenge.id}
                        </div>
                        <div>
                          <h3 className="m-0 font-medium">
                            <Link className="hover:underline" href={challenge.link}>
                              {challenge.title}
                            </Link>
                          </h3>
                          <p className="mb-0 mt-2 text-sm">{challenge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-xl border">
                <div className="grid grid-cols-1 divide-y lg:divide-y-0 lg:divide-x lg:grid-cols-2">
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-3xl rounded-full bg-base-200">
                        🎰
                      </div>
                      <h2 className="m-0 font-semibold text-lg lg:text-xl">Gaming Challenges</h2>
                    </div>
                    <p className="mb-0">
                      A series of challenges to further your understanding of decentralized finance. Explore digital
                      currencies, build a decentralized exchange, deep dive into stablecoins, and much more!
                    </p>
                    <div className="mt-6 px-4 py-3 border rounded-xl">
                      <p className="mt-0 font-medium">
                        Achievements -{" "}
                        <span className="text-gray-400 font-normal dark:text-gray-300">0/5 Completed</span>
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 space-y-5 divide-y max-h-80 overflow-x-hidden overflow-y-scroll">
                    {CHALLENGES.map(challenge => (
                      <div key={challenge.id} className="pt-5 flex gap-4">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-lg font-semibold rounded-full bg-base-200 border">
                          {challenge.id}
                        </div>
                        <div>
                          <h3 className="m-0 font-medium">
                            <Link className="hover:underline" href={challenge.link}>
                              {challenge.title}
                            </Link>
                          </h3>
                          <p className="mb-0 mt-2 text-sm">{challenge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
    </>
  );
}
