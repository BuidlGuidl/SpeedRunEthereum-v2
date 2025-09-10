import { BottomCta } from "~~/app/learn-solidity/_components/BottomCta";
import { CurriculumSection } from "~~/app/learn-solidity/_components/CurriculumSection";
import { FaqSection } from "~~/app/learn-solidity/_components/FaqSection";
import { HeroSection } from "~~/app/learn-solidity/_components/HeroSection";
import { WhyWorks } from "~~/app/learn-solidity/_components/WhyWorks";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getAllGuides } from "~~/services/guides";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Learn Solidity with our free Web3 Developer Course",
  description:
    "Master Solidity with a guided curriculum, real-world challenges, and curated guides. Learn by building on Ethereum.",
});

export default async function LearnSolidityPage() {
  const [challenges] = await Promise.all([getAllChallenges(), getAllGuides()]);

  return (
    <div className="bg-base-200">
      <HeroSection />
      <CurriculumSection challenges={challenges} />
      <WhyWorks />
      <FaqSection />
      <BottomCta />
    </div>
  );
}
