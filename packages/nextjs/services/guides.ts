import { ReactElement, ReactNode, createElement, isValidElement } from "react";
import type { ComponentPropsWithoutRef } from "react";
import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import rehypeRaw from "rehype-raw";
import { GuideImageLightbox } from "~~/app/guides/_components/GuideImageLightbox";
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

// Raw HTML tables in the markdown are indented for readability, but rehype-raw keeps the
// newline/indent text nodes inside <table>/<thead>/<tbody>/<tr>, which React rejects as
// invalid children and turns into hydration errors. Strip them.
type HastNode = { type: string; tagName?: string; value?: string; children?: HastNode[] };

const TABLE_STRUCTURE_TAGS = new Set(["table", "thead", "tbody", "tfoot", "tr", "colgroup"]);

function rehypeStripTableWhitespace() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;
      if (node.tagName && TABLE_STRUCTURE_TAGS.has(node.tagName)) {
        node.children = node.children.filter(child => !(child.type === "text" && /^\s*$/.test(child.value ?? "")));
      }
      node.children.forEach(walk);
    };
    walk(tree);
  };
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
  img: (props: ComponentPropsWithoutRef<"img">) =>
    createElement(GuideImageLightbox, { src: typeof props.src === "string" ? props.src : "", alt: props.alt ?? "" }),
  video: (props: ComponentPropsWithoutRef<"video">) =>
    createElement("video", {
      controls: true,
      playsInline: true,
      ...props,
      style: { width: "100%", borderRadius: "8px" },
    }),
  iframe: (props: ComponentPropsWithoutRef<"iframe">) =>
    createElement(
      "div",
      {
        style: {
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%",
          borderRadius: "0.75rem",
          overflow: "hidden",
          marginTop: "1rem",
          marginBottom: "1rem",
        },
      },
      createElement("iframe", {
        ...props,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        },
      }),
    ),
};

export async function getAllGuides(): Promise<Guide[]> {
  const slugs = getAllGuidesSlugs();
  const guides = (await Promise.all(slugs.map(getGuideBySlug))).filter(Boolean) as Guide[];

  // Newest first by date. Guides without a date keep their original (alphabetical) order after the dated ones.
  return guides.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
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
        mdxOptions: {
          rehypePlugins: [rehypeRaw, rehypeStripTableWhitespace],
          format: "md",
        },
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
