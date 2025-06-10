import { ReactElement } from "react";
import { TocItem, buildToc } from "../utils/buildToc";
import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";

const guidesDirectory = path.join(process.cwd(), "guides");

type GuideMetadata = {
  title: string;
  description: string;
  image?: string;
};

type Guide = GuideMetadata & {
  content: ReactElement;
  toc: TocItem[];
};

export function getAllGuidesSlugs(): string[] {
  return fs.readdirSync(guidesDirectory).map(fileName => fileName.replace(/\.md$/, ""));
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const fullPath = path.join(guidesDirectory, `${slug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { frontmatter, content } = await compileMDX<GuideMetadata>({
      source: fileContents,
      options: { parseFrontmatter: true },
    });

    const { toc } = buildToc(fileContents);

    return {
      ...frontmatter,
      content,
      toc,
    };
  } catch (error) {
    // Not found.
    return null;
  }
}
