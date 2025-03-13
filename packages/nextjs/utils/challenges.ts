import { ReviewAction } from "~~/services/database/config/types";

export const REVIEW_ACTION_BADGE_CLASSES: Record<ReviewAction, string> = {
  [ReviewAction.ACCEPTED]: "badge-success",
  [ReviewAction.REJECTED]: "badge-error",
  [ReviewAction.SUBMITTED]: "badge-warning",
} as const;
