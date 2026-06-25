"use client";

import { useEffect, useState } from "react";
import { PunkBlockie } from "../PunkBlockie";
import { AvatarComponent } from "@rainbow-me/rainbowkit";

export const BlockieAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  const [hasErrored, setHasErrored] = useState(false);

  useEffect(() => {
    setHasErrored(false);
  }, [ensImage]);

  if (!ensImage || hasErrored) {
    return <PunkBlockie address={address} width={size} className="rounded-full" />;
  }

  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-full"
      src={ensImage}
      width={size}
      height={size}
      alt={`${address} avatar`}
      onError={() => setHasErrored(true)}
    />
  );
};
