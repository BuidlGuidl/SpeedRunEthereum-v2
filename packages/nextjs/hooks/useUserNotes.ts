import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useSignatureWithNotification } from "~~/hooks/useSignatureWithNotification";
import { createUserNote, deleteUserNote, fetchUserNotes } from "~~/services/api/user-notes";
import {
  EIP_712_TYPED_DATA__CREATE_USER_NOTE,
  EIP_712_TYPED_DATA__DELETE_USER_NOTE,
} from "~~/services/eip712/userNotes";
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
  const { address } = useAccount();
  const { signWithNotification } = useSignatureWithNotification();

  const { mutateAsync: createUserNoteMutation, isPending } = useMutation({
    mutationFn: async ({ userAddress, comment }: { userAddress: string; comment: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const message = {
        ...EIP_712_TYPED_DATA__CREATE_USER_NOTE.message,
        userAddress,
        comment,
      };

      const signature = await signWithNotification({
        ...EIP_712_TYPED_DATA__CREATE_USER_NOTE,
        message,
      });

      return createUserNote({
        address,
        signature,
        comment,
        userAddress,
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

  return { createUserNote: createUserNoteMutation, isPending };
}

export function useDeleteUserNote() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { signWithNotification } = useSignatureWithNotification();

  const { mutateAsync: deleteUserNoteMutation, isPending } = useMutation({
    mutationFn: async ({ userAddress, noteId }: { userAddress: string; noteId: number }) => {
      if (!address) throw new Error("Wallet not connected");

      const message = {
        ...EIP_712_TYPED_DATA__DELETE_USER_NOTE.message,
        noteId: noteId.toString(),
      };

      const signature = await signWithNotification({
        ...EIP_712_TYPED_DATA__DELETE_USER_NOTE,
        message,
      });

      return deleteUserNote(userAddress, noteId, {
        address,
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

  return { deleteUserNote: deleteUserNoteMutation, isPending };
}
