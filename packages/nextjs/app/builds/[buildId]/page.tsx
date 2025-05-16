import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { LikeBuildBtn } from "~~/app/builders/[address]/_components/builds/LikeBuildBtn";
import { Address } from "~~/components/scaffold-eth";
import { getBuildByBuildId } from "~~/services/database/repositories/builds";
import { fetchGithubBuildReadme } from "~~/services/github";

export default async function BuildPage({ params }: { params: { buildId: string } }) {
  const { buildId } = params;
  const build = await getBuildByBuildId(buildId);

  const buildReadme = build?.githubUrl && (await fetchGithubBuildReadme(build.githubUrl));
  const buildLikesAddress = build?.likes.map(like => like.userAddress) || [];

  return (
    <div className="flex flex-col items-center py-8 px-5 xl:p-12 relative max-w-[100vw]">
      <div className="flex flex-col  bg-base-100 rounded-lg p-6 w-full lg:max-w-[1000px]">
        <div className="flex justify-between">
          <div className="flex flex-col space-y-3">
            <h1 className="text-2xl font-bold">{build?.name}</h1>
            <div className="flex space-x-3">
              {build?.githubUrl && (
                <Link href={build?.githubUrl} target="_blank" className="btn btn-sm btn-outline">
                  Code <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              )}
              {build?.demoUrl && (
                <Link href={build?.demoUrl} target="_blank" className="btn btn-sm btn-outline">
                  Demo <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              )}
              <div className="flex items-center gap-1">
                <LikeBuildBtn buildId={buildId} likes={buildLikesAddress} />
                <span className="text-base">{buildLikesAddress.length}</span>
              </div>
            </div>
            <p className="line-clamp-4 mt-4">{build?.desc}</p>
          </div>
          <div className="border-2 border-primary rounded-lg">
            {build?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={build?.imageUrl} alt={build?.name} className="w-[325px] h-[200px] rounded-lg" />
            ) : (
              <div className="w-[250px] h-[200px] rounded-lg bg-base-300 dark:bg-base-200">
                <div className="w-full h-full flex items-center justify-center text-lg font-bold">No Image</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3 mt-5">
          {build?.builders.map(builder => <Address key={builder.userAddress} address={builder.userAddress} />)}
        </div>
      </div>

      {buildReadme && (
        <div className="prose dark:prose-invert max-w-fit break-words lg:max-w-[850px] mt-12">
          <MDXRemote
            source={buildReadme}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeRaw],
                remarkPlugins: [remarkGfm],
                format: "md",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
