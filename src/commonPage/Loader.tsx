import { Box, Typography } from "@mui/material";
import React from "react";

interface LoadingScreenProps {
  logoSrc?: string;
}

const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
    }
    100% {
      transform: translateX(100%) skewX(-15deg);
    }
  }
`;

const loadingBarKeyframes = `
  @keyframes loadingBar {
    0% {
      left: -30%;
      width: 30%;
    }
    50% {
      width: 40%;
    }
    100% {
      left: 100%;
      width: 30%;
    }
  }
`;

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  logoSrc = "/loading.png",
}) => {
  return (
    <>
      <style>
        {shimmerKeyframes}
        {loadingBarKeyframes}
      </style>
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 1,
            gap: "12px",
          }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Logo"
            sx={{
              width: "50px",
              height: "auto",
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: "32px",
              letterSpacing: "-0.02em",
              fontWeight: "bold",
              color: "#C2185B",
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              },
            }}
          >
            SWINGSOCIAL
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            width: "120px",
            height: "2px",
            backgroundColor: "rgba(194,24,91,0.2)",
            borderRadius: "4px",
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
              borderRadius: "4px",
              animation: "loadingBar 1.5s infinite",
            }}
          />
        </Box>

        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: "14px",
              letterSpacing: "0.02em",
              opacity: 0.9,
              color: "#C2185B",
              position: "relative",
              overflow: "hidden",
              fontWeight: "bold",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              },
            }}
          >
            The best dating and events platform for Swingers
          </Typography>
        </Box>
      </Box>
    </>
  );
};

const Loader = () => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#121212"
      >
        <LoadingScreen logoSrc="/loading.png"></LoadingScreen>
      </Box>
    </>
  );
};

export default Loader;
