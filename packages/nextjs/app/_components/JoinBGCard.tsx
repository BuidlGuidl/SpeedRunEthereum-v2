import Image from "next/image";
import JoinBGButton from "./JoinBGButton";
import { getChallengeDependenciesInfo } from "./utils";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { UserByAddress } from "~~/services/database/repositories/users";

// TODO: use later
// "buidl-guidl": {,
//   label: "Eligible to join 🏰️ BuidlGuidl",
//   previewImage: "assets/bg.png",
//   externalLink: {
//     link: "https://buidlguidl.com/",
//   },
// },

const JOIN_BG_DEPENDENCIES = [
  "simple-nft-example",
  "decentralized-staking",
  "token-vendor",
  "dice-game",
  "minimum-viable-exchange",
];

export const JoinBGCard = ({ userChallenges, user }: { userChallenges: UserChallenges; user: UserByAddress }) => {
  const { completed: builderHasCompletedDependenciesChallenges, lockReasonToolTip } = getChallengeDependenciesInfo({
    dependencies: JOIN_BG_DEPENDENCIES,
    userChallenges,
  });

  return (
    <div className="flex justify-center bg-[url(/assets/bgBanner_castlePlatform.svg)] bg-bottom bg-repeat-x bg-[length:150%_auto] lg:bg-auto relative overflow-hidden bg-accent">
      <Image
        src="/assets/bgBanner_joinBgClouds.svg"
        alt="bgBanner_joinBgClouds"
        className="z-50 absolute w-full max-w-7xl top-[5%]"
        width={820}
        height={400}
      />
      <div className="max-w-7xl py-8 mx-14 pl-10 border-l-[5px] border-primary relative space-y-16 lg:space-y-32 min-h-[28rem] lg:min-h-[32rem]">
        <div className="flex justify-center relative mt-2 lg:mt-8">
          <Image
            src="/assets/bgBanner_JoinBG.svg"
            // workaround to avoid console warnings
            className="max-w-[820px] w-full"
            width={0}
            height={0}
            alt="bgBanner_JoinBG"
          />
        </div>
        <div className="flex flex-col lg:flex-row justify-between">
          <p className="mb-4 text-[#026262] text-center lg:text-left lg:max-w-[35%]">
            The BuidlGuidl is a curated group of Ethereum builders creating products, prototypes, and tutorials to
            enrich the web3 ecosystem. A place to show off your builds and meet other builders. Start crafting your Web3
            portfolio by submitting your DEX, Multisig or SVG NFT build.
          </p>
          <div className="flex items-center self-end">
            <JoinBGButton
              isLocked={!builderHasCompletedDependenciesChallenges}
              user={user}
              lockReasonToolTip={lockReasonToolTip}
            />
          </div>
        </div>
        <span className="absolute h-5 w-5 rounded-full bg-base-300 border-primary border-4 top-[22%] lg:top-[30%] -left-[13px]" />

        <Image
          className="absolute h-6 w-5 bg-no-repeat bg-[20px_auto] top-[22%] lg:top-[30%] -left-[40px]"
          src="/assets/vault_icon.svg"
          alt="/assets/vault_icon.svg"
          width={24}
          height={20}
        />
      </div>
    </div>
  );
};
