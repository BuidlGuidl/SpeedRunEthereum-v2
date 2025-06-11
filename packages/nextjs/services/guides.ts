import { ReactElement } from "react";
import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";

const guidesDirectory = path.join(process.cwd(), "guides");

type GuideMetadata = {
  title: string;
  description: string;
  image?: string;
};

export type Guide = GuideMetadata & {
  content: ReactElement;
  slug: string;
};

export async function getAllGuides(): Promise<Guide[]> {
  const slugs = getAllGuidesSlugs();
  const guides = await Promise.all(slugs.map(getGuideBySlug));
  return guides.filter(Boolean) as Guide[];
}

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

    return {
      ...frontmatter,
      content: content,
      slug,
    };
  } catch (error) {
    // Not found.
    return null;
  }
}
