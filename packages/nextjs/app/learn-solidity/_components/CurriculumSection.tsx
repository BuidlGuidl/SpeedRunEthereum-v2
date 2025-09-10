import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import SkillLevelIcon from "~~/app/_components/SkillLevelIcon";
import { roadmap } from "~~/app/learn-solidity/_components/data";
import type { CurriculumGroup as Group, RoadmapSection as SectionData } from "~~/app/learn-solidity/_components/data";
import { Challenges } from "~~/services/database/repositories/challenges";
import { CHALLENGE_METADATA } from "~~/utils/challenges";
import type { SkillLevel } from "~~/utils/challenges";
import { CHALLENGE_XP } from "~~/utils/xp";

export const CurriculumSection = ({ challenges }: { challenges: Challenges }) => {
  const challengeById = Object.fromEntries(challenges.map(c => [c.id, c]));

  return (
    <section id="curriculum" className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Solidity Tutorial Roadmap</h2>
        <p className="text-base-content/80 max-w-3xl mx-auto">
          Follow our structured learning path from your first smart contract to advanced Web3 concepts.
        </p>
      </div>

      {(["fundamentals", "advanced"] as Group[]).map((group: Group) => {
        const groupLabel = group === "fundamentals" ? "🌟 Solidity Fundamentals" : "🚀 Advanced Solidity Concepts";
        const groupDesc =
          group === "fundamentals"
            ? "Master the core concepts of Ethereum development and smart contract basics."
            : "Build complex DeFi protocols and advanced smart contract systems";

        return (
          <div key={group} className="mb-12 rounded-2xl p-4 md:p-6 bg-accent mx-auto lg:max-w-5xl xl:max-w-6xl">
            <div className="text-center mb-5">
              <h3 className="text-2xl md:text-3xl font-bold text-primary-content">{groupLabel}</h3>
              <p className="text-primary-content">{groupDesc}</p>
            </div>

            <div className="space-y-5">
              {roadmap
                .filter((s: SectionData) => s.group === group)
                .map((section: SectionData) => {
                  const totalXp = section.challengeIds
                    .map(id => section.xpOverrides?.[id] ?? CHALLENGE_XP)
                    .reduce((a, b) => a + b, 0);
                  return (
                    <div key={section.title} className="card bg-base-100 shadow-md overflow-hidden">
                      <div className="card-body p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="card-title text-xl mb-1">{section.title}</h4>
                            <p className="text-sm text-base-content/80">{section.description}</p>
                          </div>
                          <span className="badge badge-outline ml-4">{totalXp} XP</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 mt-4 lg:max-w-none">
                          <div>
                            <h5 className="font-semibold mb-2 text-primary">🎯 Challenges</h5>
                            <ul className="space-y-2">
                              {section.challengeIds.map((id: string) => {
                                const ch = challengeById[id];
                                if (!ch) return null;
                                const xp =
                                  section.xpOverrides?.[id as unknown as keyof typeof section.xpOverrides] ??
                                  CHALLENGE_XP;
                                const meta = CHALLENGE_METADATA[id];
                                const desc = meta?.description || ch.description;
                                return (
                                  <li key={id}>
                                    <Link
                                      href={`/challenge/${ch.id}`}
                                      className="block p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                          <div className="font-medium">{ch.challengeName}</div>
                                          <div className="text-xs text-base-content/70 leading-snug">{desc}</div>
                                        </div>
                                        <span className="badge badge-secondary shrink-0 whitespace-nowrap">
                                          +{xp} XP
                                        </span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-2 text-primary">📚 Recommended Resources</h5>
                            <ul className="space-y-1">
                              {(() => {
                                const guideLinks = section.challengeIds.flatMap(
                                  id => CHALLENGE_METADATA[id]?.guides ?? [],
                                );
                                const helpfulLinks = section.challengeIds
                                  .flatMap(id => CHALLENGE_METADATA[id]?.helpfulLinks ?? [])
                                  .filter(l => !l.url || !l.url.startsWith("/guides"))
                                  .map(l => ({ title: l.text, url: l.url ?? "#" }));
                                const combined = [...guideLinks, ...helpfulLinks];
                                const uniqueByUrl = Array.from(
                                  new Map(combined.map(item => [item.url, item])).values(),
                                );
                                return uniqueByUrl.map(item => (
                                  <li key={item.url}>
                                    <Link href={item.url} className="text-primary hover:underline text-sm">
                                      {item.title}
                                    </Link>
                                  </li>
                                ));
                              })()}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg p-3 md:p-4 bg-base-200">
                          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                            <div className="lg:basis-[60%] p-2">
                              <h6 className="text-base font-semibold text-primary mb-2">Skills you&apos;ll gain</h6>
                              <ul className="space-y-2">
                                {section.challengeIds
                                  .flatMap(id => CHALLENGE_METADATA[id]?.skills ?? [])
                                  .map(s => (
                                    <li key={s} className="flex items-center gap-2 text-sm">
                                      <CheckCircleIcon className="w-5 h-5 text-primary self-start shrink-0" />
                                      <span className="inline">
                                        <MDXRemote
                                          source={s}
                                          options={{
                                            mdxOptions: {
                                              rehypePlugins: [rehypeRaw],
                                              remarkPlugins: [remarkGfm],
                                              format: "md",
                                            },
                                          }}
                                          components={{
                                            p: (props: any) => <p className="m-0 inline">{props.children}</p>,
                                          }}
                                        />
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                            <div className="lg:basis-[40%] grid grid-cols-1 md:grid-cols-2 gap-4 min-w-fit items-center text-sm">
                              <div className="flex items-center gap-3 text-sm">
                                <SkillLevelIcon
                                  level={CHALLENGE_METADATA[section.challengeIds[0]]?.skillLevel as SkillLevel}
                                  className="w-6 h-6 text-primary"
                                />
                                <div>
                                  <div className="font-medium">Skill level</div>
                                  <div className="text-base-content/70">
                                    {CHALLENGE_METADATA[section.challengeIds[0]]?.skillLevel || "Beginner"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <ClockIcon className="w-6 h-6 text-primary" />
                                <div>
                                  <div className="font-medium">Time to complete</div>
                                  <div className="text-base-content/70">
                                    {CHALLENGE_METADATA[section.challengeIds[0]]?.timeToComplete || ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </section>
  );
};
