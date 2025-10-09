"use client";

import React, { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import * as htmlToImage from "html-to-image";
import { toast } from "react-toastify";

interface AffiliateDatingBannerProps {
  affiliateCode: string;
  imageUrl?: string;
  showRightImage?: boolean;
}

const AffiliateDatingBanner: React.FC<AffiliateDatingBannerProps> = ({
  affiliateCode,
  imageUrl = "/couple.jpg", // put a nice couple image in /public
  showRightImage = true,
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const affiliateLink = `https://swingsocial.co/?aff=${affiliateCode}`;

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(bannerRef.current);
      const link = document.createElement("a");
      link.download = `swingsocial-banner.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Banner downloaded!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "#0A0118",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
      }}
    >
      {/* Banner */}
      <Box
        ref={bannerRef}
        sx={{
          width: 300,
          height: 300,
          borderRadius: "10px",
          overflow: "hidden",
          background: "linear-gradient(180deg, #FF4081 0%, #C2185B 100%)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Logo Area */}
        <Box
          sx={{
            background: "rgba(255,255,255,0.15)",
            py: 0.8,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 14,
            letterSpacing: "1px",
          }}
        >
          SWINGSOCIAL
        </Box>

        {/* Text Area */}
        <Box
          sx={{
            px: 2.5,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              color: "white",
              textTransform: "uppercase",
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            SINGLE?
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#FFEB3B",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1px",
              mb: 1,
            }}
          >
            JOIN
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              mb: 2,
            }}
          >
            SWINGSOCIAL NEWEST SOCIAL DATING PLATFORM!
          </Typography>
        </Box>

        {/* CTA Button */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFC107",
              color: "#000",
              fontWeight: 700,
              px: 3,
              py: 0.8,
              textTransform: "uppercase",
              borderRadius: "6px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              "&:hover": { backgroundColor: "#FFD54F" },
            }}
          >
            Find Out More →
          </Button>
        </Box>

        {/* Optional Image on Right or Bottom */}
        {showRightImage && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "100%",
              height: "45%",
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.5), transparent), url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
        )}
      </Box>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        variant="outlined"
        sx={{
          mt: 3,
          color: "white",
          borderColor: "rgba(255,255,255,0.3)",
          borderRadius: "30px",
          px: 4,
          "&:hover": { background: "rgba(255,255,255,0.1)" },
        }}
      >
        {downloading ? "Downloading..." : "Download Banner"}
      </Button>
    </Box>
  );
};

export default AffiliateDatingBanner;
