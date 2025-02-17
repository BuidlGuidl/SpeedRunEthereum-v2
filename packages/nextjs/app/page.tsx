import Link from "next/link";
import type { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/respositories/challenges";

const Home: NextPage = async () => {
  const allChallenges = await getAllChallenges();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        {allChallenges.map(challenge => (
          <Link href={`/challenge/${challenge.challengeCode}`} key={challenge.challengeCode} className="link">
            {challenge.challengeName}
          </Link>
        ))}
      </div>
    </>
  );
};

export default Home;
