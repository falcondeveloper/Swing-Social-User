"use client";

import React, { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import * as htmlToImage from "html-to-image";
import { toast } from "react-toastify";

interface AffiliateDatingBannerProps {
  affiliateCode: string;
}

const AffiliateDatingBanner: React.FC<AffiliateDatingBannerProps> = ({
  affiliateCode,
}) => {
  const bannerRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const [downloading, setDownloading] = useState(false);

  const bannerImages = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"];

  const handleDownload = async (index: number) => {
    const ref = bannerRefs[index];
    if (!ref.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(ref.current);
      const link = document.createElement("a");
      link.download = `swingsocial-banner-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(`Banner ${index + 1} downloaded!`);
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 5,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {bannerImages.map((img, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              ref={bannerRefs[index]}
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                backgroundColor: "#000",
              }}
            >
              <img
                src={img}
                alt={`Banner ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxWidth: "600px",
                }}
              />
            </Box>

            <Button
              variant="outlined"
              onClick={() => handleDownload(index)}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                borderRadius: "30px",
                px: 4,
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
            >
              {downloading ? "Downloading..." : `Download Banner ${index + 1}`}
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AffiliateDatingBanner;
