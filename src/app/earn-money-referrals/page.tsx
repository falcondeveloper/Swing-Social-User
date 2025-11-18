"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
  useMediaQuery,
  Stack,
} from "@mui/material";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import AffiliateHistory from "@/pages/affiliateData/AffiliateHistory";
import AffiliateBanners from "@/pages/affiliateData/AffiliateBanners";
import AffiliatePayment from "@/pages/affiliateData/AffiliatePayment";
import ReferalForm from "@/components/ReferalForm";
import ProfileImgCheckerModel from "@/components/ProfileImgCheckerModel";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FF2D55" },
    secondary: { main: "#7000FF" },
    background: {
      default: "#000000",
      paper: "rgba(255,255,255,0.03)",
    },
    text: {
      primary: "#EAECEF",
      secondary: "rgba(234,236,239,0.75)",
    },
  },

  typography: {
    h5: { color: "#F5F7FA", fontWeight: 700 },
    h6: { color: "#F5F7FA" },
    body1: { color: "#EAECEF" },
    body2: { color: "rgba(234,236,239,0.85)" },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.03)",
          color: "#EAECEF",
          border: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#EAECEF",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#EAECEF",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 36,
        },
        indicator: {
          background: "linear-gradient(90deg,#FF2D55,#7000FF)",
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          color: "rgba(234,236,239,0.75)",
          fontWeight: 600,
          minWidth: 100,
          "&.Mui-selected": {
            color: "#FFFFFF",
            textShadow: "0 1px 6px rgba(255,45,85,0.12)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

const page = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const isSm = useMediaQuery("(max-width:900px)");
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const [affiliateStatus, setAffiliateStatus] = useState<boolean | null>(null);
  const [profileId, setProfileId] = useState<any>(null);

  useEffect(() => {
    const fetchAffiliateStatus = async () => {
      try {
        if (typeof window !== "undefined") {
          const tokenDevice = localStorage.getItem("loginInfo");

          if (!tokenDevice) {
            Swal.fire({
              icon: "warning",
              title: "Not Logged In",
              text: "Please log in to access the affiliate page.",
              confirmButtonColor: "#7000FF",
            });
            return;
          }

          const decodeToken = jwtDecode<any>(tokenDevice);
          const userId = decodeToken?.profileId;
          setProfileId(userId);

          const statusRes = await fetch("/api/user/check-affiliate-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          });

          const statusData = await statusRes.json();
          setAffiliateStatus(statusData.check_affiliate_form_status);

          if (statusData.check_affiliate_form_status === true) {
            const res = await fetch("/api/user/getaffiliate-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profileId: userId }),
            });

            const data = await res.json();
            if (data.success) {
              setAffiliateCode(data.affiliate_code);
            }
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
      }
    };

    fetchAffiliateStatus();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, val: number) => {
    setTabIndex(val);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReferralSuccess = () => {
    setAffiliateStatus(true);
    setAffiliateCode(null);
    setTabIndex(0);
  };

  if (affiliateStatus === null) {
    return (
      <ThemeProvider theme={theme}>
        <Header />
        <Box
          sx={{
            minHeight: "50vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
        <Footer />
      </ThemeProvider>
    );
  }

  if (affiliateStatus === false) {
    return (
      <ThemeProvider theme={theme}>
        <Header />
        <ReferalForm onSuccess={handleReferralSuccess} />
        <Footer />
      </ThemeProvider>
    );
  }

  return (
    <>
      {profileId && <ProfileImgCheckerModel profileId={profileId} />}
      <ThemeProvider theme={theme}>
        <Header />
        <Box
          sx={{
            minHeight: "100vh",
            background:
              "radial-gradient(circle at top left, #1A0B2E 0%, #000000 100%)",
            py: { xs: 3, sm: 4, md: 6 },
            color: "text.primary",
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: 920, sm: 1100, md: 1400 },
              mx: "auto",
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Stack
              direction={isSm ? "column" : "row"}
              alignItems={isSm ? "stretch" : "center"}
              justifyContent="space-between"
              spacing={isSm ? 1 : 0}
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              <Typography
                variant="h5"
                sx={{
                  mr: { md: 3 },
                  fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                Affiliate Center
              </Typography>

              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                textColor="inherit"
                variant={isSm ? "scrollable" : "standard"}
                scrollButtons={isSm ? "auto" : false}
                allowScrollButtonsMobile
                sx={{
                  mt: isSm ? 1 : 0,
                  minHeight: 36,
                }}
              >
                <Tab label="My Referrals" />
                <Tab label="Payment Details" />
                <Tab label="Banners & Links" />
              </Tabs>
            </Stack>

            <Box sx={{ mt: { xs: 1, sm: 2 } }}>
              {tabIndex === 0 && <AffiliateHistory />}
              {tabIndex === 1 && <AffiliatePayment />}
              {tabIndex === 2 && (
                <AffiliateBanners affiliateCode={affiliateCode} />
              )}
            </Box>
          </Box>
        </Box>
        <Footer />
      </ThemeProvider>
    </>
  );
};

export default page;
