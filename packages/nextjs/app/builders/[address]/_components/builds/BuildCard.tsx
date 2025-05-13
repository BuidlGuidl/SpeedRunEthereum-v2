import { EditBuildBtn } from "./EditBuildBtn";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Build } from "~~/services/database/repositories/builds";

type Props = {
  build: Build;
  likes: string[];
  coBuilders: string[];
  onDelete?: () => void;
  onView?: () => void;
};

export const BuildCard = ({ build, likes, coBuilders, onDelete, onView }: Props) => {
  return (
    <div className="relative flex flex-col w-72 h-[400px] bg-base-300 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg">
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <EditBuildBtn build={{ ...build, coBuilders }} buildId={build.id} />
        <button
          className="bg-base-100 rounded-lg p-2 hover:bg-base-200 transition"
          onClick={onDelete}
          aria-label="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="w-full h-44 flex items-center justify-center">
        {build.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={build.imageUrl} alt={build.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold bg-base-200 border border-secondary">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 px-6 py-4">
        <h2 className="text-xl font-bold mb-2 leading-tight">{build.name}</h2>
        <p className="text-sm my-1 line-clamp-4">{build.desc}</p>
        <div className="flex-1" />
        <div className="flex justify-between items-center pt-2 mt-2">
          <button className="btn btn-primary btn-sm" onClick={onView}>
            View
          </button>
          <div className="flex items-center gap-1">
            <HeartIcon className="h-5 w-5 text-red-400" />
            <span className="text-base">{likes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
