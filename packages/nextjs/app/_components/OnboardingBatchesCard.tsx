import { Space_Mono } from "next/font/google";
import Image from "next/image";
import JoinBatchButton from "./JoinBatchButton";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { UserByAddress } from "~~/services/database/repositories/users";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
});

export const OnboardingBatchesCard = ({
  userChallenges = [],
  user,
}: {
  userChallenges?: UserChallenges;
  user?: UserByAddress;
}) => {
  return (
    <div className="flex justify-center bg-[url(/assets/bgBanner_train.svg)] bg-bottom bg-repeat-x bg-[length:150%_auto] lg:bg-auto relative overflow-hidden bg-[#EBFFA9]">
      <Image
        src="/assets/bgBanner_joinBatchClouds.svg"
        alt="bgBanner_joinBatchClouds"
        className="z-50 absolute w-full max-w-7xl top-[5%]"
        width={820}
        height={400}
      />
      <div className="max-w-7xl py-8 mx-10 w-full sm:mx-14 pl-10 border-l-[3px] sm:border-l-[5px] border-primary relative space-y-4 min-h-[28rem] lg:min-h-[32rem]">
        <div className="flex justify-center relative mt-2 lg:mt-8">
          <Image
            src="/assets/bgBanner_OnboardingBatches.svg"
            // workaround to avoid console warnings
            className="max-w-[560px] w-full"
            width={0}
            height={0}
            alt="bgBanner_OnboardingBatches"
          />
        </div>
        <div className="flex flex-col w-full items-center">
          <p className={`mb-4 text-black text-center lg:max-w-[450px] ${spaceMono.className}`}>
            Dive intro end-to-end dApp development, receive mentorship from BG members, and learn how to collaborate
            with fellow developers in open‑source projects.
          </p>
          <div className="mt-2 flex items-center">
            <JoinBatchButton user={user} userChallenges={userChallenges} />
          </div>
        </div>
        <span className="absolute h-5 w-5 rounded-full bg-base-300 border-primary border-4 top-[22%] lg:top-[30%] -left-[11px] sm:-left-[13px]" />

        <Image
          className="absolute h-6 w-5 bg-no-repeat bg-[20px_auto] top-[22%] lg:top-[30%] -left-[38px] sm:-left-[40px]"
          src="/assets/vault_icon.svg"
          alt="/assets/vault_icon.svg"
          width={24}
          height={20}
        />
      </div>
    </div>
  );
};
