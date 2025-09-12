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
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EditIcon } from "lucide-react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Carousel from "@/commonPage/Carousel";

type Params = Promise<{ id: string }>;

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

export default function UploadBanner({ params }: { params: Params }) {
  const isXs = useMediaQuery("(max-width:600px)");
  const router = useRouter();
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<string | null>(null);
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
        setBannerImage(reader.result as string);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = () => {
    if (!croppedArea || !bannerImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();

    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    image.src = bannerImage;
    image.onload = () => {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const scaledArea = {
        x: croppedArea.x * scaleX,
        y: croppedArea.y * scaleY,
        width: croppedArea.width * scaleX,
        height: croppedArea.height * scaleY,
      };

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          image,
          scaledArea.x,
          scaledArea.y,
          scaledArea.width,
          scaledArea.height,
          0,
          0,
          width,
          height
        );

        const croppedDataURL = canvas.toDataURL("image/jpeg", 1.0);
        setCroppedBanner(croppedDataURL);
        formik.setFieldValue("banner", croppedDataURL);
        setOpenCropper(false);
      }
    };
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const analyzeImage = async (imageData: string): Promise<boolean> => {
    const img = new Image();
    img.src = imageData;

    return new Promise((resolve) => {
      img.onload = async () => {
        const model = await mobilenet.load();
        const predictions = await model.classify(img);
        const bodyKeywords = [
          "person",
          "human",
          "body",
          "diaper",
          "nappy",
          "napkin",
          "brassiere",
          "bra",
          "bandeau",
        ];
        const isNSFW = predictions.some((p) =>
          bodyKeywords.some((k) => p.className.toLowerCase().includes(k))
        );
        resolve(isNSFW);
      };
    });
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

    return result.blobUrl;
  };

  const formik = useFormik({
    initialValues: {
      banner: "",
    },
    validationSchema: Yup.object().shape({
      banner: Yup.string(),
    }),
    onSubmit: async (values) => {
      setIsUploading(true);
      try {
        let bannerUrl = "";

        if (values.banner) {
          bannerUrl = await uploadImage(values.banner);

          if (!bannerUrl) {
            formik.setFieldError("banner", "Image upload failed. Try again.");
            setIsUploading(false);
            return;
          }
        } else {
          const avatar = localStorage.getItem("Avatar");
          if (avatar) {
            bannerUrl = avatar;
          }
        }

        if (bannerUrl) {
          const res = await fetch("/api/user/bannerUpload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pid: userId,
              Questionable: 1,
              banner: bannerUrl,
            }),
          });

          if (!res.ok) {
            throw new Error("Banner save failed");
          }
        }

        await router.push(`/public-photos/${userId}`);
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
          }}
        >
          <ParticleField />
          <Container maxWidth="sm" sx={{ p: 0 }}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxHeight: { xs: "85vh", sm: "95vh" },
                overflowY: { xs: "auto", sm: "auto" },
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: "3px",
                },
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
                <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mb: 2 }}>
                  <Button
                    onClick={() => router.back()}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#2e2e2e",
                      },
                    }}
                  >
                    Back
                  </Button>
                </Box>

                <Grid>
                  <Typography
                    sx={{
                      textAlign: "center",
                      color: "#ffffffff",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    Improve your profile with a banner that will be featured
                    across the top of your profile
                  </Typography>

                  <Grid item xs={12} sx={{ mt: 4, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "#c2185b", fontWeight: "bold", mb: 2 }}
                    >
                      POST Profile Banner
                    </Typography>

                    <Box
                      sx={{
                        width: 300,
                        height: 150,
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
                        id="upload-banner"
                      />
                      <label htmlFor="upload-banner">
                        {croppedBanner ? (
                          <>
                            <img
                              src={croppedBanner}
                              alt="Cropped Banner"
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
                    If you don't upload a banner one will be created for you.
                    You can always upload one at a later time
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
                  <Carousel title="Wild Events and Real Profiles are Waiting!" />
                </Grid>
              </form>

              <Dialog
                open={openCropper}
                onClose={() => setOpenCropper(false)}
                fullScreen={isXs}
                fullWidth
                maxWidth="xl"
                PaperProps={{
                  sx: { backgroundColor: "transparent", boxShadow: "none" },
                }}
              >
                <DialogContent
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    width: { xs: "100vw", sm: "90vw", md: "80vw" },
                    height: { xs: "70vh", sm: "70vh", md: "70vh" },
                    position: "relative",
                    padding: 0,
                  }}
                >
                  {bannerImage && (
                    <Cropper
                      image={bannerImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={16 / 9}
                      minZoom={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      objectFit="contain"
                    />
                  )}
                </DialogContent>
                <DialogActions
                  sx={{
                    backgroundColor: "#121212",
                    padding: 2,
                    justifyContent: "center",
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
