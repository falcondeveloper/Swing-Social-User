"use client";

import React, { memo, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { toast } from "react-toastify";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const ParticleField = memo(() => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const particles = useMemo(() => {
    const count = isMobile ? 15 : 50;
    return [...Array(count)].map((_, i) => ({
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
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: 0.6,
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: "linear-gradient(45deg, #FF2D55, #7000FF)",
            borderRadius: "50%",
            animation: `float ${particle.duration}s infinite linear`,
            animationDelay: `${particle.delay}s`,
            "@keyframes float": {
              "0%": {
                transform: "translate(0, 0) rotate(0deg)",
                opacity: 0,
              },
              "50%": {
                opacity: 0.8,
              },
              "100%": {
                transform: "translate(100px, -100px) rotate(360deg)",
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
});

const MembershipCheckPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "No email found";

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [billingCycle, setBillingCycle] = useState("1");
  const [checking, setChecking] = useState(false);
  const [membershipData, setMembershipData] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const callApi = async () => {
      if (!email || email === "No email found") return;
      setChecking(true);
      try {
        const res = await fetch("/api/user/check-membership", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!data.success && (data.status === 404 || res.status === 404)) {
          setMembershipData({ notFound: true, message: data.message });
          setModalOpen(true);
          setChecking(false);
          return;
        }

        if (data.success) {
          setMembershipData(data);
          setModalOpen(true);
        } else {
          toast.error(data.message || "Failed to check membership");
        }
      } catch (err: any) {
        console.error("Membership API error:", err);
        toast.error("Unable to reach membership service.");
      } finally {
        setChecking(false);
      }
    };

    callApi();
  }, [email]);

  const handleCloseModal = () => setModalOpen(false);

  const handleSignup = () => router.push("/register");

  const handleLogin = () => router.push("/login");

  const handleSelectPremium = (plan: string, price: string) => {
    localStorage.setItem("ssprice", price);
    localStorage.setItem("ssplan", plan);
    localStorage.setItem("ssunit", billingCycle);
    localStorage.setItem("email", email);
    localStorage.setItem("userName", membershipData?.username || "");
    router.push(`/plan/payment/${membershipData?.profileId}`);
  };

  const membershipStatusNormalized = (
    membershipData?.membershipStatus ||
    membershipData?.membership ||
    membershipData?.title ||
    ""
  )
    .toString()
    .toLowerCase();

  const isFreeMember =
    membershipStatusNormalized.includes("free") ||
    (membershipData?.title &&
      membershipData.title.toLowerCase().includes("free"));

  const isActiveMember =
    membershipStatusNormalized.includes("active") ||
    Boolean(membershipData?.subscription) ||
    (membershipData?.title &&
      membershipData.title.toLowerCase().includes("member"));

  const renderModalContent = () => {
    if (!membershipData) {
      return (
        <DialogContentText>
          {checking ? "Checking membership..." : "No data available."}
        </DialogContentText>
      );
    }

    if (membershipData.notFound) {
      return (
        <>
          <DialogContentText mb={2}>
            No profile found for this email — please sign up again.
          </DialogContentText>
          <DialogContentText color="text.secondary" mb={2}>
            We couldn't find an account registered with <strong>{email}</strong>
            . If you already signed up, try again with the email you used during
            registration. Otherwise, tap Sign Up to create a new account.
          </DialogContentText>
        </>
      );
    }

    if (isFreeMember) {
      return (
        <>
          <DialogContentText mb={2}>
            Welcome back,{" "}
            {membershipData.username ?? membershipData.Username ?? "friend"}!
          </DialogContentText>

          <DialogContentText color="text.secondary" mb={2}>
            It looks like you're on our <strong>Free</strong> plan. To unlock
            premium features (unlimited messages, priority visibility, exclusive
            events), please purchase a Premium membership.
          </DialogContentText>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="primary" mb={1}>
              Why upgrade to Premium?
            </Typography>
            <ul style={{ marginTop: 0, marginBottom: 12 }}>
              <li>Send unlimited messages</li>
              <li>Priority placement in searches</li>
              <li>Access to private & paid events</li>
              <li>Profile boosts and more</li>
            </ul>
            <Typography variant="body2" color="text.secondary">
              Pick a billing cycle and tap Purchase to continue.
            </Typography>
          </Box>
        </>
      );
    }

    if (isActiveMember) {
      return (
        <>
          <DialogContentText mb={2}>
            You're already a premium member — thank you!
          </DialogContentText>

          <DialogContentText color="text.secondary" mb={2}>
            <strong>Plan:</strong>{" "}
            {membershipData.title ?? membershipData.Title ?? "Premium"} <br />
            <strong>Price:</strong>{" "}
            {membershipData.price ?? membershipData.Price ?? "N/A"} <br />
            <strong>Email:</strong>{" "}
            {membershipData.email ?? membershipData.Email ?? email}
          </DialogContentText>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              You're already a premium member you can login to access all
              features.
            </Typography>
          </Box>
        </>
      );
    }

    return (
      <DialogContentText>
        {membershipData.message ?? "Membership information retrieved."}
      </DialogContentText>
    );
  };

  const plans = [
    {
      title: "Premium",
      price:
        billingCycle === "1"
          ? "$17.95"
          : billingCycle === "3"
          ? "$39.95"
          : billingCycle === "6"
          ? "$69.95"
          : "$129.95",
      features: [
        "Browse & Search Members",
        "Browse & Search Events",
        "Design Your Own Profile",
        "View Other Members Profiles",
        "Send Unlimited Messages to Members",
        "Get Tickets to Free & Paid Private Events",
      ],
      devFeatures: [
        "Browse Travel & Make Bookings",
        "Read Blog",
        "What's Hot & Upload",
        "Comment & React to What's Hot Posts",
        "Play Dates",
      ],
      availability: {
        features: [true, true, true, true, true, true],
        devFeatures: [true, true, true, true, true],
      },
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top left, #1A0B2E 0%, #000000 100%)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <ParticleField />
        <Container
          maxWidth="sm"
          sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 1.5, sm: 2 } }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            <Box mt={3}>
              <Typography
                variant="body1"
                mb={2}
                textAlign="center"
                sx={{ color: "#fff" }}
              >
                Choose your billing cycle
              </Typography>

              <Box
                sx={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  display: { xs: "block", md: "flex" },
                  justifyContent: { md: "center" },
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                <ToggleButtonGroup
                  value={billingCycle}
                  exclusive
                  onChange={(_, value) => value && setBillingCycle(value)}
                  sx={{
                    display: "inline-flex",
                    flexWrap: "nowrap",
                    "& .MuiToggleButton-root": {
                      flex: "0 0 auto",
                      color: "#fff",
                      borderColor: "#f50057",
                      m: 0.5,
                      px: 2,
                      backgroundColor: "#1c1c1c",
                      borderRadius: 3,
                      whiteSpace: "nowrap",
                      "&.Mui-selected": {
                        backgroundColor: "#f50057 !important",
                        color: "#fff",
                        borderColor: "#f50057",
                      },
                      "&:hover": {
                        backgroundColor: "#f73378",
                      },
                    },
                  }}
                >
                  <ToggleButton value="1">Monthly</ToggleButton>
                  <ToggleButton value="3">Quarterly</ToggleButton>
                  <ToggleButton value="6">Bi-Annually</ToggleButton>
                  <ToggleButton value="12">Annually</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Box
              mt={4}
              width={isMobile ? "100%" : "100%"}
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              margin={"30px auto"}
              justifyContent="center"
              alignItems="stretch"
              gap={3}
            >
              {plans?.map((plan, i) => (
                <Card
                  key={plan.title}
                  sx={{
                    flex: 1,
                    borderRadius: 3,
                    backgroundColor: "#1c1c1c",
                    border: "1px solid #333",
                    p: 1,
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" color="#f50057" mb={1}>
                      {plan.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      color="#fff"
                      fontWeight="bold"
                      mb={2}
                    >
                      {plan.price}
                      <Typography component="span" variant="body2" ml={1}>
                        USD
                      </Typography>
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      color="#f50057"
                      gutterBottom
                    >
                      Features
                    </Typography>
                    {plan.features.map((text, idx) => (
                      <Box key={idx} display="flex" alignItems="center" mb={1}>
                        {plan.availability.features[idx] ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <RemoveCircleIcon color="error" fontSize="small" />
                        )}
                        <Typography variant="body2" ml={1} color="#fff">
                          {text}
                        </Typography>
                      </Box>
                    ))}

                    <Typography
                      variant="subtitle1"
                      color="#f50057"
                      mt={2}
                      gutterBottom
                    >
                      In Development
                    </Typography>
                    {plan.devFeatures.map((text, idx) => (
                      <Box key={idx} display="flex" alignItems="center" mb={1}>
                        {plan.availability.devFeatures[idx] ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <RemoveCircleIcon color="error" fontSize="small" />
                        )}
                        <Typography variant="body2" ml={1} color="#fff">
                          {text}
                        </Typography>
                      </Box>
                    ))}

                    {membershipData?.membershipStatus === "Free" ? (
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={isProcessing}
                        sx={{
                          mt: 3,
                          backgroundColor: "#f50057",
                          "&:hover": { backgroundColor: "#c51162" },
                        }}
                        onClick={() =>
                          handleSelectPremium(plan.title, plan.price)
                        }
                      >
                        {isProcessing ? (
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                          `Select ${plan.title} Plan`
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 3, color: "#fff", borderColor: "#555" }}
                        onClick={handleLogin}
                      >
                        Already a Premium Member — Login
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Container>

        {/* Modal */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="lg"
          disableEscapeKeyDown
        >
          <DialogTitle>
            {membershipData?.title
              ? `Membership Status - ${membershipData?.title}`
              : "Membership Status"}
          </DialogTitle>
          <DialogContent dividers>
            {checking ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={20} />
                <Typography>Checking membership...</Typography>
              </Box>
            ) : (
              renderModalContent()
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            {membershipData?.notFound ? (
              <Button
                variant="contained"
                onClick={handleSignup}
                sx={{
                  backgroundColor: "#f50057",
                  "&:hover": { backgroundColor: "#c51162" },
                }}
              >
                Sign Up
              </Button>
            ) : isFreeMember ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  sx={{
                    backgroundColor: "#f50057",
                    "&:hover": { backgroundColor: "#c51162" },
                  }}
                >
                  {isProcessing ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Purchase Membership"
                  )}
                </Button>
              </>
            ) : isActiveMember ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  sx={{ backgroundColor: "#1976d2" }}
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleCloseModal}>Close</Button>
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  sx={{ backgroundColor: "#1976d2" }}
                >
                  Login
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

const MembershipCheckPageContent = () => (
  <Suspense
    fallback={
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    }
  >
    <MembershipCheckPage />
  </Suspense>
);

export default MembershipCheckPageContent;
