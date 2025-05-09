import { HeartIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Build } from "~~/services/database/repositories/builds";

type Props = {
  build: Build;
  coBuilders: string[];
  likes: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
};

export const BuildCard = ({ build, coBuilders, likes, onEdit, onDelete, onView }: Props) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl relative">
      {/* Top-right action buttons */}
      <div className="absolute right-2 top-2 flex gap-2 z-10">
        <button className="btn btn-square btn-sm btn-ghost" onClick={onEdit}>
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button className="btn btn-square btn-sm btn-ghost" onClick={onDelete}>
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      {/* Image */}
      {build.imageUrl && (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={build.imageUrl} alt={build.name} className="h-40 w-full object-cover" />
        </figure>
      )}
      {/* Card body */}
      <div className="card-body">
        <h2 className="card-title">{build.name}</h2>
        <p className="text-sm">{build.desc}</p>
        {coBuilders.length > 0 && (
          <div className="text-xs mt-2">
            <span className="font-semibold">Co-Builders:</span> {coBuilders.join(", ")}
          </div>
        )}
        <div className="card-actions mt-4 flex justify-between items-center">
          <button className="btn btn-outline btn-primary" onClick={onView}>
            View
          </button>
          <div className="flex items-center gap-1">
            <HeartIcon className="h-5 w-5 text-error" />
            <span>{likes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
