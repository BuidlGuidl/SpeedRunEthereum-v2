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

// Guide page: a TechArticle tied back to the curriculum, plus its breadcrumb trail.
export function getGuideStructuredData({
  slug,
  title,
  description,
  image,
  datePublished,
}: {
  slug: string;
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
}) {
  const url = `${SITE_URL}/guides/${slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(image ? { image: `${SITE_URL}${image}` } : {}),
    ...(datePublished ? { datePublished } : {}),
    author: provider,
    publisher: provider,
    isPartOf: {
      "@id": COURSE_ID,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: COURSE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  return [article, breadcrumb];
}

// Guides index: a CollectionPage tied back to the curriculum, plus its breadcrumb trail.
export function getGuidesIndexStructuredData({ title, description }: { title: string; description: string }) {
  const url = `${SITE_URL}/guides`;

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: provider,
    isPartOf: {
      "@id": COURSE_ID,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: COURSE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: url },
    ],
  };

  return [collection, breadcrumb];
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
