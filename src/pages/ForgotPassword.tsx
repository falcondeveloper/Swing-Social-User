"use client";

import React, { memo, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  FormHelperText,
  useTheme,
  ThemeProvider,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { Password, Check } from "@mui/icons-material";
import Swal from "sweetalert2";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";

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

type OptionType = "" | "resetPassword" | "loginCode";

interface FormValues {
  email: string;
  option: OptionType;
}

const validationSchema: Yup.Schema<FormValues> = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  option: Yup.string<OptionType>() // keep type safety
    .oneOf(["resetPassword", "loginCode"], "Select a valid option")
    .required("Please choose an option"),
});

const initialValues: FormValues = { email: "", option: "" };

async function postJson<TResponse>(
  url: string,
  payload: unknown
): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  try {
    return (await res.json()) as TResponse;
  } catch {
    return {} as TResponse;
  }
}

interface ForgotPasswordProps {
  onClose?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onClose }) => {
  const router = useRouter();
  const theme = useTheme();
  const handleClose = typeof onClose === "function" ? onClose : () => {};

  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    const email = values.email.trim();
    try {
      if (values.option === "resetPassword") {
        await postJson("/api/user/resetPasswordEmail", { userName: email });
        actions.resetForm();
        await Swal.fire({
          title: "Email Sent Successfully",
          text: "A password reset email has been sent to your inbox.",
          icon: "success",
          confirmButtonText: "Got It",
        });
        handleClose();
      } else if (values.option === "loginCode") {
        const code = Math.floor(1000 + Math.random() * 9000);
        await postJson("/api/user/resetLoginCodeEmail", { email, code });
        if (typeof window !== "undefined") {
          sessionStorage.setItem("loginOtp", String(code));
        }
        actions.resetForm();
        await Swal.fire({
          title: "Login Code Sent!",
          text: "Check your email for a 4-digit code.",
          icon: "success",
          confirmButtonText: "OK",
        });
        handleClose();
        router.push(`/verify-code?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      await Swal.fire({
        title: "Something went wrong",
        text: message,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const yourTextFieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      color: "white",
      backgroundColor: "rgba(255,255,255,0.05)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  } as const;

  return (
    <>
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
                <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
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
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#fff"
                    sx={{ mt: 1, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    Need Help Logging In?
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#aaa"
                    sx={{ mt: 0.5, fontSize: { xs: "0.85rem", sm: "1rem" } }}
                  >
                    Enter your email and choose how you’d like to get back in
                  </Typography>
                </Box>

                <Formik<FormValues>
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <form noValidate onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        margin="normal"
                        autoComplete="email"
                        inputProps={{ "aria-label": "Email address" }}
                        sx={yourTextFieldSx}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="option-label">
                          Choose an option
                        </InputLabel>
                        <Select
                          labelId="option-label"
                          id="demo-simple-select"
                          label="Choose an option"
                          name="option"
                          value={values.option}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={yourTextFieldSx}
                        >
                          <MenuItem value="resetPassword">
                            Email me a Password Reset Link
                          </MenuItem>
                          <MenuItem value="loginCode">
                            Email me a 4-digit Login Code
                          </MenuItem>
                        </Select>
                        {touched.option && Boolean(errors.option) && (
                          <FormHelperText>{errors.option}</FormHelperText>
                        )}
                      </FormControl>

                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !values.option}
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Check />
                          )
                        }
                        sx={{
                          py: 1.5,
                          mb: 2,
                          my: 3,
                          position: "relative",
                          overflow: "hidden",
                          color: "white",
                          background:
                            "linear-gradient(45deg, #FF2D55, #7000FF)",
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
                        {isSubmitting ? "Sending..." : "Send"}
                      </Button>

                      <Box
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
                        <Link href="/login" onClick={handleClose}>
                          Back to Login
                        </Link>
                      </Box>
                    </form>
                  )}
                </Formik>

                <Typography
                  variant="caption"
                  color="#fff"
                  sx={{
                    display: "block",
                    mt: 2,
                    textAlign: "center",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Tip: Check your spam folder if you don’t see our email.
                </Typography>
              </Paper>
            </RotatingCard>
          </Container>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default ForgotPassword;
