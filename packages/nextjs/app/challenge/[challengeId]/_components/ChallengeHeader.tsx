import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CheckCircleIcon, ClockIcon, NumberedListIcon } from "@heroicons/react/24/outline";
import SkillLevelIcon from "~~/app/_components/SkillLevelIcon";
import { SkillLevel } from "~~/utils/challenges";

type Props = {
  title?: string;
  skills?: string[];
  skillLevel?: SkillLevel;
  timeToComplete?: string;
  prerequisites?: { text: string; url?: string }[];
};

export function ChallengeHeader({ skills, skillLevel, timeToComplete, prerequisites }: Props) {
  if (!skills || skills.length === 0) {
    return null;
  }
  return (
    <div className="w-full max-w-[850px] mx-auto mb-10">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Left card: Skills */}
        <div className="rounded-2xl border border-primary/10 bg-base-100 p-6 shadow-center h-full flex flex-col">
          <div className="font-semibold mb-3 text-primary">Skills you&apos;ll gain</div>
          <div className="flex-1 flex items-center">
            {skills && skills.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {skills.slice(0, 4).map(skill => (
                  <li key={skill} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary self-start shrink-0" />
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
        </div>

        {/* Right card: Details */}
        <div className="rounded-2xl border border-primary/10 bg-secondary/20 p-6 shadow-center flex flex-col justify-center">
          <div className="space-y-4 text-md">
            <div className="flex items-center gap-3">
              <SkillLevelIcon level={skillLevel} className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <div className="text-sm">Skill level</div>
                <div className="font-semibold">{skillLevel}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <div className="text-sm">Time to complete</div>
                <div className="font-semibold">{timeToComplete || "—"}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <NumberedListIcon className="w-8 h-8 text-primary mt-1" />
              <div className="flex-1">
                <div className="text-sm">Prerequisites</div>
                {prerequisites && prerequisites.length > 0 ? (
                  <ul className="space-y-1 mt-1 text-sm">
                    {prerequisites.map((item, idx) => (
                      <li key={`${item.text}-${idx}`} className="break-words whitespace-normal">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link text-primary font-semibold"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span className="text-primary font-semibold">{item.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
