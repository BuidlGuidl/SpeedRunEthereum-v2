import { ReactElement, ReactNode, createElement, isValidElement } from "react";
import type { ComponentPropsWithoutRef } from "react";
import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import { Heading, extractHeadings, generateHeadingId } from "~~/utils/challenges";

const guidesDirectory = path.join(process.cwd(), "guides");

type FAQ = {
  question: string;
  answer: string;
};

type GuideMetadata = {
  title: string;
  date?: string;
  description: string;
  image?: string;
  faqs?: FAQ[];
  showNavigation?: boolean;
};

export type Guide = GuideMetadata & {
  content: ReactElement;
  readingTime: number;
  slug: string;
  headings: Heading[];
};

function stripFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function computeReadingTime(text: string): number {
  const words = stripFrontmatter(text).trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatGuideDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Flatten rendered MDX children to plain text so heading ids match the ones the
// table of contents builds from the raw markdown (which contains no React nodes).
function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeToText(node.props.children);
  return "";
}

const mdxComponents = {
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const isInternal = props.href && (props.href.startsWith("/") || props.href.startsWith("#"));
    if (isInternal) return createElement("a", props);
    return createElement("a", { ...props, target: "_blank", rel: "noopener noreferrer" });
  },
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) =>
    createElement(
      "h2",
      { ...props, id: generateHeadingId(nodeToText(children)), style: { scrollMarginTop: "80px" } },
      children,
    ),
  video: (props: ComponentPropsWithoutRef<"video">) =>
    createElement("video", {
      controls: true,
      playsInline: true,
      ...props,
      style: { width: "100%", borderRadius: "8px" },
    }),
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
    const readingTime = computeReadingTime(fileContents);
    const headings = extractHeadings(stripFrontmatter(fileContents));
    const { frontmatter, content } = await compileMDX<GuideMetadata>({
      source: fileContents,
      options: {
        parseFrontmatter: true,
      },
      components: mdxComponents,
    });

    return {
      ...frontmatter,
      content,
      readingTime,
      slug,
      headings,
    };
  } catch (error) {
    // Not found.
    return null;
  }
}
