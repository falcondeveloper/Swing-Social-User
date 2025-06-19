import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  Card,
  Grid,
  Paper,
  Chip,
  Stack,
  ImageList,
  ImageListItem,
  IconButton,
} from "@mui/material";
import {
  LocationOn,
  Cake,
  CameraAlt,
  VolunteerActivism,
  Interests,
  Message,
} from "@mui/icons-material";
import { Dialog, DialogContent } from "@mui/material";
import { ShieldCloseIcon, X } from "lucide-react";

interface UserProfile {
  Id: string;
  Age: number;
  Username: string;
  Avatar: string;
  ProfileBanner: string;
  Tagline: string;
  About: string;
  Location: string;
  Gender: string;
  PartnerGender: string;
  AccountType: string;
  DateOfBirth: Date;
  PartnerDateOfBirth: Date;
  LookingFor: string[];
  SwingStyleTags: string[];
  KinkTags: string[];
  galleryImages: string[];
}

interface ProfileCardProps {
  profile: UserProfile | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const router = useRouter();
  const [profileImages, setProfileImages] = useState<any[]>([]);
  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImages = async () => {
      if (profile?.Id) {
        try {
          const response = await fetch(
            `/api/user/sweeping/images/profile?id=${profile.Id}`
          );
          const data = await response.json();
          setProfileImages(data?.images || []);
        } catch (error) {
          console.error("Error fetching profile images:", error);
        }
      }
    };

    fetchProfileImages();
  }, [profile?.Id]);

  const handleOpenImage = (src: string | null | undefined) => {
    if (!src) return;
    setModalImageSrc(src);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setModalImageSrc(null);
  };

  if (!profile) return null;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          mx: "auto",
          bgcolor: "#1e1e1e",
          minHeight: "100vh",
          overflow: openImageModal ? "hidden" : "auto",
          filter: openImageModal ? "blur(2px)" : "none",
          transition: "filter 0.3s ease-in-out",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#1e1e1e",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "white",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "rgba(255,128,171,0.5)",
            },
          },
        }}
      >
        <Card
          sx={{
            bgcolor: "#1e1e1e",
            borderRadius: 2,
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          {/* Profile Banner */}
          <Box
            sx={{ position: "relative", height: 300, cursor: "pointer" }}
            onClick={() =>
              handleOpenImage(profile.ProfileBanner ?? "/bannderDefault.jpg")
            }
          >
            <img
              src={profile.ProfileBanner ?? "/bannderDefault.jpg"}
              alt="Profile Banner"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "100%",
                background:
                  "linear-gradient(to top, #1e1e1e 0%, rgba(58, 56, 58, 0.7) 50%, rgba(189, 189, 189, 0) 100%)",
              }}
            />
          </Box>

          {/* Profile Header */}
          <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Avatar
              src={profile.Avatar ?? "/noavatar.png"}
              sx={{
                width: 120,
                height: 120,
                border: "4px solid #d81160",
                cursor: "pointer",
              }}
              onClick={() => handleOpenImage(profile.Avatar ?? "/noavatar.png")}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ color: "white", mb: 1 }}>
                {profile.Username + " "}

                {profile?.DateOfBirth
                  ? new Date().getFullYear() -
                    new Date(profile.DateOfBirth).getFullYear()
                  : ""}
                {profile?.Gender === "Male"
                  ? "M"
                  : profile?.Gender === "Female"
                  ? "F"
                  : ""}

                {profile?.PartnerDateOfBirth && (
                  <>
                    {" | "}
                    {new Date().getFullYear() -
                      new Date(profile.PartnerDateOfBirth).getFullYear()}
                    {profile?.PartnerGender === "Male"
                      ? "M"
                      : profile?.PartnerGender === "Female"
                      ? "F"
                      : ""}
                  </>
                )}
              </Typography>
              <Typography
                variant="subtitle1"
                dangerouslySetInnerHTML={{ __html: profile?.Tagline }}
                sx={{
                  color: "#d81160",
                  mb: 2,
                  fontWeight: "bold",
                  maxWidth: "100%",
                  whiteSpace: "normal", // Change this to allow wrapping
                  wordWrap: "break-word", // Ensures long text breaks within words
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box", // Enables a flex container for text truncation
                  WebkitLineClamp: 3, // Limits the text to 3 lines
                  WebkitBoxOrient: "vertical", // Establishes vertical orientation for line clamping
                }}
              ></Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<Cake />}
                  label={`Age: ${
                    new Date().getFullYear() -
                    new Date(profile.DateOfBirth).getFullYear()
                  } years`}
                  size="medium"
                  sx={{ bgcolor: "rgba(0,0,0,0.2)", color: "white" }}
                />
                <Chip
                  icon={<LocationOn />}
                  label={profile?.Location?.replace(", USA", "")}
                  size="medium"
                  sx={{ bgcolor: "rgba(0,0,0,0.2)", color: "white" }}
                />
                <Chip
                  icon={<Message sx={{ fontSize: 24 }} />}
                  label={`Chat with ${profile?.Username}`}
                  // size="large"
                  sx={{
                    bgcolor: "#453a3ade",
                    color: "white",
                    "& .MuiChip-label": {
                      fontSize: "1.1rem",
                    },
                  }}
                  onClick={() => router.push(`/messaging/${profile?.Id}`)}
                />
              </Stack>
            </Box>
          </Box>

          <Box sx={{ px: 3, paddingBottom: "120px" }}>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}></Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                dangerouslySetInnerHTML={{ __html: profile?.About }}
                sx={{
                  color: "white",
                  mb: 2,
                  fontWeight: "bold",
                  maxWidth: "100%",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  display: "-webkit-box", // Use flexbox-like behavior for text layout
                  WebkitBoxOrient: "vertical", // Required for line clamping
                  WebkitLineClamp: 3, // Limits text to 3 lines
                  textOverflow: "ellipsis",
                }}
              />
            </Stack>

            <Grid container spacing={3}>
              {/* Left Column - Photo Gallery */}
              <Grid item xs={12} md={7}>
                <Paper
                  sx={{ p: 3, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CameraAlt sx={{ color: "#d81160" }} />
                    Photo Gallery
                  </Typography>
                  <ImageList cols={3} gap={16} sx={{ mb: 0 }}>
                    {profileImages.length > 0 ? (
                      profileImages.map((image, index) => {
                        const uniqueKey = image?.Url
                          ? `${image.Url}-${index}-${Math.random()
                              .toString(36)
                              .substr(2, 9)}`
                          : `profile-image-${index}-${Math.random()
                              .toString(36)
                              .substr(2, 9)}`;
                        return (
                          <ImageListItem key={uniqueKey}>
                            <img
                              src={
                                image.Url && image.Url.trim() !== ""
                                  ? image.Url
                                  : "/noavatar.png"
                              }
                              alt={`Gallery ${index + 1}`}
                              style={{
                                borderRadius: "8px",
                                width: "100%",
                                height: "100%",
                                aspectRatio: "1",
                                objectFit: "cover",
                              }}
                            />
                          </ImageListItem>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="white">
                        No Photos Provided
                      </Typography>
                    )}
                  </ImageList>
                </Paper>
              </Grid>

              {/* Right Column - Looking For & Interests */}
              <Grid item xs={12} md={5}>
                <Stack spacing={3}>
                  {/* Looking For */}
                  <Paper
                    sx={{ p: 3, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <VolunteerActivism sx={{ color: "#d81160" }} />
                      Looking For
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {profile.LookingFor?.length > 0 ? (
                        profile.LookingFor.map((item, idx) => (
                          <Chip
                            key={`${item}-${idx}`}
                            label={item}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,128,171,0.1)",
                              color: "#ff80ab",
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="white">
                          No data
                        </Typography>
                      )}
                    </Box>
                  </Paper>

                  {/* Interests & Preferences */}
                  <Paper
                    sx={{ p: 3, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Interests sx={{ color: "#d81160" }} />
                      Interests & Preferences
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#ff80ab", mb: 1 }}
                    >
                      Swing Styles
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}
                    >
                      {profile.SwingStyleTags.map((tag, idx) => (
                        <Chip
                          key={`${tag}-${idx}`}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,128,171,0.1)",
                            color: "#ff80ab",
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>
      <Dialog
        open={openImageModal}
        onClose={handleCloseImageModal}
        maxWidth="lg"
        fullWidth
        disableScrollLock={false}
        PaperProps={{
          sx: {
            backgroundColor: "#000",
            boxShadow: "none",
            borderRadius: 1,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: "absolute",
              top: 5,
              right: 8,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.4)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
              zIndex: 2,
            }}
          >
            <X size={20} />
          </IconButton>
          {modalImageSrc && (
            <img
              src={modalImageSrc}
              alt="Full View"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "10px",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileCard;
