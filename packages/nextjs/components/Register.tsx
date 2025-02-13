import { useUserRegister } from "~~/hooks/useUserRegister";

export const RegisterButton = () => {
  const { register, isRegistering } = useUserRegister();

  return (
    <button className="btn btn-primary btn-sm" onClick={register} disabled={isRegistering}>
      {isRegistering ? <span className="loading loading-spinner loading-sm"></span> : "Register"}
    </button>
  );
};
