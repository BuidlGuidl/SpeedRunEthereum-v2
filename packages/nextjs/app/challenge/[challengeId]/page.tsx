import { notFound } from "next/navigation";
import { ChallengeHeader } from "./_components/ChallengeHeader";
import { ConnectAndRegisterBanner } from "./_components/ConnectAndRegisterBanner";
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

function splitChallengeReadme(readme: string): { headerImageMdx: string; restMdx: string } {
  const content = readme.replace(/\r\n?/g, "\n");
  const h1Index = content.search(/^#\s.+$/m);
  if (h1Index < 0) return { headerImageMdx: "", restMdx: content };

  const h1LineEnd = (() => {
    const n = content.indexOf("\n", h1Index);
    return n === -1 ? content.length : n + 1;
  })();

  const afterH1 = content.slice(h1LineEnd);
  const imgMatch = afterH1.match(/(?:!\[[^\]]*\]\([^\)]+\)|<img[\s\S]*?>)/);

  if (!imgMatch || imgMatch.index === undefined) {
    return {
      headerImageMdx: content.slice(h1Index, h1LineEnd),
      restMdx: content.slice(h1LineEnd),
    };
  }

  const imgAbsEnd = h1LineEnd + imgMatch.index + imgMatch[0].length;
  const lineEnd = content.indexOf("\n", imgAbsEnd);
  const end = lineEnd === -1 ? imgAbsEnd : lineEnd + 1;

  return {
    headerImageMdx: content.slice(h1Index, end),
    restMdx: content.slice(end),
  };
}

export async function generateStaticParams() {
  const challenges = await getAllChallenges();

  return challenges.map(challenge => ({
    challengeId: challenge.id.toString(),
  }));
}

export async function generateMetadata(props: { params: Promise<{ challengeId: string }> }) {
  const params = await props.params;
  const challenge = await getChallengeById(params.challengeId as ChallengeId);

  const staticMetadata = CHALLENGE_METADATA[params.challengeId];

  return getMetadata({
    title: staticMetadata?.title || challenge?.challengeName || "",
    description: staticMetadata?.description || challenge?.description || "",
    imageRelativePath: challenge?.previewImage || undefined,
  });
}

export default async function ChallengePage(props: { params: Promise<{ challengeId: ChallengeId }> }) {
  const params = await props.params;
  const challenge = await getChallengeById(params.challengeId);
  if (!challenge || challenge.disabled) {
    notFound();
  }

  const staticMetadata = CHALLENGE_METADATA[challenge.id];
  const guides = staticMetadata?.guides;

  if (!challenge.github) {
    return <div>No challenge content available</div>;
  }

  const challengeReadme = await fetchGithubChallengeReadme(challenge.github);
  const { headerImageMdx, restMdx } = splitChallengeReadme(challengeReadme);
  const { owner, repo, branch } = parseGithubUrl(challenge.github);

  return (
    <div className="flex flex-col items-center py-8 px-5 xl:p-12 relative max-w-[100vw]">
      {challengeReadme ? (
        <>
          <div className="prose dark:prose-invert max-w-fit break-words lg:max-w-[850px]">
            <MDXRemote
              source={headerImageMdx}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeRaw],
                  remarkPlugins: [remarkGfm],
                  format: "md",
                },
              }}
            />
          </div>
          <ChallengeHeader
            skills={staticMetadata?.skills}
            skillLevel={staticMetadata?.skillLevel}
            timeToComplete={staticMetadata?.timeToComplete}
            helpfulLinks={staticMetadata?.helpfulLinks}
          />
          <div className="prose dark:prose-invert max-w-fit break-words lg:max-w-[850px]">
            <MDXRemote
              source={restMdx}
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
          {guides && guides.length > 0 && (
            <div className="max-w-[850px] w-full mx-auto">
              <div className="mt-16 mb-4 font-semibold text-left">Related guides</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-2">
                {guides.map(guide => (
                  <div key={guide.url} className="p-4 border rounded bg-base-300">
                    <a href={guide.url} className="text-primary underline font-semibold">
                      {guide.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>Failed to load challenge content</div>
      )}
      {challenge.autograding && (
        <>
          <ConnectAndRegisterBanner />
          <SubmitChallengeButton challengeId={challenge.id} />
        </>
      )}
      {challenge.externalLink && (
        <div className="fixed bottom-8 inset-x-0 mx-auto w-fit">
          <button className="btn btn-sm sm:btn-md btn-primary text-secondary px-3 sm:px-4 mt-2 text-xs sm:text-sm">
            <a href={challenge.externalLink.link} target="_blank" rel="noopener noreferrer">
              {challenge.externalLink.claim}
            </a>
          </button>
        </div>
      )}
    </div>
  );
}
