"use client";

import Header from "@/components/Header";
import { notify, handleGeolocationError } from "@/lib/notifications";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Modal,
  FormControlLabel,
  Checkbox,
  Container,
  Chip,
  Fade,
  Paper,
  useMediaQuery,
  TextField,
  List,
  ListItem,
  ListItemText,
  Stack,
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Flag } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import AboutSection from "@/components/AboutSection";
import { Verified } from "@mui/icons-material";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import UserProfileModal from "@/components/UserProfileModal";
import { toast } from "react-toastify";

export default function MatchesPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const [profiles, setProfiles] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any>([]);
  const [profileId, setProfileId] = useState<any>();
  const [currentMatch, setCurrentMatch] = useState<any>("Liked");
  const [targetId, setTargetId] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [search, setSearch] = useState<any>(null);
  const [errors, setErrors] = useState<any>({ search: null });
  const [onlyPhotos, setOnlyPhotos] = useState(0);
  const [herAgeRange, setHerAgeRange] = useState({ min: "", max: "" });
  const [hisAgeRange, setHisAgeRange] = useState({ min: "", max: "" });
  const [hisOrientation, setHisOrientation] = useState("");
  const [herOrientation, setHerOrientation] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityOption, setCityOption] = useState<any>([]);
  const [cityInput, setCityInput] = useState<string | "">("");
  const [coupleType, setCoupleType] = useState("");
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [reportOptions, setReportOptions] = useState({
    reportUser: false,
    blockUser: false,
    reportImage: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selctedProfile, setSelectedProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    city: "",
  });

  const handleGrantAccess = async () => {
    try {
      const checkData = "121212";
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
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

  useEffect(() => {
    if (profileId && currentMatch) {
      handleGetMatch(profileId, currentMatch);
    }
  }, [profileId, currentMatch]);

  const handleGetMatch = async (userid: any, match: any) => {
    try {
      setProfileLoading(true);
      const checkResponse = await fetch(
        "/api/user/matches?id=" + userid + "&match=" + match,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await checkResponse.json();
      setProfiles(data?.profiles || []);
      setFilteredData(data?.profiles || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleReportModalToggle = (pid: any) => {
    setTargetId(pid?.Id);
    setIsReportModalOpen((prev) => !prev);
    setSelectedProfile(pid);
  };

  const handleCheckboxChange = (event: any) => {
    const { name, checked } = event.target;
    setReportOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

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

  const handleReportSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("loginInfo");
    const decodeToken = token ? jwtDecode<any>(token) : {};
    const reportedByName = decodeToken?.profileName || "Me";

    if (!selctedProfile) return;

    try {
      if (reportOptions.reportImage) {
        await reportImageApi({
          reportedById: profileId,
          reportedByName,
          reportedUserId: selctedProfile?.Id,
          reportedUserName: selctedProfile?.Username,
          image: selctedProfile?.Avatar,
        });
      }

      if (reportOptions.reportUser || reportOptions.blockUser) {
        const res = await fetch("/api/user/sweeping/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileid: profileId,
            targetid: selctedProfile?.Id,
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

  const sidebarItems = [
    { label: "Matches", match: "Matches" },
    { label: "Liked", match: "Liked" },
    { label: "Maybe", match: "Maybe" },
    { label: "Blocked", match: "Blocked" },
    { label: "Likes Me", match: "LikesMe" },
    { label: "Friends", match: "Friends" },
    { label: "Denied", match: "Denied" },
    // { label: "Online", match: "Online" },
    { label: "Search", match: "Search" },
    // { label: "Blocked", match: "Blocked" },
  ];

  const handlePhotosChange = (event: any) => {
    if (event.target.checked) {
      setOnlyPhotos(1);
    } else {
      setOnlyPhotos(0);
    }
  };

  const handleHerAgeChange = (event: any) => {
    const { name, value } = event.target;
    setHerAgeRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleHisAgeChange = (event: any) => {
    const { name, value } = event.target;
    setHisAgeRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleHisOrientationChange = (event: any) => {
    setHisOrientation(event.target.value);
  };

  const handleHerOrientationChange = (event: any) => {
    setHerOrientation(event.target.value);
  };

  useEffect(() => {
    if (!search || search.trim() === "") {
      setProfiles(filteredData);
    } else {
      const filtered = filteredData.filter((profile: any) =>
        profile.Username.toLowerCase().includes(search.toLowerCase())
      );
      setProfiles(filtered);
    }
  }, [search, filteredData]);

  useEffect(() => {
    if (!openCity) {
      setCityOption([]);
    }
  }, [openCity]);

  useEffect(() => {
    if (!openCity) return;
    if (cityInput === "") return;

    const fetchData = async () => {
      setCityLoading(true);

      try {
        const response = await fetch(`/api/user/city?city=${cityInput}`);
        if (!response.ok) {
          console.error("Failed to fetch event data:", response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { cities }: { cities: any } = await response.json();

        const uniqueCities = cities.filter(
          (city: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.City === city.City)
        );

        setCityOption(uniqueCities);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setCityLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cityInput, openCity]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const queryParams: string = new URLSearchParams({
      loginprofileid: String(profileId),
      q_username: String(search),
      q_coupletype: String(coupleType),
      q_citystate: String(cityInput),
      q_onlywithphotos: String(onlyPhotos),
      q_hisagemin: String(hisAgeRange?.min),
      q_hisagemax: String(hisAgeRange?.max),
      q_heragemin: String(herAgeRange?.min),
      q_heragemax: String(herAgeRange?.max),
      q_herorientation: String(herOrientation),
      q_hisorientation: String(hisOrientation),
    }).toString();

    try {
      const response = await fetch(`/api/user/matches/search?${queryParams}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }

      const data = await response.json();
      if (isMobile) {
        setSearchResults(data?.profiles);
        setCurrentMatch("Search");
      } else {
        setProfiles(data?.profiles);
        setCurrentMatch("Search");
      }
      setCurrentMatch(null);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  useEffect(() => {
    if (profileId) {
      getCurrentLocation();
    }
  }, [profileId]);

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

  return (
    <>
      <Header />
      {isMobile === true ? (
        <Box
          sx={{
            // padding: "20px 8px 8px 8px",
            backgroundColor: "#0a0a0a",
            minHeight: "100vh",
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              pt: { xs: 4, sm: 4, md: 4 },
              pb: { xs: 8, sm: 9, md: 10 },
              px: { xs: 1, sm: 2, md: 3 },
            }}
          >
            <>
              {searchResults?.length > 0 ? (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  {searchResults.map((profile: any, index: number) => (
                    <Card
                      key={index}
                      elevation={0}
                      sx={{
                        border: "none",
                        width: "100%",
                        boxShadow: "none",
                        backgroundColor: "#1a1a1a",
                        color: "white",
                        borderRadius: "12px",
                      }}
                      onClick={() => {
                        setShowDetail(true);
                        setSelectedUserId(
                          profile?.Id ? profile?.Id : profile?.Id
                        );
                      }}
                    >
                      <Box
                        position="relative"
                        width="100%"
                        sx={{
                          height: "300px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          alt={profile?.Username || "Profile"}
                          src={profile?.Avatar || "/default-avatar.png"}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </Box>
                      <CardContent sx={{ padding: "16px" }}>
                        <Typography
                          variant="h6"
                          component="div"
                          gutterBottom
                          sx={{ fontSize: "18px", fontWeight: "bold" }}
                        >
                          {profile?.Username || "Unknown"} ,{" "}
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
                                new Date(
                                  profile.PartnerDateOfBirth
                                ).getFullYear()}{" "}
                              {profile?.PartnerGender === "Male"
                                ? "M"
                                : profile?.PartnerGender === "Female"
                                ? "F"
                                : ""}
                            </>
                          )}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="secondary"
                          sx={{ color: "#aaa", marginBottom: "8px" }}
                        >
                          {profile?.Location?.replace(", USA", "") || ""}
                        </Typography>
                        <AboutSection aboutText={profile?.About} />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <Box
                    sx={{
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      paddingBottom: "8px",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    }}
                  >
                    <Box sx={{ display: "inline-flex", gap: "8px" }}>
                      {sidebarItems.map((item, index) => (
                        <Box
                          key={index}
                          onClick={() => setCurrentMatch(item.label)}
                          sx={{
                            backgroundColor:
                              currentMatch === item.label
                                ? "#f50057"
                                : "#2d2d2d",
                            borderRadius: "20px",
                            padding: "8px 16px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            color: "white",
                            fontWeight: "500",
                            fontSize: "14px",
                            minWidth: "fit-content",
                          }}
                        >
                          {item.label}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Card
                    sx={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      color="white"
                      textAlign="center"
                      sx={{ fontSize: "20px", marginBottom: "16px" }}
                    >
                      {currentMatch}
                    </Typography>

                    {/* Search Input */}
                    <Box sx={{ marginBottom: "16px" }}>
                      <TextField
                        placeholder="Search by username"
                        fullWidth
                        value={search ?? ""}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setErrors((prev: any) => ({ ...prev, search: "" }));
                        }}
                        sx={{
                          backgroundColor: "#2a2a2a",
                          input: {
                            color: "#fff",
                            padding: "12px 0",
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": {
                              borderColor: errors?.search ? "red" : "#444",
                            },
                          },
                        }}
                        error={Boolean(errors?.search)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#aaa" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {errors?.search && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ mt: 1, textAlign: "center" }}
                        >
                          {errors?.search}
                        </Typography>
                      )}
                    </Box>

                    {currentMatch === "Search" && (
                      <Box
                        sx={{
                          backgroundColor: "#2a2a2a",
                          borderRadius: "12px",
                          padding: "16px",
                          marginTop: "8px",
                        }}
                      >
                        {/* About Textarea */}
                        <TextField
                          multiline
                          rows={3}
                          variant="outlined"
                          fullWidth
                          sx={{
                            backgroundColor: "#1a1a1a",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-root": {
                              "& textarea": {
                                color: "#fff",
                              },
                            },
                          }}
                        />

                        {/* Location Search */}
                        <Typography
                          sx={{
                            color: "white",
                            marginTop: "16px",
                            marginBottom: "8px",
                          }}
                        >
                          City, State
                        </Typography>
                        <Autocomplete
                          value={formData?.city || ""}
                          open={openCity}
                          onOpen={() => setOpenCity(true)}
                          onClose={() => setOpenCity(false)}
                          options={cityOption.map((city: any) => city.City)}
                          loading={cityLoading}
                          inputValue={cityInput}
                          onInputChange={(event, newInputValue) => {
                            if (
                              event?.type === "change" ||
                              event?.type === "click"
                            )
                              setCityInput(newInputValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              sx={{
                                backgroundColor: "#1a1a1a",
                                borderRadius: "8px",
                                "& .MuiOutlinedInput-root": {
                                  "& input": {
                                    color: "#fff",
                                  },
                                },
                              }}
                            />
                          )}
                        />

                        {/* Photos Checkbox */}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={onlyPhotos == 1}
                              onChange={handlePhotosChange}
                              sx={{ color: "#aaa" }}
                            />
                          }
                          label="Only profiles with Photos"
                          sx={{
                            color: "#fff",
                            marginTop: "12px",
                            "& .MuiTypography-root": { fontSize: "14px" },
                          }}
                        />

                        {/* Age Range Sections */}
                        <Box
                          sx={{
                            border: "1px solid #444",
                            borderRadius: "8px",
                            padding: "12px",
                            marginTop: "16px",
                          }}
                        >
                          {/* Her Age */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "12px",
                            }}
                          >
                            <Typography
                              sx={{ color: "#fff", fontSize: "14px" }}
                            >
                              Her age between
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <TextField
                                size="small"
                                type="number"
                                name="min"
                                value={herAgeRange.min ?? ""}
                                onChange={handleHerAgeChange}
                                sx={{
                                  width: "60px",
                                  backgroundColor: "#1a1a1a",
                                  "& .MuiOutlinedInput-input": {
                                    color: "#fff",
                                    padding: "8px",
                                  },
                                }}
                              />
                              <Typography sx={{ color: "#fff" }}>
                                and
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                name="max"
                                value={herAgeRange.max ?? ""}
                                onChange={handleHerAgeChange}
                                sx={{
                                  width: "60px",
                                  backgroundColor: "#1a1a1a",
                                  "& .MuiOutlinedInput-input": {
                                    color: "#fff",
                                    padding: "8px",
                                  },
                                }}
                              />
                            </Box>
                          </Box>

                          {/* His Age */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              sx={{ color: "#fff", fontSize: "14px" }}
                            >
                              His age between
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <TextField
                                size="small"
                                type="number"
                                name="min"
                                value={hisAgeRange.min ?? ""}
                                onChange={handleHisAgeChange}
                                sx={{
                                  width: "60px",
                                  backgroundColor: "#1a1a1a",
                                  "& .MuiOutlinedInput-input": {
                                    color: "#fff",
                                    padding: "8px",
                                  },
                                }}
                              />
                              <Typography sx={{ color: "#fff" }}>
                                and
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                name="max"
                                value={hisAgeRange.max ?? ""}
                                onChange={handleHisAgeChange}
                                sx={{
                                  width: "60px",
                                  backgroundColor: "#1a1a1a",
                                  "& .MuiOutlinedInput-input": {
                                    color: "#fff",
                                    padding: "8px",
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {/* Orientation Selects */}
                        <Box sx={{ marginTop: "16px" }}>
                          <FormControl fullWidth sx={{ marginBottom: "16px" }}>
                            <InputLabel sx={{ color: "#aaa" }}>
                              His Orientation
                            </InputLabel>
                            <Select
                              value={hisOrientation ?? ""}
                              onChange={handleHisOrientationChange}
                              sx={{
                                color: "white",
                                backgroundColor: "#1a1a1a",
                                borderRadius: "8px",
                              }}
                            >
                              <MenuItem value="Straight">Straight</MenuItem>
                              <MenuItem value="Bi">Bi</MenuItem>
                              <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                              <MenuItem value="Open minded">
                                Open minded
                              </MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl fullWidth>
                            <InputLabel sx={{ color: "#aaa" }}>
                              Her Orientation
                            </InputLabel>
                            <Select
                              value={herOrientation ?? ""}
                              onChange={handleHerOrientationChange}
                              sx={{
                                color: "white",
                                backgroundColor: "#1a1a1a",
                                borderRadius: "8px",
                              }}
                            >
                              <MenuItem value="Straight">Straight</MenuItem>
                              <MenuItem value="Bi">Bi</MenuItem>
                              <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                              <MenuItem value="Open minded">
                                Open minded
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        {/* Search Button */}
                        <Button
                          onClick={handleSubmit}
                          variant="contained"
                          fullWidth
                          sx={{
                            backgroundColor: "#f50057",
                            color: "white",
                            marginTop: "24px",
                            padding: "12px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            "&:hover": {
                              backgroundColor: "#c51162",
                            },
                          }}
                        >
                          Search
                        </Button>
                      </Box>
                    )}

                    {currentMatch !== "Search" && (
                      <>
                        {profileLoading ? (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                py: 4,
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  width: 64,
                                  height: 64,
                                }}
                              >
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    border:
                                      "4px solid rgba(255, 255, 255, 0.2)",
                                  }}
                                />
                                <CircularProgress
                                  thickness={4}
                                  size={64}
                                  sx={{
                                    color: "#e91e63",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  color: "rgba(255,255,255,0.7)",
                                  fontSize: "1rem",
                                }}
                              >
                                Loading profiles…
                              </Typography>
                            </Box>
                          </Grid>
                        ) : (
                          <>
                            <Box sx={{ marginTop: "16px" }}>
                              {profiles.length > 0 ? (
                                profiles.map((profile: any, index: number) => (
                                  <Card
                                    key={index}
                                    sx={{
                                      backgroundColor: "rgba(45, 45, 45, 0.8)",
                                      borderRadius: "12px",
                                      marginBottom: "16px",
                                    }}
                                  >
                                    <Box
                                      position="relative"
                                      width="100%"
                                      sx={{
                                        aspectRatio: "1 / 1",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        setShowDetail(true);
                                        setSelectedUserId(profile?.Id);
                                      }}
                                    >
                                      <img
                                        src={
                                          profile?.Avatar ||
                                          "/default-avatar.png"
                                        }
                                        alt="Profile"
                                        loading="lazy"
                                        style={{
                                          objectFit: "cover",
                                          width: "100%",
                                          height: "100%",
                                        }}
                                      />
                                    </Box>
                                    <CardContent sx={{ padding: "12px" }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Box>
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              color: "#e91e63",
                                              fontWeight: 600,
                                              mb: 0.5,
                                              fontSize: {
                                                xs: "1rem",
                                                sm: "1.25rem",
                                              },
                                            }}
                                          >
                                            {profile.Username}
                                          </Typography>

                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "rgba(255, 255, 255, 0.8)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.5,
                                              mb: 0.5,
                                              fontSize: {
                                                xs: "0.8rem",
                                                sm: "0.875rem",
                                              },
                                            }}
                                          >
                                            {profile?.DateOfBirth && (
                                              <>
                                                {new Date().getFullYear() -
                                                  new Date(
                                                    profile.DateOfBirth
                                                  ).getFullYear()}
                                                {profile?.Gender === "Male"
                                                  ? "M"
                                                  : profile?.Gender === "Female"
                                                  ? "F"
                                                  : ""}
                                              </>
                                            )}
                                            {profile?.PartnerDateOfBirth && (
                                              <>
                                                {" | "}
                                                {new Date().getFullYear() -
                                                  new Date(
                                                    profile.PartnerDateOfBirth
                                                  ).getFullYear()}
                                                {profile?.PartnerGender ===
                                                "Male"
                                                  ? "M"
                                                  : profile?.PartnerGender ===
                                                    "Female"
                                                  ? "F"
                                                  : ""}
                                              </>
                                            )}
                                          </Typography>

                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              flexWrap: "wrap",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color:
                                                  "rgba(255, 255, 255, 0.7)",
                                                fontSize: {
                                                  xs: "0.75rem",
                                                  sm: "0.875rem",
                                                },
                                              }}
                                            >
                                              {profile.Location}
                                            </Typography>
                                            <Typography
                                              component="span"
                                              sx={{
                                                color:
                                                  "rgba(255, 255, 255, 0.5)",
                                                fontSize: {
                                                  xs: "0.75rem",
                                                  sm: "0.875rem",
                                                },
                                              }}
                                            >
                                              • {profile.Distance}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            gap: 0.5,
                                          }}
                                        >
                                          <IconButton sx={{ color: "white" }}>
                                            {currentMatch}
                                          </IconButton>
                                          <IconButton
                                            sx={{ color: "#f50057" }}
                                            onClick={() =>
                                              handleReportModalToggle(profile)
                                            }
                                          >
                                            <Flag />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <Grid item xs={12}>
                                  <Typography
                                    align="center"
                                    sx={{ color: "white", my: 8 }}
                                  >
                                    {currentMatch === "Search"
                                      ? "No search results found"
                                      : currentMatch
                                      ? `No ${currentMatch.toLowerCase()} profiles available`
                                      : "No profiles available"}
                                  </Typography>
                                </Grid>
                              )}
                            </Box>
                          </>
                        )}
                      </>
                    )}
                  </Card>
                </Box>
              )}
            </>
          </Container>
        </Box>
      ) : (
        <Container maxWidth="xl" sx={{ mt: 12, mb: 8 }}>
          <Button
            onClick={() => router.back()}
            startIcon={<ArrowLeft />}
            sx={{
              textTransform: "none",
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              minWidth: "auto",
              fontSize: "16px",
              fontWeight: "medium",
              "&:hover": {
                color: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            Back
          </Button>
          <Box sx={{ color: "white", mt: 2, mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                background: "linear-gradient(45deg, #fff 30%, #f50057 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                position: "relative",
                animation: "glow 2s ease-in-out infinite",
                "@keyframes glow": {
                  "0%": {
                    textShadow: "0 0 10px rgba(245, 0, 87, 0.5)",
                  },
                  "50%": {
                    textShadow:
                      "0 0 20px rgba(245, 0, 87, 0.8), 0 0 30px rgba(245, 0, 87, 0.4)",
                  },
                  "100%": {
                    textShadow: "0 0 10px rgba(245, 0, 87, 0.5)",
                  },
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "50px",
                  height: "3px",
                  background: "#f50057",
                  transition: "width 0.3s ease",
                },
                "&:hover::after": {
                  width: "100px",
                },
              }}
            >
              Matches
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={2}>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: "#1E1E1E",
                  borderRadius: 2,
                  position: { md: "sticky" },
                  top: 80,
                  border: "0.0625rem solid rgb(55, 58, 64)",
                  height: "fit-content",
                }}
              >
                <List sx={{ p: 1 }}>
                  {sidebarItems.map((item, index) => (
                    <ListItem
                      key={index}
                      onClick={() => setCurrentMatch(item.label)}
                      sx={{
                        borderTopRightRadius: 25,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        cursor: "pointer",
                        mb: 0.5,
                        p: 1,
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        bgcolor:
                          currentMatch === item.label
                            ? "#f50057"
                            : "transparent",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                          transition: "left 0.5s ease",
                        },
                        "&:hover::before": {
                          left: "100%",
                        },
                        "&:hover": {
                          bgcolor:
                            currentMatch === item.label
                              ? "#f50057"
                              : "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        sx={{
                          m: 0,
                          "& .MuiTypography-root": {
                            color:
                              currentMatch === item.label
                                ? "white"
                                : "rgba(255,255,255,0.7)",
                            fontSize: "1.1rem",
                            fontWeight:
                              currentMatch === item.label ? "500" : "400",
                            transition: "all 0.3s ease",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={10}>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: "#1E1E1E",
                  borderRadius: 2,
                  p: 3,
                  border: "0.0625rem solid rgb(55, 58, 64)",
                }}
              >
                <Typography
                  variant="h4"
                  color="white"
                  sx={{ mb: 3, fontWeight: "bold" }}
                >
                  {currentMatch}
                </Typography>

                {/* Search Section */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                      <TextField
                        fullWidth
                        placeholder="Search members..."
                        value={search ?? ""}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setErrors((prev: any) => ({ ...prev, search: "" }));
                        }}
                        error={Boolean(errors?.search)}
                        helperText={errors?.search}
                        InputProps={{
                          startAdornment: (
                            <SearchIcon
                              sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 1 }}
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            bgcolor: "#2D2D2D",
                            "& fieldset": {
                              borderColor: "rgba(255, 255, 255, 0.23)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255, 255, 255, 0.5)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#f50057",
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            color: "#f44336",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {currentMatch === "Search" ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={12} lg={12} md={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={onlyPhotos === 1}
                            onChange={handlePhotosChange}
                            sx={{
                              color: "#aaa",
                              "&.Mui-checked": {
                                color: "#f50057",
                              },
                            }}
                          />
                        }
                        label="Only profiles with Photos"
                        sx={{ color: "#fff" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12} lg={12} md={12}>
                      <Typography
                        sx={{
                          color: "white",
                          marginTop: "15px",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                        }}
                      >
                        City, State
                      </Typography>
                      <Autocomplete
                        value={formData?.city ?? ""}
                        id="autocomplete-filled"
                        open={openCity}
                        clearOnBlur
                        onOpen={() => setOpenCity(true)}
                        onClose={() => setOpenCity(false)}
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.id === value.id
                        }
                        getOptionLabel={(option: any) => option.City}
                        options={cityOption.map((city: any) => ({
                          ...city,
                          key: city.id,
                        }))}
                        loading={cityLoading}
                        inputValue={cityInput}
                        onInputChange={(event: any, newInputValue: any) => {
                          if (
                            event?.type === "change" ||
                            event?.type === "click"
                          )
                            setCityInput(newInputValue);
                        }}
                        onChange={(event: any, newValue: any) => {
                          if (newValue?.City)
                            setFormData({
                              ...formData,
                              city: newValue?.City,
                            });
                        }}
                        renderInput={(params: any) => (
                          <TextField
                            {...params}
                            error={!!errors.city}
                            helperText={errors.city}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {cityLoading ? (
                                    <CircularProgress
                                      sx={{ color: "#f50057" }}
                                      size={15}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                color: "white",
                                bgcolor: "#2D2D2D",
                                "& fieldset": {
                                  borderColor: "rgba(255, 255, 255, 0.23)",
                                },
                                "&:hover fieldset": {
                                  borderColor: "rgba(255, 255, 255, 0.5)",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#f50057",
                                },
                              },
                              "& .MuiFormHelperText-root": {
                                color: "#f44336",
                              },
                              mb: 2,
                            }}
                          />
                        )}
                        sx={{
                          "& .MuiAutocomplete-popupIndicator": {
                            color: "#f50057",
                            "&:hover": {
                              color: "#ff4081",
                            },
                          },
                          "& .MuiAutocomplete-option": {
                            color: "white",
                            backgroundColor: "#2D2D2D",
                            transition: "background-color 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#424242",
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12} lg={12} md={12}>
                      {/* Parent container for the two sections */}
                      <Box
                        display="flex"
                        justifyContent="center"
                        gap="20px"
                        sx={{
                          backgroundColor: "#121212",
                          padding: "20px",
                          borderRadius: "10px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        {/* Age Range Section */}
                        <Box
                          flex="1"
                          display="flex"
                          flexDirection="column"
                          gap="20px"
                          sx={{
                            backgroundColor: "#1e1e1e",
                            padding: "20px",
                            textAlign: "center",
                            borderRadius: "10px",
                            border: "1px solid #333",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.8)",
                            },
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: "#fff", marginBottom: "10px" }}
                          >
                            Age Range
                          </Typography>
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="10px"
                          >
                            <Typography sx={{ color: "#fff" }}>
                              Her age between
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              name="min"
                              value={herAgeRange.min ?? ""}
                              onChange={handleHerAgeChange}
                              variant="outlined"
                              sx={{
                                width: "80px",
                                backgroundColor: "#2a2a2a",
                                input: { color: "#fff" },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#555",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#888",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#f50057",
                                  },
                              }}
                            />
                            <Typography sx={{ color: "#fff" }}>and</Typography>
                            <TextField
                              size="small"
                              type="number"
                              name="max"
                              value={herAgeRange.max ?? ""}
                              onChange={handleHerAgeChange}
                              variant="outlined"
                              sx={{
                                width: "80px",
                                backgroundColor: "#2a2a2a",
                                input: { color: "#fff" },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#555",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#888",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#f50057",
                                  },
                              }}
                            />
                          </Box>
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="10px"
                          >
                            <Typography sx={{ color: "#fff" }}>
                              His age between
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              name="min"
                              value={hisAgeRange.min ?? ""}
                              onChange={handleHisAgeChange}
                              variant="outlined"
                              sx={{
                                width: "80px",
                                backgroundColor: "#2a2a2a",
                                input: { color: "#fff" },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#555",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#888",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#f50057",
                                  },
                              }}
                            />
                            <Typography sx={{ color: "#fff" }}>and</Typography>
                            <TextField
                              size="small"
                              type="number"
                              name="max"
                              value={hisAgeRange.max ?? ""}
                              onChange={handleHisAgeChange}
                              variant="outlined"
                              sx={{
                                width: "80px",
                                backgroundColor: "#2a2a2a",
                                input: { color: "#fff" },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#555",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#888",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#f50057",
                                  },
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Orientation Section */}
                        <Box
                          flex="1"
                          display="flex"
                          flexDirection="column"
                          textAlign="center"
                          gap="20px"
                          sx={{
                            backgroundColor: "#1e1e1e",
                            padding: "20px",
                            borderRadius: "10px",
                            border: "1px solid #333",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.8)",
                            },
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: "#fff", marginBottom: "10px" }}
                          >
                            Orientation
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel
                              id="his-orientation-label"
                              sx={{ color: "#aaa" }}
                            >
                              His Orientation
                            </InputLabel>
                            <Select
                              labelId="his-orientation-label"
                              id="his-orientation"
                              value={hisOrientation ?? ""}
                              onChange={handleHisOrientationChange}
                              sx={{
                                color: "#fff",
                                backgroundColor: "#2a2a2a",
                                ".MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#555",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#888",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#f50057",
                                  },
                              }}
                            >
                              <MenuItem value="Straight">Straight</MenuItem>
                              <MenuItem value="Bi">Bi</MenuItem>
                              <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                              <MenuItem value="Open minded">
                                Open minded
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel
                              id="her-orientation-label"
                              sx={{ color: "#aaa" }}
                            >
                              Her Orientation
                            </InputLabel>
                            <Select
                              labelId="her-orientation-label"
                              id="her-orientation"
                              value={herOrientation ?? ""}
                              onChange={handleHerOrientationChange}
                              sx={{
                                color: "#fff",
                                backgroundColor: "#2a2a2a",
                                ".MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#555",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#888",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#f50057",
                                  },
                              }}
                            >
                              <MenuItem value="Straight">Straight</MenuItem>
                              <MenuItem value="Bi">Bi</MenuItem>
                              <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                              <MenuItem value="Open minded">
                                Open minded
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    </Grid>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        paddingTop: "30px",
                      }}
                    >
                      <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        sx={{
                          textTransform: "none",
                          backgroundColor: "#f50057",
                          fontSize: "16px",
                          py: 1.5,
                          fontWeight: "bold",
                          marginLeft: "10px", // Space between input and button
                          "&:hover": {
                            backgroundColor: "#c51162",
                          },
                        }}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>
                ) : (
                  <Grid container spacing={3}>
                    {profileLoading ? (
                      // Loader state
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                          }}
                        >
                          <CircularProgress color="secondary" />
                        </Box>
                      </Grid>
                    ) : (
                      <>
                        {/* Cards */}
                        {profiles?.map((profile: any, index: number) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Fade in timeout={500 + index * 100}>
                              <Card
                                sx={{
                                  bgcolor: "rgba(45, 45, 45, 0.8)",
                                  backdropFilter: "blur(10px)",
                                  borderRadius: 3,
                                  display: "flex",
                                  flexDirection: "column",
                                  overflow: "hidden",
                                  transition: "all 0.3s ease",
                                  position: "relative",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                  cursor: "pointer",
                                  "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
                                    "& .media-overlay": { opacity: 1 },
                                  },
                                }}
                              >
                                {/* Image */}
                                <Box
                                  sx={{
                                    position: "relative",
                                    width: "100%",
                                    height: "300px",
                                    flexShrink: 0,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setShowDetail(true);
                                    setSelectedUserId(profile?.Id);
                                  }}
                                >
                                  <img
                                    src={profile?.Avatar}
                                    alt={profile?.Username}
                                    loading="lazy"
                                    style={{
                                      objectFit: "cover",
                                      cursor: "pointer",
                                      width: "100%",
                                      height: "300px",
                                    }}
                                  />
                                </Box>

                                {/* Card Content */}
                                <CardContent sx={{ p: 2 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          color: "#f50057",
                                          fontWeight: "bold",
                                          fontSize: {
                                            xs: "1rem",
                                            sm: "1.25rem",
                                          },
                                        }}
                                      >
                                        {profile?.Username + " "}
                                        <Verified
                                          sx={{
                                            color: "#f50057",
                                            fontSize: 16,
                                          }}
                                        />
                                      </Typography>
                                    </Stack>
                                    <IconButton
                                      onClick={() =>
                                        handleReportModalToggle(profile)
                                      }
                                      sx={{ color: "red" }}
                                    >
                                      <Flag />
                                    </IconButton>
                                  </Box>

                                  <Box sx={{ mb: 2 }}>
                                    {profile?.DateOfBirth && (
                                      <Chip
                                        size="small"
                                        label={`${
                                          new Date().getFullYear() -
                                          new Date(
                                            profile.DateOfBirth
                                          ).getFullYear()
                                        }${
                                          profile?.Gender === "Male" ? "M" : "F"
                                        }`}
                                        sx={{
                                          bgcolor: "#f50057",
                                          color: "white",
                                          mr: 1,
                                          fontSize: "0.75rem",
                                        }}
                                      />
                                    )}
                                    {profile?.PartnerDateOfBirth && (
                                      <Chip
                                        size="small"
                                        label={`${
                                          new Date().getFullYear() -
                                          new Date(
                                            profile.PartnerDateOfBirth
                                          ).getFullYear()
                                        }${
                                          profile?.PartnerGender === "Male"
                                            ? "M"
                                            : "F"
                                        }`}
                                        sx={{
                                          bgcolor: "#f50057",
                                          color: "white",
                                          fontSize: "0.75rem",
                                        }}
                                      />
                                    )}
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <LocationOnIcon
                                      fontSize="small"
                                      sx={{ color: "#f50057" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "rgba(255, 255, 255, 0.7)",
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      {profile?.Location?.replace(", USA", "")}{" "}
                                      • {profile?.Distance}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Fade>
                          </Grid>
                        ))}

                        {/* Empty state at the end */}
                        {!profileLoading && profiles?.length === 0 && (
                          <Grid item xs={12}>
                            <Typography
                              align="center"
                              sx={{ color: "white", my: 2 }}
                            >
                              {currentMatch === "Search"
                                ? "No search results found"
                                : currentMatch
                                ? `No ${currentMatch.toLowerCase()} profiles available`
                                : "No profiles available"}
                            </Typography>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      )}
      {/* Report Modal */}
      <Modal
        open={isReportModalOpen}
        onClose={() => handleReportModalToggle("null")}
        closeAfterTransition
      >
        <Fade in={isReportModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "#1E1E1E",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" color="white" gutterBottom>
              Report or Block User
            </Typography>
            <FormControlLabel
              sx={{
                color: "white",
                "& .MuiCheckbox-root": {
                  color: "#9c27b0",
                },
                "& .MuiCheckbox-root.Mui-checked": {
                  color: "#9c27b0",
                },
              }}
              control={
                <Checkbox
                  checked={reportOptions.reportImage}
                  onChange={handleCheckboxChange}
                  name="reportImage"
                />
              }
              label="Inappropriate Image"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.reportUser}
                  onChange={handleCheckboxChange}
                  name="reportUser"
                  sx={{
                    color: "#f50057",
                    "&.Mui-checked": { color: "#f50057" },
                  }}
                />
              }
              label="Report User"
              sx={{ color: "white", display: "block", mb: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.blockUser}
                  onChange={handleCheckboxChange}
                  name="blockUser"
                  sx={{
                    color: "#f50057",
                    "&.Mui-checked": { color: "#f50057" },
                  }}
                />
              }
              label="Block User"
              sx={{ color: "white", display: "block", mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                onClick={() => handleReportModalToggle("null")}
                sx={{
                  bgcolor: "#333",
                  color: "white",
                  "&:hover": { bgcolor: "#444" },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportSubmit}
                sx={{
                  bgcolor: "#f50057",
                  color: "white",
                  "&:hover": { bgcolor: "#c51162" },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>
          </Box>
        </Fade>
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
