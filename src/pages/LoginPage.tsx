"use client";

import React, { useEffect, useMemo, useState, useRef, memo } from "react";
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
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Swal from "sweetalert2";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const theme = createTheme({
  palette: {
    primary: { main: "#FF2D55", light: "#FF617B", dark: "#CC1439" },
    secondary: { main: "#7000FF", light: "#9B4DFF", dark: "#5200CC" },
    success: { main: "#00D179" },
    background: { default: "#0A0118" },
  },
  typography: { fontFamily: '"Poppins", "Roboto", "Arial", sans-serif' },
  // shape: { borderRadius: 16 },
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
      sx={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.6 }}
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
              "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: 0 },
              "50%": { opacity: 0.8 },
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
  const [rotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  return (
    <Box
      ref={cardRef}
      sx={{ perspective: "1000px", transformStyle: "preserve-3d" }}
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

const getOS = () => {
  const ua = window.navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "MacOS";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
};

const trackHit = async ({
  aff,
  refer,
}: {
  aff: string | null;
  refer: string | null;
}) => {
  if (!aff && !refer) return null;
  try {
    const ipData = await fetch("https://ipapi.co/json").then((r) => r.json());
    const payload = {
      affiliate: aff,
      referral: refer,
      OS: getOS(),
      page: "Login",
      url: window.location.href,
      userid: null,
      ip: ipData?.ip,
      city: ipData?.city,
      region: ipData?.region,
      country_name: ipData?.country_name,
    };
    const res = await fetch("/api/user/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data?.data?.HitId ?? null;
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">(
    "password"
  );
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "" });

  useEffect(() => {
    const id = localStorage.getItem("logged_in_profile");
    const urlParams = new URLSearchParams(window.location.search);
    const aff = urlParams.get("aff");
    const refer = urlParams.get("refer");
    (async () => {
      try {
        const ipData = await fetch("https://ipapi.co/json").then((r) =>
          r.json()
        );
        await fetch("/api/user/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliate: aff,
            referral: refer,
            OS: getOS(),
            page: "Login",
            url: window.location.href,
            userid: id || null,
            ip: ipData?.ip,
            city: ipData?.city,
            region: ipData?.region,
            country_name: ipData?.country_name,
          }),
        });
      } catch {}
    })();
  }, []);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .required("Email is required")
          .email("Enter a valid email"),
        password:
          loginMethod === "password"
            ? Yup.string().required("Please enter a password")
            : Yup.string().notRequired(),
      }),
    [loginMethod]
  );

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const aff = urlParams.get("aff");
      const refer = urlParams.get("refer");
      const hitId = await trackHit({ aff, refer });

      try {
        if (loginMethod === "password") {
          const res = await fetch("/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.email.trim(),
              pwd: values.password.trim(),
              hitid: hitId,
            }),
          });
          const data = await res.json();

          await new Promise((r) => setTimeout(r, 800));

          setSnack({ open: true, message: data.message ?? "Welcome!" });

          if (data.status === 404 || data.status === 500) return;

          if (data.currentuserName === "Webnew") {
            return router.push(`/screenname/${data.currentProfileId}`);
          }

          localStorage.setItem("loginInfo", data.jwtToken);
          localStorage.setItem("logged_in_profile", data.currentProfileId);
          localStorage.setItem("profileUsername", data.currentuserName);
          localStorage.setItem("memberalarm", data.memberAlarm);
          localStorage.setItem("memberShip", data.memberShip);
          router.push("/home");
        } else {
          const code = Math.floor(1000 + Math.random() * 9000);
          const res = await fetch("/api/user/resetLoginCodeEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.email.trim(),
              code,
              hitid: hitId,
            }),
          });
          const data = await res.json();
          if (data?.success === "false" || data?.success === false) {
            setSnack({ open: true, message: data.message ?? "Welcome!" });
            return;
          } else {
            await Swal.fire({
              title: "Login Code Sent!",
              text: "We’ve emailed you a 4-digit one-time login code. Enter this code to access your account.",
              icon: "success",
              confirmButtonText: "OK",
            });

            sessionStorage.setItem("loginOtp", String(code));
            router.push(
              `/verify-code?email=${encodeURIComponent(values.email.trim())}`
            );
            setLoginMethod("password");
          }
        }
      } catch (e) {
        setSnack({
          open: true,
          message: "Something went wrong. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
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
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <img
                    src="/logo.png"
                    alt="SwingSocial Logo"
                    style={{
                      width: "250px",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                      objectFit: "cover",
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 500,
                      background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      mt: 1,
                    }}
                  >
                    Welcome Back! Sign in to Continue
                  </Typography>
                </Box>
              </Box>

              <Box component="form" noValidate onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  label={
                    loginMethod === "password" ? "Email or Username" : "Email"
                  }
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.4)",
                      },
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  }}
                />

                {loginMethod === "password" && (
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                          borderRadius: "12px",
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

                <Button
                  fullWidth
                  type="submit"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    position: "relative",
                    overflow: "hidden",
                    color: "white",
                    borderRadius: "12px",
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
                    "@keyframes shine": { "100%": { left: "100%" } },
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
                <Typography
                  onClick={() => router.push("/forgot-password")}
                  sx={{
                    textAlign: "end",
                    cursor: "pointer",
                    color: "#FF2D55",
                    marginBottom: "15px",
                    marginTop: "2px",
                  }}
                >
                  <Link href="forgot-password">Lost your password?</Link>
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1, bgcolor: "rgba(255,255,255,0.2)" }} />
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.9rem",
                      px: 2,
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
                  <Typography
                    onClick={() => setLoginMethod("otp")}
                    sx={{
                      cursor: "pointer",
                      py: 1.2,
                      mb: 1,
                      color: "#fff",
                      fontWeight: 500,
                      textAlign: "center",
                      letterSpacing: { xs: 0.4, sm: 1 },
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                    }}
                  >
                    Login w/Email Code (no password needed)
                  </Typography>
                ) : (
                  <Typography
                    onClick={() => setLoginMethod("password")}
                    sx={{
                      cursor: "pointer",
                      py: 1.2,
                      mb: 1,
                      color: "#fff",
                      fontWeight: 500,
                      textAlign: "center",
                      letterSpacing: { xs: 0.4, sm: 1 },
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                    }}
                  >
                    Login w/password
                  </Typography>
                )}

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
                        background: "linear-gradient(45deg, #FF2D55, #7000FF)",
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
                  New to Swing Social?{" "}
                  <Link href="/register">Create an account</Link>
                </Typography>
              </Box>
            </Paper>
          </RotatingCard>
        </Container>
      </Box>

      <Snackbar
        open={snack.open}
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
              sx={{ width: 20, height: 20 }}
            />
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default LoginPage;
