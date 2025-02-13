// components/scaffold-eth/RegisterButton.tsx
import { useAccount, useSignTypedData } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { EIP_712_TYPED_DATA__USER_REGISTER } from "~~/utils/eip712/register";
import { notification } from "~~/utils/scaffold-eth";

export const RegisterButton = () => {
  const { address } = useAccount();
  const { register, isRegistering } = useUser();
  const { signTypedDataAsync } = useSignTypedData();

  const handleSignUp = async () => {
    if (!address) return;

    try {
      const signature = await signTypedDataAsync(EIP_712_TYPED_DATA__USER_REGISTER);

      register({ address, signature });
    } catch (error) {
      console.error("Error during signature:", error);
      notification.error("Failed to sign message. Please try again.");
    }
  };

  return (
    <button className="btn btn-primary btn-sm" onClick={handleSignUp} disabled={isRegistering}>
      {isRegistering ? <span className="loading loading-spinner loading-sm"></span> : "Register"}
    </button>
  );
};
