import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export function ChallengeSkills({ skills }: { skills?: string[] }) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/70">
        Skills you&apos;ll gain
      </div>
      <ul className="space-y-2.5 text-sm">
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
    </div>
  );
}
