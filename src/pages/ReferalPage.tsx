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
} from "@mui/material";
import React, { memo, useMemo } from "react";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QRCode from "react-qr-code";

const userAffiliateCode = "3422";
const affiliateLink = `https://swingsocial.co/?aff=${userAffiliateCode}`;

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

const StepCard = ({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card
    sx={{
      bgcolor: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      p: 2,
      color: "white",
      textAlign: "center",
    }}
  >
    <CardContent>
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          color: "primary.main",
          fontWeight: "bold",
        }}
      >
        {step}
      </Typography>
      <Box mb={1}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
    </CardContent>
  </Card>
);

const ReferalPage = () => {
  return (
    <ThemeProvider theme={theme}>
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
          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "30px",
              background: "linear-gradient(90deg,#FF2D55,#7000FF)",
              transition: "0.3s",
              "&:hover": {
                transform: "scale(1.08)",
                boxShadow: "0px 0px 25px rgba(255,45,85,0.6)",
              },
            }}
          >
            Sign Up Now
          </Button>
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
            value="$4 / Referral"
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

        {/* Step Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            How It Works
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 3,
            maxWidth: "1000px",
            mx: "auto",
            mb: 8,
          }}
        >
          <StepCard
            step="1️⃣"
            icon={<PersonAddAlt1Icon fontSize="large" />}
            title="Register"
            description="Sign up and get your unique referral link."
          />
          <StepCard
            step="2️⃣"
            icon={<ShareIcon fontSize="large" />}
            title="Share"
            description="Promote Swing Social with your link."
          />
          <StepCard
            step="3️⃣"
            icon={<StarIcon fontSize="large" />}
            title="Earn"
            description="Earn 50% signup + $4 monthly per referral."
          />
        </Box>

        {/* Details Section */}
        <Box sx={{ maxWidth: "850px", mx: "auto", textAlign: "center", mb: 8 }}>
          <Typography variant="body1" paragraph>
            Swing Social is an alternative lifestyle platform for couples and
            singles. Our users are loyal —{" "}
            <strong>80% stay active for an average of 5 years!</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            That means <strong>$240 per referral</strong>,{" "}
            <strong>$2,400 for 10 referrals</strong>, and{" "}
            <strong>$24,000 for 100 referrals</strong>.
          </Typography>
        </Box>

        {/* Final CTA */}
        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.8,
              fontSize: "1.2rem",
              fontWeight: "bold",
              borderRadius: "40px",
              background: "linear-gradient(90deg,#FF2D55,#7000FF)",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            Sign up today!
          </Button>
        </Box>

        {/* QR Code Section */}
        <Box
          sx={{
            textAlign: "center",
            mt: 10,
            mb: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Share Your QR Code
          </Typography>

          <QRCode
            value={affiliateLink}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
          />

          <Typography variant="body2" mt={2}>
            New users can scan this QR code to sign up with your affiliate link.
          </Typography>

          <Button
            startIcon={<ContentCopyIcon />}
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => {
              navigator.clipboard.writeText(affiliateLink);
            }}
          >
            Copy Link
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ReferalPage;
