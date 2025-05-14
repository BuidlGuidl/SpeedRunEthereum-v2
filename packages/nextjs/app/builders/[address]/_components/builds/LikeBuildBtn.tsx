"use client";

import { useAccount } from "wagmi";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useBuildLike } from "~~/hooks/useBuildLike";

type LikeBuildBtnProps = {
  buildId: string;
  likes: string[];
};

export const LikeBuildBtn = ({ buildId, likes }: LikeBuildBtnProps) => {
  const { address: connectedAddress } = useAccount();
  const { likeBuildMutation, isPending } = useBuildLike();

  const isLiked = connectedAddress && likes.includes(connectedAddress);

  return (
    <button onClick={() => likeBuildMutation({ buildId, action: isLiked ? "unlike" : "like" })} disabled={isPending}>
      {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIconOutline className="h-5 w-5" />}
    </button>
  );
};
