"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <Box
        component={motion.div}
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          component="img"
          src="/loading.png"
          alt="logo"
          sx={{ width: 44, height: 44 }}
        />

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 800,
            color: "#C2185B",
            letterSpacing: 1,
          }}
        >
          SWINGSOCIAL
        </Typography>
      </Box>

      {/* INFINITE LOADING LINE */}
      <Box
        sx={{
          position: "relative",
          width: 180,
          height: 3,
          overflow: "hidden",
          borderRadius: 10,
          backgroundColor: "rgba(194,24,91,0.25)",
        }}
      >
        <Box
          component={motion.div}
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent, #C2185B, transparent)",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Box>

      {/* Subtitle */}
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#C2185B",
          opacity: 0.85,
          maxWidth: 260,
        }}
      >
        The best dating & events platform for Swingers
      </Typography>
    </Box>
  );
};

export default Loader;
