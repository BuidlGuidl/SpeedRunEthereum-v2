type GithubRepoInfo = {
  owner: string;
  repo: string;
  branch: string;
};

export function parseGithubUrl(githubString: string): GithubRepoInfo {
  const [repoPath, branch] = githubString.split(":");
  const [owner, repo] = repoPath.split("/");

  return {
    owner,
    repo,
    branch,
  };
}

export async function fetchGithubChallengeReadme(githubString: string): Promise<string> {
  const { owner, repo, branch } = parseGithubUrl(githubString);

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${branch}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SpeedRunEthereum-v2",
  };

  if (process.env.GITHUB_PAT) {
    headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
  }

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }

  const data = await response.json();

  // The content is base64 encoded, so we need to decode it
  if (data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  throw new Error("README content not found in response");
}

export const getGithubReadmeUrlFromBranchUrl = (branchUrl: string): string =>
  branchUrl.replace("github.com", "raw.githubusercontent.com").replace(/\/tree\/(.*)/, "/$1/README.md");

export const getGithubApiReadmeFromRepoUrl = (repoUrl: string): string =>
  repoUrl.replace(/github\.com\/(.*?)\/(.*$)/, "api.github.com/repos/$1/$2/readme");

export const isGithubBranch = (url: string): boolean => /github\.com\/.*?\/.*?\/tree\/.*/.test(url);

export const fetchGithubBuildReadme = async (githubUrl: string): Promise<string | undefined> => {
  try {
    let readmeUrl: string;

    if (isGithubBranch(githubUrl)) {
      readmeUrl = getGithubReadmeUrlFromBranchUrl(githubUrl);
    } else {
      const apiUrl = getGithubApiReadmeFromRepoUrl(githubUrl);

      const ghApiResponse = await fetch(apiUrl);
      if (!ghApiResponse.ok) {
        throw new Error("Failed to fetch GitHub API README info");
      }
      const data = await ghApiResponse.json();
      readmeUrl = data.download_url;
    }

    const response = await fetch(readmeUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch README content");
    }
    return await response.text();
  } catch (err) {
    console.log("error fetching build README", err);
    return undefined;
  }
};

/**
 * Convert HTML <details>/<summary> blocks into MDX components.
 * Consecutive top-level <details> blocks → <Tabs>/<Tab> (tabbed UI).
 * Standalone <details> → <Details>/<Summary> (collapsible).
 * Handles nested <details> correctly by depth-tracking.
 */
export const convertDetailsToMdx = (markdown: string): string => {
  // Strip markdown='1' attribute (Kramdown-only, not needed in MDX)
  // Also remove leading indentation from <details> and </details> tags
  // so they don't get parsed as part of markdown list items
  let text = markdown
    .replace(/<details\s+markdown='1'>/gi, "<details>")
    .replace(/^[ \t]+(<\/?details[^>]*>)/gim, "$1")
    .replace(/^[ \t]+(<\/?summary>)/gim, "$1");

  // Parse all top-level <details> blocks with nesting support
  const parseDetailsBlocks = (input: string): { start: number; end: number }[] => {
    const blocks: { start: number; end: number }[] = [];
    const openRe = /<details[^>]*>/gi;
    const closeRe = /<\/details>/gi;

    // Collect all open/close tag positions
    const tags: { pos: number; len: number; type: "open" | "close" }[] = [];
    let m;
    while ((m = openRe.exec(input)) !== null) {
      tags.push({ pos: m.index, len: m[0].length, type: "open" });
    }
    while ((m = closeRe.exec(input)) !== null) {
      tags.push({ pos: m.index, len: m[0].length, type: "close" });
    }
    tags.sort((a, b) => a.pos - b.pos);

    let depth = 0;
    let blockStart = -1;
    for (const tag of tags) {
      if (tag.type === "open") {
        if (depth === 0) blockStart = tag.pos;
        depth++;
      } else {
        depth--;
        if (depth === 0 && blockStart !== -1) {
          blocks.push({ start: blockStart, end: tag.pos + tag.len });
          blockStart = -1;
        }
      }
    }
    return blocks;
  };

  // Convert a single <details> block (already extracted, may contain nested details)
  const convertSingleBlock = (block: string): { summary: string; content: string } => {
    // Extract summary
    const sumMatch = block.match(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>/i);
    const summary = sumMatch ? sumMatch[1].trim() : "";
    const afterSummary = sumMatch ? block.slice((sumMatch.index ?? 0) + sumMatch[0].length) : block;
    // Remove the final </details>
    const content = afterSummary.replace(/<\/details>\s*$/, "").trim();
    return { summary, content };
  };

  // Find consecutive top-level blocks (adjacent with only whitespace between)
  const blocks = parseDetailsBlocks(text);
  const groups: number[][] = [];
  let currentGroup: number[] = [];

  for (let i = 0; i < blocks.length; i++) {
    if (currentGroup.length === 0) {
      currentGroup.push(i);
    } else {
      const prevEnd = blocks[currentGroup[currentGroup.length - 1]].end;
      const gap = text.slice(prevEnd, blocks[i].start);
      if (/^\s*$/.test(gap)) {
        currentGroup.push(i);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [i];
      }
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // Replace from end to start to preserve positions
  for (let g = groups.length - 1; g >= 0; g--) {
    const group = groups[g];
    const groupStart = blocks[group[0]].start;
    const groupEnd = blocks[group[group.length - 1]].end;

    if (group.length >= 2) {
      // Consecutive → Tabs
      const tabs = group.map(idx => {
        const raw = text.slice(blocks[idx].start, blocks[idx].end);
        const { summary, content } = convertSingleBlock(raw);
        // Recursively convert nested details in tab content
        const converted = convertDetailsToMdx(content);
        return `<Tab label="${summary}">\n\n${converted}\n\n</Tab>`;
      });
      text = text.slice(0, groupStart) + `<Tabs>\n${tabs.join("\n")}\n</Tabs>` + text.slice(groupEnd);
    } else {
      // Standalone → Details/Summary
      const raw = text.slice(blocks[group[0]].start, blocks[group[0]].end);
      const { summary, content } = convertSingleBlock(raw);
      // Recursively convert nested details
      const converted = convertDetailsToMdx(content);
      text =
        text.slice(0, groupStart) +
        `<Details>\n<Summary>${summary}</Summary>\n\n${converted}\n\n</Details>` +
        text.slice(groupEnd);
    }
  }

  return text;
};

export const splitChallengeReadme = (readme: string): { headerImageMdx: string; restMdx: string } => {
  const content = readme.replace(/\r\n?/g, "\n");

  const h1 = "^#\\s.+\\n";
  const optionalBlank = "(?:[ \\t]*\\n)?";
  // ![](url) or <img src="url" />
  const img = "(?:!\\[[^\\]]*\\]\\([^\\)]+\\)|<img[\\s\\S]*?>)";
  const trailing = "\\s*(?:\\n|$)";
  const pattern = new RegExp(h1 + optionalBlank + img + trailing, "m");

  const match = content.match(pattern);
  if (!match || match.index === undefined) {
    return { headerImageMdx: "", restMdx: content };
  }
  return { headerImageMdx: match[0], restMdx: content.slice(match.index + match[0].length) };
};
