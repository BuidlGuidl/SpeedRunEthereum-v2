import { notFound } from "next/navigation";
import { GroupedChallenges } from "./_components/GroupedChallenges";
import { PointsBar } from "./_components/PointsBar";
import { SideQuests } from "./_components/SideQuests";
import { UserProfileCard } from "./_components/UserProfileCard";
import { Builds } from "./_components/builds/Builds";
import { Metadata } from "next";
import { isAddress } from "viem";
import { RouteRefresher } from "~~/components/RouteRefresher";
import { ReviewAction } from "~~/services/database/config/types";
import { getBatchById } from "~~/services/database/repositories/batches";
import { getBuildsByUserAddress } from "~~/services/database/repositories/builds";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress, getUserXP } from "~~/services/database/repositories/users";
import { SIDEQUESTS } from "~~/services/sideQuests/schema";
import { getShortAddressAndEns } from "~~/utils/short-address-and-ens";
import { getTotalXP } from "~~/utils/xp";

type Props = {
  params: Promise<{
    address: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
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

export default async function BuilderPage(props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  const { address } = params;

  const challenges = await getAllChallenges();
  const userChallenges = await getLatestSubmissionPerChallengeByUser(address);
  const userCompletedChallenges = userChallenges.filter(challenge => challenge.reviewAction === ReviewAction.ACCEPTED);
  const user = await getUserByAddress(address);

  let userBatch;
  if (user?.batchId) {
    userBatch = await getBatchById(user.batchId);
  }
  const builds = await getBuildsByUserAddress(address);
  const points = await getUserXP(address);

  if (!user) {
    notFound();
  }

  const userHasCompletedChallenges = userCompletedChallenges.length > 0;

  // Filter out disabled and non-autograding challenges
  const filteredChallenges = challenges.filter(challenge => challenge.autograding === true && !challenge.disabled);
  const totalSideQuests = Object.keys(SIDEQUESTS).length;

  const totalPoints = getTotalXP(filteredChallenges.length, totalSideQuests);

  return (
    <>
      <RouteRefresher />
      <div className="max-w-[1440px] w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-4">
            <UserProfileCard user={user} batch={userBatch} />
            <PointsBar points={points} totalPoints={totalPoints} />
            <SideQuests snapshot={user.sideQuestsSnapshot} />
          </div>
          <div className="lg:col-span-3">
            <GroupedChallenges
              address={address}
              challenges={filteredChallenges}
              userChallenges={userChallenges}
              userHasCompletedChallenges={userHasCompletedChallenges}
            />
            <Builds address={address} builds={builds} userHasCompletedChallenges={userHasCompletedChallenges} />
          </div>
        </div>
      </div>
    </>
  );
}
