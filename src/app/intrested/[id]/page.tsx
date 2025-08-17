"use client";
import React, { Suspense, useEffect, useMemo, memo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  createTheme,
  Grid,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Carousel from "@/commonPage/Carousel";

const theme = createTheme({
  palette: {
    primary: { main: "#FF2D55", light: "#FF617B", dark: "#CC1439" },
    secondary: { main: "#7000FF", light: "#9B4DFF", dark: "#5200CC" },
    success: { main: "#00D179" },
    background: { default: "#0A0118" },
  },
  typography: { fontFamily: '"Poppins", "Roboto", "Arial", sans-serif' },
});

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

const linkSx = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    textAlign: "left",
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
  "& .MuiSelect-select": {
    textAlign: "left",
  },
} as const;

export default function ShowInterest({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await params;
      setId(p.id);
    })();
  }, [params]);

  const validationSchema = Yup.object({
    selectedOption: Yup.string().required("Please select an option"),
    age: Yup.string().when("selectedOption", {
      is: (val: string) => ["Man", "Woman", "Throuple", "Couple"].includes(val),
      then: (schema) => schema.required("Age is required"),
    }),
    gender: Yup.string().when("selectedOption", {
      is: (val: string) => ["Throuple", "Couple"].includes(val),
      then: (schema) => schema.required("Gender is required"),
    }),
    sexualOrientation: Yup.string().required("Sexual orientation is required"),
    partnerBirthday: Yup.string().when("selectedOption", {
      is: (val: string) => ["Throuple", "Couple"].includes(val),
      then: (schema) => schema.required("Partner's age is required"),
    }),
    partnerGender: Yup.string().when("selectedOption", {
      is: (val: string) => ["Throuple", "Couple"].includes(val),
      then: (schema) => schema.required("Partner's gender is required"),
    }),
    partnerOrientation: Yup.string().when("selectedOption", {
      is: (val: string) => ["Throuple", "Couple"].includes(val),
      then: (schema) => schema.required("Partner's orientation is required"),
    }),
  });

  const initialValues = {
    selectedOption: "",
    age: "",
    gender: "",
    sexualOrientation: "",
    partnerBirthday: "",
    partnerGender: "",
    partnerOrientation: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    const isSingle =
      values.selectedOption === "Woman" || values.selectedOption === "Man";

    const requestBody = isSingle
      ? {
          pid: id,
          accounttype: values.selectedOption,
          age: parseInt(values.age, 10),
          orientation1: values.sexualOrientation,
          gender1: values.selectedOption === "Woman" ? "Female" : "Male",
        }
      : {
          pid: id,
          accounttype: values.selectedOption,
          gender1: values.gender,
          age: parseInt(values.age, 10),
          orientation1: values.sexualOrientation,
          partnerbirthday: values.partnerBirthday,
          partnergender: values.partnerGender,
          partnerorientation: values.partnerOrientation,
        };

    const url = isSingle
      ? "/api/user/intrested"
      : "/api/user/intrested/partner";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      await router.push(`/upload/${id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
      return;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
          maxWidth="md"
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
              activeStep={2}
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

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange }) => (
                <Form>
                  <Grid item xs={12} sx={{ textAlign: "center" }}>
                    <Grid
                      item
                      xs={12}
                      sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: "#fff",
                          fontWeight: "bold",
                          mb: { xs: 1, sm: 1.5 },
                          fontSize: { xs: "1.4rem", sm: "2rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        Tell Us About Yourself
                      </Typography>

                      <Typography
                        sx={{
                          color: "#bbb",
                          fontSize: { xs: "0.85rem", sm: "1rem" },
                          maxWidth: { xs: "90%", sm: "420px" },
                          margin: "0 auto",
                          lineHeight: 1.5,
                          px: { xs: 1, sm: 0 },
                        }}
                      >
                        Choose your identity and share a few details so we can
                        personalize your experience.
                      </Typography>
                    </Grid>

                    <TextField
                      select
                      fullWidth
                      name="selectedOption"
                      label="I am a"
                      value={values.selectedOption}
                      onChange={handleChange}
                      variant="outlined"
                      error={
                        touched.selectedOption && Boolean(errors.selectedOption)
                      }
                      helperText={
                        touched.selectedOption && errors.selectedOption
                      }
                      sx={linkSx}
                    >
                      <MenuItem value="" disabled>
                        Select your option
                      </MenuItem>
                      <MenuItem value="Man">Man</MenuItem>
                      <MenuItem value="Woman">Woman</MenuItem>
                      <MenuItem value="Throuple">Throuple</MenuItem>
                      <MenuItem value="Couple">Couple</MenuItem>
                    </TextField>

                    {["Man", "Woman"].includes(values.selectedOption) ? (
                      <>
                        <TextField
                          fullWidth
                          label="Age"
                          name="age"
                          placeholder="What's your age?"
                          variant="outlined"
                          value={values.age}
                          type="tel"
                          autoComplete="tel"
                          onChange={handleChange}
                          error={!!(touched.age && errors.age)}
                          helperText={touched.age && errors.age}
                          sx={linkSx}
                        />

                        <TextField
                          select
                          fullWidth
                          label="What's your sexual orientation?"
                          name="sexualOrientation"
                          value={values.sexualOrientation}
                          onChange={handleChange}
                          variant="outlined"
                          error={
                            touched.sexualOrientation &&
                            Boolean(errors.sexualOrientation)
                          }
                          helperText={
                            touched.sexualOrientation &&
                            errors.sexualOrientation
                          }
                          sx={linkSx}
                        >
                          <MenuItem value="" disabled>
                            What's your sexual orientation?
                          </MenuItem>
                          <MenuItem value="Straight">Straight</MenuItem>
                          <MenuItem value="Bi">Bi</MenuItem>
                          <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                          <MenuItem value="Open minded">Open minded</MenuItem>
                        </TextField>
                      </>
                    ) : ["Throuple", "Couple"].includes(
                        values.selectedOption
                      ) ? (
                      <>
                        <Typography
                          variant="h6"
                          sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
                        >
                          My Information
                        </Typography>

                        <TextField
                          fullWidth
                          label="Age"
                          name="age"
                          placeholder="What's your age?"
                          variant="outlined"
                          value={values.age}
                          type="tel"
                          autoComplete="tel"
                          onChange={handleChange}
                          error={!!(touched.age && errors.age)}
                          helperText={touched.age && errors.age}
                          sx={linkSx}
                        />

                        <TextField
                          select
                          fullWidth
                          label="Gender"
                          name="gender"
                          value={values.gender}
                          onChange={handleChange}
                          variant="outlined"
                          error={touched.gender && Boolean(errors.gender)}
                          helperText={touched.gender && errors.gender}
                          sx={linkSx}
                        >
                          <MenuItem value="" disabled>
                            What's your Gender?
                          </MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </TextField>

                        <TextField
                          select
                          fullWidth
                          label="What's your sexual orientation?"
                          name="sexualOrientation"
                          value={values.sexualOrientation}
                          onChange={handleChange}
                          variant="outlined"
                          error={
                            touched.sexualOrientation &&
                            Boolean(errors.sexualOrientation)
                          }
                          helperText={
                            touched.sexualOrientation &&
                            errors.sexualOrientation
                          }
                          sx={linkSx}
                        >
                          <MenuItem value="" disabled>
                            What's your sexual orientation?
                          </MenuItem>
                          <MenuItem value="Straight">Straight</MenuItem>
                          <MenuItem value="Bi">Bi</MenuItem>
                          <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                          <MenuItem value="Open minded">Open minded</MenuItem>
                        </TextField>

                        <Typography
                          variant="h6"
                          sx={{
                            color: "#fff",
                            fontWeight: "bold",
                            mt: 2,
                            mb: 2,
                          }}
                        >
                          Your Partner's Info
                        </Typography>

                        <TextField
                          fullWidth
                          name="partnerBirthday"
                          label="Partner's age"
                          placeholder="What's your Partner's age?"
                          variant="outlined"
                          value={values.partnerBirthday}
                          type="tel"
                          autoComplete="tel"
                          onChange={handleChange}
                          error={
                            !!(
                              touched.partnerBirthday && errors.partnerBirthday
                            )
                          }
                          helperText={
                            touched.partnerBirthday && errors.partnerBirthday
                          }
                          sx={linkSx}
                        />

                        <TextField
                          select
                          fullWidth
                          label="Partner's Gender"
                          placeholder="What's your partner's Gender?"
                          name="partnerGender"
                          value={values.partnerGender}
                          onChange={handleChange}
                          variant="outlined"
                          error={
                            touched.partnerGender &&
                            Boolean(errors.partnerGender)
                          }
                          helperText={
                            touched.partnerGender && errors.partnerGender
                          }
                          sx={linkSx}
                        >
                          <MenuItem value="" disabled>
                            What's your partner's Gender?
                          </MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </TextField>

                        <TextField
                          select
                          fullWidth
                          label="Partner's Orientation"
                          placeholder="What's your partner's Orientation?"
                          name="partnerOrientation"
                          value={values.partnerOrientation}
                          onChange={handleChange}
                          variant="outlined"
                          error={
                            touched.partnerOrientation &&
                            Boolean(errors.partnerOrientation)
                          }
                          helperText={
                            touched.partnerOrientation &&
                            errors.partnerOrientation
                          }
                          sx={linkSx}
                        >
                          <MenuItem value="" disabled>
                            What's your partner's orientation?
                          </MenuItem>
                          <MenuItem value="Straight">Straight</MenuItem>
                          <MenuItem value="Bi">Bi</MenuItem>
                          <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                          <MenuItem value="Open minded">Open minded</MenuItem>
                        </TextField>
                      </>
                    ) : null}
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: "center" }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      sx={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        backgroundColor: "#c2185b",
                        color: "#fff",
                        mt: 2,
                        "&:hover": { backgroundColor: "#ad1457" },
                      }}
                    >
                      {loading ? (
                        <CircularProgress
                          size={24}
                          sx={{
                            color: "#fff",
                          }}
                        />
                      ) : (
                        <ArrowForwardIosIcon />
                      )}
                    </Button>
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                    <Typography sx={{ color: "#c2185b", fontWeight: "bold" }}>
                      Come party with us
                    </Typography>
                  </Grid>
                </Form>
              )}
            </Formik>
            <Carousel title="Wild Events and Real Profiles are Waiting!" />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
