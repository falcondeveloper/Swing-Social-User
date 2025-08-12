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
import { EditIcon } from "lucide-react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
      banner: Yup.string().required("Please upload your banner"),
    }),
    onSubmit: async (values) => {
      setIsUploading(true);
      // const isBannerOk = await analyzeImage(values.banner);
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
          Questionable: 1,
          avatar: localStorage.getItem("avatar") || "",
        }),
      });
      localStorage.removeItem("avatar");
      router.push(`/about/${userId}`);
    },
  });

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
            Improve your profile with a banner that will be featured across the
            top of your profile
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
            If you don't upload a banner one will be created for you. You can
            always upload one at a later time
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
    </Box>
  );
}
