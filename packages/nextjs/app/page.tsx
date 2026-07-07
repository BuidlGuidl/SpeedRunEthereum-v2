import { HomepageClient } from "./_components/HomepageClient";
import { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { getHomepageStructuredData } from "~~/utils/structuredData";

export const metadata = getMetadata({
  title: "Speedrun Ethereum: Learn Solidity Development Through Interactive Challenges",
  description:
    "Learn Solidity development with hands-on blockchain challenges. Build NFTs, DEXs, and more Ethereum smart contracts in our step-by-step tutorial series.",
});

const Home: NextPage = async () => {
  const challenges = await getAllChallenges();
  const structuredData = getHomepageStructuredData(challenges);

  return (
    <>
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <HomepageClient challenges={challenges} />
    </>
  );
};

export default Home;
