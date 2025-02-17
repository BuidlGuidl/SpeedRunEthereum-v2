import fs from "fs";
import matter from "gray-matter";
import path from "path";

const guidesDirectory = path.join(process.cwd(), "guides");

type GuideMetadata = {
  title: string;
  description: string;
  slug: string;
};

type Guide = GuideMetadata & {
  content: string;
};

export function getAllGuidesSlugs(): string[] {
  return fs.readdirSync(guidesDirectory).map(fileName => fileName.replace(/\.md$/, ""));
}

export function getGuideBySlug(slug: string): Guide | null {
  const fullPath = path.join(guidesDirectory, `${slug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      ...(data as GuideMetadata),
      content,
      slug,
    };
  } catch (error) {
    // Not found.
    return null;
  }
}
