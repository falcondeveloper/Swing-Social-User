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
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { CircularProgress } from "@mui/material";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";
import "@tensorflow/tfjs";
type Params = Promise<{ id: string }>;

export default function UploadAvatar(props: { params: Params }) {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [openCropper, setOpenCropper] = useState(false);
  const [currentCropType, setCurrentCropType] = useState<string>("avatar");
  const [croppedArea, setCroppedArea] = useState(null);
  const [id, setId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      setId(pid);
    };
    getIdFromParam();
  }, [props]);

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    cropType: "avatar" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (cropType === "avatar") {
          setAvatarImage(reader.result as string);
        } else {
          setBannerImage(reader.result as string);
        }
        setCurrentCropType(cropType);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleCropConfirm = () => {
    if (!croppedArea || !currentCropType) return;

    const canvas = document.createElement("canvas");
    const image = new Image();
    const { width, height } =
      currentCropType === "avatar"
        ? { width: 200, height: 200 }
        : { width: 800, height: 450 };

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    image.src = currentCropType === "avatar" ? avatarImage! : bannerImage!;
    image.onload = () => {
      const { x, y, width: cropWidth, height: cropHeight } = croppedArea!;
      ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, width, height);

      const croppedDataURL = canvas.toDataURL("image/jpeg");
      if (currentCropType === "avatar") {
        setCroppedAvatar(croppedDataURL);
      } else {
        setCroppedBanner(croppedDataURL);
      }
      setOpenCropper(false);
    };
  };

  const handleContinue = async () => {
    if (!croppedAvatar || !croppedBanner) {
      setError(true);
      return;
    }

    setIsUploading(true);

    try {
      const isAvatarBodyPicture = true;

      const uploadImage = async (imageData: string): Promise<string | null> => {
        try {
          const blob = await (await fetch(imageData)).blob();
          const formData = new FormData();
          formData.append("image", blob, `${Date.now()}.jpg`);
          const response = await fetch("/api/user/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to upload image");
          }

          return data?.blobUrl || null;
        } catch (error) {
          console.error("Error during image upload:", error);
          return null;
        }
      };

      const avatarUrl = await uploadImage(croppedAvatar);
      const bannerUrl = await uploadImage(croppedBanner);

      if (isAvatarBodyPicture) {
        const params = await props.params;
        const pid: any = params.id;
        const response = await fetch("/api/user/upload/database", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pid: pid,
            Questionable: 1,
            avatar: avatarUrl,
            banner: bannerUrl,
          }),
        });
        if (response.ok) {
          router.push(`/about/${pid}`);
        }
      } else {
        const params = await props.params;
        const id: any = params.id;

        try {
          const response = await fetch("/api/user/upload/database", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pid: id,
              avatar: avatarUrl,
              banner: bannerUrl,
              Questionable: 0,
            }),
          });
          if (response.ok) {
            router.push(`/about/${id}`);
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: "#121212",
          borderRadius: "16px",
          maxWidth: "600px",
          padding: "32px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          sx={{ textAlign: "center", color: "#c2185b", fontWeight: "bold" }}
        >
          No Nudity allowed on the website, we will verify and remove not
          allowed images
        </Typography>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please upload avatar and banner.
          </Typography>
        )}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
          >
            POST Avatar
          </Typography>
          <Box
            sx={{
              width: 200,
              height: 200,
              border: "2px dashed #fff",
              borderRadius: "16px",
              backgroundColor: "#1d1d1d",
              margin: "0 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {croppedAvatar ? (
              <img
                src={croppedAvatar}
                alt="Cropped Avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "16px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileChange(e, "avatar")}
                  style={{ display: "none" }}
                  id="upload-avatar"
                />
                <label htmlFor="upload-avatar">
                  <IconButton component="span">
                    <PhotoCameraOutlinedIcon
                      sx={{ fontSize: 40, color: "#c2185b" }}
                    />
                  </IconButton>
                </label>
              </>
            )}
          </Box>
        </Grid>

        {/* Banner Upload */}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
          >
            Post Profile Banner
          </Typography>
          <Box
            sx={{
              width: 300,
              height: 150,
              border: "2px dashed #fff",
              borderRadius: "16px",
              backgroundColor: "#1d1d1d",
              margin: "0 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {croppedBanner ? (
              <img
                src={croppedBanner}
                alt="Cropped Banner"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "16px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileChange(e, "banner")}
                  style={{ display: "none" }}
                  id="upload-banner"
                />
                <label htmlFor="upload-banner">
                  <IconButton component="span">
                    <PhotoCameraOutlinedIcon
                      sx={{ fontSize: 40, color: "#c2185b" }}
                    />
                  </IconButton>
                </label>
              </>
            )}
          </Box>
        </Grid>

        {/* Continue Button */}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
          <Button
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
              margin: "0 auto",
              "&:hover": { backgroundColor: "#ad1457" },
            }}
            onClick={handleContinue}
          >
            {isUploading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
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
              </Box>
            ) : (
              <ArrowForwardIosIcon />
            )}
          </Button>
        </Grid>
      </Grid>

      {/* Cropper Dialog */}
      <Dialog open={openCropper} onClose={() => setOpenCropper(false)}>
        <DialogContent
          sx={{
            backgroundColor: "#000",
            color: "#fff",
            width: 400,
            height: 400,
            position: "relative",
          }}
        >
          {currentCropType && (
            <Cropper
              image={
                currentCropType === "avatar"
                  ? avatarImage || undefined
                  : currentCropType === "banner"
                  ? bannerImage || undefined
                  : undefined
              }
              crop={crop}
              zoom={zoom}
              aspect={currentCropType === "avatar" ? 1 : 16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
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
