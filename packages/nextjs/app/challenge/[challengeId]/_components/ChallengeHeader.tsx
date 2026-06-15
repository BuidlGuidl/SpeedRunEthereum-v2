import type { ReactNode } from "react";
import { ClockIcon, LinkIcon, SparklesIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import SkillLevelIcon from "~~/app/_components/SkillLevelIcon";
import { SkillLevel } from "~~/utils/challenges";

type Props = {
  skillLevel?: SkillLevel;
  timeToComplete?: string;
  helpfulLinks?: { text: string; url?: string }[];
  completedByCount?: number;
  isAiReady?: boolean;
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
  skillLevel,
  timeToComplete,
  helpfulLinks,
  completedByCount,
  isAiReady,
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

      {isAiReady && (
        <div className="mb-6 rounded-2xl border border-primary/10 bg-base-100 p-6 shadow-center flex items-start gap-4">
          <SparklesIcon className="w-8 h-8 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm opacity-80 m-0">
              This challenge ships with <span className="font-bold">context-aware AI</span> support. Open it in your
              preferred AI coding tool and ask questions, request hints, or get explanations at any point along the way.
            </p>
            <p className="text-sm opacity-80 mt-2 mb-0">
              If you prefer an <span className="font-bold">AI-guided</span> experience, you can run{" "}
              <code className="bg-base-300 px-1.5 py-0.5 rounded text-xs font-mono">/start</code> in{" "}
              <span className="italic">Claude Code</span> or <span className="italic">Cursor</span>.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-base-100 border border-primary/10 shadow-sm px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {children}
      </div>
    </div>
  );
}
