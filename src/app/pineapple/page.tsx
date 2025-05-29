"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  Modal,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  useTheme,
  Paper,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/navigation";
import UserProfileModal from "@/components/UserProfileModal";
import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";

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

interface ProfileCardProps {
  user: User;
  onProfileClick: (id: string) => void;
  onReport: (id: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onProfileClick,
  onReport,
}) => {
  const theme = useTheme();
  const [profileId, setProfileId] = useState<any>();
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);

  useEffect(() => {
    if (profileId) {
      getCurrentLocation();
    }
  }, [profileId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get the location name (you may need a third-party service here)
          const locationName = await getLocationName(latitude, longitude);

          // Send the location to your API
          await sendLocationToAPI(locationName, latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    const apiKey = "AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0"; // Replace with your actual API key

    try {
      // Call the Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract the location name from the response
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // Return the formatted address of the first result
      }

      console.error("No results found or status not OK:", data);
      return "Unknown Location";
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Unknown Location";
    }
  };

  const sendLocationToAPI = async (
    locationName: string,
    latitude: number,
    longitude: number
  ) => {
    if (!profileId) {
      console.error("Profile ID is missing.");
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
      if (response.ok) {
        console.log("Location sent successfully:", data);
      } else {
        console.error("Error sending location:", data.message);
      }
    } catch (error) {
      console.error("Error sending location to API:", error);
    }
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  };

  const handleGrantAccess = async () => {
    try {
      console.log("grantAccess");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
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
      <UserProfileModal
        handleGrantAccess={handleGrantAccess}
        handleClose={handleClose}
        open={showDetail}
        userid={selectedUserId}
      />
      <CardContent>
        <Grid container spacing={1} alignItems="center">
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
              <Avatar
                src={user.Avatar}
                alt={user.Username}
                sx={{
                  width: { xs: 50, sm: 65, md: 80 },
                  height: { xs: 50, sm: 65, md: 80 },
                  borderRadius: "12px",
                  border: "2px solid rgba(233, 30, 99, 0.5)",
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
                      new Date(user.PartnerDateOfBirth).getFullYear()}
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
              onClick={() => onReport(user.Id)}
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
  );
};

interface ReportOptions {
  reportUser: boolean;
  blockUser: boolean;
}

export default function Pineapple() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string>(
    "7c4cabe7-f7d2-4577-a9c2-de8b9c2af2c7"
  );
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [pineapple, setPineapple] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    reportUser: false,
    blockUser: false,
  });

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
    try {
      const response = await fetch("/api/user/sweeping/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileid: profileId, targetid: targetId }),
      });
      const data = await response.json();
      setIsReportModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchData = async (userId: string) => {
    if (userId) {
      setLoading(true);
      try {
        const response = await fetch(`/api/user/pineapple?id=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { pineapples } = await response.json();
        setPineapple(pineapples || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(profileId);
  }, []);

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
            mb: { xs: 2, sm: 3, md: 4 },
            marginTop: "40px",
            fontWeight: 600,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
            background: "linear-gradient(45deg, #e91e63, #9c27b0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Profiles Recently Active.
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Loading profiles...</Typography>
          </Box>
        ) : (
          <>
            {pineapple.map((user) => (
              <ProfileCard
                key={user.Id}
                user={user}
                onProfileClick={(id) => router.push(`/members?q=${id}`)}
                onReport={handleReportModalToggle}
              />
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
              Submit
            </Button>
          </Box>
        </Paper>
      </Modal>
      <Footer />
    </Box>
  );
}
