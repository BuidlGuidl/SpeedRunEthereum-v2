import Image from "next/image";
import Link from "next/link";

type BuildIdea = {
  name: string;
  description: string;
  imageUrl?: string;
};

export function BuildIdeas({ buildIdeas }: { buildIdeas: BuildIdea[] }) {
  return (
    <div>
      <p className="m-0 font-medium">
        Showcase your Ethereum builds and share them with the community! Get +5 XP for the first build you submit.
      </p>
      <p className="mt-2 mb-0">
        If you&apos;re just getting started or looking for your next idea, check out our{" "}
        <Link href="/build-prompts" className="link">
          AI-ready build prompts
        </Link>
        .
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {buildIdeas.map(build => (
          <Link
            key={build.name}
            href="/build-prompts"
            className="bg-base-300 rounded-lg shadow-md overflow-hidden [&_img]:opacity-50 [&_img]:hover:opacity-100 text-base-content/50 hover:text-base-content hover:shadow-lg dark:bg-base-200"
          >
            {build.imageUrl && (
              <div className="pt-5 pb-4 w-full flex items-center justify-center bg-base-200">
                <Image alt={build.name} src={build.imageUrl} width={652} height={401} className="w-3/4 mx-auto" />
              </div>
            )}
            <div className="flex flex-col flex-1 px-6 py-4">
              <h2 className="text-xl font-bold mb-2 leading-tight">{build.name}</h2>
              <p className="text-sm my-1">{build.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
