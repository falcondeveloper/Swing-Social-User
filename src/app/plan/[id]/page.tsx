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
  Alert,
  CircularProgress
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { TireRepair } from "@mui/icons-material";
import { title } from "process";
import { useRouter } from "next/navigation";
import Link from 'next/link'
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

type Params = Promise<{ id: string }>
export default function Pricing(props: { params: Params }) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [billingCycle, setBillingCycle] = useState("1");
  const [userName, setUsername] = useState<any>('');
  const [fullName, setFullName] = useState<any>('');
  const [email, setEmail] = useState<any>('');
  const [id, setId] = useState<string>(''); // State for error messages
  const [password, setPassword] = useState<any>('');
  const [firstMonthFree, setFirstMonthFree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFullName(localStorage.getItem('fullName'))
    setUsername(localStorage.getItem('userName'))
    setEmail(localStorage.getItem('email'));
    setPassword(localStorage.getItem('password'))
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    const handlePromoState = async () => {
      const params = await props.params;
      const userid: any = params.id;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/state?userid=${userid}`);
        if (!response.ok) {
          console.log("Error : please check it out");
        }
        const { user: advertiserData } = await response.json();
        console.log(advertiserData);
        const [city, state] = advertiserData.Location.split(", ");

        const result = await fetch("/api/user/promostate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: state,
          }),
        });

        const data = await result.json();

        if (data.result == 1) {
          setFirstMonthFree(true);
          console.log("Free Month");
        } else {
          console.log("Premium Month");
          setFirstMonthFree(false);
        }
      } catch (error) {
        console.error("Error fetching promo state:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getIdFromParam();
    handlePromoState();
  }, [props]);
  const handleTabChange = (event: any, newValue: any) => {
    setSelectedTab(newValue);
  };

  const handleBillingCycleChange = (event: any, newCycle: any) => {
    console.log(newCycle);
    if (newCycle) {
      setBillingCycle(newCycle);
    }
  };

  const plans = [
    {
      title: "Premium",
      price:
        billingCycle === "1"
          ? "$ 17.95"
          : billingCycle === "12"
            ? "$ 129.95"
            : billingCycle === "3"
              ? "$ 39.95"
              : "$ 69.95",
      core_features: [
        {
          title: "Browse & Search Members",
          available: true
        },
        {
          title: "Browse & Search Events",
          available: true
        },
        {
          title: "Design Your Own Profile",
          available: true
        },
        {
          title: "View Other Members Profiles",
          available: true
        },
        {
          title: "Send Unlimited Messages to Members",
          available: true
        },
        {
          title: "Get Tickets to Free & Paid Private Events",
          available: true
        },
      ],
      in_development: [
        {
          title: "Browse Travel & Make Bookings",
          available: true
        },
        {
          title: "Browse & Read Blog",
          available: true
        },
        {
          title: "What's Hot Search & Upload",
          available: true
        },
        {
          title: "Comment & React to What's Hot Posts",
          available: true
        },
        {
          title: "Play Dates",
          available: true
        },
      ]
    },
    {
      title: "Free",
      price: "$ 0",
      core_features: [
        {
          title: "Browse & Search Members",
          available: true
        },
        {
          title: "Browse & Search Events",
          available: true
        },
        {
          title: "Design Your Own Profile",
          available: true
        },
        {
          title: "View Other Members Profiles",
          available: false
        },
        {
          title: "Send Unlimited Messages to Members",
          available: false
        },
        {
          title: "Get Tickets to Free & Paid Private Events",
          available: false
        },
      ],
      in_development: [
        {
          title: "Browse Travel & Make Bookings",
          available: true
        },
        {
          title: "Browse & Read Blog",
          available: true
        },
        {
          title: "What's Hot Search & Upload",
          available: true
        },
        {
          title: "Comment & React to What's Hot Posts",
          available: false
        },
        {
          title: "Play Dates",
          available: true
        },
      ]
    },
    
  ];

  const sendEmail = async (username: string, email: string) => {
    try {
      const response = await fetch("/api/user/email", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, email: email }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Email sent successfully:", data);
    } catch (error: any) {
      console.error("Error sending email:", error.message);
    }
  }

  const handleLogin = async (userName: string, password: string) => {
    const payload = {
      email: userName,
      pwd: password
    }

    const result = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await result.json();
    console.log(data)

    localStorage.setItem('loginInfo', data.jwtToken);
    localStorage.setItem('logged_in_profile', data.currentProfileId);
    localStorage.setItem('profileUsername', data.currentuserName);
    localStorage.setItem('memberalarm', data.memberAlarm);
    localStorage.setItem('memberShip', data.memberShip);
    window.location.href = 'https://swing-social-user.vercel.app/login';
  }

  const handleNavigation = (plan: string, price: string) => {
    if (plan == 'Free') {
      toast.success('You have subscribe to free plan successfully');
      sendEmail(userName, email);
      Swal.fire({
        title: `Thank you ${userName}!  Your password is ${password}`,
        text: 'You will now be directed to login again to confirm your account and start using Swingsocial!',
        icon: 'success',
        confirmButtonText: 'Tap here to login',
      }).then(() => {

        // Redirect after the user clicks "OK"
        handleLogin(userName, password);
      });
      // Redirect to an external URL      
    } else {
      localStorage.setItem('ssprice', price);
      localStorage.setItem('ssplan', plan);
      localStorage.setItem('ssunit', billingCycle);
      router.push(`/plan/payment/${id}`);
    }

  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          margin: "auto",
          mt: 5,
          p: 3,
          borderRadius: 2,
          backgroundColor: "#000",
          color: "#fff",
          border: '1px solid'
        }}
      >
        {isLoading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '200px',
              gap: 2 // adds space between elements
            }}
          >
            <CircularProgress 
              sx={{ 
                color: '#f50057', // matches your theme color
                mb: 2 
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': {
                    opacity: 0.6,
                  },
                  '50%': {
                    opacity: 1,
                  },
                  '100%': {
                    opacity: 0.6,
                  }
                }
              }}
            >
              Checking Your Promostate...
            </Typography>
          </Box>
        ) : firstMonthFree ? (
          <Box>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              textColor="secondary"
              indicatorColor="secondary"
              sx={{
                mb: 3,
                "& .MuiTabs-flexContainer": {
                  justifyContent: "space-around",
                },
              }}
            >
              <Tab
                label="Premium"
                sx={{
                  color: selectedTab === 1 ? "#f50057" : "#fff",
                  textTransform: "none",
                }}
                onClick={() => {
                  if (firstMonthFree) {
                    setBillingCycle("1");
                  }
                }}
              />
              <Tab
                label="Free"
                sx={{
                  color: selectedTab === 0 ? "#f50057" : "#fff",
                  textTransform: "none",
                }}
              />
            </Tabs>
            {selectedTab === 0 ? (<Typography variant="h6" mb={2} sx={{textAlign: "center"}}>
              Signup for only $1 the first month, then $17.95 monthly
            </Typography>) : null}
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" mb={2}>
              Select a plan
            </Typography>
            {/* <Alert variant="filled" sx={{ background: '#f50057' }}>Premium acccess only $1 for the first month!</Alert> */}
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              textColor="secondary"
              indicatorColor="secondary"
              sx={{
                mb: 3,
                "& .MuiTabs-flexContainer": {
                  justifyContent: "space-around",
                },
              }}
            >
              <Tab
                label="Premium"
                sx={{
                  color: selectedTab === 1 ? "#f50057" : "#fff",
                  textTransform: "none",
                }}
              />
              <Tab
                label="Free"
                sx={{
                  color: selectedTab === 0 ? "#f50057" : "#fff",
                  textTransform: "none",
                }}
              />
            </Tabs>

            {selectedTab === 0 && (
              <Box
                sx={{
                  mb: 3,
                  textAlign: "center",
                }}
              >

                <ToggleButtonGroup
                  value={billingCycle}
                  exclusive
                  onChange={handleBillingCycleChange}
                  aria-label="Billing Cycle"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    "& .MuiToggleButton-root": {
                      color: "#fff",
                      border: "1px solid #444",
                      backgroundColor: "#2a2a2a",
                      "&.Mui-selected": {
                        backgroundColor: "#f50057",
                        color: "#fff",
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
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {plans.map((plan, index) => {
            if (index === selectedTab)
              return (
                <Card
                  key={plan.title}
                  sx={{
                    width: 300,
                    borderRadius: 2,
                    border: index === selectedTab ? "2px solid #f50057" : "1px solid #444",
                    backgroundColor: "#2a2a2a",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      sx={{ color: index === selectedTab ? "#f50057" : "#fff", mb: 1 }}
                    >
                      {selectedTab === 1 ? plan.title : firstMonthFree ? "$1 Membership" : plan.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
                    >
                      {selectedTab === 1 ? plan.price : firstMonthFree ? "$1" : plan.price}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ ml: 1, color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        USD
                      </Typography>
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#f50057", mb: 2, textTransform: "uppercase" }}
                    >
                      Core Features
                    </Typography>
                    {plan.core_features.map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {feature.available == true ? <CheckCircleIcon sx={{ fontSize: 20, color: "#4caf50", mr: 1 }} /> : <RemoveCircleIcon sx={{ fontSize: 20, color: "red", mr: 1 }} />}
                        <Typography variant="body2">{feature.title}</Typography>
                      </Box>
                    ))}
                    <Typography
                      variant="h6"
                      sx={{ color: "#f50057", mb: 2, textTransform: "uppercase" }}
                    >
                      In Development
                    </Typography>
                    {plan.in_development.map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {feature.available == true ? <CheckCircleIcon sx={{ fontSize: 20, color: "#4caf50", mr: 1 }} /> : <RemoveCircleIcon sx={{ fontSize: 20, color: "red", mr: 1 }} />}
                        <Typography variant="body2">{feature.title}</Typography>
                      </Box>
                    ))}

                    <Button
                      onClick={() => handleNavigation(plan.title, plan.price)}
                      variant="contained"
                      color="primary"
                      sx={{
                        mt: 3,
                        textTransform: "none",
                        backgroundColor: "#f50057",
                        "&:hover": {
                          backgroundColor: "#c51162",
                        },
                      }}
                      fullWidth
                    >
                      Select {plan.title} Plan
                    </Button>

                  </CardContent>
                </Card>

              )
          })

          }

        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Suspense>
  );
}
