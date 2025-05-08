import { notFound } from "next/navigation";
import { UpgradedToBGCard } from "./_components/UpgradedToBGCard";
import { UserChallengesTable } from "./_components/UserChallengesTable";
import { UserProfileCard } from "./_components/UserProfileCard";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { Address } from "~~/components/scaffold-eth";
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
          <div className="lg:col-span-3">
            {bgMemberExists && <UpgradedToBGCard user={user} />}
            <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Challenges</h2>
            {challenges.length > 0 ? (
              <UserChallengesTable challenges={challenges} />
            ) : (
              <div className="bg-base-100 p-8 text-center rounded-lg text-neutral">
                This builder hasn&apos;t completed any challenges.
              </div>
            )}
            <h2 className="text-2xl font-bold mt-10 mb-4 text-neutral">Builds</h2>
            {builds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {builds.map(build => (
                  <div key={build.id} className="bg-base-100 rounded-lg shadow p-6 flex flex-col gap-2">
                    <div className="font-bold text-lg">{build.name}</div>
                    <div className="text-xs">ID: {build.id}</div>
                    {build.desc && <div>{build.desc}</div>}
                    <div className="text-sm text-neutral-content">Type: {build.buildType}</div>
                    <div className="text-sm text-neutral-content">Category: {build.buildCategory}</div>
                    {build.demoUrl && (
                      <a
                        href={build.demoUrl}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Demo
                      </a>
                    )}
                    {build.videoUrl && (
                      <a
                        href={build.videoUrl}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Video
                      </a>
                    )}
                    {build.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={build.imageUrl} alt={build.name} className="w-full h-40 object-cover rounded mt-2" />
                    )}
                    {build.githubUrl && (
                      <a
                        href={build.githubUrl}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </a>
                    )}
                    <div className="text-xs text-neutral-content mt-2">
                      Submitted: {new Date(build.submittedTimestamp).toLocaleString()}
                    </div>
                    {/* Cobuilders */}
                    {build.cobuilders && build.cobuilders.length > 0 && (
                      <div className="mt-2">
                        <div className="font-semibold text-xs text-neutral">Cobuilders:</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {build.cobuilders.map(cb => (
                            <span
                              key={cb.userAddress}
                              className={`px-2 py-1 rounded text-xs ${cb.isOwner ? "bg-primary text-white" : "bg-neutral-200 text-neutral-700"}`}
                            >
                              <Address address={cb.userAddress} />
                              {cb.isOwner && " (Owner)"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Likes */}
                    <div className="mt-2">
                      <div className="font-semibold text-xs text-neutral">Likes: {build.likes?.length || 0}</div>
                      {build.likes && build.likes.length > 0 && (
                        <div className="collapse collapse-arrow bg-base-200 mt-1">
                          <input type="checkbox" />
                          <div className="collapse-title text-xs font-medium">Show like addresses</div>
                          <div className="collapse-content flex flex-wrap gap-2">
                            {build.likes.map(like => (
                              <span
                                key={like.userAddress}
                                className="px-2 py-1 rounded text-xs bg-pink-100 text-pink-700"
                              >
                                <Address address={like.userAddress} />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-base-100 p-8 text-center rounded-lg text-neutral">
                This builder hasn&apos;t submitted any builds.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
