"use client";

import { Box, Typography } from "@mui/material";
import React from "react";

interface LoadingScreenProps {
  logoSrc?: string;
}

const Loader: React.FC<LoadingScreenProps> = ({ logoSrc = "/loading.png" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#121212",
        position: "relative",
      }}
    >
      {/* Logo + Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          gap: "12px",
        }}
      >
        <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 50 }} />

        <Typography
          sx={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#C2185B",
          }}
        >
          SWINGSOCIAL
        </Typography>
      </Box>

      {/* Loading bar */}
      <Box
        sx={{
          position: "relative",
          width: 120,
          height: 2,
          backgroundColor: "rgba(194,24,91,0.2)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            backgroundColor: "#C2185B",
            borderRadius: 4,
            animation: "loadingBar 1.5s infinite",
            "@keyframes loadingBar": {
              "0%": { left: "-30%", width: "30%" },
              "50%": { width: "40%" },
              "100%": { left: "100%", width: "30%" },
            },
          }}
        />
      </Box>

      {/* Subtitle */}
      <Typography
        sx={{
          mt: 2,
          fontSize: 14,
          fontWeight: "bold",
          color: "#C2185B",
          opacity: 0.9,
          textAlign: "center",
        }}
      >
        The best dating and events platform for Swingers
      </Typography>
    </Box>
  );
};

export default Loader;
