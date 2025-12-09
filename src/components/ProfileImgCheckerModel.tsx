import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  IconButton,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { EditIcon } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Cropper from "react-easy-crop";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { useRouter } from "next/navigation";

const ProfileImgCheckerModel = ({
  profileId,
}: {
  profileId: string | null;
}) => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const preventDefault = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };

    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const preventTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    const preventKey = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    if (openDialog) {
      try {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } catch (err) {
        console.error("Error setting overflow hidden:", err);
      }

      window.addEventListener("wheel", preventWheel, { passive: false });
      window.addEventListener("touchmove", preventTouch, { passive: false });
      window.addEventListener("keydown", preventKey, { passive: false });
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
    }

    return () => {
      try {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      } catch (err) {}

      window.removeEventListener("wheel", preventWheel as EventListener);
      window.removeEventListener("touchmove", preventTouch as EventListener);
      window.removeEventListener("keydown", preventKey as EventListener);
      document.removeEventListener(
        "touchmove",
        preventDefault as EventListener
      );
    };
  }, [openDialog]);

  useEffect(() => {
    if (!profileId) return;

    async function checkAvatar() {
      try {
        const res = await fetch("/api/user/profile/profile-img-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: profileId }),
        });

        const json = await res.json();

        if (!res.ok) {
          console.error("profile-img-check failed:", json);
          setOpenDialog(true);
          return;
        }

        const avatar = json?.avatar;

        if (avatar === null || avatar === "") {
          setOpenDialog(true);
        } else {
          setOpenDialog(false);
        }
      } catch (err) {
        console.error("Profile check error:", err);
      }
    }

    checkAvatar();
  }, [profileId]);

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
      try {
        setUploading(true);
        const avatarUrl = await uploadImage(values.avatar);

        if (!avatarUrl) {
          formik.setFieldError("avatar", "Image upload failed. Try again.");
          return;
        }

        const res = await fetch("/api/user/avatarUpload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pid: profileId,
            Questionable: 1,
            avatar: avatarUrl,
          }),
        });

        if (!res.ok) {
          throw new Error("Avatar save failed");
        }

        setOpenDialog(false);
        setSnack({
          open: true,
          message: "Profile photo uploaded successfully!",
        });
      } catch (err) {
        console.error("Form submit failed:", err);
        formik.setFieldError("avatar", "Submission failed. Please try again.");
        setSnack({
          open: true,
          message: "Submission failed. Please try again.",
        });
      } finally {
        setUploading(false);
      }
    },
  });

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };
  return (
    <>
      <Dialog
        open={openDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        onClose={() => {}}
        hideBackdrop={false}
        aria-labelledby="upload-avatar-title"
        BackdropProps={{
          style: { backgroundColor: "rgba(0,0,0,0.75)" },
          onClick: (e) => e.stopPropagation(),
        }}
        PaperProps={{
          style: {
            borderRadius: 10,
            border: "2px solid #c2185b",
            pointerEvents: "auto",
            boxShadow: "none",
            ["--Paper-shadow" as any]: "none",
            background:
              "radial-gradient(circle at top left, #1A0B2E 0%, #000000 100%)",
          },
        }}
      >
        <DialogTitle
          id="upload-avatar-title"
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
          }}
        >
          Upload your profile picture
        </DialogTitle>

        <DialogContent
          sx={{
            color: "#fff",
            pt: 0,
          }}
        >
          <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            <Grid>
              <Typography
                sx={{
                  textAlign: "center",
                  color: "#ffffffff",
                  fontWeight: "bold",
                  fontSize: "clamp(0.875rem, 1.8vw, 1.05rem)",
                  mb: 1,
                }}
              >
                We noticed you haven’t uploaded a profile picture yet. Upload
                one now to unlock the full experience your photo helps others
                recognize you and improves content recommendations.
              </Typography>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "#ffffffcc",
                  fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                  mb: 2,
                }}
              >
                If you&apos;ve already uploaded an image and still see this
                message, you can log out and log back in again.
              </Typography>

              <Grid item xs={12} sx={{ mt: 2, textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#c2185b",
                    fontWeight: "bold",
                    mb: 2,
                    textAlign: "center",
                    fontSize: { xs: "0.98rem", sm: "1.05rem", md: "1.15rem" },
                  }}
                >
                  Primary Profile Picture
                </Typography>
                <Box
                  sx={{
                    width: 230,
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
                  fontSize: { xs: "0.625rem", sm: "0.7rem", md: "0.75rem" },
                }}
              >
                Please upload a clear, front-facing photo, no nudity, no
                cartoons, no objects. Real faces only.
              </Typography>

              <Grid
                item
                xs={12}
                sx={{
                  textAlign: "center",
                  mt: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  type="submit"
                  disabled={uploading}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "#c2185b",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#ad1457" },
                  }}
                >
                  {uploading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ArrowForwardIosIcon />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="text"
                  onClick={handleLogout}
                  sx={{
                    color: "#ffffffcc",
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    "&:hover": { color: "#ffffff" },
                  }}
                >
                  Log out and re-login
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>

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

      <Snackbar
        open={snack.open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          severity="success"
          sx={{
            backgroundColor: "white",
            color: "#fc4c82",
            fontWeight: "bold",
            alignItems: "center",
            borderRight: "5px solid #fc4c82",
          }}
          icon={
            <Box
              component="img"
              src="/icon.png"
              alt="Logo"
              sx={{ width: 20, height: 20 }}
            />
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfileImgCheckerModel;
