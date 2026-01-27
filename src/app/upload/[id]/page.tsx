"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  Container,
  Paper,
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";
import "@tensorflow/tfjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EditIcon } from "lucide-react";
import Carousel from "@/commonPage/Carousel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

export default function UploadAvatar({ params }: { params: Params }) {
  const router = useRouter();
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await params;
      setUserId(p.id);
    })();
  }, [params]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarImage(reader.result as string);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = () => {
    if (!croppedArea || !avatarImage) return;

    const image = new Image();
    image.src = avatarImage;

    image.onload = () => {
      const work = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const { x, y, width, height } = croppedArea;

      work.width = Math.round(width * scaleX);
      work.height = Math.round(height * scaleY);

      const wctx = work.getContext("2d");
      if (!wctx) return;

      wctx.drawImage(
        image,
        x * scaleX,
        y * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        work.width,
        work.height
      );

      const MAX_SIDE = 768;
      const maxDim = Math.max(work.width, work.height);
      const scale = maxDim > MAX_SIDE ? MAX_SIDE / maxDim : 1;

      const out = document.createElement("canvas");
      out.width = Math.round(work.width * scale);
      out.height = Math.round(work.height * scale);

      const octx = out.getContext("2d");
      if (!octx) return;

      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(work, 0, 0, out.width, out.height);

      const WEBP_QUALITY = 0.7;
      const JPEG_QUALITY = 0.75;

      let dataUrl = out.toDataURL("image/webp", WEBP_QUALITY);
      if (!dataUrl.startsWith("data:image/webp")) {
        dataUrl = out.toDataURL("image/jpeg", JPEG_QUALITY);
      }

      setCroppedAvatar(dataUrl);
      formik.setFieldValue("avatar", dataUrl);
      setOpenCropper(false);
    };
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const uploadImage = async (dataUrl: string): Promise<string> => {
    const blob = await (await fetch(dataUrl)).blob();
    const formData = new FormData();
    formData.append("image", blob, `${Date.now()}.jpg`);

    const res = await fetch("/api/user/upload", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!result.blobUrl) {
      throw new Error("Upload failed");
    }
    localStorage.setItem("Avatar", result?.blobUrl);
    return result.blobUrl;
  };

  const formik = useFormik({
    initialValues: {
      avatar: "",
    },
    validationSchema: Yup.object().shape({
      avatar: Yup.string().required("Please upload your avatar"),
    }),
    onSubmit: async (values) => {
      setIsUploading(true);
      try {
        const avatarUrl = await uploadImage(values.avatar);

        if (!avatarUrl) {
          formik.setFieldError("banner", "Image upload failed. Try again.");
          setIsUploading(false);
          return;
        }

        const res = await fetch("/api/user/avatarUpload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pid: userId,
            Questionable: 1,
            avatar: avatarUrl,
          }),
        });

        if (!res.ok) {
          throw new Error("Avatar save failed");
        }

        await router.push(`/bannerupload/${userId}`);
      } catch (err) {
        console.error("Form submit failed:", err);
        setIsUploading(false);
      }
    },
  });

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
              <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
                <Stepper
                  activeStep={3}
                  alternativeLabel
                  sx={{
                    background: "transparent",
                    width: "100%",
                    margin: "0 auto 16px auto",
                  }}
                >
                  {[
                    "Profile Info",
                    "Verify Phone",
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

                <Grid>
                  <Typography
                    sx={{
                      textAlign: "center",
                      color: "#ffffffff",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    Look your best! Upload a clear, confident photo of you. A
                    great pic gets great results.
                  </Typography>

                  <Grid item xs={12} sx={{ mt: 2, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "#c2185b", fontWeight: "bold", mb: 2 }}
                    >
                      Primary Profile Picture
                    </Typography>

                    <Box
                      sx={{
                        width: 200,
                        height: 200,
                        border: "2px dashed #fff",
                        borderRadius: 4,
                        backgroundColor: "#1d1d1d",
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        style={{ display: "none" }}
                        id="upload-avatar"
                      />
                      <label htmlFor="upload-avatar">
                        {croppedAvatar ? (
                          <>
                            <img
                              src={croppedAvatar}
                              alt="Cropped Avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "16px",
                              }}
                            />
                            <IconButton
                              component="span"
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                color: "#fff",
                                "&:hover": {
                                  backgroundColor: "rgba(0,0,0,0.8)",
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton component="span">
                            <PhotoCameraOutlinedIcon
                              sx={{ fontSize: 40, color: "#c2185b" }}
                            />
                          </IconButton>
                        )}
                      </label>
                    </Box>

                    {formik.errors.avatar && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {formik.errors.avatar}
                      </Typography>
                    )}
                  </Grid>

                  <Typography
                    sx={{
                      textAlign: "center",
                      color: "#ffffffff",
                      fontWeight: "bold",
                      mt: 2,
                      fontSize: "0.675rem",
                    }}
                  >
                    No nudity, vulgarity, cartoons, or objects. Real faces only
                    - this is a community of real people.
                  </Typography>

                  <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                    <Button
                      type="submit"
                      disabled={isUploading}
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        backgroundColor: "#c2185b",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#ad1457" },
                      }}
                    >
                      {isUploading ? (
                        <>
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                          <Typography
                            sx={{
                              color: "#fff",
                              fontSize: "0.875rem",
                              position: "absolute",
                              top: "100%",
                              width: "400px",
                              marginTop: "8px",
                            }}
                          >
                            Don't take your pants off yet, give us a sec...
                          </Typography>
                        </>
                      ) : (
                        <ArrowForwardIosIcon />
                      )}
                    </Button>
                  </Grid>

                  <Carousel title="Exciting Events and Real Connections Start Here!" />
                </Grid>
              </form>

              <Dialog open={openCropper} onClose={() => setOpenCropper(false)}>
                <DialogContent
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    width: { xs: "300px", sm: "400px" },
                    height: { xs: "300px", sm: "400px" },
                    position: "relative",
                    padding: 0,
                  }}
                >
                  <Cropper
                    image={avatarImage || undefined}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </DialogContent>
                <DialogActions
                  sx={{
                    backgroundColor: "#121212",
                    justifyContent: "center",
                    p: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleCropConfirm}
                    sx={{
                      backgroundColor: "#c2185b",
                      "&:hover": { backgroundColor: "#ad1457" },
                    }}
                  >
                    Crop
                  </Button>
                </DialogActions>
              </Dialog>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    </>
  );
}
