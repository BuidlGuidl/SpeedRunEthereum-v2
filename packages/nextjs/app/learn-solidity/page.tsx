import Image from "next/image";
import { CurriculumSection } from "~~/app/learn-solidity/_components/CurriculumSection";
import { FaqSection } from "~~/app/learn-solidity/_components/FaqSection";
import { HeroSection } from "~~/app/learn-solidity/_components/HeroSection";
import { WhyWorks } from "~~/app/learn-solidity/_components/WhyWorks";
import { ConnectAndRegisterSection } from "~~/app/start/_components/ConnectAndRegisterSection";
import { SpaceshipIcon } from "~~/app/start/_components/Icons";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getAllGuides } from "~~/services/guides";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = {
  ...getMetadata({
    title: "Learn Solidity with our free Web3 Developer Course",
    description:
      "Master Solidity with a guided curriculum, real-world challenges, and curated guides. Learn by building on Ethereum.",
  }),
  alternates: { canonical: "/learn-solidity" },
};

export default async function LearnSolidityPage() {
  const [challenges] = await Promise.all([getAllChallenges(), getAllGuides()]);

  return (
    <div className="bg-base-200">
      <HeroSection />
      <CurriculumSection challenges={challenges} />
      <WhyWorks />
      <FaqSection />
      <div className="mt-14 lg:mt-12 relative h-[130px]">
        <div className="absolute inset-0 bg-[url('/assets/start/separation-trees.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
        <div className="bg-base-200 absolute inset-0 top-auto w-full h-24" />
      </div>
      <section className="bg-base-200 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <div className="mb-12 flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:justify-center">
            <SpaceshipIcon />
            <h2 className="m-0 text-center text-2xl font-medium md:text-4xl">Ready?</h2>
          </div>
          <Image
            src="/assets/start/ready-img.svg"
            alt="NFT"
            className="my-8 mx-auto md:max-w-md"
            width={650}
            height={400}
          />
          <ConnectAndRegisterSection />
        </div>
      </section>
    </div>
  );
}
