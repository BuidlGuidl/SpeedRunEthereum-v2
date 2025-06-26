import { useAccount } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useUpdateEns } from "~~/hooks/useUpdateEns";
import { UserByAddress } from "~~/services/database/repositories/users";

export const RefreshEnsButton = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const { address } = useAccount();
  const { handleUpdateEns, isUpdatingEns } = useUpdateEns();
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  if (!isProfileOwner) {
    return null;
  }

  return (
    <button
      className="btn-ghost hover:bg-transparent hover:opacity-80 tooltip"
      onClick={handleUpdateEns}
      disabled={isUpdatingEns}
      data-tip={`${isUpdatingEns ? "Updating ENS..." : "Refresh ENS from ENS records"}`}
    >
      <ArrowPathIcon className={`w-4 h-4 ${isUpdatingEns ? "animate-spin opacity-50" : ""}`} />
    </button>
  );
};
