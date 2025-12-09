"use client";

import { useCallback, useEffect, useState } from "react";
import { notify, handleGeolocationError } from "@/lib/notifications";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  Modal,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/navigation";
import UserProfileModal from "@/components/UserProfileModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import ProfileImgCheckerModel from "@/components/ProfileImgCheckerModel";

interface User {
  Id: string;
  Avatar: string;
  Username: string;
  DateOfBirth?: string;
  Gender?: string;
  PartnerDateOfBirth?: string;
  PartnerGender?: string;
  Location: string;
  Distance: string;
  LastOnline: string;
}

interface ReportOptions {
  reportUser: boolean;
  blockUser: boolean;
  reportImage: boolean;
}

export default function Pineapple() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string>("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [pineapple, setPineapple] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    reportUser: false,
    blockUser: false,
    reportImage: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportImageApi = async ({
    reportedById,
    reportedByName,
    reportedUserId,
    reportedUserName,
    image,
  }: {
    reportedById: string;
    reportedByName: string;
    reportedUserId: string;
    reportedUserName: string;
    image: string;
  }) => {
    try {
      const response = await fetch("/api/user/reportedUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedById,
          reportedByName,
          reportedUserId,
          reportedUserName,
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || "Failed to report image.");
        return false;
      }

      toast.success("Image reported successfully!");
      return true;
    } catch (err) {
      console.error("Error reporting image:", err);
      toast.error("Error reporting image.");
      return false;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify.location.notSupported();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          await sendLocationToAPI(locationName, latitude, longitude);
        } catch (error) {
          console.error("Error processing location:", error);
        }
      },
      (error) => {
        handleGeolocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("loginInfo");
      if (token) {
        const decodeToken = jwtDecode<any>(token);
        setProfileId(decodeToken?.profileId);
      } else {
        router.push("/login");
      }
    }
  }, []);

  const handleReportModalToggle = (pid: any) => {
    setTargetId(pid);
    setIsReportModalOpen((prev) => !prev);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setReportOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleReportSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const reportedUser = pineapple?.find((u) => u?.Id === targetId);
    const reportedUserName = reportedUser?.Username || "Unknown";
    const reportedUserImage = reportedUser?.Avatar || "";
    const token = localStorage.getItem("loginInfo");
    const decodeToken = token ? jwtDecode<any>(token) : {};
    const reportedByName = decodeToken?.profileName || "Me";

    try {
      if (reportOptions.reportImage) {
        await reportImageApi({
          reportedById: profileId,
          reportedByName,
          reportedUserId: targetId!,
          reportedUserName,
          image: reportedUserImage,
        });
      }

      if (reportOptions.reportUser || reportOptions.blockUser) {
        const res = await fetch("/api/user/sweeping/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileid: profileId,
            targetid: targetId,
          }),
        });

        if (!res.ok) {
          toast.error("Failed to report user.");
          return null;
        }

        await res.json();
        toast.success("User reported successfully");
      }

      if (
        reportOptions.reportImage ||
        reportOptions.reportUser ||
        reportOptions.blockUser
      ) {
        setIsReportModalOpen(false);
        setReportOptions({
          reportUser: false,
          blockUser: false,
          reportImage: false,
        });
      }
    } catch (err) {
      toast.error("An error occurred while reporting.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [profileId, reportOptions]);

  useEffect(() => {
    if (!profileId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/user/pineapple?id=${profileId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { pineapples } = await response.json();
        setPineapple(pineapples || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getCurrentLocation();
  }, [profileId]);

  const getLocationName = async (latitude: number, longitude: number) => {
    const apiKey = "AIzaSyBEr0k_aQ_Sns6YbIQ4UBxCUTdPV9AhdF0";
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return "Unknown Location";
    } catch (error) {
      return "Unknown Location";
    }
  };

  const sendLocationToAPI = async (
    locationName: string,
    latitude: number,
    longitude: number
  ) => {
    if (!profileId) {
      return;
    }

    try {
      const response = await fetch("/api/user/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          locationName,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return;
      }
    } catch (error) {}
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  };

  const handleGrantAccess = async () => {
    try {
    } catch (error) {}
  };

  return (
    <>
      <Header />
      {profileId && <ProfileImgCheckerModel profileId={profileId} />}

      <Container
        fixed
        sx={{
          px: { xs: 2, md: 0 },
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            mt: { xs: 2, md: 3 },
            mb: 5,
            fontWeight: 700,
            background: "linear-gradient(45deg, #e91e63, #9c27b0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
          }}
        >
          Profiles Recently Active
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress
              sx={{
                color: "#d219c4",
              }}
              size={60}
            />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {pineapple.map((user, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={4}
                  key={index}
                  sx={{
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Card
                    sx={{
                      mb: 3,
                      borderRadius: 4,
                      overflow: "hidden",
                      backgroundColor: "rgba(18, 18, 18, 0.9)",
                      transition: "transform 0.25s",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  >
                    {/* Avatar Top */}
                    <CardMedia
                      component="img"
                      image={user.Avatar}
                      alt={user.Username}
                      sx={{
                        width: "100%",
                        height: { xs: 280, sm: 320, md: 350 },
                        objectFit: "cover",
                        objectPosition: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setShowDetail(true);
                        setSelectedUserId(user.Id);
                      }}
                    />

                    {/* Info Section */}
                    <CardContent>
                      {/* Username + Age/Gender */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: {
                              xs: "1rem",
                              sm: "1.1rem",
                              md: "1.2rem",
                            },
                            color: "#fff",
                          }}
                        >
                          {user.Username}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          }}
                        >
                          {user?.DateOfBirth &&
                            `${
                              new Date().getFullYear() -
                              new Date(user.DateOfBirth).getFullYear()
                            }${user?.Gender?.[0] || ""}`}
                        </Typography>
                      </Box>

                      {/* Partner Info */}

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: { xs: "0.75rem", sm: "0.85rem" },
                        }}
                      >
                        {user?.PartnerDateOfBirth && (
                          <>
                            Partner:{" "}
                            {new Date().getFullYear() -
                              new Date(user.PartnerDateOfBirth).getFullYear()}
                            {user?.PartnerGender?.[0] || ""}
                          </>
                        )}
                      </Typography>

                      {/* Location + Distance */}
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "rgba(255,255,255,0.8)",
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          mt: 1,
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: "1rem" }} />
                        {user?.Location?.replace(", USA", "")} • {user.Distance}
                      </Typography>

                      {/* Last Online */}
                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          color: "rgba(0,255,127,0.8)",
                        }}
                      >
                        Last online:{" "}
                        {user.LastOnline
                          ? new Date(user.LastOnline).toLocaleString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            })
                          : "Unknown"}
                      </Typography>
                    </CardContent>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        px: 2,
                        pb: 2,
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setShowDetail(true);
                          setSelectedUserId(user.Id);
                        }}
                        sx={{
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      >
                        <img
                          src="/icons/pineapple.png"
                          alt="pineapple"
                          width={32}
                        />
                      </IconButton>
                      <IconButton
                        onClick={() => handleReportModalToggle(user.Id)}
                        sx={{
                          "&:hover": {
                            transform: "scale(1.1)",
                            color: "red",
                          },
                        }}
                      >
                        <FlagIcon sx={{ fontSize: "1.4rem", color: "red" }} />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      <Box sx={{ height: { xs: "72px", sm: "80px" } }} />

      <Modal
        open={isReportModalOpen}
        onClose={() => handleReportModalToggle("null")}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: { xs: 280, sm: 340 },
            maxWidth: "90%",
            bgcolor: "#1e1e1e",
            color: "white",
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            mx: { xs: 2 },
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Report or Block User
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.reportImage}
                onChange={handleCheckboxChange}
                name="reportImage"
                sx={{
                  color: "white",
                  "& .MuiCheckbox-root": {
                    color: "#9c27b0",
                  },
                  "& .MuiCheckbox-root.Mui-checked": {
                    color: "#9c27b0",
                  },
                }}
              />
            }
            label="Inappropriate Image"
            sx={{ display: "block", mb: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.reportUser}
                onChange={handleCheckboxChange}
                name="reportUser"
                sx={{
                  color: "#9c27b0",
                  "&.Mui-checked": {
                    color: "#e91e63",
                  },
                }}
              />
            }
            label="Report User"
            sx={{ display: "block", mb: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.blockUser}
                onChange={handleCheckboxChange}
                name="blockUser"
                sx={{
                  color: "#9c27b0",
                  "&.Mui-checked": {
                    color: "#e91e63",
                  },
                }}
              />
            }
            label="Block User"
            sx={{ display: "block", mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              onClick={() => handleReportModalToggle("null")}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportSubmit}
              variant="contained"
              color="secondary"
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <UserProfileModal
        handleGrantAccess={handleGrantAccess}
        handleClose={handleClose}
        open={showDetail}
        userid={selectedUserId}
      />
      <Footer />
    </>
  );
}
