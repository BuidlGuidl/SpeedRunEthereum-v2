// TODO: Hardcoded. Remove and use types from schema later
export const CHALLENGE_SUBMISSION_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  SUBMITTED: "SUBMITTED",
} as const;

// TODO: Hardcoded. Remove and use types from schema later
export const USER_ROLES = {
  anonymous: "user_role.anonymous",
  registered: "user_role.registered",
  builder: "user_role.builder",
  admin: "user_role.administrator",
};
