import React from "react";
import moment from "moment";

interface DateWithTooltipProps {
  timestamp: string | number | Date;
}

export const DateWithTooltip = ({ timestamp }: DateWithTooltipProps) => {
  const timestampMoment = moment(timestamp);
  return (
    <div className="tooltip" data-tip={timestampMoment.format("YYYY-MM-DD, HH:mm")}>
      <span className="cursor-pointer">{timestampMoment.fromNow()}</span>
    </div>
  );
};
