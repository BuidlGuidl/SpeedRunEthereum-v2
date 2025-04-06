import Image from "next/image";
import Link from "next/link";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UpgradedToBGCard = ({ user }: { user: NonNullable<UserByAddress> }) => {
  return (
    <div className="flex flex-col mb-8 items-center bg-[url(/assets/bgBanner_castlePlatform.svg)] bg-bottom bg-repeat-x bg-[length:150%_auto] lg:bg-[length:120%_auto] relative overflow-hidden bg-secondary dark:bg-accent min-h-[28rem] rounded-lg">
      <Image
        src="/assets/bgBanner_joinBgClouds.svg"
        alt="Background clouds"
        className="absolute w-full max-w-7xl top-[20%]"
        width={820}
        height={400}
      />

      <div className="flex flex-col items-center gap-4 z-10 mt-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center dark:text-secondary font-display !leading-[1.4]">
          This builder has upgraded
          <br />
          to BuidlGuidl
        </h1>

        <Link
          href={`https://app.buidlguidl.com/builders/${user.userAddress}`}
          target="_blank"
          className="flex gap-2 items-center text-sm sm:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 dark:bg-primary dark:text-secondary dark:border-secondary cursor-pointer hover:bg-base-200 dark:hover:bg-accent transition-colors hover:underline"
        >
          <span className="w-5 h-5 flex items-center justify-center">🏰</span>
          View profile on BuidlGuidl
        </Link>
      </div>
    </div>
  );
};
