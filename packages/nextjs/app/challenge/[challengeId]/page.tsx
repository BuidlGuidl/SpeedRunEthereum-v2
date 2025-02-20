import { SubmitChallengeButton } from "./_components/SubmitChallengeButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import { findChallengeById, getAllChallenges } from "~~/services/database/repositories/challenges";
import { fetchGithubReadme } from "~~/services/github";

// TODO. Metadata

// 6 hours
export const revalidate = 21600;

export async function generateStaticParams() {
  const challenges = await getAllChallenges();

  return challenges.map(challenge => ({
    challengeId: challenge.id.toString(),
  }));
}

export default async function ChallengePage({ params }: { params: { challengeId: string } }) {
  const challenge = await findChallengeById(params.challengeId);
  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  if (!challenge.github) {
    return <div>No challenge content available</div>;
  }

  const challengeReadme = await fetchGithubReadme(challenge.github);

  return (
    <div className="flex flex-col gap-4 p-4 relative">
      {challengeReadme ? (
        <div className="prose dark:prose-invert max-w-none">
          <MDXRemote source={challengeReadme} />
        </div>
      ) : (
        <div>Failed to load challenge content</div>
      )}
      <SubmitChallengeButton challengeId={challenge.id} />
    </div>
  );
}
