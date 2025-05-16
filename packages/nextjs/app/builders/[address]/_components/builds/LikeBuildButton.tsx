"use client";

import { useAccount } from "wagmi";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useBuildLike } from "~~/hooks/useBuildLike";
import { notification } from "~~/utils/scaffold-eth";

type LikeBuildBtnProps = {
  buildId: string;
  likes: string[];
};

export const LikeBuildButton = ({ buildId, likes }: LikeBuildBtnProps) => {
  const { address: connectedAddress } = useAccount();
  const isLiked = connectedAddress && likes.includes(connectedAddress);

  const { likeBuildMutation, isPending } = useBuildLike({
    onSuccess: () => {
      notification.success(`Build ${isLiked ? "unliked" : "liked"} successfully!`);
    },
  });

  return (
    <button onClick={() => likeBuildMutation({ buildId, action: isLiked ? "unlike" : "like" })} disabled={isPending}>
      {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIconOutline className="h-5 w-5" />}
    </button>
  );
};
