import React from "react";
import { formatDate, getRelativeTime } from "~~/utils/date";

type DateWithTooltipProps = {
  timestamp: string | number | Date;
  position?: "top" | "bottom" | "left" | "right";
};

export const DateWithTooltip = ({ timestamp, position = "top" }: DateWithTooltipProps) => {
  const tooltipPosition = {
    top: "tooltip-top",
    bottom: "tooltip-bottom",
    left: "tooltip-left",
    right: "tooltip-right",
  }[position];

  return (
    <div className={`tooltip ${tooltipPosition}`} data-tip={formatDate(timestamp)}>
      <span className="cursor-pointer">{getRelativeTime(timestamp)}</span>
    </div>
  );
};
