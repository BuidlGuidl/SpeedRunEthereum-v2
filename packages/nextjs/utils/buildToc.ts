export interface TocItem {
  id: string;
  text: string;
  level: 2;
}

function simpleSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Returns a ToC array for all ## headings only.
export function buildToc(markdown: string): { toc: TocItem[] } {
  const toc: TocItem[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      const text = h2[1].trim();
      toc.push({ id: simpleSlugify(text), text, level: 2 });
    }
  }
  return { toc };
}
