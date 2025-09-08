"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Container,
  alpha,
  useMediaQuery,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  ViewList,
  CalendarMonth,
  Add,
  Search,
  ExpandMore,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SidebarList from "@/components/SidebarList";
import Footer from "@/components/Footer";
import { ArrowLeft, MapPin } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Loader from "@/commonPage/Loader";

const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function CalendarView() {
  const router = useRouter();
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any>([]);
  const [profileId, setProfileId] = useState<any>();
  const [viewType, setViewType] = useState("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [processedEvents, setProcessedEvents] = useState<{
    [key: string]: any[];
  }>({});
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

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const getProcessedDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

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

  useEffect(() => {
    const groupedEvents = events.reduce(
      (acc: { [key: string]: any[] }, event: any) => {
        const eventDate = new Date(event.StartTime);
        const key = getDateKey(eventDate);
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(event);
        return acc;
      },
      {}
    );
    setProcessedEvents(groupedEvents);
  }, [events]);

  const handleGetEvents = async (userid: any) => {
    try {
      const response = await fetch("/api/user/events?id=" + userid, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const eventsData = await response.json();
      setEvents(eventsData?.events || []);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const firstDayOfWeek = firstDay.getDay() || 7;

    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1
    );
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1
    );
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const formatEventDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const isSameMonth = (date1: any, date2: any) => {
    return (
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const currentMonthEvents = searchStatus
    ? sortedEvents
    : events.filter(
        (event: any) =>
          event?.StartTime &&
          isSameMonth(new Date(event.StartTime), currentDate)
      );

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
          const locationName = await getLocationName(latitude, longitude);
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
      } else {
        console.error("Error sending location:", data.message);
      }
    } catch (error) {
      console.error("Error sending location to API:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

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

  const upcomingMonthEvents = [...sortedEvents]
    .filter(
      (event: any) =>
        event?.StartTime &&
        isSameMonth(new Date(event.StartTime), currentDate) &&
        new Date(event.StartTime) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime()
    );

  const pastMonthEvents = [...sortedEvents]
    .filter(
      (event: any) =>
        event?.StartTime &&
        isSameMonth(new Date(event.StartTime), currentDate) &&
        new Date(event.StartTime) < now
    )
    .sort(
      (a, b) =>
        new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime()
    );

  const clearFilters = () => {
    setCityInput("");
    setSearchText("");
    setSortedEvents(events);
    setSearchStatus(false);
    setSearchType("none");
  };

  return (
    <Box
      sx={{
        bgcolor: "#0A0A0A",
        minHeight: "100vh",
        color: "white",
        paddingBottom: 1,
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
            <Grid spacing={2}>
              <Grid item xs={12} sm={12} md={12}>
                <Card
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "#0a0a0a",
                    py: { xs: 2, sm: 3 },
                  }}
                >
                  <Typography
                    variant="h5"
                    color="white"
                    textAlign="center"
                    mb={2}
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
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1100,
                      bgcolor: "#0a0a0a",
                      px: 2,
                    }}
                  >
                    <Accordion
                      expanded={expanded}
                      onChange={() => setExpanded(!expanded)}
                      sx={{
                        bgcolor: "#1a1a1a",
                        color: "white",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          Filters & Actions
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="stretch"
                          mb={1}
                        >
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
                              setExpanded(false);
                            }}
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            sx={{
                              flex: 1,
                              textTransform: "none",
                              backgroundColor: "#f50057",
                              fontSize: "16px",
                              fontWeight: "bold",
                              "&:hover": {
                                backgroundColor: "#c51162",
                              },
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
                              fontSize: "16px",
                              fontWeight: "bold",
                              "&:hover": {
                                backgroundColor: "#c51162",
                              },
                            }}
                          >
                            Calendar
                          </Button>
                        </Stack>

                        {/* Filter by State */}
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
                          sx={{ mb: 1 }}
                          noOptionsText={
                            <Typography sx={{ color: "white" }}>
                              No options
                            </Typography>
                          }
                          onInputChange={(event, newInputValue) => {
                            if (
                              event?.type === "change" ||
                              event?.type === "click"
                            )
                              setCityInput(newInputValue);
                          }}
                          onChange={(event, newValue) => {
                            if (newValue?.City) {
                              const filtered = events.filter((event: any) =>
                                event.Venue?.toLowerCase().includes(
                                  newValue.City.toLowerCase()
                                )
                              );
                              const groupedEvents = filtered.reduce(
                                (acc: { [key: string]: any[] }, event: any) => {
                                  const eventDate = new Date();
                                  const key = getProcessedDateKey(eventDate);
                                  if (!acc[key]) acc[key] = [];
                                  acc[key].push(event);
                                  return acc;
                                },
                                {}
                              );

                              setSortedEvents(filtered);
                              setSearchStatus(true);
                              setProcessedEvents(groupedEvents);
                              setViewType("list");
                              setSearchType("city");
                            } else {
                              setSortedEvents(events);
                              const groupedAll = events.reduce(
                                (acc: { [key: string]: any[] }, event: any) => {
                                  const date = new Date(event.StartTime);
                                  const dateKey = getProcessedDateKey(date);
                                  if (!acc[dateKey]) acc[dateKey] = [];
                                  acc[dateKey].push(event);
                                  return acc;
                                },
                                {}
                              );
                              setProcessedEvents(groupedAll);
                            }
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
                                      <CircularProgress
                                        color="inherit"
                                        size={15}
                                      />
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
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: "#f50057",
                                    },
                                },
                              }}
                            />
                          )}
                        />

                        <TextField
                          placeholder="Search events..."
                          variant="outlined"
                          fullWidth
                          value={searchText}
                          sx={{
                            mb: 1,
                            input: { color: "white" },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.23)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.4)",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.23)",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search sx={{ color: "#f50057" }} />
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase();
                            setSearchText(e.target.value);

                            if (value.trim() === "") {
                              setSortedEvents(events);
                              setSearchStatus(false);
                              setSearchType("none");
                              return;
                            }

                            const filtered = events.filter(
                              (event: any) =>
                                event.Name?.toLowerCase().includes(value) ||
                                event.Venue?.toLowerCase().includes(value) ||
                                event.Description?.toLowerCase().includes(value)
                            );

                            setSortedEvents(filtered);
                            setSearchStatus(true);
                            setSearchType("text");
                          }}
                        />

                        <Tabs
                          value={tabValue}
                          onChange={(e, newValue) => {
                            setTabValue(newValue);
                            setExpanded(false);
                            window.scroll(0, 0);
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
                      </AccordionDetails>
                    </Accordion>
                  </Box>
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
                        (tabValue === "upcoming"
                          ? upcomingEvents
                          : pastEvents
                        ).map((post: any) => {
                          const eventDate = new Date(post.StartTime);
                          const isCurrentMonth =
                            eventDate.getMonth() === currentDate.getMonth() &&
                            eventDate.getFullYear() ===
                              currentDate.getFullYear();

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
                                <Typography variant="h6">
                                  {post.Name}
                                </Typography>
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
                        })
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
                            {searchType === "text"
                              ? "No events found for your search"
                              : searchType === "city"
                              ? "No events found in your searched city"
                              : `No ${
                                  tabValue === "upcoming" ? "Upcoming" : "Past"
                                } Events`}
                          </Typography>

                          {searchType !== "none" ? (
                            <Button
                              onClick={clearFilters}
                              variant="outlined"
                              sx={{
                                mt: 2,
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
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                color: alpha("#fff", 0.7),
                                textAlign: "center",
                                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              }}
                            >
                              There are no{" "}
                              {tabValue === "upcoming" ? "upcoming" : "past"}{" "}
                              events scheduled for{" "}
                              {currentDate.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              })}
                              . Check back later or try a different month.
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Button
              onClick={() => router.back()}
              startIcon={<ArrowLeft />}
              sx={{
                display: { xs: "none", sm: "none", md: "inline-flex" },
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

            <Box sx={{ color: "white", mt: 2 }}>
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
                Events
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "row" },
                gap: { xs: 2, sm: 2, md: 3 },
                alignItems: { xs: "stretch", md: "center" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", md: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: { xs: "wrap", md: "nowrap" },
                  mt: { xs: 3, md: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    background:
                      "linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
                    p: "2px",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#0A0A0A",
                      px: 1,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h1"
                      sx={{
                        background:
                          "linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        fontWeight: "bold",
                      }}
                    >
                      {currentDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={handlePreviousMonth}
                        sx={{
                          color: "#f50057",
                          "&:hover": {
                            bgcolor: alpha("#f50057", 0.1),
                          },
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        onClick={handleNextMonth}
                        sx={{
                          color: "#f50057",
                          "&:hover": {
                            bgcolor: alpha("#f50057", 0.1),
                          },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                <Button
                  startIcon={<AddIcon />}
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
                  }}
                  sx={{
                    display: {
                      xs: "inline-flex",
                      sm: "inline-flex",
                      md: "none",
                    },
                    color: viewType === "calendar" ? "white" : "#f50057",
                    bgcolor:
                      viewType === "calendar"
                        ? "#f50057"
                        : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      bgcolor:
                        viewType === "calendar"
                          ? "#c51162"
                          : "rgba(255, 255, 255, 0.1)",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  Create
                </Button>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
              >
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
                  size="small"
                  sx={{ width: { xs: "100%", sm: 200, md: 220 } }}
                  noOptionsText={
                    <Typography sx={{ color: "white" }}>No options</Typography>
                  }
                  onInputChange={(event, newInputValue) => {
                    if (event?.type === "change" || event?.type === "click")
                      setCityInput(newInputValue);
                  }}
                  onChange={(event, newValue) => {
                    if (newValue?.City) {
                      const filtered = events.filter((event: any) =>
                        event.Venue?.toLowerCase().includes(
                          newValue.City.toLowerCase()
                        )
                      );

                      setSortedEvents(filtered);
                      setSearchStatus(true);
                      setSearchType("city");
                      setViewType("list");
                    } else {
                      const monthEvents = events.filter(
                        (event: any) =>
                          event?.StartTime &&
                          isSameMonth(new Date(event.StartTime), currentDate)
                      );

                      setSortedEvents(monthEvents);
                      setSearchStatus(false);
                      setSearchType("none");
                    }
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
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <MapPin size={20} color="#f50057" />,
                        endAdornment: (
                          <>
                            {cityLoading ? (
                              <CircularProgress color="inherit" size={15} />
                            ) : null}
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
                />

                <TextField
                  placeholder="Search events..."
                  variant="outlined"
                  size="small"
                  value={searchText}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setSearchText(e.target.value);

                    if (value.trim() === "") {
                      const monthEvents = events.filter(
                        (event: any) =>
                          event?.StartTime &&
                          isSameMonth(new Date(event.StartTime), currentDate)
                      );

                      setSortedEvents(monthEvents);
                      setSearchStatus(false);
                      setSearchType("none");
                      return;
                    }

                    const filtered = events.filter(
                      (event: any) =>
                        event.Name?.toLowerCase().includes(value) ||
                        event.Venue?.toLowerCase().includes(value) ||
                        event.Description?.toLowerCase().includes(value)
                    );

                    setSortedEvents(filtered);
                    setSearchStatus(true);
                    setSearchType("text");
                  }}
                  sx={{
                    width: { xs: "100%", sm: 200, md: 220 },
                    input: { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.4)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.23)",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#f50057" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  startIcon={<CalendarToday />}
                  onClick={() => setViewType("calendar")}
                  sx={{
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                    color: viewType === "calendar" ? "white" : "#f50057",
                    bgcolor:
                      viewType === "calendar"
                        ? "#f50057"
                        : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      bgcolor:
                        viewType === "calendar"
                          ? "#c51162"
                          : "rgba(255, 255, 255, 0.1)",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  Calendar
                </Button>

                <Button
                  startIcon={<ViewList />}
                  onClick={() => setViewType("list")}
                  sx={{
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                    color: viewType === "list" ? "white" : "#f50057",
                    bgcolor:
                      viewType === "list"
                        ? "#f50057"
                        : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      bgcolor:
                        viewType === "list"
                          ? "#c51162"
                          : "rgba(255, 255, 255, 0.1)",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  List
                </Button>

                <Button
                  startIcon={<AddIcon />}
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
                  }}
                  sx={{
                    display: {
                      xs: "none",
                      sm: "none",
                      md: "inline-flex",
                    },
                    color: viewType === "calendar" ? "white" : "#f50057",
                    bgcolor:
                      viewType === "calendar"
                        ? "#f50057"
                        : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      bgcolor:
                        viewType === "calendar"
                          ? "#c51162"
                          : "rgba(255, 255, 255, 0.1)",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  Create
                </Button>
              </Stack>

              <Tabs
                value={tabValue}
                onChange={(e, newValue) => {
                  setTabValue(newValue);
                  window.scroll(0, 0);
                }}
                variant="scrollable"
                sx={{
                  mt: 3,
                  mb: 4,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: "bold",
                    color: "white",
                    minWidth: 120,
                  },
                  "& .Mui-selected": {
                    color: "#f50057 !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#f50057",
                  },
                }}
              >
                <Tab value="upcoming" label="Upcoming" />
                <Tab value="past" label="Past" />
              </Tabs>
            </Box>

            {viewType === "calendar" ? (
              <Grid item xs={12}>
                <Paper
                  elevation={24}
                  sx={{
                    p: 3,
                    bgcolor: "#1E1E1E",
                    borderRadius: 2,
                  }}
                >
                  {selectedDate && (
                    <Box
                      sx={{
                        mb: 4,
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: -24,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          backgroundColor: "#f50057",
                          borderRadius: 8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 3,
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: "1px",
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: "#1E1E1E",
                              px: 2,
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                background:
                                  "linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                fontWeight: "bold",
                              }}
                            >
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`There are ${
                            processedEvents[getDateKey(selectedDate)]?.length ||
                            0
                          } Events`}
                          sx={{
                            bgcolor: alpha("#f50057", 0.1),
                            color: "#f50057",
                            border: "1px solid",
                            fontWeight: "bold",
                            borderColor: alpha("#f50057", 0.3),
                            backdropFilter: "blur(4px)",
                          }}
                        />
                      </Box>

                      <Stack spacing={2}>
                        {processedEvents[getDateKey(selectedDate)]?.map(
                          (event: any) => (
                            <Paper
                              key={event.Id}
                              elevation={8}
                              onClick={() =>
                                router.push("/events/detail/" + event?.Id)
                              }
                              sx={{
                                bgcolor: alpha("#1A1A1A", 0.6),
                                backdropFilter: "blur(20px)",
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                borderRadius: 2,
                                "&:hover": {
                                  transform: "translateX(8px)",
                                  bgcolor: alpha("#1A1A1A", 0.8),
                                },
                              }}
                            >
                              <Box sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    mb: 1,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      color: "#fff",
                                      fontWeight: "bold",
                                      flex: 1,
                                      mr: 2,
                                    }}
                                  >
                                    {event.Name}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={event.Category}
                                    sx={{
                                      bgcolor: alpha("#000", 0.3),
                                      color: "#f50057",
                                      border: "1px solid",
                                      borderColor: alpha("#f50057", 0.3),
                                      backdropFilter: "blur(4px)",
                                      flexShrink: 0,
                                    }}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CalendarToday
                                    sx={{
                                      color: alpha("#fff", 0.5),
                                      fontSize: 16,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: alpha("#fff", 0.7),
                                    }}
                                  >
                                    {formatEventDate(event.StartTime)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          )
                        )}
                        {(!processedEvents[getDateKey(selectedDate)] ||
                          processedEvents[getDateKey(selectedDate)].length ===
                            0) && (
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 6,
                              px: 3,
                              bgcolor: alpha("#1A1A1A", 0.3),
                              borderRadius: 2,
                              border: "1px dashed",
                              borderColor: alpha("#fff", 0.1),
                            }}
                          >
                            <Typography
                              sx={{
                                color: alpha("#fff", 0.5),
                                mb: 1,
                                fontWeight: "medium",
                              }}
                            >
                              No events scheduled for this date
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: alpha("#fff", 0.3),
                              }}
                            >
                              Select another date to view events
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Calendar grid */}
                  <Grid container spacing={1}>
                    {getDaysInMonth(currentDate).map((day, index) => (
                      <Grid item xs={12 / 7} key={index}>
                        <Box
                          onClick={() => handleDateChange(day.date)}
                          sx={{
                            p: 1,
                            height: "120px",
                            border: "1px solid",
                            borderColor: alpha("#fff", 0.1),
                            borderRadius: 2,
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s ease",
                            ...(selectedDate &&
                              isSameDay(day.date, selectedDate) && {
                                bgcolor: alpha("#f50057", 0.15),
                              }),
                            "&:hover": {
                              bgcolor: alpha("#f50057", 0.1),
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              color: day.isCurrentMonth
                                ? day.isToday
                                  ? "#f50057"
                                  : "white"
                                : alpha("#fff", 0.3),
                              fontWeight: day.isToday ? "bold" : "normal",
                              fontSize: "0.9rem",
                              mb: 1,
                            }}
                          >
                            {day.date.getDate()}
                          </Typography>

                          <Stack spacing={0.5}>
                            {processedEvents[getDateKey(day.date)]
                              ?.slice(0, 2)
                              .map((event: any, idx: number) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    bgcolor: alpha("#f50057", 0.2),
                                    p: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.75rem",
                                    color: "#fff",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {event.Name}
                                </Box>
                              ))}
                            {(processedEvents[getDateKey(day.date)]?.length ||
                              0) > 2 && (
                              <Typography
                                sx={{
                                  color: alpha("#fff", 0.7),
                                  fontSize: "0.75rem",
                                  textAlign: "center",
                                }}
                              >
                                +
                                {processedEvents[getDateKey(day.date)].length -
                                  2}{" "}
                                more
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ) : (
              <>
                <Grid container spacing={4}>
                  {/* Calendar Grid */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={24}
                      sx={{
                        display: { xs: "none", sm: "none", md: "inline-flex" },
                        p: 3,
                        bgcolor: "#1E1E1E",
                        borderRadius: 2,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <Grid container>
                        {daysOfWeek.map((day) => (
                          <Grid item xs={12 / 7} key={day}>
                            <Typography
                              align="center"
                              sx={{
                                color: alpha("#fff", 0.6),
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                mb: 2,
                              }}
                            >
                              {day}
                            </Typography>
                          </Grid>
                        ))}

                        {getDaysInMonth(currentDate).map((day, index) => {
                          const hasEvents =
                            processedEvents[getDateKey(day.date)]?.length > 0;
                          const isSelected =
                            selectedDate && isSameDay(day.date, selectedDate);

                          return (
                            <Grid item xs={12 / 7} key={index}>
                              <Box
                                onClick={() => handleDateChange(day.date)}
                                sx={{
                                  p: 1,
                                  textAlign: "center",
                                  position: "relative",
                                  cursor: "pointer",
                                  borderRadius: 2,
                                  transition: "all 0.2s ease",
                                  ...(isSelected && {
                                    bgcolor: alpha("#f50057", 0.15),
                                    transform: "scale(1.1)",
                                  }),
                                  "&:hover": {
                                    bgcolor: alpha("#f50057", 0.1),
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: day.isCurrentMonth
                                      ? day.isToday
                                        ? "#f50057"
                                        : "white"
                                      : alpha("#fff", 0.3),
                                    fontWeight: day.isToday ? "bold" : "normal",
                                    fontSize: "0.9rem",
                                    mb: 1,
                                  }}
                                >
                                  {day.date.getDate()}
                                </Typography>
                                {hasEvents && (
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      bgcolor: "#f50057",
                                      borderRadius: "50%",
                                      position: "absolute",
                                      bottom: 4,
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      boxShadow: "0 0 8px #f50057",
                                    }}
                                  />
                                )}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Events List */}
                  <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                      {(tabValue === "upcoming"
                        ? upcomingMonthEvents
                        : pastMonthEvents
                      ).length > 0 ? (
                        (tabValue === "upcoming"
                          ? upcomingMonthEvents
                          : pastMonthEvents
                        ).map((event: any) => (
                          <Paper
                            key={event.Id}
                            elevation={24}
                            onClick={() =>
                              router.push("/events/detail/" + event?.Id)
                            }
                            sx={{
                              p: 0,
                              bgcolor: alpha("#1A1A1A", 0.6),
                              backdropFilter: "blur(20px)",
                              overflow: "hidden",
                              border: "#121212",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-8px)",
                              },
                            }}
                          >
                            <Box sx={{ position: "relative" }}>
                              <img
                                src={event.CoverImageUrl}
                                alt={event.Name}
                                style={{
                                  width: "100%",
                                  height: "280px",
                                  objectFit: "cover",
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 16,
                                  left: 16,
                                  display: "flex",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={event.Category}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha("#000", 0.7),
                                    color: "#f50057",
                                    border: "1px solid",
                                    borderColor: alpha("#f50057", 0.3),
                                    backdropFilter: "blur(4px)",
                                  }}
                                />
                              </Box>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  p: 3,
                                  background:
                                    "linear-gradient(transparent, rgba(0,0,0,0.9))",
                                  backdropFilter: "blur(8px)",
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  sx={{
                                    mb: 1,
                                    fontWeight: "bold",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                    color: "white",
                                  }}
                                >
                                  {event.Name}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: alpha("#fff", 0.9),
                                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                  }}
                                >
                                  {formatEventDate(event.StartTime)}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        ))
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
                            <CalendarToday
                              sx={{
                                width: 48,
                                height: 48,
                                color: "#f50057",
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: "bold",
                              color: "white",
                              mb: 1,
                              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                              textAlign: "center",
                            }}
                          >
                            {`No ${
                              tabValue === "upcoming" ? "Upcoming" : "Past"
                            } Events in ${currentDate.toLocaleString(
                              "default",
                              { month: "long", year: "numeric" }
                            )}`}
                          </Typography>

                          <Typography
                            variant="body1"
                            sx={{
                              color: alpha("#fff", 0.7),
                              textAlign: "center",
                              maxWidth: "md",
                              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                            }}
                          >
                            Check back later or try a different month.
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
