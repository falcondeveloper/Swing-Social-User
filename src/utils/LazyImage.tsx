"use client";

import { Box, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

interface LazyImageProps {
  src: string;
  direction: "left" | "right";
}

export default function LazyImage({ src, direction }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 1,
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        />
      )}

      <img
        src={src}
        draggable={false}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",

          opacity: loaded ? 1 : 0,
          transform: loaded
            ? "translateX(0)"
            : `translateX(${direction === "right" ? "30px" : "-30px"})`,

          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      />
    </Box>
  );
}
