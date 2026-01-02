"use client";

import { Avatar, Skeleton } from "@mui/material";
import { useState } from "react";

interface BlurAvatarProps {
  src?: string;
  size?: number;
  border?: string;
}

const LazyAvatar = ({ src, size, border }: BlurAvatarProps) => {
  const [loaded, setLoaded] = useState(false);

  const finalSrc = src || "/noavatar.png";

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        border,
        bgcolor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      {!loaded && (
        <Skeleton
          variant="circular"
          width={size}
          height={size}
          sx={{
            position: "absolute",
            zIndex: 1,
            bgcolor: "rgba(255,255,255,0.1)",
          }}
        />
      )}

      <img
        src={finalSrc}
        loading="lazy"
        alt="avatar"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: loaded ? "blur(0px)" : "blur(12px)",
          transform: loaded ? "scale(1)" : "scale(1.05)",
          transition: "filter 0.4s ease, transform 0.4s ease",
        }}
      />
    </Avatar>
  );
};

export default LazyAvatar;
