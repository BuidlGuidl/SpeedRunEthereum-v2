"use client";

import { useEffect, useState } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { fetchGithubBuildReadme } from "~~/services/github";

type BuildReadmeProps = {
  githubUrl: string;
};

export const BuildReadme = ({ githubUrl }: BuildReadmeProps) => {
  const [buildReadmeMdxSource, setBuildReadmeMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReadme = async () => {
      setLoading(true);
      try {
        const readme = await fetchGithubBuildReadme(githubUrl);
        if (readme) {
          const mdxSource = await serialize(readme, {
            mdxOptions: {
              rehypePlugins: [rehypeRaw],
              remarkPlugins: [remarkGfm],
              format: "md",
            },
          });
          setBuildReadmeMdxSource(mdxSource);
        }
      } catch (error) {
        console.error("Error fetching README:", error);
      }
      setLoading(false);
    };

    if (githubUrl) {
      fetchReadme();
    }
  }, [githubUrl]);

  if (loading) return <div>Loading README...</div>;
  if (!buildReadmeMdxSource) return null;

  return (
    <div className="prose dark:prose-invert max-w-fit break-words lg:max-w-[850px] mt-12">
      <MDXRemote {...buildReadmeMdxSource} />
    </div>
  );
};
