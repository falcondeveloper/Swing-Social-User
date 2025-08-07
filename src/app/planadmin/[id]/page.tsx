// app/pricing/page.tsx

"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

type Params = Promise<{ id: string }>;

export default function Pricing({ params }: { params: Params }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedTab, setSelectedTab] = useState(0);
  const [billingCycle, setBillingCycle] = useState("1");
  const [userName, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [firstMonthFree, setFirstMonthFree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setFullName(localStorage.getItem("fullName") || "");
    setUsername(localStorage.getItem("userName") || "");
    setEmail(localStorage.getItem("email") || "");
    setPassword(localStorage.getItem("password") || "");

    const initialize = async () => {
      const { id } = await params;
      setId(id);
      setIsLoading(true);

      try {
        const res = await fetch(`/api/user/state?userid=${id}`);
        const { user } = await res.json();
        const state = user.Location.split(", ")[1];

        const promoRes = await fetch("/api/user/promostate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        });

        const promoData = await promoRes.json();
        setFirstMonthFree(promoData.result == 1);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [params]);

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
    {
      title: "Free",
      price: "$0",
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
        features: [true, true, true, false, false, false],
        devFeatures: [true, true, true, false, true],
      },
    },
  ];

  const handlePlanSelect = async (plan: string, price: string) => {
    setIsProcessing(true);
    try {
      if (plan === "Free") {
        toast.success("Subscribed to Free plan!");
        await sendEmail(userName, email);

        await Swal.fire({
          title: "You're All Set!",
          html: `
          <p style="margin-bottom: 10px;">Your free plan has been activated successfully.</p>
          <strong>You're now ready to explore the platform.</strong>
        `,
          icon: "success",
          confirmButtonText: "Access Swingsocial",
          confirmButtonColor: "#f50057",
        });

        await handleLogin(userName, password);
      } else {
        localStorage.setItem("ssprice", price);
        localStorage.setItem("ssplan", plan);
        localStorage.setItem("ssunit", billingCycle);
        router.push(`/planadmin/payment/${id}`);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendEmail = async (username: string, email: string) => {
    await fetch("/api/user/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
  };

  const handleLogin = async (userName: string, password: string) => {
    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userName, pwd: password }),
    });

    const data = await response.json();
    localStorage.setItem("loginInfo", data.jwtToken);
    localStorage.setItem("logged_in_profile", data.currentProfileId);
    localStorage.setItem("profileUsername", data.currentuserName);
    localStorage.setItem("memberalarm", data.memberAlarm);
    localStorage.setItem("memberShip", data.memberShip);
    router.push("/home");
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        sx={{
          px: 2,
          py: 4,
          width: "100%",
          backgroundColor: "#000",
          color: "#fff",
          minHeight: "100vh",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "#f50057" }} />
            <Typography variant="h6">Checking Promo State...</Typography>
          </Box>
        ) : (
          <>
            <Tabs
              value={selectedTab}
              onChange={(_, value) => setSelectedTab(value)}
              centered
              variant={isMobile ? "fullWidth" : "standard"}
              textColor="secondary"
              indicatorColor="secondary"
            >
              <Tab
                label="Premium"
                sx={{ color: selectedTab === 0 ? "#f50057" : "#fff" }}
              />
              <Tab
                label="Free"
                sx={{ color: selectedTab === 1 ? "#f50057" : "#fff" }}
              />
            </Tabs>

            {selectedTab === 0 && (
              <Box mt={3}>
                <Typography variant="body1" mb={2} textAlign="center">
                  {firstMonthFree
                    ? "Enjoy your first month for just $1!"
                    : "Choose your billing cycle:"}
                </Typography>

                {!firstMonthFree && (
                  <Box
                    sx={{
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      px: 1,
                      "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar on mobile
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
                )}
              </Box>
            )}

            <Box
              mt={4}
              width={isMobile ? "100%" : "40%"}
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              margin={"30px auto"}
              justifyContent="center"
              alignItems="stretch"
              gap={3}
            >
              {plans
                .filter((_, i) => i === selectedTab)
                .map((plan, i) => (
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
                        {firstMonthFree && selectedTab === 0
                          ? "$1"
                          : plan.price}
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
                        <Box
                          key={idx}
                          display="flex"
                          alignItems="center"
                          mb={1}
                        >
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
                        <Box
                          key={idx}
                          display="flex"
                          alignItems="center"
                          mb={1}
                        >
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

                      <Button
                        variant="contained"
                        fullWidth
                        disabled={isProcessing}
                        sx={{
                          mt: 3,
                          backgroundColor: "#f50057",
                          "&:hover": {
                            backgroundColor: "#c51162",
                          },
                        }}
                        onClick={() => handlePlanSelect(plan.title, plan.price)}
                      >
                        {isProcessing ? (
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                          `Select ${plan.title} Plan`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </>
        )}
      </Box>
    </Suspense>
  );
}
