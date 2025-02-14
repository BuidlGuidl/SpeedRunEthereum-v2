type Role = "registered" | "builder" | "admin";

type ChallengeStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";

interface SocialLinks {
  twitter?: string;
  github?: string;
  [key: string]: string | undefined; // Allow for other social platforms
}

interface Challenge {
  status: ChallengeStatus;
  contractUrl: string;
  deployedUrl: string;
  submittedTimestamp: number;
  reviewComment?: string;
  autograding?: boolean;
  disabled?: boolean;
}

interface User {
  id: string; // Ethereum address
  creationTimestamp: number;
  role: Role;
  socialLinks?: SocialLinks;
  reachedOut?: boolean;
  challenges?: {
    [challengeId: string]: Challenge;
  };
  joinedBg?: boolean;
}

// Optional: Database response type based on usage in the code
interface UserResponse {
  exists: boolean;
  data: User;
}

export type { User, UserResponse };
