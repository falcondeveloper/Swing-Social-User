"use client";

import {
  Box,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Card,
  CardContent,
  TextField,
  IconButton,
} from "@mui/material";
import React, { memo, useEffect, useMemo, useState } from "react";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QRCode from "react-qr-code";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { DownloadIcon, ShareIcon } from "lucide-react";
import * as htmlToImage from "html-to-image";

const theme = createTheme({
  palette: {
    primary: { main: "#FF2D55", light: "#FF617B", dark: "#CC1439" },
    secondary: { main: "#7000FF", light: "#9B4DFF", dark: "#5200CC" },
    success: { main: "#00D179" },
    background: { default: "#0A0118" },
  },
  typography: { fontFamily: '"Poppins", "Roboto", "Arial", sans-serif' },
});

const ParticleField = memo(() => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const particles = useMemo(() => {
    const count = isMobile ? 15 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * (isMobile ? 4 : 6) + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * (isMobile ? 15 : 20) + 10,
      delay: -Math.random() * 20,
    }));
  }, [isMobile]);

  return (
    <Box
      sx={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.5 }}
    >
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: "absolute",
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: "linear-gradient(45deg, #FF2D55, #7000FF)",
            borderRadius: "50%",
            animation: `float ${p.duration}s infinite linear`,
            animationDelay: `${p.delay}s`,
            "@keyframes float": {
              "0%": { transform: "translate(0, 0)", opacity: 0 },
              "50%": { opacity: 0.8 },
              "100%": { transform: "translate(100px, -100px)", opacity: 0 },
            },
          }}
        />
      ))}
    </Box>
  );
});

const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <Card
    sx={{
      bgcolor: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      borderRadius: "20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      color: "white",
      textAlign: "center",
      transition: "0.3s",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      },
    }}
  >
    <CardContent>
      <Box mb={1}>{icon}</Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h5" fontWeight="bold" color="primary.main">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ReferalPage = () => {
  const [profile, setProfile] = useState<any>();
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<string>("");
  const qrRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenDevice = localStorage.getItem("loginInfo");
      if (tokenDevice) {
        const decodeToken = jwtDecode<any>(tokenDevice);
        setProfile(decodeToken);
        const fetchAffiliateCode = async () => {
          try {
            const res = await fetch("/api/user/getaffiliate-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profileId: decodeToken?.profileId }),
            });

            const data = await res.json();
            if (data.success) {
              setAffiliateCode(data.affiliate_code);
              setAffiliateLink(
                `https://swingsocial.co/?aff=${data.affiliate_code}`
              );
            }
          } catch (err) {
            console.error("Error fetching affiliate code:", err);
          }
        };

        fetchAffiliateCode();
      }
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Affiliate link copied!");
  };

  const handleShare = async () => {
    const message = `🎉 Join me on SwingSocial!\n\n
Earn rewards on your signup. Use my referral link below:`;

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
          position: "relative",
          overflow: "hidden",
          px: 3,
          py: 8,
        }}
      >
        <ParticleField />

        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
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
            Swing Social Affiliate Program
          </Typography>
          <Typography variant="h6" gutterBottom>
            Earn <strong>50% commission</strong> on referrals + $4 monthly per
            user 🎉
          </Typography>
        </Box>

        {/* Stats Section */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3,1fr)",
            },
            gap: 3,
            maxWidth: "1000px",
            mx: "auto",
            mb: 8,
          }}
        >
          <StatCard
            icon={<MonetizationOnIcon fontSize="large" />}
            title="Monthly Commission"
            value="$3 / Referral"
          />
          <StatCard
            icon={<TrendingUpIcon fontSize="large" />}
            title="One Referral in 5 Yrs"
            value="$240"
          />
          <StatCard
            icon={<GroupsIcon fontSize="large" />}
            title="100 Referrals in 5 Yrs"
            value="$24,000"
          />
        </Box>

        {/* QR + Affiliate Link Section */}
        {affiliateCode && (
          <Box textAlign="center" mb={8}>
            <Box
              ref={qrRef}
              sx={{
                display: "inline-block",
                p: 2,
                bgcolor: "white",
                borderRadius: "12px",
              }}
            >
              <QRCode value={affiliateLink} size={180} />
            </Box>
            <Typography variant="body2" mt={2}>
              Share this QR or copy your affiliate link below.
            </Typography>

            <Button
              onClick={handleDownloadQR}
              variant="outlined"
              startIcon={<DownloadIcon size={18} />}
              sx={{
                mt: 2,
                borderRadius: "20px",
                color: "white",
                borderColor: "white",
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
            >
              Download QR Code
            </Button>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                maxWidth: "700px",
                mx: "auto",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {/* Affiliate URL */}
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
                    pr: 0, // remove extra padding
                  },
                  "& input": {
                    whiteSpace: "nowrap",
                    overflowX: "auto", // scroll if long
                    textOverflow: "unset",
                  },
                }}
              />

              {/* Buttons on the right side */}
              <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                <IconButton onClick={handleCopy} sx={{ color: "white" }}>
                  <ContentCopyIcon />
                </IconButton>
                <IconButton onClick={handleShare} sx={{ color: "white" }}>
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}

        {/* View Reports Button */}
        <Box textAlign="center" mt={6}>
          <Link href="/dashboard/reports">
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                mb: 4,
                fontSize: "1rem",
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
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default ReferalPage;
