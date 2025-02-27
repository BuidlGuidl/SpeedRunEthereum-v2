// Types to import from both schema/db and client
export enum ReviewAction {
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  SUBMITTED = "SUBMITTED",
}

export enum EventType {
  CHALLENGE_SUBMIT = "CHALLENGE_SUBMIT",
  CHALLENGE_AUTOGRADE = "CHALLENGE_AUTOGRADE",
  USER_CREATE = "USER_CREATE",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
