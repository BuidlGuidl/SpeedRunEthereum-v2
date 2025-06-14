import { Address, AddressProps } from "./Address";
import { useUser } from "~~/hooks/useUser";

type AddressWithCachedEnsProps = Omit<AddressProps, "cachedEns">;

export const AddressWithCachedEns = ({ address, ...restProps }: AddressWithCachedEnsProps) => {
  const { data: user } = useUser(address);

  return <Address address={address} {...restProps} cachedEns={user?.ens} />;
};
