import Link from "next/link";
import type { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/respositories/challenges";

const Home: NextPage = async () => {
  const challenges = await getAllChallenges();
  return (
    <>
      <div className="flex items-center flex-col gap-2 flex-grow pt-10">
        {challenges.map(challenge => (
          <Link key={challenge.id} href={`/challenge/${challenge.id}`} className="link">
            {challenge.id}
          </Link>
        ))}
      </div>
    </>
  );
};

export default Home;
