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
import Carousel from "@/commonPage/Carousel";

type Params = Promise<{ id: string }>;

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
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const { x, y, width, height } = croppedArea;

      canvas.width = width * scaleX;
      canvas.height = height * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        image,
        x * scaleX,
        y * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        width * scaleX,
        height * scaleY
      );

      const croppedDataURL = canvas.toDataURL("image/jpeg", 1.0);
      setCroppedAvatar(croppedDataURL);
      formik.setFieldValue("avatar", croppedDataURL);
      setOpenCropper(false);
    };
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const uploadImage = async (dataUrl: string): Promise<string> => {
    // const blob = await (await fetch(dataUrl)).blob();
    // const formData = new FormData();
    // formData.append("image", blob, `${Date.now()}.jpg`);
    // const response = await fetch("/api/user/upload", {
    //   method: "POST",
    //   body: formData,
    // });
    // const data = await response.json();

    // if (!response.ok) {
    //   throw new Error(data.message || "Failed to upload image");
    // }

    // return data?.blobUrl || null;

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
    localStorage.setItem("avatar", result.blobUrl);
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

        await fetch("/api/user/upload/database", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pid: userId,
            Questionable: 1,
            avatar: avatarUrl,
            banner: "",
          }),
        });
        router.push(`/bannerupload/${userId}`);
      } catch (err) {
        console.error("Form submit failed:", err);
      } finally {
        setIsUploading(false);
      }
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
              POST Avatar
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

          <Carousel title="These users are waiting to meet you!" />
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
          sx={{ backgroundColor: "#121212", justifyContent: "center", p: 2 }}
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
