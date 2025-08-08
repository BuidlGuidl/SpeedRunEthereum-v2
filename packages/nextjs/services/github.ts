const GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com";

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

export async function fetchLocalChallengeReadme(githubString: string): Promise<string> {
  const { branch } = parseGithubUrl(githubString);

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:${process.env.PORT || 3000}`;

  const branchWithoutChallengePrefix = branch.replace("challenge-", "");
  const response = await fetch(`${baseUrl}/readme/${branchWithoutChallengePrefix}.md`);
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }

  return response.text();
}

export async function fetchGithubChallengeReadme(githubString: string): Promise<string> {
  const { owner, repo, branch } = parseGithubUrl(githubString);

  // TODO: Remove this hotfix after github url scaffold-eth/se-2-challenges  works correctly
  let correctOwner = owner;
  if (owner === "scaffold-eth" && repo === "se-2-challenges") {
    correctOwner = "BuidlGuidl";
  }
  const readmeUrl = `${GITHUB_RAW_BASE_URL}/${correctOwner}/${repo}/${branch}/README.md`;

  const response = await fetch(readmeUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }

  return response.text();
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
