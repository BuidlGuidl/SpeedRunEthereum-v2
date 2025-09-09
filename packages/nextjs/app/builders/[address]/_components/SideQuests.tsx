"use client";

import { useState } from "react";
import { SIDEQUESTS } from "~~/services/sideQuests/schema";
import { SideQuestsSnapshot } from "~~/services/sideQuests/types";

type SideQuest = {
  id: string;
  name: string;
  completed: boolean;
};

type CollapseSectionProps = {
  title: string;
  quests: SideQuest[];
  defaultExpanded?: boolean;
  className?: string;
};

const CollapseSection = ({ title, quests, defaultExpanded = false, className = "" }: CollapseSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`collapse collapse-arrow bg-base-200 rounded-lg ${className}`}>
      <input type="checkbox" checked={isExpanded} onChange={() => setIsExpanded(!isExpanded)} className="peer" />
      <div className="collapse-title text-lg font-semibold text-base-content">
        <div className="flex items-center justify-between">
          <span>{title}</span>
        </div>
      </div>
      <div className="collapse-content px-3 bg-base-100">
        <div className="mt-4 space-y-3">
          {quests.map(quest => (
            <div key={quest.id} className="flex items-center gap-3 rounded-lg">
              <input
                type="checkbox"
                checked={quest.completed}
                readOnly
                className="checkbox checkbox-primary checkbox-sm cursor-default"
              />
              <label className="text-base flex-1">{quest.name}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QUEST_CATEGORIES = {
  ENS_BASICS: [SIDEQUESTS.ensRegistered, SIDEQUESTS.ensAvatarSet],
  ETHEREUM_FIRST_STEPS: [
    SIDEQUESTS.contractDeployed,
    SIDEQUESTS.sentMainnetTx,
    SIDEQUESTS.usedL2,
    SIDEQUESTS.mintedNFT,
    SIDEQUESTS.swappedOnDex,
  ],
};

export const SideQuests = ({ snapshot }: { snapshot: SideQuestsSnapshot | null }) => {
  const ensQuests = [
    ...QUEST_CATEGORIES.ENS_BASICS.map(sideQuest => ({
      id: sideQuest.id,
      name: sideQuest.name,
      completed: Boolean(snapshot?.[sideQuest.id]?.completedAt),
    })),
  ];

  const devQuests = QUEST_CATEGORIES.ETHEREUM_FIRST_STEPS.map(sideQuest => ({
    id: sideQuest.id,
    name: sideQuest.name,
    completed: Boolean(snapshot?.[sideQuest.id]?.completedAt),
  }));

  const totalQuests = ensQuests.length + devQuests.length;
  const completedQuests = [...ensQuests, ...devQuests].filter(q => q.completed).length;

  return (
    <div className="bg-base-100 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 text-lg">
        <div className="font-bold">
          Side Quests <span className="text-xs text-base-content/50">(+ 5 XP each)</span>
        </div>
        <div>
          {completedQuests} / {totalQuests}
        </div>
      </div>

      <CollapseSection title="ENS Basics" quests={ensQuests} defaultExpanded={true} className="mb-4" />

      <CollapseSection title="Ethereum First Steps" quests={devQuests} defaultExpanded={true} />
    </div>
  );
};
