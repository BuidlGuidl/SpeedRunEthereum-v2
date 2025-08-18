import { useSignTypedData } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

/**
 * Hook to handle signature with loading notification
 * @returns signWithNotification function that takes typedData and optional loading message
 */
export function useSignatureWithNotification() {
  const { signTypedDataAsync } = useSignTypedData();

  const signWithNotification = async (
    typedData: any,
    loadingMessage = "Awaiting for Wallet signature...",
  ): Promise<`0x${string}`> => {
    const loadingNotificationId = notification.loading(loadingMessage);

    try {
      const signature = await signTypedDataAsync(typedData);
      return signature;
    } finally {
      notification.remove(loadingNotificationId);
    }
  };

  return { signWithNotification };
}
