"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  alpha,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Autocomplete,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  ViewList,
  Search,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import CircularProgress from "@mui/material/CircularProgress";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatDateEST } from "@/utils/formatDateEST";

const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

type EventItem = {
  Id: string | number;
  Name: string;
  Category?: string;
  StartTime: string;
  Venue?: string;
  Description?: string;
  CoverImageUrl?: string;
};

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

export default function EventDesktopList() {
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sortedEvents, setSortedEvents] = useState<EventItem[]>([]);
  const [processedEvents, setProcessedEvents] = useState<
    Record<string, EventItem[]>
  >({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [profileId, setProfileId] = useState<string | number | undefined>();
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState<"upcoming" | "past">("upcoming");
  const [searchText, setSearchText] = useState("");

  const [cityInput, setCityInput] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOption, setCityOption] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<any | null>(null);

  const filterEventsByState = (list: EventItem[], state: any | null) => {
    if (!state) return list;

    const full = state.StateFull?.toLowerCase() || "";
    const abbr = state.State?.toLowerCase() || "";

    return list.filter((e) => {
      const venue = (e.Venue || "").toLowerCase();

      return (
        (full && venue.includes(full)) ||
        (abbr && venue.includes(`, ${abbr}`)) ||
        (abbr && venue.endsWith(` ${abbr}`))
      );
    });
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
        const response = await fetch(`/api/usStates?state=${cityInput}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { states } = await response.json();

        const uniqueStates = states.filter(
          (state: any, index: number, self: any[]) =>
            index ===
            self.findIndex((t: any) => t.StateFull === state.StateFull)
        );

        setCityOption(uniqueStates);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setCityLoading(false);
      }
    };

    fetchData();
  }, [cityInput, openCity]);

  const monthHasAnyEvents = useMemo(() => {
    return events.some(
      (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
    );
  }, [events, currentDate]);

  useEffect(() => {
    const monthList = events.filter(
      (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
    );
    setSortedEvents(monthList);
  }, [events, currentDate]);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("loginInfo") : null;
    if (!token) return router.push("/login");
    try {
      const decoded = jwtDecode<any>(token);
      setProfileId(decoded?.profileId);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      try {
        const res = await fetch(`/api/user/events?id=${profileId}`);
        const data = await res.json();
        const list: EventItem[] = data?.events || [];
        setEvents(list);
        const monthList = list.filter(
          (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
        );
        setSortedEvents(monthList);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId, currentDate]);

  useEffect(() => {
    const grouped = events.reduce<Record<string, EventItem[]>>((acc, ev) => {
      const k = dateKey(new Date(ev.StartTime));
      (acc[k] ||= []).push(ev);
      return acc;
    }, {});
    setProcessedEvents(grouped);
  }, [events]);

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

  const onMonth = (offset: number) => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  const now = useMemo(() => new Date(), []);

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

  const handleDateChange = (d: Date) => {
    setSelectedDate(d);
    setCurrentDate(d);
  };

  const handleSearch = (val: string) => {
    setSearchText(val);
    const v = val.toLowerCase().trim();

    // base list: events of current month
    let baseList = events.filter(
      (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
    );

    // 🔹 apply state filter if a state is selected
    baseList = filterEventsByState(baseList, selectedState);

    if (!v) {
      setSortedEvents(baseList);
      return;
    }

    const filtered = baseList.filter(
      (e) =>
        e.Name?.toLowerCase().includes(v) ||
        e.Venue?.toLowerCase().includes(v) ||
        e.Description?.toLowerCase().includes(v)
    );
    setSortedEvents(filtered);
  };

  useEffect(() => {
    const grouped = sortedEvents.reduce<Record<string, EventItem[]>>(
      (acc, ev) => {
        const k = dateKey(new Date(ev.StartTime));
        (acc[k] ||= []).push(ev);
        return acc;
      },
      {}
    );
    setProcessedEvents(grouped);
  }, [sortedEvents]);

  function EmptyState({
    title,
    subtitle,
    onSearchFocus,
  }: {
    title: string;
    subtitle?: string;
    onSearchFocus?: () => void;
  }) {
    return (
      <Paper
        elevation={24}
        sx={{
          p: 6,
          bgcolor: "#121212",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: alpha("#f50057", 0.1),
            p: 2,
            borderRadius: "50%",
            mb: 1,
          }}
        >
          <CalendarToday sx={{ width: 48, height: 48, color: "#f50057" }} />
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: alpha("#fff", 0.7),
              textAlign: "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            {subtitle}
          </Typography>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {onSearchFocus && (
            <Button
              variant="outlined"
              onClick={onSearchFocus}
              sx={{
                borderColor: "#f50057",
                color: "#f50057",
                "&:hover": { borderColor: "#f50057" },
              }}
            >
              Search events
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
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

      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              background: "linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
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

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Autocomplete
            id="location-autocomplete"
            open={openCity}
            onOpen={() => setOpenCity(true)}
            onClose={() => setOpenCity(false)}
            isOptionEqualToValue={(option, value) =>
              option.StateFull === value.StateFull
            }
            getOptionLabel={(option) =>
              option.StateFull && option.State
                ? `${option.StateFull} (${option.State})`
                : option.StateFull || ""
            }
            options={cityOption}
            loading={cityLoading}
            inputValue={cityInput}
            size="small"
            sx={{ width: { xs: "100%", sm: 200, md: 220 } }}
            noOptionsText="No states found"
            onInputChange={(e, v) => {
              if (e?.type === "change" || e?.type === "click") setCityInput(v);
            }}
            onChange={(_, v) => {
              setSelectedState(v || null);

              const searchVal = searchText.toLowerCase().trim();

              let baseList = events.filter(
                (e) =>
                  e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
              );

              baseList = filterEventsByState(baseList, v || null);

              if (!searchVal) {
                setSortedEvents(baseList);
                return;
              }

              const filtered = baseList.filter(
                (e) =>
                  e.Name?.toLowerCase().includes(searchVal) ||
                  e.Venue?.toLowerCase().includes(searchVal) ||
                  e.Description?.toLowerCase().includes(searchVal)
              );
              setSortedEvents(filtered);
            }}
            // 🔹 Style the dropdown paper + list
            componentsProps={{
              paper: {
                sx: {
                  bgcolor: "#ffffff",
                  color: "#000000",
                  borderRadius: 2,
                  border: "1px solid #f50057",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                },
              },
            }}
            ListboxProps={{
              sx: {
                maxHeight: 260,
                paddingY: 0.5,
                backgroundColor: "#ffffff",
                color: "#000000",
                "& .MuiAutocomplete-option": {
                  fontSize: 14,
                  paddingY: 0.75,
                  color: "#000000",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.08)",
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: "rgba(245,0,87,0.18)",
                    color: "#000",
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
                      {cityLoading && (
                        <CircularProgress color="inherit" size={15} />
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
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255,255,255,0.55)",
                      opacity: 1,
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

              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.45)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#f50057",
                },
              },

              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255,255,255,0.55)",
                opacity: 1,
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
                viewType === "list" ? "#f50057" : "rgba(255, 255, 255, 0.05)",
              "&:hover": {
                bgcolor:
                  viewType === "list" ? "#c51162" : "rgba(255, 255, 255, 0.1)",
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
                const decoded = jwtDecode<any>(token);
                decoded?.membership === 0
                  ? router.push("/membership")
                  : router.push("/events/create");
              } else {
                router.push("/login");
              }
            }}
            sx={{
              display: { xs: "none", sm: "none", md: "inline-flex" },
              color: "#f50057",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
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
            },
            "& .Mui-selected": { color: "#f50057 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#f50057" },
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
            sx={{ p: 3, bgcolor: "#1E1E1E", borderRadius: 2 }}
          >
            {selectedDate && (
              <Box sx={{ mb: 4, position: "relative" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}
                >
                  <Box sx={{ p: "1px", borderRadius: 2 }}>
                    <Box sx={{ bgcolor: "#1E1E1E", px: 2, borderRadius: 2 }}>
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
                    sx={{ bgcolor: alpha("#f50057", 0.1), color: "#f50057" }}
                  />
                </Box>

                <Stack spacing={2}>
                  {processedEvents[dateKey(selectedDate)]?.map((ev) => (
                    <Paper
                      key={ev.Id}
                      elevation={8}
                      onClick={() => router.push("/events/detail/" + ev.Id)}
                      sx={{
                        bgcolor: alpha("#1A1A1A", 0.6),
                        cursor: "pointer",
                        borderRadius: 2,
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
                            sx={{ color: "#f50057" }}
                          />
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday
                            sx={{ color: alpha("#fff", 0.5), fontSize: 16 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: alpha("#fff", 0.7) }}
                          >
                            {formatDateEST(ev.StartTime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}

                  {(!processedEvents[dateKey(selectedDate)] ||
                    processedEvents[dateKey(selectedDate)].length === 0) && (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 6,
                        px: 3,
                        bgcolor: alpha("#1A1A1A", 0.3),
                        borderRadius: 2,
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
                          +{processedEvents[dateKey(day.date)]!.length - 2} more
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
            <Grid item xs={12} md={4}>
              <Paper
                elevation={24}
                sx={{
                  display: { xs: "none", sm: "none", md: "inline-flex" },
                  p: 3,
                  bgcolor: "#1E1E1E",
                  borderRadius: 2,
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

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {(tabValue === "upcoming" ? monthUpcoming : monthPast).length >
                0 ? (
                  (tabValue === "upcoming" ? monthUpcoming : monthPast).map(
                    (ev) => (
                      <Paper
                        key={ev?.Id}
                        elevation={8}
                        onClick={() => router.push("/events/detail/" + ev?.Id)}
                        sx={{
                          p: 0,
                          bgcolor: alpha("#1A1A1A", 0.8),
                          backdropFilter: "blur(20px)",
                          overflow: "hidden",
                          border: "2px solid rgba(245, 0, 87, 0.8)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            elevation: 16,
                            borderColor: "2px solid rgba(245, 0, 87, 0.8)",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative" }}>
                          {ev.CoverImageUrl && (
                            <Box
                              sx={{
                                height: 320,
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                bgcolor: "#0A0A0A",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={ev.CoverImageUrl}
                                alt={ev.Name}
                                style={{
                                  height: "100%",
                                  width: "auto",
                                  maxWidth: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </Box>
                          )}

                          {/* Category Badge */}
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
                              label={ev.Category}
                              size="small"
                              sx={{
                                bgcolor: alpha("#000", 0.8),
                                color: "#f50057",
                                fontWeight: "bold",
                                border: "1px solid",
                                borderColor: alpha("#f50057", 0.4),
                                backdropFilter: "blur(10px)",
                              }}
                            />
                          </Box>

                          {/* Content Overlay */}
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: "rgb(245, 0, 87)",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 1,
                                fontWeight: "bold",
                                background:
                                  "linear-gradient(45deg, #FFF 30%, #f50057 90%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                lineHeight: 1.3,
                                minHeight: "1em",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {ev.Name}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 16, color: alpha("#fff", 0.7) }}
                              />

                              <Typography
                                variant="body2"
                                sx={{ color: "rgba(255,255,255,0.8)" }}
                              >
                                <strong>Starts:</strong>{" "}
                                {formatDateEST(ev.StartTime)}
                              </Typography>
                            </Box>

                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                bgcolor: "#FFFFFF",
                                color: "#f50057",
                                fontWeight: "bold",
                                mt: 2,
                                borderRadius: "8px",
                                border: "2px solid transparent",
                                textTransform: "none",
                                fontSize: "0.95rem",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                },
                                "&:active": {
                                  transform: "translateY(0)",
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    )
                  )
                ) : (
                  <EmptyState
                    title={
                      !monthHasAnyEvents
                        ? `No ${
                            tabValue === "upcoming" ? "Upcoming" : "Past"
                          } events in ${currentDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}`
                        : "No events found"
                    }
                    subtitle={
                      !monthHasAnyEvents
                        ? "Try another month or adjust your search."
                        : "Try another month or adjust your search."
                    }
                    onSearchFocus={() => {
                      const el = document.querySelector<HTMLInputElement>(
                        'input[placeholder="Search events..."]'
                      );
                      el?.focus();
                    }}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
