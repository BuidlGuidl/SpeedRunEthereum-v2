type Role = "registered" | "builder" | "admin";

type ChallengeStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";

interface SocialLinks {
  twitter?: string;
  github?: string;
  [key: string]: string | undefined; // Allow for other social platforms
}

export type Challenge = {
  id: number; // remove?
  branchName: string;
  label: string;
  dependencies?: string[];
  description: string;
  icon?: string;
  disabled?: boolean;
  previewImage?: string;
  externalLink?: {
    link?: string;
    claim: string;
  };
  sortOrder: number;
};

export interface ChallengeAttempt {
  status: ChallengeStatus;
  contractUrl?: string;
  deployedUrl?: string;
  submittedTimestamp: number;
  reviewComment?: string;
  autograding?: boolean;
  // disabled?: boolean;
}

export type User = {
  id: string; // Ethereum address
  creationTimestamp: number;
  role: Role;
  socialLinks?: SocialLinks;
  reachedOut?: boolean;
  challenges: Record<string, ChallengeAttempt>;
  joinedBg?: boolean;
  address?: string;
  username?: string;
};

// Optional: Database response type based on usage in the code
export type UserResponse = {
  exists: boolean;
  data: User;
};
