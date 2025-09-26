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
} from "@mui/material";
import { CalendarMonth, Add, Search, ExpandMore } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { jwtDecode } from "jwt-decode";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
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
  const [events, setEvents] = useState<any>([]);
  const [profileId, setProfileId] = useState<any>();

  const [loading, setLoading] = useState(true);
  const [sortedEvents, setSortedEvents] = useState<any[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOption, setCityOption] = useState<any[]>([]);
  const [searchStatus, setSearchStatus] = useState(false);
  const [tabValue, setTabValue] = useState("upcoming");
  const [searchType, setSearchType] = useState<"none" | "city" | "text">(
    "none"
  );
  const [searchText, setSearchText] = useState("");
  const [expanded, setExpanded] = useState(false);
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

  const toggleFilter = (state: boolean) => () => {
    setOpenFilter(state);
  };

  useGeolocationWithAPI(profileId);

  const getDistanceInMiles = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 3958.8; // Earth radius in miles
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
        const decodeToken = jwtDecode<any>(token);
        setProfileId(decodeToken?.profileId);
      } else {
        router.push("/login");
      }
    }
  }, []);

  useEffect(() => {
    if (profileId) {
      handleGetEvents(profileId);
    } else {
      handleGetEvents("a0cf00e0-6245-4d03-9d07-48d6626f4f57");
    }
  }, []);

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
        throw new Error(`Geocoding failed: ${data.status}`);
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
    if (profileId) {
      handleGetEvents(profileId);
      fetchData(profileId);
    }
  }, [profileId]);

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
      setSortedEvents(eventsWithCoords);
      return;
    }

    const filteredEvents = eventsWithCoords.filter((event: any) => {
      if (event.latitude && event.longitude) {
        const distance = getDistanceInMiles(
          referenceLat,
          referenceLng,
          event.latitude,
          event.longitude
        );
        return distance <= 200;
      }
      return false;
    });

    setSortedEvents(filteredEvents);
  }, [
    latitude,
    longitude,
    advertiserDataLat,
    advertiserDataLng,
    eventsWithCoords,
  ]);

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
    setSearchStatus(false);
    setSearchType("none");

    // Reapply location-based filter automatically
    if (latitude !== null || advertiserDataLat !== null) {
      // let the location useEffect run again
      setEventsWithCoords([...eventsWithCoords]);
    } else {
      setSortedEvents(events);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
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
            pb: { xs: 8, sm: 9, md: 10 },
            px: { xs: 1, sm: 2, md: 3 },
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
                    // borderTopLeftRadius: "16px",
                    // borderTopRightRadius: "16px",
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
                          const decodeToken = jwtDecode<any>(token);
                          if (decodeToken?.membership === 0) {
                            router.push("/membership");
                          } else {
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
                        setSearchStatus(true);
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
                              {/* ✅ Show loader */}
                              {cityLoading && (
                                <CircularProgress color="inherit" size={15} />
                              )}

                              {/* ✅ Clear button */}
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
                        setSearchStatus(true);
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
                          {/* ✅ Clear button */}
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
                {/* Events List */}
                <Box
                  sx={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    scrollBehavior: "smooth",
                    overflowX: "hidden",
                  }}
                >
                  {(tabValue === "upcoming" ? upcomingEvents : pastEvents)
                    .length > 0 ? (
                    (tabValue === "upcoming" ? upcomingEvents : pastEvents).map(
                      (post: any) => {
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
                              borderRadius: 2,
                              my: 2,
                              backgroundColor: "#f50057",
                              border: isCurrentMonth
                                ? `2px solid ${alpha("#f50057", 0.8)}`
                                : "none",
                              transition: "transform 0.2s ease-in-out",
                              "&:hover": {
                                transform: "scale(1.02)",
                              },
                            }}
                          >
                            <Box sx={{ backgroundColor: "#2d2d2d", p: 1 }}>
                              <img
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/events/detail/" + post?.Id);
                                }}
                                src={post?.CoverImageUrl}
                                alt="Post Image"
                                style={{
                                  width: "100%",
                                  // height: "400px",
                                  // objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>

                            <CardContent
                              sx={{
                                background: "#f50057",
                                color: "white",
                                textAlign: "center",
                                px: 2,
                                pb: 2,
                              }}
                            >
                              <Typography variant="h6">{post.Name}</Typography>
                              <Typography
                                variant="body2"
                                sx={{ mt: 1, color: "white" }}
                              >
                                <strong>Start at:</strong>{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  hour12: true,
                                }).format(new Date(post.StartTime))}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      }
                    )
                  ) : (
                    <Paper
                      elevation={24}
                      sx={{
                        p: 6,
                        bgcolor: "#121212",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 4,
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
                          sx={{ width: 48, height: 48, color: "#f50057" }}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        />
                      </Box>

                      {/* Message */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: "white",
                          mb: 1,
                          textAlign: "center",
                          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        {searchType === "text" &&
                          "No events found matching your search."}
                        {searchType === "city" &&
                          "No events found in this state/city."}
                        {searchType === "none" &&
                          (tabValue === "upcoming"
                            ? "No upcoming events near you."
                            : "No past events available.")}
                      </Typography>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={2} mt={3}>
                        {/* Clear Filters (only shows if search/city filter is active) */}
                        {searchType !== "none" && (
                          <Button
                            onClick={clearFilters}
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
