import React from "react";
import { formatDate, getRelativeTime } from "~~/utils/date";

type DateWithTooltipProps = {
  timestamp: string | number | Date;
};

export const DateWithTooltip = ({ timestamp }: DateWithTooltipProps) => {
  return (
    <div className="tooltip" data-tip={formatDate(timestamp)}>
      <span className="cursor-pointer">{getRelativeTime(timestamp)}</span>
    </div>
  );
};
