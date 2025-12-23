"use client";

import SwipeCardComponent from "@/swiping-card/Card";
import Header from "@/swiping-card/Header";
import { Box } from "@mui/material";
import React from "react";

const page = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header />
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          mt: "60px",
        }}
      >
        <SwipeCardComponent />
      </Box>
    </Box>
  );
};

export default page;
