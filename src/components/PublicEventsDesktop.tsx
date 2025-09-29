import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Stack,
  Autocomplete,
  Tabs,
  TextField,
  alpha,
  CircularProgress,
  InputAdornment,
  Tab,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Loader from "@/commonPage/Loader";
import {
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Search,
  ViewList,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

interface EventType {
  Id: string;
  Name: string;
  StartTime: string;
  EndTime: string;
  Description: string;
  Venue: string | null;
  Address: string | null;
  CoverImageUrl: string | null;
  Category?: string | null;
}

type EventItem = {
  Id: string | number;
  Name: string;
  Category?: string;
  StartTime: string;
  Venue?: string | null;
  Description?: string;
  CoverImageUrl?: string | null;
};

const fmtDateTime = (s: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(s));

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const sameMonth = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

const PublicEventsDesktop: React.FC = () => {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOption, setCityOption] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchText, setSearchText] = useState("");
  const [tabValue, setTabValue] = useState<"upcoming" | "past">("upcoming");
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);
  const [sortedEvents, setSortedEvents] = useState<(EventItem | EventType)[]>(
    []
  );
  const [userSelected, setUserSelected] = useState(false);
  const [processedEvents, setProcessedEvents] = useState<
    Record<string, EventItem[]>
  >({});
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cityError, setCityError] = useState<string>("");

  const onMonth = (offset: number) => {
    setUserSelected(true);
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  const getDaysInMonth = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] =
      [];
    const firstDow = first.getDay() || 7;

    for (let i = firstDow - 1; i > 0; i--) {
      const prev = new Date(y, m, 1 - i);
      days.push({ date: prev, isCurrentMonth: false, isToday: false });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      const cur = new Date(y, m, i);
      days.push({
        date: cur,
        isCurrentMonth: true,
        isToday: cur.toDateString() === new Date().toDateString(),
      });
    }
    return days;
  };

  const handleDateChange = (d: Date) => {
    setUserSelected(true);
    setSelectedDate(d);
    setCurrentDate(d);
  };

  const monthUpcoming = useMemo(
    () =>
      [...sortedEvents]
        .filter(
          (e) =>
            e?.StartTime &&
            sameMonth(new Date(e.StartTime), currentDate) &&
            new Date(e.StartTime) >= now
        )
        .sort((a, b) => +new Date(a.StartTime) - +new Date(b.StartTime)),
    [sortedEvents, currentDate, now]
  );

  const monthPast = useMemo(
    () =>
      [...sortedEvents]
        .filter(
          (e) =>
            e?.StartTime &&
            sameMonth(new Date(e.StartTime), currentDate) &&
            new Date(e.StartTime) < now
        )
        .sort((a, b) => +new Date(b.StartTime) - +new Date(a.StartTime)),
    [sortedEvents, currentDate, now]
  );

  const isFutureMonth = useMemo(() => {
    return (
      currentDate.getFullYear() > now.getFullYear() ||
      (currentDate.getFullYear() === now.getFullYear() &&
        currentDate.getMonth() > now.getMonth())
    );
  }, [currentDate, now]);

  const handleSearch = (val: string) => {
    setSearchText(val);

    if (!val) {
      setSortedEvents(events);
      return;
    }

    const lowerVal = val.toLowerCase();
    const filtered = events.filter(
      (e) =>
        e?.Name?.toLowerCase().includes(lowerVal) ||
        e?.Description?.toLowerCase().includes(lowerVal) ||
        e?.Category?.toLowerCase().includes(lowerVal) ||
        e?.Venue?.toLowerCase().includes(lowerVal)
    );

    setSortedEvents(filtered);
  };

  useEffect(() => {
    if (!openCity) {
      setCityOption([]);
    }
  }, [openCity]);

  useEffect(() => {
    if (!openCity) return;
    if (cityInput === "") return;

    const fetchCityData = async () => {
      setCityLoading(true);

      try {
        const response = await fetch(`/api/user/city?city=${cityInput}`);
        if (!response.ok) {
          console.error("Failed to fetch city data:", response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { cities }: { cities: any[] } = await response.json();

        const uniqueCities = cities.filter(
          (city, index, self) =>
            index === self.findIndex((t) => t.City === city.City)
        );

        setCityOption(uniqueCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setCityLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCityData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cityInput, openCity]);

  const handleCityChange = (_: any, v: any) => {
    if (v?.City) {
      const place = String(v.City);
      setSelectedCity(place);

      // filter events by city
      const filtered = events.filter(
        (e) =>
          e?.Venue?.toLowerCase().includes(place.toLowerCase()) ||
          e?.Address?.toLowerCase().includes(place.toLowerCase())
      );

      if (filtered.length === 0) {
        setSortedEvents([]);
        setCityError(`No events found in ${place}.`);
      } else {
        setSortedEvents(filtered);
        setCityError(""); // clear error
      }

      setViewType("list");
    } else {
      // cleared selection
      setSelectedCity("");
      setSortedEvents(events);
      setCityError("");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/events/publicEvents");
        const data = await res.json();
        const list = data?.events || [];
        setEvents(list);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (events?.length === 0) return;

    let baseList = [...events];

    if (searchText) {
      const lowerVal = searchText.toLowerCase();
      baseList = baseList.filter(
        (e) =>
          e?.Name?.toLowerCase().includes(lowerVal) ||
          e?.Description?.toLowerCase().includes(lowerVal) ||
          e?.Category?.toLowerCase().includes(lowerVal) ||
          e?.Venue?.toLowerCase().includes(lowerVal)
      );
    }

    if (tabValue === "upcoming") {
      let monthUpcomingList = baseList.filter(
        (e) =>
          e?.StartTime &&
          sameMonth(new Date(e.StartTime), currentDate) &&
          new Date(e.StartTime) >= now
      );

      if (monthUpcomingList.length === 0 && !userSelected && !searchText) {
        const futureEvents = baseList
          .filter((e) => new Date(e.StartTime) >= now)
          .sort((a, b) => +new Date(a.StartTime) - +new Date(b.StartTime));

        if (futureEvents.length > 0) {
          const firstEventDate = new Date(futureEvents[0].StartTime);
          const newDate = new Date(
            firstEventDate.getFullYear(),
            firstEventDate.getMonth(),
            1
          );
          if (!sameMonth(newDate, currentDate)) {
            setCurrentDate(newDate);
            return;
          }
          monthUpcomingList = futureEvents.filter((e) =>
            sameMonth(new Date(e.StartTime), firstEventDate)
          );
        } else {
          setSortedEvents([]);
          return;
        }
      }

      setSortedEvents(monthUpcomingList);
    } else {
      const monthPastList = baseList.filter(
        (e) =>
          e?.StartTime &&
          sameMonth(new Date(e.StartTime), currentDate) &&
          new Date(e.StartTime) < now
      );
      setSortedEvents(monthPastList);
    }

    setUserSelected(false);
  }, [events, currentDate, tabValue, searchText, now]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Box
        sx={{
          bgcolor: "#0A0A0A",
          minHeight: "100vh",
          color: "white",
          py: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                  lineHeight: 1.1,
                  color: "white",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                Discover Events Near You
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: { xs: "0.78rem", sm: "0.85rem" },
                  maxWidth: { xs: "100%", sm: "520px" },
                }}
              >
                Sign up free to RSVP, save events, and get reminders.
              </Typography>
            </Box>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#f50057",
                color: "white",
                fontWeight: "bold",
                px: 3,
                py: 1,
                borderRadius: 2,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                "&:hover": { bgcolor: "#c51162" },
              }}
              onClick={() => router.push("/register")}
            >
              Sign Up
            </Button>
          </Box>

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
                  "0%": { textShadow: "0 0 10px rgba(245, 0, 87, 0.5)" },
                  "50%": {
                    textShadow:
                      "0 0 20px rgba(245, 0, 87, 0.8), 0 0 30px rgba(245, 0, 87, 0.4)",
                  },
                  "100%": { textShadow: "0 0 10px rgba(245, 0, 87, 0.5)" },
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
                "&:hover::after": { width: "100px" },
              }}
            >
              Events
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
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
                      onClick={() => onMonth(-1)}
                      sx={{
                        color: "#f50057",
                        "&:hover": { bgcolor: alpha("#f50057", 0.1) },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={() => onMonth(1)}
                      sx={{
                        color: "#f50057",
                        "&:hover": { bgcolor: alpha("#f50057", 0.1) },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
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
                isOptionEqualToValue={(o, v) => o.City === v.City}
                getOptionLabel={(o) => o.City || ""}
                options={cityOption}
                loading={cityLoading}
                inputValue={cityInput}
                size="small"
                sx={{ width: { xs: "100%", sm: 200, md: 220 } }}
                noOptionsText={
                  <Typography sx={{ color: "white" }}>No options</Typography>
                }
                onInputChange={(e, v) => {
                  if (e?.type === "change" || e?.type === "click")
                    setCityInput(v);
                }}
                onChange={handleCityChange}
                ListboxProps={{
                  sx: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    "& .MuiAutocomplete-option": {
                      "&:hover": { backgroundColor: "rgba(245,0,87,0.08)" },
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
                onChange={(e) => handleSearch(e.target.value)}
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
            </Stack>

            <Tabs
              value={tabValue}
              onChange={(_, v) => {
                setTabValue(v);
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
                  opacity: 1,
                  "&.Mui-disabled": {
                    color: "rgba(255,255,255,0.3) !important",
                    cursor: "not-allowed",
                  },
                },
                "& .Mui-selected": { color: "#f50057 !important" },
                "& .MuiTabs-indicator": { backgroundColor: "#f50057" },
              }}
            >
              <Tab value="upcoming" label="Upcoming" />
              <Tab value="past" label="Past" disabled={isFutureMonth} />
            </Tabs>
          </Box>

          {viewType === "calendar" ? (
            <>
              <Grid item xs={12}>
                <Paper
                  elevation={24}
                  sx={{ p: 3, bgcolor: "#1E1E1E", borderRadius: 2 }}
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
                        <Box sx={{ p: "1px", borderRadius: 2 }}>
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
                            processedEvents[dateKey(selectedDate)]?.length || 0
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
                        {processedEvents[dateKey(selectedDate)]?.map((ev) => (
                          <Paper
                            key={ev.Id}
                            elevation={8}
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
                                  {ev.Name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={ev.Category}
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
                                  sx={{ color: alpha("#fff", 0.7) }}
                                >
                                  {fmtDateTime(ev.StartTime)}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        ))}

                        {(!processedEvents[dateKey(selectedDate)] ||
                          processedEvents[dateKey(selectedDate)].length ===
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
                              sx={{ color: alpha("#fff", 0.3) }}
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
                    {getDaysInMonth(currentDate).map((day, i) => (
                      <Grid item xs={(12 / 7) as any} key={i}>
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
                              sameDay(day.date, selectedDate) && {
                                bgcolor: alpha("#f50057", 0.15),
                              }),
                            "&:hover": { bgcolor: alpha("#f50057", 0.1) },
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
                            {processedEvents[dateKey(day.date)]
                              ?.slice(0, 2)
                              .map((ev, idx) => (
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
                                  {ev.Name}
                                </Box>
                              ))}
                            {(processedEvents[dateKey(day.date)]?.length || 0) >
                              2 && (
                              <Typography
                                sx={{
                                  color: alpha("#fff", 0.7),
                                  fontSize: "0.75rem",
                                  textAlign: "center",
                                }}
                              >
                                +
                                {processedEvents[dateKey(day.date)]!.length - 2}{" "}
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
            </>
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
                      {daysOfWeek.map((d) => (
                        <Grid item xs={(12 / 7) as any} key={d}>
                          <Typography
                            align="center"
                            sx={{
                              color: alpha("#fff", 0.6),
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              mb: 2,
                            }}
                          >
                            {d}
                          </Typography>
                        </Grid>
                      ))}

                      {getDaysInMonth(currentDate).map((day, i) => {
                        const hasEvents =
                          (processedEvents[dateKey(day.date)]?.length || 0) > 0;
                        const isSelected =
                          selectedDate && sameDay(day.date, selectedDate);
                        return (
                          <Grid item xs={(12 / 7) as any} key={i}>
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
                    {(tabValue === "upcoming" ? monthUpcoming : monthPast)
                      .length > 0 ? (
                      (tabValue === "upcoming" ? monthUpcoming : monthPast).map(
                        (ev: any) => (
                          <Paper
                            key={ev.Id}
                            elevation={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenEvent(ev);
                            }}
                            sx={{
                              borderRadius: 3,
                              overflow: "hidden",
                              bgcolor: alpha("#1A1A1A", 0.85),
                              backdropFilter: "blur(12px)",
                              border: `1px solid ${alpha("#f50057", 0.2)}`,
                              cursor: "pointer",
                              transition: "all 0.35s ease",
                              "&:hover": {
                                transform: "translateY(-6px)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                                borderColor: "#f50057",
                              },
                            }}
                          >
                            {/* Cover image */}
                            <Box sx={{ position: "relative", height: 260 }}>
                              <img
                                src={ev.CoverImageUrl ?? ""}
                                alt={ev.Name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />

                              {/* Category Chip */}
                              {ev.Category && (
                                <Chip
                                  label={ev.Category}
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 16,
                                    left: 16,
                                    bgcolor: alpha("#000", 0.6),
                                    color: "#f50057",
                                    border: "1px solid",
                                    borderColor: alpha("#f50057", 0.4),
                                    fontWeight: "bold",
                                    textTransform: "capitalize",
                                    backdropFilter: "blur(4px)",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Event Info */}
                            <Box sx={{ p: 3, bgcolor: "rgb(245, 0, 87)" }}>
                              <Typography
                                variant="h5"
                                sx={{
                                  mb: 1,
                                  fontWeight: 700,
                                  color: "white",
                                  lineHeight: 1.3,
                                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                }}
                              >
                                {ev.Name}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  color: alpha("#fff", 0.8),
                                  fontWeight: 500,
                                }}
                              >
                                <CalendarToday
                                  sx={{ fontSize: 16, color: "#fff" }}
                                />
                                {fmtDateTime(ev.StartTime)}
                              </Typography>
                            </Box>
                          </Paper>
                        )
                      )
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 6,
                          px: 3,
                          bgcolor: alpha("#1A1A1A", 0.3),
                          borderRadius: 3,
                          border: "1px dashed",
                          borderColor: alpha("#fff", 0.15),
                        }}
                      >
                        <Typography
                          sx={{
                            color: alpha("#fff", 0.6),
                            fontWeight: "bold",
                          }}
                        >
                          {cityError
                            ? cityError
                            : searchText
                            ? "No events match your search."
                            : tabValue === "upcoming"
                            ? "No upcoming events for this month. Try checking next months."
                            : "No past events for this month."}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </Box>

      <Dialog
        open={Boolean(openEvent)}
        onClose={() => setOpenEvent(null)}
        fullWidth
        maxWidth="sm"
        BackdropProps={{
          sx: {
            backdropFilter: "blur(6px) saturate(120%)",
            WebkitBackdropFilter: "blur(6px) saturate(120%)",
            backgroundColor: "rgba(0,0,0,0.48)",
            transition:
              "backdrop-filter 240ms ease, background-color 240ms ease",
            "@media (max-width:600px)": {
              backgroundColor: "rgba(0,0,0,0.56)",
            },
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: "#0f0f0f",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          },
        }}
        aria-labelledby="event-signup-title"
      >
        <DialogTitle
          id="event-signup-title"
          sx={{
            bgcolor: "#111",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1,
          }}
        >
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: "1rem" }}
          >
            {openEvent?.Name}
          </Typography>

          <IconButton
            onClick={() => setOpenEvent(null)}
            sx={{ color: "white" }}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ bgcolor: "#0d0d0d", color: "white", px: 2, pt: 2 }}
        >
          {/* Big hero image (tapable) */}
          {openEvent?.CoverImageUrl && (
            <Box sx={{ mb: 2, borderRadius: 1, overflow: "hidden" }}>
              <img
                src={openEvent.CoverImageUrl}
                alt={openEvent.Name}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "cover",
                }}
                loading="lazy"
              />
            </Box>
          )}

          {/* Key info */}
          <Stack spacing={0.5}>
            <Chip
              label={
                openEvent
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).format(new Date(openEvent.StartTime || ""))
                  : "TBA"
              }
              size="small"
              sx={{
                bgcolor: "rgba(245,0,87,0.95)",
                color: "white",
                fontWeight: 700,
                width: "fit-content",
              }}
            />

            {openEvent?.Venue && (
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                {openEvent.Venue}
              </Typography>
            )}

            {/* Short irresistible benefit lines — keep these punchy */}
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}
              >
                Why sign up?
              </Typography>

              <Stack spacing={0.5}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)" }}
                >
                  • Save this event to your profile and get reminders.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)" }}
                >
                  • Access members-only discounts & faster RSVP.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)" }}
                >
                  • See who’s going and connect with attendees.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: "#111",
            p: 2,
            display: "flex",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setOpenEvent(null)}
            sx={{ color: "white", textTransform: "none" }}
            aria-label="Close dialog"
          >
            Not now
          </Button>

          {/* Primary CTA: clear, high-contrast signup — drives to signup page */}
          <Button
            variant="contained"
            onClick={() => {
              setOpenEvent(null);
              router.push("/register");
            }}
            sx={{
              textTransform: "none",
              bgcolor: "#f50057",
              px: 2,
              py: 0.8,
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(245,0,87,0.18)",
              "&:hover": { bgcolor: "#ff2d78" },
            }}
            aria-label="Sign up to RSVP"
          >
            Sign up to RSVP
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PublicEventsDesktop;
