"use client";

import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  useTheme,
  ThemeProvider,
  useMediaQuery,
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import Swal from "sweetalert2";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { toast } from "react-toastify";

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
  option: Yup.string<OptionType>()
    .oneOf(["resetPassword", "loginCode"], "Select a valid option")
    .required("Please choose an option"),
});

const baseInitialValues: FormValues = { email: "", option: "" };

interface ForgotPasswordProps {
  onClose?: () => void;
}

const OptionCard: React.FC<{
  value: OptionType;
  title: string;
  hint: string;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
  shortcut?: string;
}> = ({ value, title, hint, selected, recommended, onSelect, shortcut }) => {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      aria-pressed={selected}
      aria-label={title}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: { xs: 1.25, sm: 2 },
        p: { xs: 1.5, sm: 2 },
        minHeight: 56,
        borderRadius: { xs: 1.5, sm: 2 },
        border: "1px solid",
        borderColor: selected
          ? "rgba(255,255,255,0.6)"
          : "rgba(255,255,255,0.2)",
        background: selected
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.04)",
        cursor: "pointer",
        transition: "all .2s",
        "&:hover": { borderColor: "rgba(255,255,255,0.6)" },
      }}
    >
      <Radio
        checked={selected}
        value={value}
        onChange={onSelect}
        inputProps={{ "aria-label": title }}
        sx={{ color: "#fff", mt: { xs: 0.25, sm: 0 } }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            color="#fff"
            fontWeight={700}
            sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="#aaa"
          sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" }, mt: 0.25 }}
        >
          {hint}
        </Typography>
      </Box>
    </Box>
  );
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onClose }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const handleClose = typeof onClose === "function" ? onClose : () => {};

  const recommendedOption: OptionType = isMobile
    ? "loginCode"
    : "resetPassword";

  const initialValues = useMemo(
    () => ({ ...baseInitialValues, option: recommendedOption }),
    [recommendedOption]
  );

  const [snack, setSnack] = useState({ open: false, message: "" });

  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    const email = values.email.trim();
    try {
      if (values.option === "resetPassword") {
        const res = await fetch("/api/user/resetPasswordEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: email,
          }),
        });
        const data = await res.json();
        if (data?.success === "false" || data?.success === false) {
          setSnack({ open: true, message: data.message ?? "Welcome!" });
          return;
        } else {
          actions.resetForm({
            values: { email: "", option: recommendedOption },
          });
          await Swal.fire({
            title: "Email Sent Successfully",
            text: "A password reset email has been sent to your inbox.",
            icon: "success",
            confirmButtonText: "Got It",
          });
          handleClose();
          router.push("/login");
        }
      } else if (values.option === "loginCode") {
        const code = Math.floor(1000 + Math.random() * 9000);
        const res = await fetch("/api/user/resetLoginCodeEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code,
          }),
        });

        const data = await res.json();
        if (data?.success === "false" || data?.success === false) {
          setSnack({ open: true, message: data.message ?? "Welcome!" });
          return;
        } else {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("loginOtp", String(code));
          }
          actions.resetForm({
            values: { email: "", option: recommendedOption },
          });
          await Swal.fire({
            title: "Login Code Sent!",
            text: "Check your email for a 4-digit code.",
            icon: "success",
            confirmButtonText: "OK",
          });
          handleClose();
          router.push(`/verify-code?email=${encodeURIComponent(email)}`);
        }
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      )
        return;
      if (e.key === "1") {
        const el = document.querySelector<HTMLInputElement>(
          'input[name="option"][value="resetPassword"]'
        );
        el?.click();
      } else if (e.key === "2") {
        const el = document.querySelector<HTMLInputElement>(
          'input[name="option"][value="loginCode"]'
        );
        el?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      color: "white",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: "12px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  } as const;

  const submitLabel = (opt: OptionType) =>
    opt === "resetPassword"
      ? "Send Reset Link"
      : opt === "loginCode"
      ? "Send 4-digit Code"
      : "Send";

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
                borderRadius: "12px",
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
                  sx={{
                    fontWeight: 500,
                    background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    mt: 1,
                  }}
                >
                  Need Help Logging In?
                </Typography>
                <Typography
                  variant="body2"
                  color="#fff"
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
                  setFieldValue,
                  isSubmitting,
                  isValid,
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
                      sx={fieldSx}
                    />

                    {/* LAZY-FRIENDLY OPTIONS */}
                    <FormControl
                      fullWidth
                      sx={{ mb: { xs: 1.5, sm: 1 } }}
                      error={touched.option && Boolean(errors.option)}
                    >
                      <Typography
                        variant="subtitle2"
                        color="#fff"
                        sx={{
                          mb: { xs: 0.75, sm: 1 },
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        Choose an option{" "}
                      </Typography>

                      <RadioGroup
                        name="option"
                        value={values.option}
                        onChange={(e) =>
                          setFieldValue("option", e.target.value)
                        }
                        row
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <FormControlLabel
                          value="resetPassword"
                          control={<Radio sx={{ display: "none" }} />}
                          label={
                            <OptionCard
                              value="resetPassword"
                              title="Email me a Password Reset Link"
                              hint="Best if you forgot your password. We’ll send a secure link."
                              selected={values.option === "resetPassword"}
                              recommended={!isMobile}
                              onSelect={() =>
                                setFieldValue("option", "resetPassword")
                              }
                              shortcut="1"
                            />
                          }
                          sx={{ m: 0 }}
                        />

                        <FormControlLabel
                          value="loginCode"
                          control={<Radio sx={{ display: "none" }} />}
                          label={
                            <OptionCard
                              value="loginCode"
                              title="Email me a 4-digit Login Code"
                              hint="Quick sign-in without changing your password. Expires soon."
                              selected={values.option === "loginCode"}
                              recommended={isMobile}
                              onSelect={() =>
                                setFieldValue("option", "loginCode")
                              }
                              shortcut="2"
                            />
                          }
                          sx={{ m: 0 }}
                        />
                      </RadioGroup>

                      {touched.option && Boolean(errors.option) && (
                        <FormHelperText>{errors.option}</FormHelperText>
                      )}

                      <Button
                        type="button"
                        onClick={() =>
                          setFieldValue("option", recommendedOption)
                        }
                        sx={{
                          mt: { xs: 1, sm: 1 },
                          alignSelf: { xs: "stretch", sm: "flex-start" }, // full width on mobile
                          textTransform: "none",
                          justifyContent: { xs: "center", sm: "flex-start" },
                        }}
                      >
                        Not sure? Choose for me
                      </Button>
                    </FormControl>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting ||
                        !values.option ||
                        !values.email ||
                        !isValid
                      }
                      sx={{
                        py: 1.5,
                        mb: 2,
                        my: 3,
                        position: "relative",
                        borderRadius: "12px",
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
                        "@keyframes shine": { "100%": { left: "100%" } },
                      }}
                    >
                      {isSubmitting ? "Sending..." : submitLabel(values.option)}
                    </Button>

                    <Link
                      href="/login"
                      style={{
                        color: "#FF2D55",
                        marginTop: 8,
                        textDecoration: "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      Back to Login
                    </Link>
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
                Tip: Check your spam folder if you don’t see our email
              </Typography>
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

export default ForgotPassword;
