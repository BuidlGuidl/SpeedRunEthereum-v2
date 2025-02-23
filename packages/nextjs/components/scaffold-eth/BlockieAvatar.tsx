"use client";

import { PunkBlockie } from "../PunkBlockie";
import { AvatarComponent } from "@rainbow-me/rainbowkit";

export const BlockieAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  if (!ensImage) {
    return <PunkBlockie address={address} width={size} className="rounded-full" />;
  }

  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="rounded-full" src={ensImage} width={size} height={size} alt={`${address} avatar`} />;
};
