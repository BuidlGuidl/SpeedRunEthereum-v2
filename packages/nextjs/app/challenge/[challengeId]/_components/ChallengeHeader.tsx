import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CheckCircleIcon, ClockIcon, LinkIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import SkillLevelIcon from "~~/app/_components/SkillLevelIcon";
import { SkillLevel } from "~~/utils/challenges";

type Props = {
  title?: string;
  skills?: string[];
  skillLevel?: SkillLevel;
  timeToComplete?: string;
  helpfulLinks?: { text: string; url?: string }[];
  completedByCount?: number;
  children?: ReactNode;
};

type FactProps = {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
  children?: ReactNode;
};

function Fact({ icon, label, value, children }: FactProps) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm text-base-content/70">{label}</div>
        {children || <div className="font-semibold break-words">{value}</div>}
      </div>
    </div>
  );
}

export function ChallengeHeader({
  skills,
  skillLevel,
  timeToComplete,
  helpfulLinks,
  completedByCount,
  children,
}: Props) {
  return (
    <div className="w-full">
      <div className="relative z-10 -mt-9 mb-6 rounded-2xl bg-base-200 border-2 border-secondary/80 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[0.9fr_1fr_1fr_1.35fr] gap-x-4 gap-y-4 p-6">
        <Fact
          icon={<SkillLevelIcon level={skillLevel} className="w-7 h-7 text-primary" />}
          label="Skill level"
          value={skillLevel || "Not specified"}
        />
        <Fact
          icon={<ClockIcon className="w-7 h-7 text-primary" />}
          label="Time to complete"
          value={timeToComplete || "-"}
        />
        <Fact
          icon={<UserGroupIcon className="w-7 h-7 text-primary" />}
          label="Completed by"
          value={completedByCount ? `${completedByCount} builder${completedByCount > 1 ? "s" : ""}` : "-"}
        />
        <Fact icon={<LinkIcon className="w-7 h-7 text-primary" />} label="Helpful links">
          {helpfulLinks && helpfulLinks.length > 0 ? (
            <div className="mt-0.5 space-y-1">
              {helpfulLinks.map((item, idx) =>
                item.url ? (
                  <a
                    key={`${item.text}-${idx}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link text-primary font-semibold block text-sm break-words"
                  >
                    {item.text}
                  </a>
                ) : (
                  <div key={`${item.text}-${idx}`} className="text-sm font-semibold break-words">
                    {item.text}
                  </div>
                ),
              )}
            </div>
          ) : (
            <span className="text-sm">None</span>
          )}
        </Fact>
      </div>

      <div className="rounded-2xl bg-base-100 border border-primary/10 shadow-sm px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <section>
          <div className="font-semibold mb-4 text-primary">Skills you&apos;ll gain</div>
          <div className="flex-1 flex">
            {skills && skills.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {skills.slice(0, 4).map(skill => (
                  <li key={skill} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary self-start shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 break-words whitespace-normal leading-5">
                      <MDXRemote
                        source={skill}
                        options={{
                          mdxOptions: {
                            rehypePlugins: [rehypeRaw],
                            remarkPlugins: [remarkGfm],
                            format: "md",
                          },
                        }}
                        components={{
                          p: (props: any) => <p className="m-0">{props.children}</p>,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm opacity-70">This challenge helps you build practical Solidity skills.</div>
            )}
          </div>
        </section>

        <div className="my-8 border-t border-base-content/25" />
        {children}
      </div>
    </div>
  );
}
