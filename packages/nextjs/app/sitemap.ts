import type { MetadataRoute } from "next";
import { ChallengeId } from "~~/services/database/config/types";
import { getAllGuidesSlugs } from "~~/services/guides";

const siteUrl = "https://speedrunethereum.com";

const staticRoutes = ["", "/start", "/guides", "/learn-solidity", "/build-prompts"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = staticRoutes.map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.9,
  }));

  const challengePages = Object.values(ChallengeId).map(challengeId => ({
    url: `${siteUrl}/challenge/${challengeId}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const guidePages = getAllGuidesSlugs().map(slug => ({
    url: `${siteUrl}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...challengePages, ...guidePages];
}
