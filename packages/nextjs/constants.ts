export const CHALLENGE_SUBMISSION_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  SUBMITTED: "SUBMITTED",
} as const;

export const USER_ROLES = {
  anonymous: "user_role.anonymous",
  registered: "user_role.registered",
  builder: "user_role.builder",
  admin: "user_role.administrator",
};

export const USER_FUNCTIONS = {
  frontend: "user_function.frontend",
  backend: "user_function.backend",
  fullstack: "user_function.fullstack",
  designer: "user_function.designer",
  support: "user_function.support",
  mentor: "user_function.mentor",
};

export const userFunctionDescription = {
  [USER_FUNCTIONS.frontend]: { colorScheme: "orange", label: "Frontend" },
  [USER_FUNCTIONS.backend]: { colorScheme: "teal", label: "Backend" },
  [USER_FUNCTIONS.fullstack]: { colorScheme: "purple", label: "Fullstack" },
  [USER_FUNCTIONS.designer]: { colorScheme: "pink", label: "Designer" },
  [USER_FUNCTIONS.support]: { colorScheme: "blue", label: "Support" },
  [USER_FUNCTIONS.mentor]: { colorScheme: "yellow", label: "Mentor" },
};

export const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:49832";
