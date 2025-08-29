import { useAccount } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useUpdateOnchainData } from "~~/hooks/useUpdateOnchainData";
import { UserByAddress } from "~~/services/database/repositories/users";

export const RefreshEnsButton = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const { address } = useAccount();
  const { handleUpdateOnchainData, isUpdating } = useUpdateOnchainData();
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  if (!isProfileOwner) {
    return null;
  }

  return (
    <button
      className="btn-ghost hover:bg-transparent hover:opacity-80 tooltip"
      onClick={handleUpdateOnchainData}
      disabled={isUpdating}
      data-tip={`${isUpdating ? "Updating profile..." : "Refresh ENS and side quests from on-chain data"}`}
    >
      <ArrowPathIcon className={`w-4 h-4 ${isUpdating ? "animate-spin opacity-50" : ""}`} />
    </button>
  );
};
