"use client";

import React, { useEffect, useState, useRef, useMemo, memo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  ThemeProvider,
  createTheme,
  Modal,
  Backdrop,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Password,
  Check,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Swal from "sweetalert2";
import Link from "next/link";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF2D55",
      light: "#FF617B",
      dark: "#CC1439",
    },
    secondary: {
      main: "#7000FF",
      light: "#9B4DFF",
      dark: "#5200CC",
    },
    success: {
      main: "#00D179",
    },
    background: {
      default: "#0A0118",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
});

interface ValidationState {
  email: {
    error: boolean;
    message: string;
  };
  password: {
    error: boolean;
    message: string;
  };
}

interface RestValidationState {
  resetUserName: {
    error: boolean;
    message: string;
  };

  resetPassword: {
    error: boolean;
    message: string;
  };
}

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

const RotatingCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={cardRef}
      // onMouseMove={handleMouseMove}
      // onMouseLeave={handleMouseLeave}
      sx={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <Box
        sx={{
          transition: "transform 0.1s ease-out",
          transform: `rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(false);
  const [resetUserName, setResetUserName] = useState<string>("");
  const [loginMethod, setLoginMethod] = useState("password");
  const [validation, setValidation] = useState<ValidationState>({
    email: {
      error: false,
      message: "",
    },
    password: {
      error: false,
      message: "",
    },
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [otpOption, setOtpOption] = useState("");
  const [resetValidation, setResetValidation] = useState<RestValidationState>({
    resetUserName: {
      error: false,
      message: "",
    },
    resetPassword: {
      error: false,
      message: "",
    },
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  useEffect(() => {
    const id = localStorage.getItem("logged_in_profile");
    const urlParams = new URLSearchParams(window.location.search);
    const aff = urlParams.get("aff");
    const refer = urlParams.get("refer");

    const getOS = () => {
      const userAgent = window.navigator.userAgent;

      if (userAgent.indexOf("Win") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "MacOS";
      if (userAgent.indexOf("Android") !== -1) return "Android";
      if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";

      return "Unknown";
    };

    const currentUrl = window.location.href;
    const currentPage = "Login";

    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((ipData) => {
        const payload = {
          affiliate: aff,
          referral: refer,
          OS: getOS(),
          page: currentPage,
          url: currentUrl,
          userid: id || null,
          ip: ipData?.ip,
          city: ipData?.city,
          region: ipData?.region,
          country_name: ipData?.country_name,
        };

        fetch("/api/user/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Tracking saved:", data);
          })
          .catch((err) => {
            console.error("Failed to save tracking:", err);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch IP:", err);
      });
  }, []);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const PasswordRequirements = (password: string) => {
    if (!password) {
      return {
        error: true,
        message: "Please enter a password",
      };
    } else {
      return {
        error: false,
        message: "",
      };
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return {
        error: true,
        message: "Email is required",
      };
    }

    return {
      error: false,
      message: "",
    };
  };

  const validateResetUserName = (email: string) => {
    if (!email) {
      return {
        error: true,
        message: "Email is required",
      };
    }

    return {
      error: false,
      message: "",
    };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value.trim();
    setEmail(newEmail);
    if (touched.email) {
      setValidation((prev) => ({
        ...prev,
        email: validateEmail(newEmail),
      }));
    }
  };

  const handleResetUserNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newUserName = e.target.value.trim();
    console.log(newUserName);
    setResetUserName(newUserName);
    setResetValidation((prev) => ({
      ...prev,
      resetUserName: validateResetUserName(newUserName),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.trim();
    setPassword(newPassword);
    if (touched.password) {
      setValidation((prev) => ({
        ...prev,
        password: PasswordRequirements(password),
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const aff = urlParams.get("aff");
    const refer = urlParams.get("refer");

    const getOS = () => {
      const userAgent = window.navigator.userAgent;
      if (userAgent.indexOf("Win") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "MacOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";
      if (userAgent.indexOf("Android") !== -1) return "Android";
      if (
        userAgent.indexOf("iPhone") !== -1 ||
        userAgent.indexOf("iPad") !== -1
      )
        return "iOS";
      return "Unknown";
    };

    const currentUrl = window.location.href;
    const currentPage = "Login";

    let hitId: string | null = null;

    if (aff || refer) {
      try {
        const ipRes = await fetch("https://ipapi.co/json");
        const ipData = await ipRes.json();

        const trackingPayload = {
          affiliate: aff,
          referral: refer,
          OS: getOS(),
          page: currentPage,
          url: currentUrl,
          userid: null,
          ip: ipData?.ip,
          city: ipData?.city,
          region: ipData?.region,
          country_name: ipData?.country_name,
        };

        const trackingRes = await fetch("/api/user/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trackingPayload),
        });

        const trackingData = await trackingRes.json();
        console.log("Tracking saved:", trackingData);
        hitId = trackingData?.data?.HitId ?? null;
      } catch (err) {
        console.error("Failed to save tracking:", err);
      }
    }

    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = PasswordRequirements(password);

    setValidation({
      email: emailValidation,
      password: passwordValidation,
    });

    setTouched({
      email: true,
      password: true,
    });

    if (!emailValidation.error && !passwordValidation.error) {
      setLoading(true);
      try {
        const payload = {
          email: email,
          pwd: password,
          hitid: hitId,
        };

        const result = await fetch("/api/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await result.json();

        await new Promise((resolve) => setTimeout(resolve, 2000));

        setMessage(data.message);

        if (data.status === 404 || data.status === 500) {
          setOpen(true);
        } else {
          setOpen(true);
          if (data.currentuserName === "Webnew") {
            router.push(`/screennameadmin/${data.currentProfileId}`);
          } else {
            localStorage.setItem("loginInfo", data.jwtToken);
            localStorage.setItem("logged_in_profile", data.currentProfileId);
            localStorage.setItem("profileUsername", data.currentuserName);
            localStorage.setItem("memberalarm", data.memberAlarm);
            localStorage.setItem("memberShip", data.memberShip);
            router.push("/home");
          }
        }
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPasswordEmail = async () => {
    const resetValidation = validateResetUserName(resetUserName);
    if (!resetValidation.error) {
      const payload = {
        userName: resetUserName,
      };
      setSubmitLoading(true);

      try {
        const result = await fetch("/api/user/resetPasswordEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (result) {
          setShowLocationModal(false);
          setResetUserName("");
          setOtpOption("");
          Swal.fire({
            title: "Email Sent Successfully",
            text: "A password reset email has been sent to your inbox. Please check your email and follow the instructions to reset your password.",
            icon: "success",
            confirmButtonText: "Got It",
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handleSendLoginCodeEmail = async () => {
    const resetValidation = validateResetUserName(resetUserName);
    let code = Math.floor(1000 + Math.random() * 9000);

    if (!resetValidation.error) {
      setSubmitLoading(true);

      try {
        const response = await fetch("/api/user/resetLoginCodeEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: resetUserName, code: code }),
        });

        if (response.ok) {
          setShowLocationModal(false);
          setResetUserName("");
          Swal.fire({
            title: "Login Code Sent!",
            text: "We’ve emailed you a 4-digit one-time login code. Enter this code on the login page to access your account.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            const encodedEmail = encodeURIComponent(resetUserName);
            router.push(`/verify-code?email=${encodedEmail}`);
            sessionStorage.setItem("loginOtp", code.toString());
            setOtpOption("");
            setLoginMethod("password");
          });
        } else {
          setShowLocationModal(false);
          Swal.fire({
            title: "Something went wrong",
            text: "We couldn’t send the login code. Please try again later or contact support.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error(error);
        setShowLocationModal(false);
        Swal.fire({
          title: "Error",
          text: "An unexpected error occurred. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handleLoginViaOTP = async (event: React.FormEvent) => {
    event.preventDefault();

    const code = Math.floor(1000 + Math.random() * 9000);
    const urlParams = new URLSearchParams(window.location.search);
    const aff = urlParams.get("aff");
    const refer = urlParams.get("refer");

    const getOS = () => {
      const userAgent = window.navigator.userAgent;
      if (userAgent.indexOf("Win") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "MacOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";
      if (userAgent.indexOf("Android") !== -1) return "Android";
      if (
        userAgent.indexOf("iPhone") !== -1 ||
        userAgent.indexOf("iPad") !== -1
      )
        return "iOS";
      return "Unknown";
    };

    const currentUrl = window.location.href;
    const currentPage = "Login";

    let hitId: string | null = null;

    if (aff || refer) {
      try {
        const ipRes = await fetch("https://ipapi.co/json");
        const ipData = await ipRes.json();

        const trackingPayload = {
          affiliate: aff,
          referral: refer,
          OS: getOS(),
          page: currentPage,
          url: currentUrl,
          userid: null,
          ip: ipData?.ip,
          city: ipData?.city,
          region: ipData?.region,
          country_name: ipData?.country_name,
        };

        const trackingRes = await fetch("/api/user/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trackingPayload),
        });

        const trackingData = await trackingRes.json();
        console.log("Tracking saved:", trackingData);
        hitId = trackingData?.data?.HitId ?? null;
      } catch (err) {
        console.error("Failed to save tracking:", err);
      }
    }

    const emailValidation = validateEmail(email);

    if (!emailValidation.error) {
      setLoading(true);
      try {
        const response = await fetch("/api/user/resetLoginCodeEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, code: code, hitid: hitId }),
        });

        if (response.ok) {
          setShowLocationModal(false);
          setResetUserName("");
          Swal.fire({
            title: "Login Code Sent!",
            text: "We’ve emailed you a 4-digit one-time login code. Enter this code on the login page to access your account.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            const encodedEmail = encodeURIComponent(email);
            router.push(`/verify-code?email=${encodedEmail}`);
            sessionStorage.setItem("loginOtp", code.toString());
            setOtpOption("");
            setLoginMethod("password");
          });
        } else {
          setShowLocationModal(false);
          Swal.fire({
            title: "Something went wrong",
            text: "We couldn’t send the login code. Please try again later or contact support.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error(error);
        setShowLocationModal(false);
        Swal.fire({
          title: "Error",
          text: "An unexpected error occurred. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, #1A0B2E 0%, #000000 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ParticleField />

        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <RotatingCard>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 2, sm: 2, md: 4 },
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Box
                sx={{ mb: 4, textAlign: "center" }}
                component="form"
                onSubmit={
                  loginMethod === "password" ? handleSubmit : handleLoginViaOTP
                }
              >
                <Box
                  sx={{
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    animation: "slideDown 1s ease-out",
                  }}
                >
                  <Box
                    component="img"
                    src="/icon.png"
                    alt="Logo"
                    sx={{
                      width: "50px",
                      height: "auto",
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    SwingSocial
                  </Typography>
                </Box>
              </Box>

              <Box>
                {/* Login method toggle */}
                {/* <Box
                  sx={{
                    display: "grid",
                    justifyContent: "center",
                    gap: { xs: 1.5, sm: 2 },
                    mb: { xs: 3, sm: 5 },
                    width: "100%",
                    maxWidth: "600px",
                    mx: "auto",
                  }}
                >
                  <Button
                    variant={loginMethod === "otp" ? "contained" : "outlined"}
                    onClick={() => setLoginMethod("otp")}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.9rem", md: "0.9rem" },
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1.5, sm: 3 },
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      minHeight: { xs: "43px", sm: "45px" },
                      lineHeight: { xs: 1.2, sm: 1.5 },
                    }}
                  >
                    Login w/Email Code (no password needed)
                  </Button>
                  <Button
                    variant={
                      loginMethod === "password" ? "contained" : "outlined"
                    }
                    onClick={() => setLoginMethod("password")}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.9rem", md: "0.9rem" },
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1.5, sm: 3 },
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      minHeight: { xs: "43px", sm: "45px" },
                      lineHeight: { xs: 1.2, sm: 1.5 },
                    }}
                  >
                    Login w/Password
                  </Button>
                </Box>*/}

                <Box
                  component="form"
                  onSubmit={
                    loginMethod === "password"
                      ? handleSubmit
                      : handleLoginViaOTP
                  }
                >
                  {/* Email / Username */}
                  <TextField
                    fullWidth
                    label="Email or Username"
                    variant="outlined"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, email: true }))
                    }
                    error={touched.email && validation.email.error}
                    helperText={touched.email && validation.email.message}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        "& fieldset": {
                          borderColor: "rgba(255,255,255,0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.4)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255,255,255,0.7)",
                      },
                    }}
                  />

                  {/* Password or OTP */}
                  {loginMethod === "password" && (
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, password: true }))
                      }
                      error={touched.password && validation.password.error}
                      helperText={
                        touched.password && validation.password.message
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.4)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                      }}
                    />
                  )}

                  {/* Submit Button */}
                  <Button
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mb: 2,
                      my: 3,
                      position: "relative",
                      overflow: "hidden",
                      color: "white",
                      background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "200%",
                        height: "100%",
                        background:
                          "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                        animation: "shine 2s infinite",
                      },
                      "@keyframes shine": {
                        "100%": {
                          left: "100%",
                        },
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : loginMethod === "password" ? (
                      "SIGN IN"
                    ) : (
                      "Send Email Code"
                    )}
                  </Button>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        flexGrow: 1,
                        bgcolor: "rgba(255,255,255,0.2)",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "0.9rem",
                      }}
                    >
                      OR
                    </Typography>
                    <Box
                      sx={{
                        flexGrow: 1,
                        height: 1,
                        bgcolor: "rgba(255,255,255,0.2)",
                      }}
                    />
                  </Box>

                  {loginMethod === "password" ? (
                    <Button
                      fullWidth
                      onClick={() => setLoginMethod("otp")}
                      sx={{
                        py: 1.2,
                        mb: 1,
                        color: "#fff",
                        border: "none",
                        background: "transparent",
                        fontWeight: 500,
                        letterSpacing: 1,
                      }}
                    >
                      Login w/Email Code (no password needed)
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => setLoginMethod("password")}
                      sx={{
                        py: 1.2,
                        mb: 1,
                        color: "#fff",
                        border: "none",
                        background: "transparent",
                        fontWeight: 500,
                        letterSpacing: 1,
                      }}
                    >
                      Login w/password
                    </Button>
                  )}

                  {/* Links */}
                  <Typography
                    sx={{
                      mt: 3,
                      textAlign: "center",
                      color: "rgba(255,255,255,0.7)",
                      "& a": {
                        color: "primary.main",
                        textDecoration: "none",
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          width: "100%",
                          height: "2px",
                          bottom: -2,
                          left: 0,
                          background:
                            "linear-gradient(45deg, #FF2D55, #7000FF)",
                          transform: "scaleX(0)",
                          transition: "transform 0.3s ease",
                          transformOrigin: "right",
                        },
                        "&:hover::after": {
                          transform: "scaleX(1)",
                          transformOrigin: "left",
                        },
                      },
                    }}
                  >
                    New to Swing Social?
                    <Link href="/registeradmin">Create an account</Link>
                  </Typography>

                  <Typography
                    onClick={() => {
                      setShowLocationModal(true);
                    }}
                    sx={{
                      mt: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      color: "#FF2D55",
                      "& a": {
                        color: "primary.main",
                        textDecoration: "none",
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          width: "100%",
                          height: "2px",
                          bottom: -2,
                          left: 0,
                          background:
                            "linear-gradient(45deg, #FF2D55, #7000FF)",
                          transform: "scaleX(0)",
                          transition: "transform 0.3s ease",
                          transformOrigin: "right",
                        },
                        "&:hover::after": {
                          transform: "scaleX(1)",
                          transformOrigin: "left",
                        },
                      },
                    }}
                  >
                    Forget Password? Reset your password
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </RotatingCard>
        </Container>

        <Modal
          open={showLocationModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <Password sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
              Need Help Logging In?
            </Typography>

            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={resetUserName}
              onChange={handleResetUserNameChange}
              error={resetValidation.resetUserName.error}
              helperText={
                resetValidation.resetUserName.error
                  ? resetValidation.resetUserName.message
                  : ""
              }
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  color: "#FF2D55",
                  backgroundColor: "white",
                  "& fieldset": { borderColor: "#FF2D55" },
                  "&:hover fieldset": { borderColor: "#FF617B" },
                  "&.Mui-focused fieldset": { borderColor: "#7000FF" },
                  "&.Mui-error fieldset": { borderColor: "#FF0000" },
                },
                "& .MuiInputLabel-root": {
                  color: "#FF2D55!important",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#7000FF",
                },
                "& .MuiInputLabel-root.Mui-error": {
                  color: "#FF0000",
                },
              }}
            />

            <Typography sx={{ mb: 3 }}>
              Choose an option to regain access to your account:
            </Typography>

            <Select
              fullWidth
              value={otpOption}
              onChange={(e) => setOtpOption(e.target.value)}
              displayEmpty
              sx={{ mb: 3 }}
            >
              <MenuItem value="" disabled>
                Select an option
              </MenuItem>
              <MenuItem value="resetPassword">
                Email me a Password Reset Link
              </MenuItem>
              <MenuItem value="loginCode">
                Email me a 4-digit Login Code
              </MenuItem>
            </Select>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                if (!otpOption) {
                  Swal.fire({
                    title: "Select an Option",
                    text: "Please choose an option before proceeding.",
                    icon: "warning",
                    confirmButtonText: "OK",
                  });
                  return;
                }
                if (otpOption === "resetPassword") {
                  handleResetPasswordEmail();
                } else if (otpOption === "loginCode") {
                  handleSendLoginCodeEmail();
                }
              }}
              disabled={submitLoading || !otpOption}
              sx={{
                background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                py: 1.5,
                px: 4,
                mb: 1,
              }}
              startIcon={
                submitLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Check />
                )
              }
            >
              {submitLoading ? "Sending..." : "Send"}
            </Button>

            <Button
              variant="text"
              onClick={() => {
                router.push("/login");
                setShowLocationModal(false);
              }}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </Box>
        </Modal>
      </Box>

      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          severity="success"
          sx={{
            backgroundColor: "white",
            color: "#fc4c82",
            fontWeight: "bold",
            alignItems: "center",
            borderRight: "5px solid #fc4c82",
          }}
          icon={
            <Box
              component="img"
              src="/icon.png"
              alt="Logo"
              sx={{
                width: "20px",
                height: "20px",
              }}
            />
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default LoginPage;
