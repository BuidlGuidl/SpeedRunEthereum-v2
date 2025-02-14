import Markdown from "react-markdown";
import { findChallengeById, getAllChallenges } from "~~/services/database/respositories/challenges";
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

  const challengeReadme = await fetchGithubReadme(challenge.github);

  return (
    <div className="flex flex-col gap-4 p-4">
      {challengeReadme ? (
        <div className="prose dark:prose-invert max-w-none">
          {/* TODO. Parse the markdown correctly */}
          <Markdown>{challengeReadme}</Markdown>
        </div>
      ) : (
        <div>Failed to load challenge content</div>
      )}
    </div>
  );
}
