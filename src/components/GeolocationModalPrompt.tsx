import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";

export default function GeolocationModalPrompt({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.6)",
        zIndex: 13000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 4,
          p: 4,
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          📍 Enable Geolocation
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          To improve your experience, please enable location access. This allows us to show you personalized content and recommendations near you.
        </Typography>
        <Button variant="contained" color="primary" onClick={onClose}>
          Got it
        </Button>
      </Box>
    </Box>
  );
}
