import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSignMessage } from "wagmi";
import { createUserNote, deleteUserNote, fetchUserNotes } from "~~/services/api/user-notes";
import { notification } from "~~/utils/scaffold-eth";

const QUERY_KEY = "userNotes";

export function useUserNotes(userAddress: string) {
  return useQuery({
    queryKey: [QUERY_KEY, userAddress],
    queryFn: () => fetchUserNotes(userAddress),
    enabled: !!userAddress,
  });
}

export function useCreateUserNote() {
  const queryClient = useQueryClient();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async ({ userAddress, comment }: { userAddress: string; comment: string }) => {
      const message = {
        action: "Create User Note",
        userAddress,
        comment,
      };

      const signature = await signMessageAsync({
        message: JSON.stringify(message),
      });

      return createUserNote({
        address: userAddress,
        signature,
        comment,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.userAddress] });
      notification.success("Note created successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });
}

export function useDeleteUserNote() {
  const queryClient = useQueryClient();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async ({ userAddress, noteId }: { userAddress: string; noteId: number }) => {
      const message = {
        action: "Delete User Note",
        noteId: noteId.toString(),
      };

      const signature = await signMessageAsync({
        message: JSON.stringify(message),
      });

      return deleteUserNote(userAddress, noteId, {
        address: userAddress,
        signature,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.userAddress] });
      notification.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });
}
