import { createElement } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChallengeHeader } from "./_components/ChallengeHeader";
import { ChallengeSidebar } from "./_components/ChallengeSidebar";
import { ChallengeSkills } from "./_components/ChallengeSkills";
import { ChatWidget } from "./_components/ChatWidget";
import { ConnectAndRegisterBanner } from "./_components/ConnectAndRegisterBanner";
import { Details as MdxDetails, Summary as MdxSummary } from "./_components/MdxDetails";
import { Tab as MdxTab, Tabs as MdxTabs } from "./_components/MdxTabs";
import { SubmitChallengeButton } from "./_components/SubmitChallengeButton";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ChallengeId } from "~~/services/database/config/types";
import {
  getAllChallenges,
  getChallengeById,
  getCountOfCompletedChallenge,
} from "~~/services/database/repositories/challenges";
import { fetchGithubChallengeReadme, parseGithubUrl, prepareMdxReadme, splitChallengeReadme } from "~~/services/github";
import { CHALLENGE_METADATA, extractHeadings, generateHeadingId } from "~~/utils/challenges";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const mdxRemoteOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    rehypePlugins: [
      [
        rehypeRaw,
        {
          passThrough: ["mdxJsxFlowElement", "mdxJsxTextElement", "mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"],
        },
      ],
    ],
    remarkPlugins: [remarkGfm],
    format: "mdx",
  },
};

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
  const countOfCompletedChallenge = await getCountOfCompletedChallenge(challenge.id as ChallengeId);

  if (!challenge.github) {
    return <div>No challenge content available</div>;
  }

  const rawReadme = await fetchGithubChallengeReadme(challenge.github);
  const challengeReadme = prepareMdxReadme(rawReadme);
  const { restMdx } = splitChallengeReadme(challengeReadme);
  const { owner, repo, branch } = parseGithubUrl(challenge.github);

  // Extract headings for the sidebar navigation
  const headings = extractHeadings(restMdx);

  // Custom h2 component that adds IDs for anchor navigation
  const createH2WithId = ({ children, ...props }: { children?: ReactNode }) => {
    const text = String(children);
    const id = generateHeadingId(text);
    return createElement("h2", { ...props, id, style: { scrollMarginTop: "80px" } }, children);
  };

  return (
    <div className="relative max-w-[100vw]">
      {challengeReadme ? (
        <>
          <div className="bg-white dark:bg-[#015555] py-10 lg:py-12">
            <div className="challenge-page-shell px-4 lg:px-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
              <div className="hidden lg:block" aria-hidden />
              <div className="min-w-0 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
                <div className="min-w-0 flex-1 max-w-[640px]">
                  <div className="mb-2.5 text-sm font-semibold tracking-[0.1em] text-base-content/70">
                    CHALLENGE #{challenge.sortOrder}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content mb-3 leading-tight">
                    {challenge.challengeName}
                  </h1>
                  <ChallengeSkills skills={staticMetadata?.skills} />
                </div>
                {challenge.previewImage && (
                  <div className="shrink-0 flex justify-center lg:justify-end">
                    <Image
                      src={challenge.previewImage}
                      alt=""
                      width={440}
                      height={330}
                      className="w-full max-w-[300px] lg:max-w-[360px] h-auto object-contain"
                      priority
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="challenge-page-shell px-4 lg:px-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 pt-0 pb-10 lg:pb-14">
            <ChallengeSidebar headings={headings} />

            <main className="min-w-0 max-w-[1040px]">
              <ChallengeHeader
                skillLevel={staticMetadata?.skillLevel}
                timeToComplete={staticMetadata?.timeToComplete}
                helpfulLinks={staticMetadata?.helpfulLinks}
                completedByCount={countOfCompletedChallenge}
              >
                <article className="prose dark:prose-invert max-w-none break-words">
                  <MDXRemote
                    source={restMdx}
                    components={{
                      a: (props: ComponentPropsWithoutRef<"a">) =>
                        createElement("a", { ...props, target: "_blank", rel: "noopener" }),
                      h2: createH2WithId,
                      Tabs: MdxTabs,
                      Tab: MdxTab,
                      Details: MdxDetails,
                      Summary: MdxSummary,
                    }}
                    options={mdxRemoteOptions}
                  />
                </article>

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
                  <div className="w-full">
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

                {challenge.autograding && (
                  <>
                    <ConnectAndRegisterBanner />
                    <SubmitChallengeButton challengeId={challenge.id} />
                  </>
                )}
              </ChallengeHeader>
            </main>
          </div>
        </>
      ) : (
        <div className="px-5 py-8">Failed to load challenge content</div>
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
      {staticMetadata?.isAiReady && challenge.github && (
        <ChatWidget challengeId={challenge.id} github={challenge.github} />
      )}
    </div>
  );
}
