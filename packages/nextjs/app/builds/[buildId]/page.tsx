import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { LikeBuildButton } from "~~/app/builders/[address]/_components/builds/LikeBuildButton";
import { Address } from "~~/components/scaffold-eth";
import { getBuildByBuildId } from "~~/services/database/repositories/builds";
import { fetchGithubBuildReadme } from "~~/services/github";

export default async function BuildPage(props: { params: Promise<{ buildId: string }> }) {
  const params = await props.params;
  const { buildId } = params;
  const build = await getBuildByBuildId(buildId);

  const buildReadme = build?.githubUrl && (await fetchGithubBuildReadme(build.githubUrl));
  const buildLikesAddress = build?.likes.map(like => like.userAddress) || [];

  return (
    <div className="flex flex-col items-center py-8 px-5 xl:p-12 relative max-w-[100vw]">
      <div className="flex flex-col bg-base-100 rounded-lg w-full lg:max-w-[950px]">
        <div className="flex flex-col md:flex-row justify-between gap-4 p-6">
          <div className="flex flex-col space-y-3 items-center md:items-start text-center md:text-left">
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
                <LikeBuildButton buildId={buildId} likes={buildLikesAddress} />
                <span className="text-base">{buildLikesAddress.length}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-4 w-full">
              <p className="line-clamp-4">{build?.desc}</p>
              {build?.bgGrant && (
                <div className="inline-flex self-center md:self-start flex-wrap items-center justify-center md:justify-start gap-2 px-3 py-2 bg-[#E2E5FD] text-black rounded-xl text-center w-full md:w-auto">
                  <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-white rounded-full shadow-sm border-[1px] border-[#D8D8D8] whitespace-nowrap shrink-0">
                    <Image
                      src="/assets/sparkle.png"
                      alt="BG Grant"
                      width={20}
                      height={20}
                      className="w-4 h-4 object-contain"
                    />
                    <span className="text-xs md:text-sm font-light text-black">BG Grant</span>
                  </div>
                  <span className="text-xs md:text-sm font-medium whitespace-normal break-words max-w-[340px] sm:max-w-[480px] md:max-w-none text-center md:text-left">
                    This project received a{" "}
                    <Link
                      href="https://grants.buidlguidl.com/completed-grants"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      small grant
                    </Link>{" "}
                    from BuidlGuidl
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {build?.imageUrl ? (
              <div className="w-[290px] h-[200px] flex items-center justify-center border-2 border-primary rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={build?.imageUrl} alt={build?.name} className="w-full h-full object-cover rounded-lg" />
              </div>
            ) : (
              <div className="w-[250px] h-[200px] rounded-lg bg-base-300 dark:bg-base-200">
                <div className="w-full h-full flex items-center justify-center text-lg font-bold">No Image</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex mt-5 flex-wrap gap-4 w-full justify-center lg:justify-start p-6 bg-base-300 dark:bg-primary-content">
          {build?.builders.map(builder => (
            <Address
              key={builder.userAddress}
              address={builder.userAddress}
              cachedEns={builder.user.ens}
              cachedEnsAvatar={builder.user.ensAvatar}
            />
          ))}
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
