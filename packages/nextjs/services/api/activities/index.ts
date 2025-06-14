export type ActivityType = "ALL" | "CHALLENGE_SUBMISSIONS" | "USER_CREATE";

export type ActivityResponse = {
  data: ActivityItem[];
  meta: {
    totalRowCount: number;
  };
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  userAddress: string;
  userEns?: string | null;
  timestamp: Date;
  details: {
    challengeId?: string;
    challengeName?: string;
    reviewAction?: string;
    frontendUrl?: string;
    contractUrl?: string;
  };
};

export const fetchActivities = async (
  start: number,
  size: number,
  activityType: ActivityType = "ALL",
): Promise<ActivityResponse> => {
  const response = await fetch(`/api/activities?start=${start}&size=${size}&type=${activityType}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};
