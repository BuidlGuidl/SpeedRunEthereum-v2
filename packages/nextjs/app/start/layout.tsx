import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Build your first Apps on Ethereum",
  description:
    "Build your first Ethereum apps with hands-on challenges. Learn smart contracts and dapp development through real, practical experience.",
});

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
