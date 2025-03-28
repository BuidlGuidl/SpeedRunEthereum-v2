import Link from "next/link";

type AddressLinkWrapperProps = {
  children: React.ReactNode;
  disableAddressLink?: boolean;
  address: string;
};

export const AddressLinkWrapper = ({ children, disableAddressLink, address }: AddressLinkWrapperProps) => {
  return disableAddressLink ? <>{children}</> : <Link href={`/builders/${address}`}>{children}</Link>;
};
