import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { updateLocation } from "~~/services/api/users";
import { UserLocation } from "~~/services/database/repositories/users";
import { EIP_712_TYPED_DATA__UPDATE_LOCATION } from "~~/services/eip712/location";
import { notification } from "~~/utils/scaffold-eth";

export const useUpdateLocation = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutateAsync: updateLocationMutation, isPending } = useMutation({
    mutationFn: async (location: UserLocation) => {
      if (!address) throw new Error("Wallet not connected");

      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      const message = {
        ...EIP_712_TYPED_DATA__UPDATE_LOCATION.message,
        location: location || "",
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__UPDATE_LOCATION,
        message,
      });
      notification.remove(loadingNotificationId);

      return updateLocation({
        location: location || null,
        userAddress: address,
        signature,
      });
    },
    onSuccess: () => {
      notification.success("Location updated successfully");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return {
    updateLocation: updateLocationMutation,
    isPending,
  };
};
