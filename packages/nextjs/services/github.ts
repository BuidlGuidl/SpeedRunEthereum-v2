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

export async function fetchGithubChallengeReadme(githubString: string): Promise<string> {
  const { owner, repo, branch } = parseGithubUrl(githubString);
  const readmeUrl = `${GITHUB_RAW_BASE_URL}/${owner}/${repo}/${branch}/README.md`;

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

export const fetchGithubBuildReadme = async (githubUrl: string): Promise<string> => {
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
    throw new Error("error fetching build README");
  }
};
