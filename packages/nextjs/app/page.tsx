import { HomepageClient } from "./_components/HomepageClient";
import { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/repositories/challenges";

const Home: NextPage = async () => {
  const challenges = await getAllChallenges();

  return <HomepageClient challenges={challenges} />;
};

export default Home;
