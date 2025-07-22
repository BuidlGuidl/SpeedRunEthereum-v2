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
    <div className="relative flex flex-col md:h-[400px] bg-base-300 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg">
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <EditBuildButton build={{ ...build, coBuilders }} buildId={build.id} ownerAddress={ownerAddress} />
        <DeleteBuildButton buildId={build.id} ownerAddress={ownerAddress} />
      </div>
      <div className="w-full h-44 flex items-center justify-center">
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
      </div>
      <div className="flex flex-col flex-1 px-6 py-4">
        <h2 className="text-xl font-bold mb-2 leading-tight line-clamp-2">{build.name}</h2>
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
