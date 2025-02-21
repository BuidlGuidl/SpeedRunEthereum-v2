import React from "react";
import { blo } from "blo";

// punk size with scale = 1
const PUNK_SIZE = 112;
// punk size pixels in the original file
const ORIGINAL_PUNK_SIZE = 24;
const PUNK_SIZE_RATIO = PUNK_SIZE / ORIGINAL_PUNK_SIZE;

interface PunkBlockieProps {
  address: string;
  scale?: number;
  width?: number;
  className?: string;
}

export default function PunkBlockie({ address, scale, width, className }: PunkBlockieProps) {
  const part1 = address?.slice(2, 22);
  const part2 = address?.slice(-20);

  const backgroundPositionX = parseInt(part1, 16) % 100;
  const backgroundPositionY = parseInt(part2, 16) % 100;

  const computedScale = width ? width / PUNK_SIZE : (scale ?? 1);

  return (
    <div
      className={`relative block overflow-hidden m-0 ${className}`}
      style={{
        width: PUNK_SIZE * computedScale,
        height: PUNK_SIZE * computedScale,
      }}
    >
      <div className="opacity-40 absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={address} src={blo(address as `0x${string}`, PUNK_SIZE * computedScale)} />
      </div>
      <div
        className="absolute inset-0 bg-no-repeat [image-rendering:pixelated]"
        style={{
          backgroundImage: "url(/punks.png)",
          backgroundSize: `${2400 * PUNK_SIZE_RATIO * computedScale}px ${2400 * PUNK_SIZE_RATIO * computedScale}px`,
          backgroundPosition: `${-PUNK_SIZE * backgroundPositionX * computedScale}px ${-PUNK_SIZE * backgroundPositionY * computedScale}px`,
        }}
      />
    </div>
  );
}
