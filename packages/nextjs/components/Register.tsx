// components/scaffold-eth/RegisterButton.tsx
import { useAccount, useSignTypedData } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { EIP_712_DOMAIN, EIP_712_TYPES__USER_REGISTER } from "~~/utils/eip712";
import { notification } from "~~/utils/scaffold-eth";

export const RegisterButton = () => {
  const { address } = useAccount();
  const { register, isRegistering } = useUser();
  const { signTypedDataAsync } = useSignTypedData();

  const handleSignUp = async () => {
    if (!address) return;

    try {
      const typedData = {
        domain: EIP_712_DOMAIN,
        types: EIP_712_TYPES__USER_REGISTER,
        primaryType: "Message",
        message: {
          action: "Register",
          description: "I would like to register as a builder in speedrunethereum.com signing this offchain message",
        },
      } as const;

      const signature = await signTypedDataAsync(typedData);

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
