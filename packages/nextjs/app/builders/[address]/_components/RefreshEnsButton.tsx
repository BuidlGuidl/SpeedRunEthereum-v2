import { useAccount } from "wagmi";
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
    <button className="btn btn-xs btn-outline w-full" onClick={handleUpdateEns} disabled={isUpdatingEns}>
      {isUpdatingEns ? <span className="loading loading-spinner loading-xs"></span> : "Refresh ENS"}
    </button>
  );
};
