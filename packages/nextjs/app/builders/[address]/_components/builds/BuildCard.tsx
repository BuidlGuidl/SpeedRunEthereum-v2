import Image from "next/image";
import Link from "next/link";
import { DeleteBuildButton } from "./DeleteBuildButton";
import { EditBuildButton } from "./EditBuildButton";
import { LikeBuildButton } from "./LikeBuildButton";
import { Build } from "~~/services/database/repositories/builds";

type Props = {
  ownerAddress: string;
  build: Build;
  likes: string[];
  coBuilders: string[];
};

export const BuildCard = ({ ownerAddress, build, likes, coBuilders }: Props) => {
  return (
    <div className="relative flex flex-col md:h-[400px] bg-base-300 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg dark:bg-base-200">
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <EditBuildButton build={{ ...build, coBuilders }} buildId={build.id} ownerAddress={ownerAddress} />
        <DeleteBuildButton buildId={build.id} ownerAddress={ownerAddress} />
      </div>
      <div className="w-full h-44 flex items-center justify-center relative">
        <Link href={`/builds/${build.id}`} className="w-full h-full block">
          {build.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={build.imageUrl} alt={build.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold bg-base-200 border border-secondary">
              No Image
            </div>
          )}
        </Link>
        {build.bgGrant && (
          <div className="absolute right-4 bottom-0 translate-y-1/2 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-white rounded-full shadow-sm border border-[#D8D8D8]">
              <Image
                src="/assets/sparkle.png"
                alt="BG Grant"
                width={12}
                height={12}
                className="w-3 h-3 object-contain"
              />
              <span className="text-xs font-light text-black">BG Grant</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 px-6 py-4">
        <div className="flex items-start gap-2 mb-2">
          <h2 className="text-xl font-bold leading-tight line-clamp-2 flex-1 min-w-0">{build.name}</h2>
        </div>
        <p className="text-sm my-1 line-clamp-4">{build.desc}</p>
        <div className="flex-1" />
        <div className="flex justify-between items-center pt-2 mt-2 w-full gap-2">
          <Link className="btn btn-sm btn-outline grow" href={`/builds/${build.id}`}>
            View
          </Link>
          <div className="flex items-center gap-1">
            <LikeBuildButton buildId={build.id} likes={likes} />
            <span className="text-base">{likes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
