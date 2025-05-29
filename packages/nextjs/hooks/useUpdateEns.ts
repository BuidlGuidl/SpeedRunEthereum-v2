import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notification } from "~~/utils/scaffold-eth";

export function useUpdateEns({ address, enabled }: { address?: string; enabled: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: updateEns, isPending: isUpdatingEns } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${address}/update-ens`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update ENS");
      }

      return response.json();
    },
    onSuccess: user => {
      queryClient.setQueryData(["user", address], user);
      router.refresh();
      notification.success("ENS updated successfully!");
    },
    onError: (error: Error) => {
      console.error("ENS update error:", error);
    },
  });

  useEffect(() => {
    if (enabled) {
      try {
        updateEns();
      } catch (error) {
        console.error("Error during ENS update:", error);
        notification.error("Failed to update ENS. Please try again.");
      }
    }
  }, [enabled, updateEns, address]);

  return {
    isUpdatingEns,
  };
}
