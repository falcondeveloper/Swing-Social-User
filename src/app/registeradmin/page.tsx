"use client";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";

type CityType = {
  id: number;
  City: string;
};

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

export default function ProfileDetail() {
  const router = useRouter();
  const navigate = useRouter();
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

  const [particles, setParticles] = useState<
    Array<{
      id: number;
      size: number;
      x: number;
      y: number;
      duration: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    const generatedParticles = [...Array(50)].map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: -Math.random() * 20,
    }));
    setParticles(generatedParticles);
  }, []);

  const ParticleField = () => {
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
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.match(/[a-z]+/)) strength += 20;
    if (password.match(/[A-Z]+/)) strength += 20;
    if (password.match(/[0-9]+/)) strength += 20;
    if (password.match(/[$@#&!]+/)) strength += 20;
    return strength;
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleCheckPasswordVisibility = () => {
    setCheckPassword((prev) => !prev);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleContinue = () => {
    handleClose();
    navigate.push(`/otpadmin/${profileId}`);
  };

  useEffect(() => {
    if (!openCity) {
      setCityOption([]);
    }
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

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cityInput, openCity]);

  const validationSchema = Yup.object({
    userName: Yup.string().required("User Name is required"),
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
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      phone: "",
      password: "",
      repeatPassword: "",
      city: "",
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
        const ipRes = await fetch("https://ipapi.co/json");
        const ipData = await ipRes.json();

        const payload = {
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
        };

        const hitRes = await fetch("/api/user/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const hitData = await hitRes.json();
        const hitId = hitData?.data?.HitId;

        const checkRes = await fetch("/api/user/profile/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ search: values.email }),
        });

        const checkData = await checkRes.json();
        if (checkData.exists) {
          setErrors({ email: "Email already taken" });
          setSubmitting(false);
          return;
        }

        handleOpen();

        const response = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            age: "01/01/0101",
            affiliate: aff,
            hitid: hitId,
          }),
        });

        const data = await response.json();
        const profileId = data.profileId;

        if (profileId) {
          localStorage.setItem("email", values.email);
          localStorage.setItem("userName", values.userName);
          localStorage.setItem("password", values.password);
          localStorage.setItem("logged_in_profile", profileId);
          setProfileId(profileId);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong!");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const yourTextFieldSx = {
    bgcolor: "#2a2a2a",
    input: { color: "#fff" },
    mb: 2,
    borderRadius: 1,
    "& .MuiOutlinedInput-root": {
      color: "#FF2D55",
      bgcolor: "white",
      "& fieldset": { borderColor: "#FF2D55" },
      "&:hover fieldset": { borderColor: "#FF617B" },
      "&.Mui-focused fieldset": { borderColor: "#7000FF" },
      "&.Mui-error fieldset": { borderColor: "#FF0000" },
    },
    "& .MuiInputLabel-root": {
      color: "#FF2D55!important",
      "&.Mui-focused": { color: "#7000FF" },
      "&.Mui-error": { color: "#FF0000" },
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ParticleField />
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          padding: "16px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#fff",
            mb: 2,
            fontWeight: "bold",
          }}
        >
          What's your email?
        </Typography>
        <Typography
          sx={{
            color: "#aaa",
            mb: 3,
          }}
        >
          We protect our community by making sure everyone on SwingSocial is
          real
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="filled"
            size="small"
            name="email"
            sx={yourTextFieldSx}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            label="Name"
            variant="filled"
            size="small"
            name="userName"
            sx={yourTextFieldSx}
            value={formik.values.userName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.userName && Boolean(formik.errors.userName)}
            helperText={formik.touched.userName && formik.errors.userName}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="filled"
            size="small"
            value={formik.values.password}
            onChange={(e) => {
              const value = e.target.value;
              formik.setFieldValue("password", value);
              const strength = calculatePasswordStrength(value);
              setPasswordStrength(strength);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
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
            sx={yourTextFieldSx}
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
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mt: 1,
                  mb: 0.5,
                }}
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
                  {passwordStrength >= 40 && passwordStrength < 60 && "Medium"}
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
            variant="filled"
            size="small"
            value={formik.values.repeatPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.repeatPassword &&
              Boolean(formik.errors.repeatPassword)
            }
            helperText={
              formik.touched.repeatPassword && formik.errors.repeatPassword
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

          <TextField
            fullWidth
            label="Phone"
            variant="filled"
            size="small"
            name="phone"
            sx={yourTextFieldSx}
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />

          <Autocomplete
            id="city-autocomplete"
            open={openCity}
            onOpen={() => setOpenCity(true)}
            onClose={(event, reason) => {
              if (isMobile && reason === "blur") return;
              setOpenCity(false);
            }}
            disableClearable
            isOptionEqualToValue={(option, value) => option.City === value.City}
            getOptionLabel={(option) => option.City}
            options={cityOption.map((city) => ({ ...city, key: city.id }))}
            loading={cityLoading}
            inputValue={cityInput}
            onInputChange={(event, newInputValue) => {
              if (event?.type === "change" || event?.type === "click") {
                setCityInput(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              if (newValue?.City) {
                formik.setFieldValue("city", newValue.City);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name="city"
                variant="filled"
                label="City"
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

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            sx={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#c2185b",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 16px auto",
              "&:hover": { backgroundColor: "#ad1457" },
            }}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              <ArrowForwardIosIcon />
            )}
          </Button>
        </form>

        <Typography
          sx={{ color: "#c2185b", fontWeight: "bold", fontSize: "1rem" }}
        >
          Come party with us
        </Typography>
        <Typography
          sx={{
            color: "#aaa",
            fontSize: "0.85rem",
          }}
        >
          We never share this with anyone and it won’t be on your profile
        </Typography>
        <Button
          style={{
            color: "#c2185b",
            marginTop: 2,
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.preventDefault();
            router.push("/login");
          }}
        >
          Already registered? Click here to Login
        </Button>
      </Box>

      {/* Dialog Component */}
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "12px",
            textAlign: "center",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#000",
            fontWeight: "bold",
          }}
        >
          Email Verification
        </DialogTitle>
        <DialogContent
          sx={{
            color: "#333",
            mb: 2,
            fontStyle: "italic",
          }}
        >
          <p>We sent a code to your email. Please check your inbox. </p>
          <p>Don't see it? Check your Spam folder.</p>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Button
            fullWidth
            sx={{
              backgroundColor: "#c2185b",
              color: "#fff",
              "&:hover": { backgroundColor: "#ad1457" },
              fontWeight: "bold",
            }}
            onClick={handleContinue}
          >
            Continue
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "#c2185b",
              color: "#c2185b",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#f8f8f8" },
            }}
            onClick={handleClose}
          >
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
