import { ChallengeExpandedCard } from "./_components/ChallengeExpandedCard";
import { Hero } from "./_components/Hero";
import { JoinBGCard } from "./_components/JoinBGCard";
import { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { findUserChallengesByAddress } from "~~/services/database/repositories/userChallenges";
import { findUserByAddress } from "~~/services/database/repositories/users";

const Home: NextPage = async () => {
  const user = (await findUserByAddress("0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1"))[0];
  const challenges = await getAllChallenges();

  const userChallenges = (await findUserChallengesByAddress(user.userAddress)).filter(
    userChallenge => userChallenge.reviewAction,
  );

  return (
    <div>
      <Hero firstChallengeId={challenges[0].id} />
      <div className="bg-base-200">
        <ChallengeExpandedCard
          key="simple-nft-example"
          challengeId="simple-nft-example"
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key="decentralized-staking"
          challengeId="decentralized-staking"
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard key="token-vendor" challengeId="token-vendor" userChallenges={userChallenges} />
        <ChallengeExpandedCard key="dice-game" challengeId="dice-game" userChallenges={userChallenges} />
        <ChallengeExpandedCard
          key="minimum-viable-exchange"
          challengeId="minimum-viable-exchange"
          userChallenges={userChallenges}
        />

        <JoinBGCard userChallenges={userChallenges} user={user} />

        <ChallengeExpandedCard key="state-channels" challengeId="state-channels" userChallenges={userChallenges} />
        <ChallengeExpandedCard key="multisig" challengeId="multisig" userChallenges={userChallenges} />
        <ChallengeExpandedCard key="svg-nft" challengeId="svg-nft" userChallenges={userChallenges} />
      </div>
    </div>
  );
};

export default Home;
