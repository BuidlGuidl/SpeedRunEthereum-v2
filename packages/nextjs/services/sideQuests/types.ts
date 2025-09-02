import { UserByAddress } from "../database/repositories/users";
import { SIDEQUEST_IDS } from "./schema";

export type SideQuestCheckArgs = {
  user: NonNullable<UserByAddress>;
};

export type SideQuestMeta = {
  id: SideQuestId;
  name: string;
  check: (args: SideQuestCheckArgs) => Promise<boolean>;
  link?: string;
};

export type SideQuestId = (typeof SIDEQUEST_IDS)[number];

export type SideQuestsSnapshot = {
  _lastCheckedAt: Date;
} & Partial<Record<SideQuestId, { id: SideQuestId; completedAt: Date }>>;
