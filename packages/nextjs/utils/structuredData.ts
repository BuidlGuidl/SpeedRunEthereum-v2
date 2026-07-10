import { Challenges } from "~~/services/database/repositories/challenges";

const SITE_URL = "https://speedrunethereum.com";
const COURSE_NAME = "Speedrun Ethereum";
// Canonical node id so the homepage Course and each challenge's `isPartOf` resolve to the same entity.
const COURSE_ID = `${SITE_URL}/#course`;

const provider = {
  "@type": "Organization",
  name: "BuidlGuidl",
  url: "https://buidlguidl.com",
};

// Homepage: the whole curriculum as a Course plus an ordered ItemList of its challenges.
// `description` is sourced from the homepage metadata so the two never drift.
export function getHomepageStructuredData(challenges: Challenges, description: string) {
  const orderedChallenges = challenges
    .filter(challenge => !challenge.disabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": COURSE_ID,
    name: COURSE_NAME,
    description,
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
      item: {
        "@type": "Course",
        name: challenge.challengeName,
        url: `${SITE_URL}/challenge/${challenge.id}`,
      },
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
      "@id": COURSE_ID,
    },
  };
}
