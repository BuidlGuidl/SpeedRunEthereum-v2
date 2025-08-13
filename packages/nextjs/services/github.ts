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
