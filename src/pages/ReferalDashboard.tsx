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
} from "@mui/material";
import { DownloadIcon, ShareIcon } from "lucide-react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import * as htmlToImage from "html-to-image";
import Link from "next/link";
import AffiliateBanner from "./AffiliateBanner";

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
          textAlign: "center",
        }}
      >
        {/* Heading */}
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: "linear-gradient(90deg,#FF2D55,#7000FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome to Your Affiliate Dashboard 🎉
        </Typography>

        <Typography variant="h6" sx={{ mb: 5, opacity: 0.9 }}>
          Share your personalized link or QR code below to earn commissions.
        </Typography>

        {/* QR Code Section */}
        <Box textAlign="center" mb={6}>
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

        {/* Affiliate Link Box */}
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
              "& .MuiOutlinedInput-root": {
                border: "none",
                pr: 0,
              },
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

        {/* CTA Section */}
        <Box sx={{ mt: 6, mb: 6 }}>
          <Typography variant="body1" mb={2}>
            Start sharing your referral link with friends, newsletters, or
            social media!
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)" mb={6}>
            Each signup through your link earns you a commission automatically.
          </Typography>

          <Link href="/dashboard/reports" passHref>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.4,
                fontWeight: "bold",
                borderRadius: "30px",
                background: "linear-gradient(90deg,#7000FF,#FF2D55)",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              View Reports
            </Button>
          </Link>
        </Box>

        {/* 🎯 Banner Section */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: "linear-gradient(90deg,#FF2D55,#7000FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Affiliate Banners
          </Typography>

          <Typography variant="body2" sx={{ mb: 4, opacity: 0.8 }}>
            Use these banners in your website, blog, or newsletters. Each banner
            automatically includes your affiliate link.
          </Typography>

          <AffiliateBanner affiliateCode={affiliateLink} />
        </Box>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default ReferalDashboard;
