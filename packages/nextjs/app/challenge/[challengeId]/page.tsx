import { notFound } from "next/navigation";
import { SubmitChallengeButton } from "./_components/SubmitChallengeButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ChallengeId } from "~~/services/database/config/types";
import { getAllChallenges, getChallengeById } from "~~/services/database/repositories/challenges";
import { fetchGithubReadme, parseGithubUrl } from "~~/services/github";
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

  if (!challenge) return {};

  return getMetadata({
    title: challenge.challengeName,
    description: challenge.description,
    imageRelativePath: challenge.previewImage || undefined,
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

  const challengeReadme = await fetchGithubReadme(challenge.github);
  const { owner, repo, branch } = parseGithubUrl(challenge.github);

  return (
    <div className="flex flex-col items-center py-8 px-5 xl:p-12 relative max-w-[100vw]">
      {/* Useful resources section at the top */}
      {challenge.id === "simple-nft-example" && (
        <div className="w-full max-w-[850px] mb-6">
          <h2 className="text-lg font-semibold mb-2">Useful resources</h2>
          <ul className="list-disc list-inside">
            <li>
              <a href="/guides/erc721-vs-erc1155" className="underline text-primary">
                ERC721 vs. ERC1155 – Choosing the Right NFT Standard
              </a>
            </li>
            <li>
              <a href="/guides/mastering-erc721" className="underline text-primary">
                Mastering ERC721: A Deep Dive into NFT Standards, Metadata, and tokenURI Management
              </a>
            </li>
            <li>
              <a href="/guides/nft-use-cases" className="underline text-primary">
                NFTs in Web3: Understanding Use Cases Beyond Digital Art
              </a>
            </li>
            <li>
              <a href="/guides/solidity-nft-security" className="underline text-primary">
                Solidity NFT Security: 10 Best Practices to Protect Your Collectibles
              </a>
            </li>
          </ul>
        </div>
      )}
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
          {/* Guide Link for Challenge 0 */}
          {challenge.id === "simple-nft-example" && (
            <>
              <div className="max-w-[850px] w-full mx-auto">
                <div className="mt-6 mb-2 font-semibold text-left">Related guides</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-2">
                  {/* ERC721 vs. ERC1155 */}
                  <div className="p-4 border rounded bg-base-200 dark:bg-base-300">
                    <a href="/guides/erc721-vs-erc1155" className="text-primary underline font-semibold">
                      ERC721 vs. ERC1155 – Choosing the Right NFT Standard
                    </a>
                  </div>
                  {/* Mastering ERC721 */}
                  <div className="p-4 border rounded bg-base-200 dark:bg-base-300">
                    <a href="/guides/mastering-erc721" className="text-primary underline font-semibold">
                      Mastering ERC721: A Deep Dive into NFT Standards, Metadata, and tokenURI Management
                    </a>
                  </div>
                  {/* NFT Use Cases */}
                  <div className="p-4 border rounded bg-base-200 dark:bg-base-300">
                    <a href="/guides/nft-use-cases" className="text-primary underline font-semibold">
                      NFTs in Web3: Understanding Use Cases Beyond Digital Art
                    </a>
                  </div>
                  {/* Solidity NFT Security */}
                  <div className="p-4 border rounded bg-base-200 dark:bg-base-300">
                    <a href="/guides/solidity-nft-security" className="text-primary underline font-semibold">
                      Solidity NFT Security: 10 Best Practices to Protect Your Collectibles
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div>Failed to load challenge content</div>
      )}
      <SubmitChallengeButton challengeId={challenge.id} />
    </div>
  );
}
