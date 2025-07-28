"use client";

import { useEffect, useState } from "react";
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
  useTheme,
  Paper,
  CircularProgress,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/navigation";
import UserProfileModal from "@/components/UserProfileModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { toast } from "react-toastify";

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
}

interface ReportOptions {
  reportUser: boolean;
  blockUser: boolean;
  reportImage: boolean;
}

export default function Pineapple() {
  const router = useRouter();
  const theme = useTheme();
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
        console.log("decodeToken", decodeToken);
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

  const handleReportUser = async () => {
    setIsSubmitting(true);

    const reportedUser = pineapple?.find((u) => u?.Id === targetId);
    const reportedUserName = reportedUser?.Username || "Unknown";
    const reportedUserImage = reportedUser?.Avatar || "";
    const token = localStorage.getItem("loginInfo");
    const decodeToken = token ? jwtDecode<any>(token) : {};
    const reportedByName = decodeToken?.profileName || "Me";

    try {
      const response = await fetch("/api/user/sweeping/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileid: profileId, targetid: targetId }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("User reported successfully!");
      } else {
        toast.error(data?.message || "Failed to submit report.");
      }
      if (reportOptions?.reportImage) {
        await reportImageApi({
          reportedById: profileId,
          reportedByName,
          reportedUserId: targetId!,
          reportedUserName,
          image: reportedUserImage,
        });
      }

      setIsReportModalOpen(false);
      setReportOptions({
        reportUser: false,
        blockUser: false,
        reportImage: false,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
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
    const apiKey = "AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0";
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
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "white",
      }}
    >
      <Header />

      <Container
        maxWidth="md"
        sx={{
          pt: { xs: 8, sm: 10, md: 12 },
          pb: { xs: 8, sm: 9, md: 10 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            marginTop: "30px",
            marginBottom: "30px",
            fontWeight: 600,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
            background: "linear-gradient(45deg, #e91e63, #9c27b0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Profiles Recently Active
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Loading profiles...</Typography>
          </Box>
        ) : (
          <>
            {pineapple.map((user, index) => (
              <>
                <Card
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(18, 18, 18, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.2)`,
                    },
                  }}
                >
                  <CardContent>
                    <Grid container spacing={1} alignItems="center" key={index}>
                      <Grid item xs={3} sm={2}>
                        <Box
                          sx={{
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            setShowDetail(true);
                            setSelectedUserId(user.Id);
                          }}
                        >
                          <img
                            src={user.Avatar || "/default-avatar.png"}
                            alt={user.Username}
                            style={{
                              objectFit: "cover",
                              width: "80px",
                              height: "80px",
                              borderRadius: "12px",
                            }}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={7}>
                        <Box sx={{ pl: { xs: 1, sm: 2 } }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#e91e63",
                              fontWeight: 600,
                              mb: 0.5,
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                          >
                            {user.Username}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.8)",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 0.5,
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            }}
                          >
                            {user?.DateOfBirth && (
                              <>
                                {new Date().getFullYear() -
                                  new Date(user.DateOfBirth).getFullYear()}
                                {user?.Gender === "Male"
                                  ? "M"
                                  : user?.Gender === "Female"
                                  ? "F"
                                  : ""}
                              </>
                            )}
                            {user?.PartnerDateOfBirth && (
                              <>
                                {" | "}
                                {new Date().getFullYear() -
                                  new Date(
                                    user.PartnerDateOfBirth
                                  ).getFullYear()}
                                {user?.PartnerGender === "Male"
                                  ? "M"
                                  : user?.PartnerGender === "Female"
                                  ? "F"
                                  : ""}
                              </>
                            )}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              <LocationOnIcon
                                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                              />
                              {user?.Location?.replace(", USA", "")}
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                color: "rgba(255, 255, 255, 0.5)",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              • {user.Distance}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid
                        item
                        xs={3}
                        sm={3}
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            setShowDetail(true);
                            setSelectedUserId(user.Id);
                          }}
                          sx={{
                            p: { xs: 0.5, sm: 1 },
                            "&:hover": { transform: "scale(1.1)" },
                          }}
                        >
                          <img
                            src="/icons/pineapple.png"
                            alt="Pineapple"
                            style={{
                              width: "100%",
                              height: "100%",
                              maxWidth: "40px",
                              maxHeight: "40px",
                            }}
                          />
                        </IconButton>
                        <IconButton
                          onClick={() => handleReportModalToggle(user.Id)}
                          sx={{
                            p: { xs: 0.5, sm: 1 },
                            "&:hover": {
                              color: theme.palette.error.main,
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <FlagIcon
                            sx={{
                              color: "red",
                              fontSize: { xs: "1.25rem", sm: "1.5rem" },
                            }}
                          />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </>
            ))}
          </>
        )}
      </Container>

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
                  color: "#9c27b0",
                  "&.Mui-checked": {
                    color: "#e91e63",
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
              onClick={handleReportUser}
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
    </Box>
  );
}
