import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Container,
  useMediaQuery,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Loader from "@/commonPage/Loader";
import AddIcon from "@mui/icons-material/Add";
import {
  CalendarMonth,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  Search,
  TextFields,
  ViewList,
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
}

type EventItem = {
  Id: string | number;
  Name: string;
  Category?: string;
  StartTime: string;
  Venue?: string;
  Description?: string;
  CoverImageUrl?: string;
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
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOption, setCityOption] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchText, setSearchText] = useState("");
  const [baseSorted, setBaseSorted] = useState<EventItem[]>([]);
  const [tabValue, setTabValue] = useState<"upcoming" | "past">("upcoming");
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [sortedEvents, setSortedEvents] = useState<EventItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [processedEvents, setProcessedEvents] = useState<
    Record<string, EventItem[]>
  >({});

  const onMonth = (offset: number) => {
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
    setSelectedDate(d);
    setCurrentDate(d);
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

  const handleSearch = (val: string) => {};

  const handleCityChange = async (_: any, v: any) => {};

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/events/publicEvents");
        const data = await res.json();
        const list = data?.events;
        setEvents(list);
        const monthList = list.filter(
          (e: any) =>
            e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
        );
        setSortedEvents(monthList);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentDate]);

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
          py: { xs: 4, sm: 6, md: 8 },
          background: "linear-gradient(to bottom, #0A0A0A, #1A1A1A)",
        }}
      >
        <Container maxWidth="xl"></Container>

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
                  viewType === "list" ? "#f50057" : "rgba(255, 255, 255, 0.05)",
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
                          onClick={() => router.push("/events/detail/" + ev.Id)}
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
                              +{processedEvents[dateKey(day.date)]!.length - 2}{" "}
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
                      (ev) => (
                        <Paper
                          key={ev.Id}
                          elevation={24}
                          onClick={() => router.push("/events/detail/" + ev.Id)}
                          sx={{
                            p: 0,
                            bgcolor: alpha("#1A1A1A", 0.6),
                            backdropFilter: "blur(20px)",
                            overflow: "hidden",
                            border: "#121212",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": { transform: "translateY(-8px)" },
                          }}
                        >
                          <Box sx={{ position: "relative" }}>
                            <img
                              src={ev.CoverImageUrl}
                              alt={ev.Name}
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
                                label={ev.Category}
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
                                {ev.Name}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: alpha("#fff", 0.9),
                                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                }}
                              >
                                {fmtDateTime(ev.StartTime)}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      )
                    )
                  ) : (
                    <>
                      <></>
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </>
  );
};

export default PublicEventsDesktop;
