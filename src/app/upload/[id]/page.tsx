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
import { CircularProgress } from '@mui/material';
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
type Params = Promise<{ id: string }>

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
  const [id, setId] = useState<string>(''); // State for error messages
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    getIdFromParam();
  }, [props]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, cropType: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    console.log(e)
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
  const [error, setError] = useState(false);

  const handleCropConfirm = () => {
    if (!croppedArea || !currentCropType) return;

    const canvas = document.createElement("canvas");
    const image = new Image();
    const { width, height } =
      currentCropType === "avatar" ? { width: 200, height: 200 } : { width: 800, height: 450 };

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

  const analyzeImage = async (imageData: string): Promise<boolean> => {
    const img = new Image();
    img.src = imageData;
  
    return new Promise((resolve) => {
      img.onload = async () => {
        const model = await mobilenet.load();
        const predictions = await model.classify(img);
  
        console.log('Predictions:', predictions);
  
        // Check if any of the predictions indicate a body picture
        const bodyKeywords = ['person', 'human', 'body', 'diaper', 'nappy', 'napkin', 'brassiere', 'bra', 'bandeau'];
        const isBodyPicture = predictions.some(prediction =>
          bodyKeywords.some(keyword => prediction.className.toLowerCase().includes(keyword))
        );
  
        resolve(isBodyPicture);
      };
    });
  };

  const handleContinue = async () => {
    if (!croppedAvatar || !croppedBanner) {
      setError(true);
      return;
    }

    setIsUploading(true); // Set uploading state to true when starting

    try {
      // const isAvatarBodyPicture = await analyzeImage(croppedAvatar);
      const isAvatarBodyPicture = true;
  
      // Function to upload an image and return its URL
      const uploadImage = async (imageData: string): Promise<string | null> => {
        try {
          // Convert Base64 imageData to a Blob
          const blob = await (await fetch(imageData)).blob();
          const formData = new FormData();
  
          // Append the image Blob with a unique name
          formData.append("image", blob, `${Date.now()}.jpg`);
          console.log("Blob details:", blob);
  
          // Send the FormData via fetch
          const response = await fetch('/api/user/upload', {
            method: 'POST',
            body: formData,
          });
  
          // Parse the JSON response
          const data = await response.json();
  
          // Handle response errors
          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
          }
  
          console.log("Upload response:", data);
          return data?.blobUrl || null; // Return the uploaded image's URL
        } catch (error) {
          console.error("Error during image upload:", error);
          return null; // Return null in case of an error
        }
      };
  
      // Upload avatar and banner images
      console.log("Uploading avatar...");
      const avatarUrl = await uploadImage(croppedAvatar);
      console.log("Avatar URL:", avatarUrl);
  
      console.log("Uploading banner...");
      const bannerUrl = await uploadImage(croppedBanner);
      console.log("Banner URL:", bannerUrl);
  
      if (isAvatarBodyPicture) {
        const params = await props.params;
        const pid: any = params.id;
  
        // Store the avatar and banner
        console.log("Storing avatar and banner for questionable content...");
        const response = await fetch('/api/user/upload/database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pid: pid,
            Questionable: 1,
            avatar: avatarUrl,
            banner: bannerUrl,
          }),
        });
        if(response.ok){
          router.push(`/about/${pid}`);
        }
  
        console.log("Body pictures are not allowed.");
      } else {
        // Save the avatar and banner if they are not questionable
        console.log("Saving avatar and banner for valid content...");
        const params = await props.params;
        const id: any = params.id;
  
        try {
          const response = await fetch('/api/user/upload/database', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
          console.error('Error submitting form:', error);
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false); // Reset uploading state when done
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
        <Typography sx={{ textAlign: "center", color: "#c2185b", fontWeight: "bold" }}>No Nudity allowed on the website, we will verify and remove not allowed images</Typography>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please upload avatar and banner.
          </Typography>
        )}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}>
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
                    <PhotoCameraOutlinedIcon sx={{ fontSize: 40, color: "#c2185b" }} />
                  </IconButton>
                </label>
              </>
            )}
          </Box>
        </Grid>

        {/* Banner Upload */}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}>
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
                    <PhotoCameraOutlinedIcon sx={{ fontSize: 40, color: "#c2185b" }} />
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={24} color="inherit" />
                <Typography 
                  sx={{ 
                    color: '#fff', 
                    fontSize: '0.875rem',
                    position: 'absolute',
                    top: '100%',
                    width: '400px',
                    marginTop: '8px'
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
                  ? avatarImage || undefined // If `avatarImage` is null, pass undefined
                  : currentCropType === "banner"
                    ? bannerImage || undefined // If `bannerImage` is null, pass undefined
                    : undefined // For other cases
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
