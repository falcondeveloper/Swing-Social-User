"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ChevronLeft, ChevronRight, EditIcon } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import DialogTitle from "@mui/material/DialogTitle";
import SwiperCore from "swiper";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);

const demoImages = [
  "/images/event.png",
  "/images/event.png",
  "/images/event.png",
  "/images/event.png",
  "/images/event.png",
];

type Params = Promise<{ id: string }>;

export default function UploadBanner({ params }: { params: Params }) {
  const router = useRouter();
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await params;
      setUserId(p.id);
    })();
  }, [params]);

  const formik = useFormik({
    initialValues: {
      banner: "",
    },
    validationSchema: Yup.object().shape({
      banner: Yup.string().required("Please upload your banner"),
    }),
    onSubmit: async (values) => {
      setIsUploading(true);
      const isBannerOk = await analyzeImage(values.banner);
      const bannerUrl = await uploadImage(values.banner);

      if (!bannerUrl) {
        formik.setFieldError("banner", "Image upload failed. Try again.");
        setIsUploading(false);
        return;
      }

      await fetch("/api/user/upload/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pid: userId,
          banner: bannerUrl,
          Questionable: isBannerOk ? 1 : 0,
        }),
      });

      router.push(`/about/${userId}`);
    },
  });

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

        const croppedDataURL = canvas.toDataURL("image/jpeg");
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

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
        <Grid
          container
          justifyContent="center"
          sx={{
            backgroundColor: "#121212",
            borderRadius: 4,
            maxWidth: 600,
            mx: "auto",
            p: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: "#ffffffff",
              fontWeight: "bold",
              fontSize: "0.875rem",
            }}
          >
            Please upload a classy pic of yourself, the better your picture the
            better results you will have.
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
            {formik.errors.banner && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {formik.errors.banner}
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
            Please refrain from any nudity or vulgar expressions.Remember,
            SwingSocial is a community of real people.No pets, cartoons, or
            inanimate objects.
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
                  <CircularProgress size={24} color="inherit" />
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

          <Grid item xs={12} sx={{ textAlign: "center", mt: 6 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                mb: 2,
                fontSize: "1.10rem",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                textAlign: "center",
              }}
            >
              These users are waiting to meet you!
            </Typography>
            {/* Custom Navigation Buttons */}
            <Box
              sx={{
                transform: "translateY(-50%)",
                display: "flex",
                justifyContent: "end",
                gap: 1,
                zIndex: 10,
                marginTop: "40px",
              }}
            >
              <IconButton
                className="custom-prev"
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#555" },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                className="custom-next"
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#555" },
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>

            <Box
              sx={{
                width: "100%",
                maxWidth: 500,
                mx: "auto",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Slider */}
              <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                spaceBetween={16}
                slidesPerView={3}
                loop={true}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 3,
                  },
                  480: {
                    slidesPerView: 3,
                  },
                  768: {
                    slidesPerView: 3,
                  },
                }}
                navigation={{
                  nextEl: ".custom-next",
                  prevEl: ".custom-prev",
                }}
              >
                {demoImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <Box
                      onClick={() => setOpenProfileModal(true)}
                      sx={{
                        cursor: "pointer",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        borderRadius: "16px",
                        overflow: "hidden",
                        mx: "auto",
                      }}
                    >
                      <img
                        src={img}
                        alt={`user-${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "16px",
                        }}
                      />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          </Grid>
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

      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            borderRadius: 4,
            mx: 2,
            overflow: "hidden",
            boxShadow: 10,
          },
        }}
      >
        {/* Title */}
        <DialogTitle
          sx={{
            color: "#fff",
            textAlign: "center",
            fontWeight: 700,
            fontSize: { xs: "1rem", sm: "1rem" },
            py: 2,
          }}
        >
          These are real profile pics!
        </DialogTitle>

        {/* Message */}
        <DialogContent
          sx={{
            color: "#ccc",
            textAlign: "center",
            px: 3,
            py: 3,
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          Finish your signup and you can view all of our members.
        </DialogContent>

        {/* Button */}
        <DialogActions
          sx={{
            justifyContent: "center",
            py: 2,
          }}
        >
          <Button
            onClick={() => setOpenProfileModal(false)}
            variant="contained"
            sx={{
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 9999,
              textTransform: "none",
              bgcolor: "#ff006e",
              color: "#fff",
              width: "100%",
              maxWidth: 120,
              "&:hover": {
                bgcolor: "#e60060",
              },
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
