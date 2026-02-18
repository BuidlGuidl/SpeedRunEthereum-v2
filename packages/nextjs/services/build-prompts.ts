import fs from "fs";
import matter from "gray-matter";
import path from "path";

const buildPromptsDirectory = path.join(process.cwd(), "build-prompts");

export type BuildPrompt = {
  slug: string;
  name: string;
  description: string;
  prompt: string;
};

export function getAllBuildPrompts(): BuildPrompt[] {
  const fileNames = fs.readdirSync(buildPromptsDirectory).filter(f => f.endsWith(".md"));

  return fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(buildPromptsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    if (!data.name || !data.description) {
      throw new Error(`Build prompt "${slug}" is missing required frontmatter (name, description)`);
    }

    return {
      slug,
      name: data.name,
      description: data.description,
      prompt: content.trim(),
    };
  });
}
