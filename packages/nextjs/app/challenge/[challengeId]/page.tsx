import { notFound } from "next/navigation";
import { SubmitChallengeButton } from "./_components/SubmitChallengeButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ChallengeId } from "~~/services/database/config/types";
import { getAllChallenges, getChallengeById } from "~~/services/database/repositories/challenges";
import { fetchGithubChallengeReadme, parseGithubUrl } from "~~/services/github";
import { CHALLENGE_METADATA } from "~~/utils/challenges";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

// 6 hours
export const revalidate = 21600;

export async function generateStaticParams() {
  const challenges = await getAllChallenges();

  return challenges.map(challenge => ({
    challengeId: challenge.id.toString(),
  }));
}

export async function generateMetadata({ params }: { params: { challengeId: string } }) {
  const challenge = await getChallengeById(params.challengeId as ChallengeId);

  const staticMetadata = CHALLENGE_METADATA[params.challengeId];

  return getMetadata({
    title: staticMetadata?.title || challenge?.challengeName || "",
    description: staticMetadata?.description || challenge?.description || "",
    imageRelativePath: challenge?.previewImage || undefined,
  });
}

export default async function ChallengePage({ params }: { params: { challengeId: ChallengeId } }) {
  const challenge = await getChallengeById(params.challengeId);
  if (!challenge || challenge.disabled) {
    notFound();
  }

  if (!challenge.github) {
    return <div>No challenge content available</div>;
  }

  const challengeReadme = await fetchGithubChallengeReadme(challenge.github);
  const { owner, repo, branch } = parseGithubUrl(challenge.github);

  return (
    <div className="flex flex-col items-center py-8 px-5 xl:p-12 relative max-w-[100vw]">
      {challengeReadme ? (
        <>
          <div className="prose dark:prose-invert max-w-fit break-words lg:max-w-[850px]">
            <MDXRemote
              source={challengeReadme}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeRaw],
                  remarkPlugins: [remarkGfm],
                  format: "md",
                },
              }}
            />
          </div>
          <a
            href={`https://github.com/${owner}/${repo}/tree/${branch}`}
            className="block mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn btn-outline btn-sm sm:btn-md">
              <span className="text-xs sm:text-sm">View on GitHub</span>
              <ArrowTopRightOnSquareIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
