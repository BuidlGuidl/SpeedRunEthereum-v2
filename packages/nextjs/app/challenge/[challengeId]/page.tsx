import { SubmitChallengeButton } from "./_components/SubmitChallengeButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ChallengeId } from "~~/services/database/config/types";
import { getAllChallenges, getChallengeById } from "~~/services/database/repositories/challenges";
import { fetchGithubReadme, parseGithubUrl } from "~~/services/github";

// TODO. Metadata

// 6 hours
export const revalidate = 21600;

export async function generateStaticParams() {
  const challenges = await getAllChallenges();

  return challenges.map(challenge => ({
    challengeId: challenge.id.toString(),
  }));
}

export default async function ChallengePage({ params }: { params: { challengeId: ChallengeId } }) {
  const challenge = await getChallengeById(params.challengeId);
  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  if (!challenge.github) {
    return <div>No challenge content available</div>;
  }

  const challengeReadme = await fetchGithubReadme(challenge.github);
  const { owner, repo, branch } = parseGithubUrl(challenge.github);

  return (
    <div className="flex flex-col items-center p-8 xl:p-12 relative max-w-[100vw]">
      {challengeReadme ? (
        <>
          <div className="prose dark:prose-invert max-w-fit break-all xl:max-w-[850px]">
            <MDXRemote source={challengeReadme} />
          </div>
          <a
            href={`https://github.com/${owner}/${repo}/tree/${branch}`}
            className="block mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn btn-outline">
              View on GitHub
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
          </a>
        </>
      ) : (
        <div>Failed to load challenge content</div>
      )}
      <SubmitChallengeButton challengeId={challenge.id} />
    </div>
  );
}
