export type BgBatch = {
  id: string;
  name: string;
  status: string;
  startDate: number;
  telegramLink: string;
  contractAddress: string;
  totalParticipants: number;
  graduates: number;
};

export type BgBatchUser = {
  id: string;
  batch: {
    number: string;
    status: string;
  };
};

export type BGBuilder = {
  id: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
    instagram?: string;
    email?: string;
  };
  role?: string;
  function?: string;
  creationTimestamp?: number;
  builds?: { submittedTimestamp: number; id: string }[];
  ens?: string;
  status?: { text?: string; timestamp?: number };
  reachedOut?: boolean;
  scholarship?: boolean;
  batch?: { number?: string; status?: string };
  location?: string;
  builderCohort?: { name?: string; id?: string; url?: string }[];
  stream?: {
    lastContract?: number;
    cap?: string;
    lastIndexedBlock?: number;
    balance?: string;
    streamAddress?: string;
    frequency?: number;
  };
  [key: string]: any;
};
