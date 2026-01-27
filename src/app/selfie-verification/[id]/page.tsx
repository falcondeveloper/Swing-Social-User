"use client";

import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useRouter } from "next/navigation";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type Params = Promise<{ id: string }>;

const theme = createTheme({
  palette: {
    primary: { main: "#FF2D55", light: "#FF617B", dark: "#CC1439" },
    secondary: { main: "#7000FF", light: "#9B4DFF", dark: "#5200CC" },
    success: { main: "#00D179" },
    background: { default: "#0A0118" },
  },
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

const validationSchema = Yup.object({
  selfie: Yup.mixed()
    .required("A selfie is required")
    .test("fileSize", "File too large (max 5MB)", (value: any) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value: any) => {
      if (!value) return true;
      return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        value.type,
      );
    }),
});

const getReadableError = (code: string) => {
  switch (code) {
    case "NO_FACE_DETECTED":
      return "No face detected. Please center your face in the frame.";
    case "MULTIPLE_FACES":
      return "Only one person should be visible in the selfie.";
    case "EYES_CLOSED":
      return "Please keep your eyes open.";
    case "SUNGLASSES_NOT_ALLOWED":
      return "Remove sunglasses and try again.";
    case "FACE_NOT_STRAIGHT":
      return "Please look straight at the camera.";
    case "LOW_CONFIDENCE":
      return "Image is not clear. Improve lighting.";
    default:
      return "Selfie verification failed. Please try again.";
  }
};

export default function UploadAvatar({ params }: { params: Params }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await params;
      setUserId(p.id);
    })();
  }, [params]);

  const formik = useFormik({
    initialValues: {
      selfie: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!values.selfie) {
        setError("Please select a selfie to upload");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        setUploadSuccess(true);
        setIsUploading(false);

        setTimeout(() => {
          setUploadSuccess(false);
          formik.resetForm();
          setPreview(null);
        }, 3000);
      } catch (err) {
        setError("Upload failed. Please try again.");
        setIsUploading(false);
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);

        const base64 = dataUrl.split(",")[1];

        const res = await fetch("/api/user/verify-selfie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selfieBase64: base64 }),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.reason);
        }

        const badgeRes = await fetch(
          "/api/user/verify-selfie/update-profile-badge",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
            }),
          },
        );

        const badgeData = await badgeRes.json();

        if (!badgeRes.ok || !badgeData.ok) {
          throw new Error("BADGE_UPDATE_FAILED");
        }

        setUploadSuccess(true);
      } catch (err: any) {
        setIsUploading(false);
        setUploadSuccess(false);
        setPreview(null);
        setError(getReadableError(err.message));
        return;
      }

      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = useCallback(() => {
    formik.setFieldValue("selfie", null);
    setPreview(null);
    setError(null);
  }, [formik]);

  const handleTakeSelfie = useCallback(() => {
    const input = document.getElementById("selfie-upload") as HTMLInputElement;
    if (input) {
      input.click();
    }
  }, []);

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
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                    background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Verify Your Face
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3 }}
                >
                  Take a real-time selfie to confirm you’re a real person
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 230,
                    height: 230,
                  }}
                >
                  {/* CIRCULAR IMAGE */}
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "3px dashed rgba(255, 255, 255, 0.2)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {isUploading ? (
                      <Box
                        sx={{
                          position: "fixed",
                          inset: 0,
                          zIndex: 2000,
                          background: "rgba(10, 1, 24, 0.92)",
                          backdropFilter: "blur(6px)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          px: 3,
                        }}
                      >
                        <CircularProgress
                          size={60}
                          thickness={4}
                          sx={{ color: "#FF2D55", mb: 3 }}
                        />

                        <Typography
                          variant="h6"
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          We’re verifying your selfie
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          This usually takes 5–10 seconds. Please don’t close
                          the app.
                        </Typography>
                      </Box>
                    ) : preview ? (
                      <Box
                        component="img"
                        src={preview}
                        alt="Selfie"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <CameraAltIcon
                        sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)" }}
                      />
                    )}
                  </Box>

                  {/* DELETE BUTTON (OUTSIDE CLIP) */}
                  {/* {preview && (
                    <IconButton
                      onClick={handleRemoveImage}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 18,
                        backgroundColor: "#fff",
                        color: "#000",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        zIndex: 10,
                        "&:hover": {
                          backgroundColor: "#FF2D55",
                          color: "#fff",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )} */}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    mt: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      Face Clearly Visible
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      Good Lighting
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      No Sunglasses
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="selfie-upload"
                />

                <Box sx={{ mb: 2 }}>
                  {!uploadSuccess ? (
                    <Button
                      variant="contained"
                      startIcon={<CameraAltIcon />}
                      onClick={handleTakeSelfie}
                      fullWidth
                      sx={{
                        background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                        color: "white",
                        py: 1.5,
                        px: 4,
                        borderRadius: "50px",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #CC1439, #5200CC)",
                        },
                      }}
                    >
                      Take Selfie
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 3,
                      }}
                    >
                      <IconButton
                        onClick={() => router.push(`/plan/${userId}`)}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          backgroundColor: "#c2185b",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#ad1457" },
                        }}
                      >
                        <ArrowForwardIosIcon sx={{ fontSize: 26 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(255, 45, 85, 0.1)",
                    color: "#FF2D55",
                    border: "1px solid rgba(255, 45, 85, 0.3)",
                  }}
                >
                  {error}
                </Alert>
              )}

              {formik.touched.selfie && formik.errors.selfie && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(255, 45, 85, 0.1)",
                    color: "#FF2D55",
                    border: "1px solid rgba(255, 45, 85, 0.3)",
                  }}
                >
                  {formik.errors.selfie}
                </Alert>
              )}

              {uploadSuccess && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(0, 209, 121, 0.1)",
                    color: "#00D179",
                    border: "1px solid rgba(0, 209, 121, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <strong>Selfie verified</strong>
                  <br />
                  Your selfie was uploaded successfully and a verification badge
                  has been added to your profile.
                </Alert>
              )}

              <Button
                variant="text"
                fullWidth
                onClick={() => router.push(`/plan/${userId}`)}
                sx={{
                  mt: 2,
                  color: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    color: "rgba(255, 255, 255, 0.8)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                Skip for now
              </Button>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    </>
  );
}
