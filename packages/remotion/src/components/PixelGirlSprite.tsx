import React from "react";
import { staticFile, OffthreadVideo } from "remotion";

const SPRITE_SRC = staticFile("Animated_Sprite_Generation.mp4");

type Props = {
  size?: number; // display height in pixels
};

export const PixelGirlSprite: React.FC<Props> = ({
  size = 200,
}) => {
  return (
    <div
      style={{
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        imageRendering: "pixelated",
      }}
    >
      <OffthreadVideo
        src={SPRITE_SRC}
        style={{
          height: size,
          imageRendering: "pixelated",
        }}
        muted
        loop
      />
    </div>
  );
};
