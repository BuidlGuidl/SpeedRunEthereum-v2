import { HomepageClient } from "./_components/HomepageClient";
import { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Speed Run Ethereum: Learn Solidity Development Through Interactive Challenges",
  description:
    "Learn Solidity development with hands-on blockchain challenges. Build NFTs, DEXs, and more Ethereum smart contracts in our step-by-step tutorial series.",
});

const Home: NextPage = async () => {
  const challenges = await getAllChallenges();

  return <HomepageClient challenges={challenges} />;
};

export default Home;
