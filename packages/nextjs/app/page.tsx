import { ChallengeExpandedCard } from "./_components/ChallengeExpandedCard";
import { Hero } from "./_components/Hero";
import { JoinBGCard } from "./_components/JoinBGCard";
import { NextPage } from "next";
import { ChallengeId } from "~~/services/database/config/types";
import { findUserChallengesByAddress } from "~~/services/database/repositories/userChallenges";
import { findUserByAddress } from "~~/services/database/repositories/users";

const Home: NextPage = async () => {
  const user = (await findUserByAddress("0x45334F41aAA464528CD5bc0F582acadC49Eb0Cd1"))[0];

  const userChallenges = (await findUserChallengesByAddress(user.userAddress)).filter(
    userChallenge => userChallenge.reviewAction,
  );

  return (
    <div>
      <Hero firstChallengeId={ChallengeId.SIMPLE_NFT_EXAMPLE} />
      <div className="bg-base-200">
        <ChallengeExpandedCard
          key={ChallengeId.SIMPLE_NFT_EXAMPLE}
          challengeId={ChallengeId.SIMPLE_NFT_EXAMPLE}
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.DECENTRALIZED_STAKING}
          challengeId={ChallengeId.DECENTRALIZED_STAKING}
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.TOKEN_VENDOR}
          challengeId={ChallengeId.TOKEN_VENDOR}
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.DICE_GAME}
          challengeId={ChallengeId.DICE_GAME}
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.MINIMUM_VIABLE_EXCHANGE}
          challengeId={ChallengeId.MINIMUM_VIABLE_EXCHANGE}
          userChallenges={userChallenges}
        />

        <JoinBGCard userChallenges={userChallenges} user={user} />

        <ChallengeExpandedCard
          key={ChallengeId.STATE_CHANNELS}
          challengeId={ChallengeId.STATE_CHANNELS}
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.MULTISIG}
          challengeId={ChallengeId.MULTISIG}
          userChallenges={userChallenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.SVG_NFT}
          challengeId={ChallengeId.SVG_NFT}
          userChallenges={userChallenges}
        />
      </div>
    </div>
  );
};

export default Home;
