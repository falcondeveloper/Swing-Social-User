"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  LinearProgress,
  createTheme,
  useMediaQuery,
  ThemeProvider,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Link as MUILink,
  Stack,
  FormControlLabel,
  Checkbox,
  Avatar,
  DialogContentText,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import Link from "next/link";

const theme = createTheme({
  palette: {
    primary: { main: "#FF2D55", light: "#FF617B", dark: "#CC1439" },
    secondary: { main: "#7000FF", light: "#9B4DFF", dark: "#5200CC" },
    success: { main: "#00D179" },
    background: { default: "#0A0118" },
  },
  typography: { fontFamily: '"Poppins", "Roboto", "Arial", sans-serif' },
});

type CityType = {
  id: number;
  City: string;
};

const WhyWeAsk = ({ title, points }: { title: string; points: string[] }) => (
  <Accordion
    sx={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#ddd",
      mb: 1,
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
      sx={{
        "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1 },
      }}
    >
      <ShieldOutlinedIcon fontSize="small" />
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Why we ask for {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {points.map((p, i) => (
          <li key={i} style={{ marginBottom: 6, lineHeight: 1.4 }}>
            {p}
          </li>
        ))}
      </ul>
    </AccordionDetails>
  </Accordion>
);

type PolicyRowProps = { supportEmail: string };

const PolicyRow = ({ supportEmail }: PolicyRowProps) => (
  <Stack
    spacing={1.5}
    sx={{
      mt: 2,
      alignItems: "center",
      px: { xs: 2, sm: 0 },
    }}
  >
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1, sm: 2 }}
      sx={{
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          display: { xs: "none", sm: "block" },
        }}
      />

      <MUILink href={`mailto:${supportEmail}`} underline="hover" sx={linkSx}>
        Contact support
      </MUILink>
    </Stack>
  </Stack>
);

const linkSx = {
  color: "#c2185b",
  fontWeight: 600,
  display: "block",
  px: 1,
  py: 0.75,
  borderRadius: 1,
  lineHeight: 1.4,
  textAlign: "center",
  "&:focus-visible": {
    outline: "2px solid rgba(194,24,91,0.5)",
    outlineOffset: 2,
    borderRadius: 6,
  },
} as const;

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

const RegisterPage = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const userNameRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityOption, setCityOption] = useState<CityType[] | []>([]);
  const [cityInput, setCityInput] = useState<string | "">("");

  const isMobile = useMediaQuery("(max-width:600px)");

  const [profileId, setProfileId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkPassword, setCheckPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [supportEmail, setSupportEmail] = useState("info@swingsocial.co");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host.replace(/^www\./, "");
      setSupportEmail(`support@${host}`);
    }
  }, []);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.match(/[a-z]+/)) strength += 20;
    if (password.match(/[A-Z]+/)) strength += 20;
    if (password.match(/[0-9]+/)) strength += 20;
    if (password.match(/[$@#&!]+/)) strength += 20;
    return strength;
  };

  const handleTogglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleToggleCheckPasswordVisibility = () =>
    setCheckPassword((prev) => !prev);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleContinue = async () => {
    await router.push(`/otp/${profileId}`);
    handleClose();
  };

  useEffect(() => {
    if (!openCity) setCityOption([]);
  }, [openCity]);

  useEffect(() => {
    if (!openCity) return;
    if (cityInput === "") return;

    const fetchData = async () => {
      setCityLoading(true);
      try {
        const response = await fetch(`/api/user/city?city=${cityInput}`);
        if (!response.ok) {
          console.error("Failed to fetch event data:", response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { cities }: { cities: CityType[] } = await response.json();
        const uniqueCities = cities.filter(
          (city, index, self) =>
            index === self.findIndex((t) => t.City === city.City)
        );
        setCityOption(uniqueCities);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setCityLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [cityInput, openCity]);

  const validationSchema = Yup.object({
    userName: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Please enter a valid phone number (10 digits)")
      .required("Phone is required"),
    password: Yup.string()
      .required("Password is required")
      .test(
        "password-strength",
        "Password is not strong enough",
        (value) => calculatePasswordStrength(value || "") >= 60
      ),
    repeatPassword: Yup.string()
      .required("Repeat your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    city: Yup.string().required("City is required"),
    user_name: Yup.string().required("User Name is required"),
    consent: Yup.boolean().oneOf(
      [true],
      "Please agree to the Privacy Policy & Terms"
    ),
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      phone: "",
      password: "",
      repeatPassword: "",
      city: "",
      user_name: "",
      consent: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
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

      try {
        setIsUploading(true);
        const ipData = await (await fetch("https://ipapi.co/json")).json();

        const hitData = await (
          await fetch("/api/user/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              affiliate: aff,
              referral: refer,
              OS: getOS(),
              page: "Register",
              url: window.location.href,
              userid: null,
              ip: ipData?.ip,
              city: ipData?.city,
              region: ipData?.region,
              country_name: ipData?.country_name,
            }),
          })
        ).json();
        const hitId = hitData?.data?.HitId;

        if (
          (
            await (
              await fetch("/api/user/screenname/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: values.user_name }),
              })
            ).json()
          ).exists
        ) {
          setErrors({ user_name: "Username already taken" });
          formik.setTouched({ ...formik.touched, user_name: true }, false);

          requestAnimationFrame(() => {
            userNameRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
            setTimeout(
              () => userNameRef.current?.focus({ preventScroll: true }),
              250
            );
          });
          return setSubmitting(false);
        }

        if (
          (
            await (
              await fetch("/api/user/profile/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: values.email }),
              })
            ).json()
          ).exists
        ) {
          setErrors({ email: "Email already taken" });
          formik.setTouched({ ...formik.touched, email: true }, false);

          requestAnimationFrame(() => {
            emailRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
            setTimeout(
              () => emailRef.current?.focus({ preventScroll: true }),
              250
            );
          });
          return setSubmitting(false);
        }

        const data = await (
          await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              age: "01/01/0101",
              affiliate: aff,
              hitid: hitId,
            }),
          })
        ).json();

        if (data.profileId) {
          localStorage.setItem("email", values.email);
          localStorage.setItem("userName", values.userName);
          localStorage.setItem("password", values.password);
          localStorage.setItem("logged_in_profile", data.profileId);
          localStorage.setItem("userName", values.user_name);
          setProfileId(data.profileId);
          setIsUploading(false);
          handleOpen();
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong!");
      } finally {
        setIsUploading(false);
      }
    },
  });

  const yourTextFieldSx = {
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

  return (
    <>
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
              <Stepper
                activeStep={0}
                alternativeLabel
                sx={{
                  background: "transparent",
                  width: "100%",
                  margin: "0 auto 16px auto",
                }}
              >
                {[
                  "Profile Info",
                  "Verify Email",
                  "Preferences",
                  "Avatar & Banner",
                  "About",
                ].map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          color: "#fff !important",
                          fontSize: { xs: "0.7rem", sm: "0.85rem" },
                        },
                        "& .MuiStepIcon-root": {
                          color: "rgba(255,255,255,0.3)",
                        },
                        "& .MuiStepIcon-root.Mui-active": {
                          color: "#c2185b",
                        },
                        "& .MuiStepIcon-root.Mui-completed": {
                          color: "#c2185b",
                        },
                      }}
                    >
                      {/* {label} */}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ mb: 2, textAlign: "center" }}>
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
                  Create your account
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  {/* <CheckCircleOutlineIcon fontSize="small" /> */}
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                    }}
                  >
                    We verify every account to keep SwingSocial real
                  </Typography>
                </Stack>
              </Box>

              <form onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  autoFocus
                  label="Name (This will never be shared or displayed)"
                  name="userName"
                  placeholder="Your full name"
                  variant="outlined"
                  value={formik.values.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="userName"
                  inputProps={{ maxLength: 60 }}
                  error={
                    formik.touched.userName && Boolean(formik.errors.userName)
                  }
                  helperText={formik.touched.userName && formik.errors.userName}
                  sx={yourTextFieldSx}
                />

                <TextField
                  fullWidth
                  label="Username (This will be shown on your profile)"
                  name="user_name"
                  placeholder="Choose a unique handle"
                  variant="outlined"
                  inputRef={userNameRef}
                  value={formik.values.user_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="name"
                  error={
                    formik.touched.user_name && Boolean(formik.errors.user_name)
                  }
                  helperText={
                    formik.touched.user_name && formik.errors.user_name
                  }
                  sx={yourTextFieldSx}
                />
                <WhyWeAsk
                  title="username"
                  points={[
                    "Helps friends recognize you and reduces fake profiles",
                    "Shown on your profile. You can update it any time",
                  ]}
                />

                {/* EMAIL */}
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  inputRef={emailRef}
                  placeholder="you@example.com"
                  variant="outlined"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="email"
                  inputProps={{ inputMode: "email", spellCheck: "false" }}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    formik.touched.email && formik.errors.email ? (
                      formik.errors.email
                    ) : (
                      <span style={{ color: "#9fc9c5ff" }}>
                        Used only for login & verification. No spam—ever
                      </span>
                    )
                  }
                  sx={yourTextFieldSx}
                />

                {/* PASSWORD */}
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  variant="outlined"
                  value={formik.values.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    formik.setFieldValue("password", value);
                    const strength = calculatePasswordStrength(value);
                    setPasswordStrength(strength);
                  }}
                  onBlur={formik.handleBlur}
                  autoComplete="new-password"
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                  sx={yourTextFieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          style={{ color: "white" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {formik.values.password.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={
                        passwordStrength < 40
                          ? "error"
                          : passwordStrength < 60
                          ? "warning"
                          : "success"
                      }
                      sx={{ height: 8, borderRadius: 4, mt: 1, mb: 0.5 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      Password Strength:
                      <span
                        style={{
                          color:
                            passwordStrength < 40
                              ? "#FF0000"
                              : passwordStrength < 60
                              ? "#FFA000"
                              : "#00C853",
                        }}
                      >
                        {passwordStrength < 40 && "Weak"}
                        {passwordStrength >= 40 &&
                          passwordStrength < 60 &&
                          "Medium"}
                        {passwordStrength >= 60 && "Strong"}
                      </span>
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Repeat Password"
                  name="repeatPassword"
                  type={checkPassword ? "text" : "password"}
                  variant="outlined"
                  autoComplete="new-password"
                  value={formik.values.repeatPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.repeatPassword &&
                    Boolean(formik.errors.repeatPassword)
                  }
                  helperText={
                    formik.touched.repeatPassword &&
                    formik.errors.repeatPassword
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleCheckPasswordVisibility}
                          edge="end"
                          style={{ color: "white" }}
                        >
                          {checkPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={yourTextFieldSx}
                />

                {/* PHONE */}
                <TextField
                  fullWidth
                  label="Phone"
                  variant="outlined"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  sx={yourTextFieldSx}
                  value={formik.values.phone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                    formik.setFieldValue("phone", onlyNums);
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 10,
                  }}
                />

                {/* CITY */}
                <Autocomplete
                  id="city-autocomplete"
                  open={openCity}
                  onOpen={() => setOpenCity(true)}
                  onClose={(event, reason) => {
                    if (isMobile && reason === "blur") return;
                    setOpenCity(false);
                  }}
                  disableClearable
                  disablePortal
                  isOptionEqualToValue={(option, value) =>
                    option.City === value.City
                  }
                  getOptionLabel={(option) => option.City}
                  options={cityOption.map((city) => ({
                    ...city,
                    key: city.id,
                  }))}
                  loading={cityLoading}
                  inputValue={cityInput}
                  onInputChange={(event, newInputValue) => {
                    if (event?.type === "change" || event?.type === "click") {
                      setCityInput(newInputValue.trim());
                    }
                  }}
                  onChange={(event, newValue) => {
                    if (newValue?.City) {
                      formik.setFieldValue("city", newValue.City);
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="city"
                      variant="outlined"
                      label="City"
                      autoComplete="address-level2"
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {cityLoading ? (
                              <CircularProgress color="inherit" size={15} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={yourTextFieldSx}
                    />
                  )}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      name="consent"
                      checked={formik.values.consent}
                      onChange={formik.handleChange}
                      sx={{
                        color: "#fff",
                        p: 0.5,
                        marginRight: "5px",
                        "& .MuiSvgIcon-root": { fontSize: 22 },
                      }}
                    />
                  }
                  label={
                    <Typography
                      component="span"
                      sx={{
                        color: "#ddd",
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        lineHeight: 1.5,
                        whiteSpace: "normal",
                      }}
                    >
                      I agree to the{" "}
                      <Link
                        href="https://swingsocial.co/privacy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#c2185b",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="https://swingsocial.co/terms-and-conditions/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#c2185b",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}
                      >
                        Terms of Use
                      </Link>
                      .
                    </Typography>
                  }
                  sx={{
                    alignItems: "flex-start", // keeps checkbox at top
                    mt: 0.3,
                    ml: 0,
                  }}
                />

                {formik.touched.consent && formik.errors.consent && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#d32f2f",
                      display: "block",
                      mb: 1,
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    }}
                  >
                    {formik.errors.consent}
                  </Typography>
                )}

                {/* SUBMIT */}
                <Button
                  type="submit"
                  disabled={isUploading}
                  sx={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#c2185b",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto 8px auto",
                    "&:hover": { backgroundColor: "#ad1457" },
                  }}
                >
                  {isUploading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    <ArrowForwardIosIcon />
                  )}
                </Button>
              </form>

              <Stack spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                <Typography
                  sx={{
                    color: "#c2185b",
                    fontWeight: "bold",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Come party with us
                </Typography>
              </Stack>

              <PolicyRow supportEmail={supportEmail} />

              <Link
                href="/login"
                style={{
                  color: "#c2185b",
                  marginTop: 8,
                  textDecoration: "underline",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Already have an account? Login
              </Link>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>

      {/* Dialog Component */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="email-verification-title"
        aria-describedby="email-verification-desc"
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 480,
            mx: { xs: 1.5, sm: "auto" },
            borderRadius: { xs: 2, sm: 3 },
            p: { xs: 2, sm: 3 },
            background: "linear-gradient(180deg, #ffffff 0%, #faf7fa 100%)",
            border: "1px solid rgba(194,24,91,0.12)",
            boxShadow:
              "0 10px 30px rgba(194,24,91,0.15), 0 2px 8px rgba(0,0,0,0.06)",
          },
        }}
      >
        <DialogTitle
          id="email-verification-title"
          sx={{
            fontWeight: 800,
            pr: 6,
            textAlign: "center",
            color: "#1a1a1a",
          }}
        >
          Email Verification
          <IconButton
            onClick={handleClose}
            aria-label="Close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "rgba(0,0,0,0.54)",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Avatar
              sx={{
                bgcolor: "#c2185b",
                width: 48,
                height: 48,
                boxShadow: "0 6px 14px rgba(194,24,91,0.35)",
              }}
            >
              <MarkEmailUnreadIcon />
            </Avatar>

            <DialogContentText
              id="email-verification-desc"
              sx={{
                color: "#333",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                lineHeight: 1.6,
                maxWidth: 360,
              }}
            >
              We’ve sent a one-time code to your email to confirm it’s you.
            </DialogContentText>

            <Typography
              variant="body2"
              sx={{ color: "#6b6b6b", maxWidth: 360 }}
            >
              Don’t see it? Check your Spam folder.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            mt: 1.5,
            gap: 1,
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            justifyContent: "center",
            flexDirection: "row",
            flexWrap: "nowrap",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: "#c2185b",
              color: "#c2185b",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              minWidth: 120,
              "&:hover": {
                borderColor: "#ad1457",
                backgroundColor: "rgba(194,24,91,0.06)",
              },
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            sx={{
              backgroundColor: "#c2185b",
              color: "#fff",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              minWidth: 120,
              "&:hover": { backgroundColor: "#ad1457" },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegisterPage;
