"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Stack,
  Container,
  alpha,
  useMediaQuery,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Drawer,
  IconButton,
  Divider,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CalendarMonth, Add, Search, ExpandMore } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";
import Loader from "@/commonPage/Loader";
import EventDesktopList from "@/components/EventDesktopList";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import { useGeolocationWithAPI } from "@/components/useGeolocationWithAPI";

export default function CalendarView() {
  const router = useRouter();
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<any>();

  const [loading, setLoading] = useState(true);
  const [sortedEvents, setSortedEvents] = useState<any[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOption, setCityOption] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState("upcoming");
  const [searchType, setSearchType] = useState<"none" | "city" | "text">(
    "none"
  );
  const [searchText, setSearchText] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [advertiserDataLat, setAdvertiserDataLat] = useState<number | null>(
    null
  );
  const [advertiserDataLng, setAdvertiserDataLng] = useState<number | null>(
    null
  );
  const [eventsWithCoords, setEventsWithCoords] = useState<any[]>([]);
  const [openFilter, setOpenFilter] = useState(false);

  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationDialogMessage, setLocationDialogMessage] = useState("");

  const [isNationwideFallback, setIsNationwideFallback] = useState(false);

  const toggleFilter = (state: boolean) => () => {
    setOpenFilter(state);
  };

  useGeolocationWithAPI(profileId);

  useEffect(() => {
    if (
      latitude !== null ||
      longitude !== null ||
      advertiserDataLat !== null ||
      advertiserDataLng !== null
    )
      return;

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          console.warn("Initial geolocation failed:", err);
          setLocationDialogMessage(
            "Would you like to enable location so we can show events near you?"
          );
          setLocationDialogOpen(true);
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 60000 }
      );
    } else {
      setLocationDialogMessage(
        "Would you like to enable location so we can show events near you?"
      );
      setLocationDialogOpen(true);
    }
  }, []);

  const getDistanceInMiles = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!openCity) {
      setCityOption([]);
      return;
    }
    if (cityInput === "") return;

    const fetchData = async () => {
      setCityLoading(true);
      try {
        const response = await fetch(`/api/user/city?city=${cityInput}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { cities } = await response.json();
        const uniqueCities = cities.filter(
          (city: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.City === city.City)
        );

        setCityOption(uniqueCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setCityLoading(false);
      }
    };

    fetchData();
  }, [cityInput, openCity]);

  useEffect(() => {
    setSortedEvents(events);
  }, [events]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("loginInfo");
      if (token) {
        try {
          const decodeToken = jwtDecode<any>(token);
          setProfileId(decodeToken?.profileId || null);
        } catch (e) {
          console.warn("Failed to decode token", e);
          setProfileId(null);
        }
      } else {
        router.push("/login");
      }
    }
  }, []);

  useEffect(() => {
    if (profileId) {
      handleGetEvents(profileId);
      fetchData(profileId);
    } else {
      handleGetEvents("a0cf00e0-6245-4d03-9d07-48d6626f4f57");
    }
  }, [profileId]);

  const handleGetEvents = async (userid: any) => {
    try {
      const response = await fetch("/api/user/events?id=" + userid, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const eventsData = await response.json();
      const fetchedEvents = eventsData?.events || [];

      const enrichedEvents = await Promise.all(
        fetchedEvents.map(async (event: any) => {
          if (event.Venue) {
            const coords = await getLatLngFromAddress(event.Venue);
            return {
              ...event,
              latitude: coords?.latitude || null,
              longitude: coords?.longitude || null,
            };
          }
          return { ...event, latitude: null, longitude: null };
        })
      );

      setEvents(fetchedEvents);
      setEventsWithCoords(enrichedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const getLatLngFromAddress = async (address: string) => {
    try {
      const apiKey = "AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0";

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  const fetchData = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const { user: advertiserData } = await response.json();
      if (advertiserData) {
        const coords = await getLatLngFromAddress(advertiserData?.Location);
        if (coords) {
          setAdvertiserDataLat(coords.latitude);
          setAdvertiserDataLng(coords.longitude);
        }
      }
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    if (!eventsWithCoords.length) return;

    let referenceLat: number | null = null;
    let referenceLng: number | null = null;

    if (latitude !== null && longitude !== null) {
      referenceLat = latitude;
      referenceLng = longitude;
    } else if (advertiserDataLat !== null && advertiserDataLng !== null) {
      referenceLat = advertiserDataLat;
      referenceLng = advertiserDataLng;
    }

    if (referenceLat === null || referenceLng === null) {
      // No location → show all events
      setSortedEvents(eventsWithCoords);
      setIsNationwideFallback(false);
      return;
    }

    const filteredEvents = eventsWithCoords.filter((event: any) => {
      if (event.latitude && event.longitude) {
        const distance = getDistanceInMiles(
          referenceLat as number,
          referenceLng as number,
          event.latitude,
          event.longitude
        );
        return distance <= 200;
      }
      return false;
    });

    if (filteredEvents.length > 0) {
      setSortedEvents(filteredEvents);
      setIsNationwideFallback(false);
    } else {
      // Fallback to nationwide if no local events
      setSortedEvents(eventsWithCoords);
      setIsNationwideFallback(true);
    }
  }, [
    latitude,
    longitude,
    advertiserDataLat,
    advertiserDataLng,
    eventsWithCoords,
  ]);

  useEffect(() => {
    const shouldAskForLocation = () => {
      return (
        latitude === null &&
        longitude === null &&
        advertiserDataLat === null &&
        advertiserDataLng === null
      );
    };

    if (!shouldAskForLocation()) return;

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      const permissions = (navigator as any).permissions;
      if (permissions && permissions.query) {
        permissions
          .query({ name: "geolocation" })
          .then((status: any) => {
            if (status.state === "granted") {
              requestCurrentLocation();
            } else if (status.state === "prompt") {
              setLocationDialogMessage(
                "Would you like to enable location so we can show events near you?"
              );
              setLocationDialogOpen(true);
            } else if (status.state === "denied") {
              setLocationDialogMessage(
                "Your browser has denied location access. Would you like to try enabling it now?"
              );
              setLocationDialogOpen(true);
            }
          })
          .catch(() => {
            setLocationDialogMessage(
              "Would you like to enable location so we can show events near you?"
            );
            setLocationDialogOpen(true);
          });
      } else {
        setLocationDialogMessage(
          "Would you like to enable location so we can show events near you?"
        );
        setLocationDialogOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserDataLat, advertiserDataLng, latitude, longitude]);

  const requestCurrentLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator))
      return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationDialogOpen(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationDialogOpen(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const now = new Date();
  const upcomingEvents = [...sortedEvents]
    .filter((event: any) => new Date(event.StartTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime()
    );

  const pastEvents = [...sortedEvents]
    .filter((event: any) => new Date(event.StartTime) < now)
    .sort(
      (a, b) =>
        new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime()
    );

  const clearFilters = () => {
    setCityInput("");
    setSearchText("");
    setSearchType("none");
    setEventsWithCoords([...eventsWithCoords]);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* <Dialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
      >
        <DialogTitle>Enable Location?</DialogTitle>
        <DialogContent>
          <Typography>{locationDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLocationDialogOpen(false);
            }}
          >
            No thanks
          </Button>
          <Button
            onClick={() => {
              requestCurrentLocation();
            }}
            variant="contained"
          >
            Enable Location
          </Button>
        </DialogActions>
      </Dialog> */}

      <Box
        sx={{
          bgcolor: "#0A0A0A",
          mt: 2,
          color: "white",
          background: "linear-gradient(to bottom, #0A0A0A, #1A1A1A)",
        }}
      >
        <Header />
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            pb: { xs: 8 },
          }}
        >
          {isMobile ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  px: 2,
                }}
              >
                <Typography
                  variant="h5"
                  color="white"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #e91e63, #9c27b0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  Events
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={toggleFilter(true)}
                  sx={{
                    backgroundColor: "#f50057",
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                >
                  Filters
                </Button>
              </Box>

              <Drawer
                anchor="right"
                open={openFilter}
                onClose={toggleFilter(false)}
                PaperProps={{
                  sx: {
                    bgcolor: "#1a1a1a",
                    color: "white",
                    maxHeight: "100vh",
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  {/* Header with close button */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Filters & Actions
                    </Typography>
                    <IconButton
                      onClick={toggleFilter(false)}
                      sx={{ color: "white" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  {/* Create + Calendar Buttons */}
                  <Stack direction="row" spacing={2} mb={2}>
                    <Button
                      onClick={() => {
                        const token = localStorage.getItem("loginInfo");
                        if (token) {
                          try {
                            const decodeToken = jwtDecode<any>(token);
                            if (decodeToken?.membership === 0) {
                              router.push("/membership");
                            } else {
                              router.push("/events/create");
                            }
                          } catch (e) {
                            router.push("/events/create");
                          }
                        } else {
                          router.push("/login");
                        }
                        setOpenFilter(false);
                      }}
                      variant="contained"
                      startIcon={<Add />}
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        backgroundColor: "#f50057",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#c51162" },
                      }}
                    >
                      Create
                    </Button>

                    <Button
                      onClick={() => router.push("/events/calendar")}
                      variant="contained"
                      endIcon={<CalendarMonth />}
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        backgroundColor: "#f50057",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#c51162" },
                      }}
                    >
                      Calendar
                    </Button>
                  </Stack>

                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2 }} />

                  {/* City Autocomplete */}
                  <Autocomplete
                    id="location-autocomplete"
                    open={openCity}
                    onOpen={() => setOpenCity(true)}
                    onClose={() => setOpenCity(false)}
                    isOptionEqualToValue={(option, value) =>
                      option.City === value.City
                    }
                    getOptionLabel={(option) => option.City || ""}
                    options={cityOption}
                    loading={cityLoading}
                    inputValue={cityInput}
                    noOptionsText={
                      <Typography sx={{ color: "white" }}>
                        No options
                      </Typography>
                    }
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === "change" || event?.type === "click") {
                        const normalized = newInputValue
                          .replace(/\s+/g, " ")
                          .trim();
                        setCityInput(normalized);
                      }
                    }}
                    onChange={(event, newValue) => {
                      if (newValue?.City) {
                        const normalizedCity = newValue.City.replace(
                          /\s+/g,
                          " "
                        ).trim();
                        const filtered = events.filter((event: any) =>
                          event.Venue?.toLowerCase().includes(
                            normalizedCity.toLowerCase()
                          )
                        );
                        setSortedEvents(filtered);
                        setSearchType("city");
                      } else {
                        clearFilters();
                      }
                      setOpenFilter(false);
                    }}
                    ListboxProps={{
                      sx: {
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        "& .MuiAutocomplete-option": {
                          "&:hover": {
                            backgroundColor: "rgba(245,0,87,0.08)",
                          },
                          '&[aria-selected="true"]': {
                            backgroundColor: "rgba(245,0,87,0.16)",
                          },
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search by state"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {cityLoading && (
                                <CircularProgress color="inherit" size={15} />
                              )}

                              {cityInput && (
                                <IconButton
                                  size="small"
                                  onClick={() => clearFilters()}
                                  sx={{ color: "white" }}
                                >
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              )}

                              {params.InputProps.endAdornment}
                            </>
                          ),
                          sx: {
                            color: "white",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.23)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.4)",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#f50057",
                            },
                          },
                        }}
                      />
                    )}
                    sx={{ mb: 2 }}
                  />

                  {/* Search Input */}
                  <TextField
                    placeholder="Search events..."
                    variant="outlined"
                    fullWidth
                    value={searchText}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const normalizedValue = rawValue
                        .replace(/\s+/g, " ")
                        .trim()
                        .toLowerCase();

                      setSearchText(rawValue);

                      if (normalizedValue === "") {
                        clearFilters();
                      } else {
                        const filtered = events.filter(
                          (event: any) =>
                            event.Name?.toLowerCase().includes(
                              normalizedValue
                            ) ||
                            event.Venue?.toLowerCase().includes(
                              normalizedValue
                            ) ||
                            event.Description?.toLowerCase().includes(
                              normalizedValue
                            )
                        );
                        setSortedEvents(filtered);
                        setSearchType("text");
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "#f50057" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {searchText && (
                            <IconButton
                              size="small"
                              onClick={() => clearFilters()}
                              sx={{ color: "white" }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      input: { color: "white" },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.4)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#f50057",
                      },
                    }}
                  />

                  {/* Tabs */}
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => {
                      setTabValue(newValue);
                      window.scroll(0, 0);
                      setOpenFilter(false);
                    }}
                    variant="fullWidth"
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "#1a1a1a",
                      minHeight: "40px",
                      "& .MuiTabs-indicator": {
                        display: "none",
                      },
                      "& .MuiTab-root": {
                        color: "white",
                        textTransform: "none",
                        fontWeight: "bold",
                        borderRadius: 2,
                        mx: 0.5,
                        transition: "all 0.2s ease-in-out",
                        bgcolor: "#2a2a2a",
                        minHeight: "40px",
                        py: 0.5,
                        px: 2,
                        "&:hover": {
                          bgcolor: "rgba(245,0,87,0.2)",
                        },
                      },
                      "& .Mui-selected": {
                        color: "white !important",
                        bgcolor: "#f50057 !important",
                      },
                    }}
                  >
                    <Tab value="upcoming" label="Upcoming" />
                    <Tab value="past" label="Past" />
                  </Tabs>

                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />

                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Notes:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: alpha("#fff", 0.7), mb: 1 }}
                    >
                      • If you enable your location, events within 200 miles
                      will be shown.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: alpha("#fff", 0.7), mb: 1 }}
                    >
                      • If location is disabled, events are shown based on your
                      saved profile location.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: alpha("#fff", 0.7), mb: 1 }}
                    >
                      • You can search events by state or event
                      name/description.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: alpha("#fff", 0.7) }}
                    >
                      • Use the tabs to switch between Upcoming and Past events.
                    </Typography>
                  </Box>
                </Box>
              </Drawer>

              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                {isNationwideFallback && (
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "center",
                      color: "#f50057",
                      fontWeight: "bold",
                      mt: 2,
                    }}
                  >
                    Showing nationwide events
                  </Typography>
                )}

                {/* Events List */}
                <Box
                  sx={{
                    maxHeight: { xs: "unset", sm: "60vh" }, // no limit on mobile
                    overflowY: { xs: "visible", sm: "auto" },
                    px: { xs: 1, sm: 2 },
                    py: 1,
                  }}
                >
                  {(tabValue === "upcoming" ? upcomingEvents : pastEvents)
                    .length > 0 ? (
                    <Stack spacing={2}>
                      {(tabValue === "upcoming"
                        ? upcomingEvents
                        : pastEvents
                      ).map((post: any) => {
                        const eventDate = new Date(post.StartTime);
                        const isCurrentMonth =
                          eventDate.getMonth() === currentDate.getMonth() &&
                          eventDate.getFullYear() === currentDate.getFullYear();

                        return (
                          <Card
                            key={post.Id}
                            data-event-id={post.Id}
                            ref={isCurrentMonth ? currentMonthRef : null}
                            onClick={() =>
                              router.push("/events/detail/" + post?.Id)
                            }
                            sx={{
                              borderRadius: 3,
                              overflow: "hidden",
                              bgcolor: "#1e1e1e",
                              color: "white",
                              border: isCurrentMonth
                                ? `2px solid ${alpha("#f50057", 0.8)}`
                                : "1px solid rgba(255,255,255,0.1)",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": { transform: "scale(1.01)" },
                            }}
                          >
                            {/* Image */}
                            <Box sx={{ position: "relative" }}>
                              <img
                                src={post?.CoverImageUrl}
                                alt="Event Cover"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  maxHeight: "200px",
                                  objectFit: "cover",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/events/detail/" + post?.Id);
                                }}
                              />
                            </Box>

                            {/* Content */}
                            <CardContent
                              sx={{
                                p: { xs: 2, sm: 3 },
                                bgcolor: "rgb(245, 0, 87)",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontSize: { xs: "1rem", sm: "1.1rem" },
                                  fontWeight: "bold",
                                  mb: 1,
                                  lineHeight: 1.3,
                                }}
                              >
                                {post.Name}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{ color: "rgba(255,255,255,0.8)" }}
                              >
                                <strong>Starts:</strong>{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }).format(eventDate)}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  ) : (
                    // Empty State
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 4, sm: 6 },
                        bgcolor: "#121212",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 4,
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: alpha("#f50057", 0.1),
                          p: 2,
                          borderRadius: "50%",
                          mb: 3,
                        }}
                      >
                        <Search
                          sx={{ width: 40, height: 40, color: "#f50057" }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "white",
                          mb: 1,
                          textAlign: "center",
                        }}
                      >
                        {searchType === "text" &&
                          "No events found matching your search."}
                        {searchType === "city" &&
                          "No events found in this state/city."}
                        {searchType === "none" && "No events available."}
                      </Typography>

                      {/* Actions */}
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        mt={3}
                        width="100%"
                        maxWidth={300}
                      >
                        {searchType !== "none" && (
                          <Button
                            onClick={clearFilters}
                            fullWidth
                            variant="outlined"
                            sx={{
                              color: "#f50057",
                              borderColor: "#f50057",
                              "&:hover": {
                                backgroundColor: "rgba(245, 0, 87, 0.1)",
                                borderColor: "#f50057",
                              },
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                        {searchType === "none" &&
                          latitude === null &&
                          advertiserDataLat === null && (
                            <Button
                              onClick={() => setLocationDialogOpen(true)}
                              fullWidth
                              variant="contained"
                              sx={{
                                bgcolor: "#f50057",
                                "&:hover": { bgcolor: "#c51162" },
                              }}
                            >
                              Enable Location
                            </Button>
                          )}
                      </Stack>
                    </Paper>
                  )}
                </Box>
              </CardContent>
            </>
          ) : (
            <>
              <EventDesktopList />
            </>
          )}
        </Container>
        <Footer />
      </Box>
    </>
  );
}
