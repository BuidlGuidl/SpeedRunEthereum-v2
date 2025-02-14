const GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com";

interface GithubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
}

export function parseGithubUrl(githubString: string): GithubRepoInfo {
  const [repoPath, branch] = githubString.split(":");
  const [owner, repo] = repoPath.split("/");

  return {
    owner,
    repo,
    branch,
  };
}

export async function fetchGithubReadme(githubString: string): Promise<string> {
  const { owner, repo, branch } = parseGithubUrl(githubString);
  const readmeUrl = `${GITHUB_RAW_BASE_URL}/${owner}/${repo}/${branch}/README.md`;

  const response = await fetch(readmeUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }

  return response.text();
}
