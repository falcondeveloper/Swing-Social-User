"use client";

import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import React, { memo, useEffect, useMemo, useState } from "react";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReferalForm from "@/components/ReferalForm";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import ReferalDashboard from "./ReferalDashboard";

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
  const [loading, setLoading] = useState(true);
  const [hasAffiliate, setHasAffiliate] = useState<boolean | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchAffiliateStatus = async () => {
      try {
        if (typeof window !== "undefined") {
          const tokenDevice = localStorage.getItem("loginInfo");
          if (!tokenDevice) {
            await Swal.fire({
              icon: "warning",
              title: "Not Logged In",
              text: "Please log in to access the affiliate page.",
              confirmButtonColor: "#7000FF",
            });
            return;
          }

          const decoded = jwtDecode<any>(tokenDevice);
          const pid = decoded?.profileId;
          setProfileId(pid);

          // ✅ Check affiliate status
          const res = await fetch("/api/user/check-affiliate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: pid }),
          });

          const data = await res.json();
          if (data.success) {
            setHasAffiliate(data.hasAffiliate);
            setAffiliateCode(data.affiliateCode);
          } else {
            setHasAffiliate(false);
          }
        }
      } catch (err) {
        console.error("Error checking affiliate status:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to check affiliate status. Please try again later.",
          confirmButtonColor: "#7000FF",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateStatus();
  }, []);

  // 🌀 Show loading screen
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Typography variant="h6">Checking affiliate status...</Typography>
      </Box>
    );
  }

  // 🆕 If user does not have affiliate code, show application form
  if (hasAffiliate === false) {
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
            px: 2,
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
              Swing Social Affiliate Application
            </Typography>
            <Typography variant="h6" gutterBottom>
              Apply to become an affiliate and start earning instantly.
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
              title="Signup Commission"
              value="50%"
            />
            <StatCard
              icon={<TrendingUpIcon fontSize="large" />}
              title="Monthly Recurring"
              value="$4 / Member"
            />
            <StatCard
              icon={<GroupsIcon fontSize="large" />}
              title="Lifetime Potential"
              value="$240 / Referral"
            />
          </Box>

          {/* Affiliate Application Form */}
          <ReferalForm
            onSuccess={(code: string) => {
              setHasAffiliate(true);
              setAffiliateCode(code);
            }}
          />
        </Box>
        <Footer />
      </ThemeProvider>
    );
  }

  // 🎉 If already an affiliate, show affiliate dashboard
  return <ReferalDashboard affiliateCode={affiliateCode} />;
};

export default ReferalPage;
