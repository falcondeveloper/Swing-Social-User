"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { DownloadIcon, ShareIcon, PlusIcon, TrashIcon } from "lucide-react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import * as htmlToImage from "html-to-image";
import Link from "next/link";
import AffiliateBanner from "./AffiliateBanner";
import AffiliateDashboard from "./AffiliateDashboard";

const theme = createTheme({
  palette: {
    primary: { main: "#FF2D55", light: "#FF617B", dark: "#CC1439" },
    secondary: { main: "#7000FF", light: "#9B4DFF", dark: "#5200CC" },
    success: { main: "#00D179" },
    background: { default: "#0A0118" },
  },
  typography: { fontFamily: '"Poppins", "Roboto", "Arial", sans-serif' },
});

interface Props {
  affiliateCode?: string | null;
}

const ReferalDashboard: React.FC<Props> = ({ affiliateCode }) => {
  const [affiliateLink, setAffiliateLink] = useState<string>("");
  const [tab, setTab] = useState<number>(0);

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (affiliateCode) {
      setAffiliateLink(`https://swingsocial.co/?aff=${affiliateCode}`);
    }
  }, [affiliateCode]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadQR = async () => {
    if (qrRef.current === null) return;
    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);
      const link = document.createElement("a");
      link.download = `affiliate-qr-${affiliateCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download QR code", err);
    }
  };

  const handleShare = async () => {
    if (!affiliateLink) return;
    const message = `🎉 Join me on SwingSocial!\n\nEarn rewards using my referral link:\n${affiliateLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on SwingSocial!",
          text: message,
          url: affiliateLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(message);
      toast.info("Referral link copied to clipboard!");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Box
        sx={{
          minHeight: "100vh",
          color: "white",
          background:
            "radial-gradient(circle at top left, #1A0B2E 0%, #000000 100%)",
          px: 3,
          py: 8,
        }}
      >
        {/* Page Heading */}
        <Typography
          component="h1"
          fontWeight="bold"
          textAlign="center"
          marginBottom={4}
          gutterBottom
          sx={{
            fontSize: {
              xs: "1.8rem",
              sm: "2.3rem",
              md: "3rem",
              lg: "3.5rem",
              xl: "4rem",
            },
            lineHeight: 1.2,
            letterSpacing: "0.5px",
            background: "linear-gradient(90deg,#FF2D55,#7000FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "all 0.3s ease",
          }}
        >
          Affiliate Dashboard
        </Typography>

        {/* Tabs Menu */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          textColor="inherit"
          sx={{
            mb: 4,
            width: "100%",
            maxWidth: "600px",
            mx: "auto",
            "& .MuiTab-root": {
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              letterSpacing: "1px",
              fontSize: "0.95rem",
              textTransform: "uppercase",
              minHeight: "48px",
              minWidth: "auto",
              flex: 1,
              transition: "all 0.3s ease",
            },
            "& .Mui-selected": {
              color: "#fff",
              background: "linear-gradient(90deg,#FF2D55,#7000FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            },
            "& .MuiTabs-indicator": {
              height: "3px",
              borderRadius: "3px",
              background: "linear-gradient(90deg,#FF2D55,#7000FF)",
              width: "50%",
              transition: "all 0.4s ease",
            },
          }}
        >
          <Tab label="Links" />
          <Tab label="Banners" />
          <Tab label="View Reports" />
        </Tabs>

        {/* ------------------ LINKS SECTION ------------------ */}
        {tab === 0 && (
          <Box textAlign="center">
            {/* QR Section */}
            <Box mb={6}>
              <Box
                ref={qrRef}
                sx={{
                  display: "inline-block",
                  p: 2,
                  bgcolor: "white",
                  borderRadius: "12px",
                  mb: 2,
                }}
              >
                <QRCode value={affiliateLink || ""} size={180} />
              </Box>

              <Typography variant="body2" sx={{ mb: 2 }}>
                Share this QR code or copy your unique link below.
              </Typography>

              <Button
                onClick={handleDownloadQR}
                variant="outlined"
                startIcon={<DownloadIcon size={18} />}
                sx={{
                  mt: 1,
                  borderRadius: "20px",
                  color: "white",
                  borderColor: "white",
                  "&:hover": { background: "rgba(255,255,255,0.1)" },
                }}
              >
                Download QR Code
              </Button>
            </Box>

            {/* Default Affiliate Link */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "700px",
                mx: "auto",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <TextField
                fullWidth
                value={affiliateLink}
                InputProps={{
                  readOnly: true,
                  disableUnderline: true,
                  style: {
                    color: "white",
                    fontFamily: "monospace",
                    fontSize: "0.95rem",
                  },
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": { border: "none", pr: 0 },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                <IconButton
                  onClick={() => handleCopy(affiliateLink)}
                  sx={{ color: "white" }}
                >
                  <ContentCopyIcon />
                </IconButton>
                <IconButton onClick={handleShare} sx={{ color: "white" }}>
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}

        {/* ------------------ BANNERS SECTION ------------------ */}
        {tab === 1 && (
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              textAlign="center"
              sx={{
                background: "linear-gradient(90deg,#FF2D55,#7000FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Affiliate Banners
            </Typography>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mb: 4, opacity: 0.8 }}
            >
              Use these banners in your website, blog, or newsletters. Each one
              includes your affiliate link.
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <AffiliateBanner affiliateCode={affiliateLink} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ------------------ AFFILIATE DASHBOARD SECTION ------------------ */}
        {tab === 2 && (
          <>
            <AffiliateDashboard />
          </>
        )}
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default ReferalDashboard;
