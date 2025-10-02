"use client";

import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  useMediaQuery,
  CircularProgress,
  Divider,
  TableContainer,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import RepeatIcon from "@mui/icons-material/Repeat";
import { memo, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";

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

// Mini Stat Card
const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: string;
}) => (
  <Card
    sx={{
      bgcolor: "rgba(255,255,255,0.07)",
      borderRadius: "20px",
      p: 2,
      textAlign: "center",
      color: "white",
      transition: "0.3s",
      boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
      },
    }}
  >
    <CardContent>
      <Box mb={1} fontSize={36}>
        {icon}
      </Box>
      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
        {title}
      </Typography>
      <Typography
        variant="h6"
        fontWeight="bold"
        color={color || "primary.main"}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ReportsPage = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenDevice = localStorage.getItem("loginInfo");
      if (tokenDevice) {
        const decodeToken = jwtDecode<any>(tokenDevice);
        const fetchAffiliateCode = async () => {
          try {
            const res = await fetch("/api/user/get-affiliate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ affiliateId: decodeToken?.profileId }),
            });

            const data = await res.json();
            if (data.success) {
              setStats(data.stats);
              setLoading(false);
            }
          } catch (err) {
            console.error("Error fetching affiliate code:", err);
          }
        };

        fetchAffiliateCode();
      }
    }
  }, []);

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
        {/* Page Title */}
        <Box textAlign="center" mb={5}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight="bold"
            sx={{
              background: "linear-gradient(90deg,#FF2D55,#7000FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Referral Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "gray", mt: 1 }}>
            Track your referrals, commissions, and earnings in real-time
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={10}>
            <CircularProgress color="primary" />
          </Box>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 3,
                maxWidth: "1200px",
                mx: "auto",
                mb: 6,
              }}
            >
              <StatCard
                icon={<GroupsIcon fontSize="large" />}
                title="Total Referrals"
                value={stats.total_referrals}
                color="primary.main"
              />
              <StatCard
                icon={<RepeatIcon fontSize="large" />}
                title="Monthly Recurring"
                value={`$${parseFloat(stats.monthly_recurring).toFixed(2)}`}
                color="secondary.main"
              />
              <StatCard
                icon={<MonetizationOnIcon fontSize="large" />}
                title="Lifetime Earnings"
                value={`$${stats.total_commissions}`}
                color="success.main"
              />
            </Box>

            {/* Divider */}
            <Divider
              sx={{
                borderColor: "rgba(255,255,255,0.1)",
                mb: 4,
                maxWidth: "1000px",
                mx: "auto",
              }}
            />

            {/* Referral History */}
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={2}
              textAlign="center"
              color="white"
            >
              Referral History
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                maxWidth: "1000px",
                mx: "auto",
                overflow: "auto",
              }}
            >
              <Table>
                {/* Table Head */}
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(90deg,#FF2D55,#7000FF)",
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      #
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Name
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Date
                      </TableCell>
                    )}
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Commission
                    </TableCell>
                  </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                  {stats.referral_details.map((ref: any, index: number) => (
                    <TableRow
                      key={ref.id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: "rgba(255,255,255,0.03)",
                        },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <TableCell sx={{ color: "white" }}>{index + 1}</TableCell>
                      <TableCell
                        sx={{ color: "white", textTransform: "capitalize" }}
                      >
                        {ref.referred_firstname || "N/A"}{" "}
                        {ref.referred_lastname || ""}
                      </TableCell>

                      {!isMobile && (
                        <TableCell sx={{ color: "white" }}>
                          {new Date(ref.createdat).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                      )}

                      {/* Status with badge */}
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            bgcolor:
                              ref.status.toLowerCase() === "active"
                                ? "rgba(0, 209, 121, 0.15)"
                                : "rgba(255, 76, 76, 0.15)",
                            color:
                              ref.status.toLowerCase() === "active"
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {ref.status}
                        </Box>
                      </TableCell>

                      {/* Commission */}
                      <TableCell
                        sx={{ color: "secondary.light", fontWeight: "bold" }}
                      >
                        ${ref.totalcommission}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography textAlign="center" mt={5} color="gray">
            No referral data found.
          </Typography>
        )}
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default ReportsPage;
