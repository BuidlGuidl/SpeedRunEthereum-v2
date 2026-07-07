import { Challenges } from "~~/services/database/repositories/challenges";

const SITE_URL = "https://speedrunethereum.com";
const COURSE_NAME = "Speedrun Ethereum";
const COURSE_DESCRIPTION =
  "Learn Solidity development by building real dapps through hands-on Ethereum challenges, from your first NFT to a DEX, oracles, stablecoins, and more.";

const provider = {
  "@type": "Organization",
  name: "BuidlGuidl",
  url: "https://buidlguidl.com",
};

// Homepage: the whole curriculum as a Course plus an ordered ItemList of its challenges.
export function getHomepageStructuredData(challenges: Challenges) {
  const orderedChallenges = challenges
    .filter(challenge => !challenge.disabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: COURSE_NAME,
    description: COURSE_DESCRIPTION,
    url: SITE_URL,
    provider,
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Speedrun Ethereum Challenges",
    itemListElement: orderedChallenges.map((challenge, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/challenge/${challenge.id}`,
      name: challenge.challengeName,
    })),
  };

  return [course, itemList];
}

// Challenge page: a Course node for a single challenge, tied back to the curriculum.
export function getChallengeStructuredData({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: `${SITE_URL}/challenge/${id}`,
    provider,
    isPartOf: {
      "@type": "Course",
      name: COURSE_NAME,
      url: SITE_URL,
    },
  };
}
