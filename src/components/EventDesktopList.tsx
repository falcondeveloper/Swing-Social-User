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
  Alert,
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
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Loader from "@/commonPage/Loader";

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
const fmtDateTime = (s: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(s));

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

  const [cityInput, setCityInput] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOption, setCityOption] = useState<any[]>([]);

  const [userLocation, setUserLocation] = useState<any>([]);

  const ACTIVE_RADIUS_MI = 200;
  const [basePlace, setBasePlace] = useState<string | null>(null); // e.g. "Arlington, VA"
  const [baseState, setBaseState] = useState<string | null>(null); // e.g. "VA"
  const [baseCoords, setBaseCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoAllowed, setGeoAllowed] = useState<boolean>(false);
  const [baseSorted, setBaseSorted] = useState<EventItem[]>([]);

  const [geoPermission, setGeoPermission] = useState<
    "granted" | "denied" | "prompt" | "unsupported"
  >("prompt");
  const [radiusMi, setRadiusMi] = useState<number>(ACTIVE_RADIUS_MI);

  // Optional: widen radius quickly if nothing nearby
  const widenRadius = () => setRadiusMi((r) => Math.min(1000, r + 100));
  const apiKey = "AIzaSyDv-b2OlvhI1HmMyfHoSEwHkKpPkKlX4vc";

  const [searchText, setSearchText] = useState("");

  const parseStateFromPlace = (place?: string | null): string | null => {
    if (!place) return null;
    const m = place.match(/,\s*([A-Za-z]{2})(?:\s|$)/);
    return m ? m[1].toUpperCase() : null;
  };

  const haversineMiles = (
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 3958.7613;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  // Ask again -> will show browser prompt if state is "prompt"
  const requestLocation = () => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setGeoAllowed(true);
        setGeoPermission("granted");
        const { latitude, longitude } = coords;
        const name = await getLocationName(latitude, longitude);
        setBasePlace(name);
        setBaseState(parseStateFromPlace(name));
        setBaseCoords({ lat: latitude, lng: longitude });
        if (profileId) {
          await sendLocationToAPI({
            profileId,
            locationName: name,
            latitude,
            longitude,
          });
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGeoAllowed(false);
        // error.code === err.PERMISSION_DENIED doesn't always update Permissions API immediately
        setGeoPermission("denied");
      }
    );
  };

  useEffect(() => {
    let cancelled = false;

    if (
      !("permissions" in navigator) ||
      !(navigator as any).permissions?.query
    ) {
      setGeoPermission("unsupported");
      return;
    }
    (async () => {
      try {
        // @ts-ignore
        const status: PermissionStatus = await (
          navigator as any
        ).permissions.query({ name: "geolocation" as PermissionName });
        if (!cancelled) setGeoPermission(status.state as any);
        // keep it in sync if user changes it in-site settings
        status.onchange = () => {
          if (!cancelled) setGeoPermission(status.state as any);
        };
      } catch {
        if (!cancelled) setGeoPermission("prompt");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const monthHasAnyEvents = useMemo(() => {
    return events.some(
      (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
    );
  }, [events, currentDate]);

  const monthHasNearbyEvents = useMemo(() => {
    return sortedEvents.some(
      (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
    );
  }, [sortedEvents, currentDate]);

  // Are we filtering out everything because we don't have a base location yet?
  const hasBaseLocation = !!(baseState || baseCoords);

  const geocodePlace = async (place: string, apiKey: string) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        place
      )}&key=${apiKey}`
    );
    if (!res.ok) throw new Error(`Geocode HTTP ${res.status}`);
    const data = await res.json();
    const loc = data?.results?.[0]?.geometry?.location;
    return loc && typeof loc.lat === "number" && typeof loc.lng === "number"
      ? { lat: loc.lat, lng: loc.lng }
      : null;
  };

  function EmptyState({
    title,
    subtitle,
    onEnableLocation,
    showEnableLocation,
    onSearchFocus,
    onWidenRadius,
    showWidenRadius,
  }: {
    title: string;
    subtitle?: string;
    onEnableLocation?: () => void;
    showEnableLocation?: boolean;
    onSearchFocus?: () => void;
    onWidenRadius?: () => void;
    showWidenRadius?: boolean;
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

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, flexWrap: "wrap", justifyContent: "center" }}
        >
          {showEnableLocation && (
            <Button
              variant="contained"
              onClick={onEnableLocation}
              sx={{ bgcolor: "#f50057", "&:hover": { bgcolor: "#c51162" } }}
            >
              Enable location
            </Button>
          )}
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
          {showWidenRadius && (
            <Button
              variant="outlined"
              onClick={onWidenRadius}
              sx={{
                borderColor: "#f50057",
                color: "#f50057",
                "&:hover": { borderColor: "#f50057" },
              }}
            >
              Expand search radius
            </Button>
          )}
        </Stack>

        {/* Optional nudge if denied */}
        {showEnableLocation && geoPermission === "denied" && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              bgcolor: alpha("#2196f3", 0.1),
              color: "white",
              border: "1px solid",
              borderColor: alpha("#2196f3", 0.3),
            }}
          >
            Location access is blocked in your browser. Go to Site Settings →
            Location and allow it, then click “Enable location”.
          </Alert>
        )}
      </Paper>
    );
  }

  useEffect(() => {
    let isMounted = true;

    const recompute = async () => {
      // Always start from events in the currently viewed month
      const monthList = events.filter(
        (e) => e?.StartTime && sameMonth(new Date(e.StartTime), currentDate)
      );

      // Until we know the base location, show nothing (avoids "everywhere")
      if (!baseState && !baseCoords) {
        if (isMounted) {
          setBaseSorted([]);
          setSortedEvents([]);
        }
        return;
      }

      const checks = await Promise.all(monthList.map(passesLocationFilter));
      const filtered = monthList.filter((_, i) => checks[i]);

      if (isMounted) {
        setBaseSorted(filtered);
        setSortedEvents(filtered);
      }
    };

    recompute();
    return () => {
      isMounted = false;
    };
  }, [events, currentDate, baseState, baseCoords]);

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

  useEffect(() => {
    if (!openCity || !cityInput) {
      if (!openCity) setCityOption([]);
      return;
    }
    let active = true;
    (async () => {
      setCityLoading(true);
      try {
        const res = await fetch(`/api/user/city?city=${cityInput}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { cities } = await res.json();
        const unique = cities.filter(
          (c: any, i: number, self: any[]) =>
            i === self.findIndex((t) => t.City === c.City)
        );
        if (active) setCityOption(unique);
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setCityLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [cityInput, openCity]);

  useEffect(() => {
    if (!profileId || !navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setGeoAllowed(true);
        const { latitude, longitude } = coords;
        const name = await getLocationName(latitude, longitude);
        setBasePlace(name);
        setBaseState(parseStateFromPlace(name));
        setBaseCoords({ lat: latitude, lng: longitude });

        await sendLocationToAPI({
          profileId,
          locationName: name,
          latitude,
          longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGeoAllowed(false);
      }
    );
  }, [profileId]);

  useEffect(() => {
    if (!userLocation || geoAllowed) return; // prefer geo if allowed
    const place = String(userLocation); // e.g., "Arlington, VA"
    setBasePlace(place);
    setBaseState(parseStateFromPlace(place));
    (async () => {
      try {
        const coords = await geocodePlace(place, apiKey);
        if (coords) setBaseCoords(coords);
      } catch (e) {
        console.error("Geocode (signup) failed", e);
      }
    })();
  }, [userLocation, geoAllowed]);

  const passesLocationFilter = async (ev: EventItem): Promise<boolean> => {
    if (!ev?.Venue) return false;

    // (A) If event has ", ST" and matches base state, accept
    const evState = parseStateFromPlace(ev.Venue);
    if (baseState && evState && evState === baseState) return true;

    // (B) else if we have coordinates, include within radius
    if (baseCoords) {
      try {
        const evCoords = await geocodePlace(ev.Venue, apiKey);
        if (evCoords) {
          const d = haversineMiles(baseCoords, evCoords);
          return d <= ACTIVE_RADIUS_MI;
        }
      } catch (e) {
        // ignore errors, just fail the radius check
      }
    }

    return false;
  };

  const fetchData = async () => {
    if (!profileId) return;

    try {
      const response = await fetch(`/api/user/sweeping/user?id=${profileId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const { user: advertiserData } = await response.json();

      if (advertiserData) {
        setUserLocation(advertiserData?.Location);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

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

  const handleCityChange = async (_: any, v: any) => {
    if (v?.City) {
      const place = String(v.City);
      setBasePlace(place);
      setBaseState(parseStateFromPlace(place));
      try {
        const coords = await geocodePlace(place, apiKey);
        setBaseCoords(coords || null);
      } catch (e) {
        console.error("Geocode (picker) failed", e);
        setBaseCoords(null);
      }
      setViewType("list");
    } else {
      if (!geoAllowed && userLocation) {
        const place = String(userLocation);
        setBasePlace(place);
        setBaseState(parseStateFromPlace(place));
        try {
          const coords = await geocodePlace(place, apiKey);
          setBaseCoords(coords || null);
        } catch {
          setBaseCoords(null);
        }
      }
    }
  };

  const handleSearch = (val: string) => {
    setSearchText(val);
    const v = val.toLowerCase().trim();
    if (!v) {
      setSortedEvents([...baseSorted]);
      return;
    }
    const filtered = baseSorted.filter(
      (e) =>
        e.Name?.toLowerCase().includes(v) ||
        e.Venue?.toLowerCase().includes(v) ||
        e.Description?.toLowerCase().includes(v)
    );
    setSortedEvents(filtered);
  };

  const getLocationName = async (lat: number, lng: number) => {
    const apiKey = "AIzaSyDv-b2OlvhI1HmMyfHoSEwHkKpPkKlX4vc";
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const data = await res.json();
      return data.status === "OK" && data.results.length > 0
        ? data.results[0].formatted_address
        : "Unknown Location";
    } catch (e) {
      console.error("Error fetching location name:", e);
      return "Unknown Location";
    }
  };

  const sendLocationToAPI = async (payload: {
    profileId: string | number;
    locationName: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const res = await fetch("/api/user/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        console.error("Error sending location:", (await res.json())?.message);
    } catch (e) {
      console.error("Error sending location to API:", e);
    }
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

  if (loading) return <Loader />;

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
              if (e?.type === "change" || e?.type === "click") setCityInput(v);
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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday
                            sx={{ color: alpha("#fff", 0.5), fontSize: 16 }}
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
                    processedEvents[dateKey(selectedDate)].length === 0) && (
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
                {(tabValue === "upcoming" ? monthUpcoming : monthPast).length >
                0 ? (
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
                    <EmptyState
                      title={
                        !hasBaseLocation
                          ? "See nearby events"
                          : !monthHasAnyEvents
                          ? `No ${
                              tabValue === "upcoming" ? "Upcoming" : "Past"
                            } events in ${currentDate.toLocaleString(
                              "default",
                              { month: "long", year: "numeric" }
                            )}`
                          : !monthHasNearbyEvents
                          ? "No events near you this month"
                          : "No events found"
                      }
                      subtitle={
                        !hasBaseLocation
                          ? geoPermission === "prompt"
                            ? "Turn on your location to find events around you, or search by state."
                            : geoPermission === "denied"
                            ? "Location is blocked. Allow location in your browser settings, or search by state."
                            : "Set a location or search by state to get started."
                          : !monthHasNearbyEvents
                          ? "Try expanding your radius, searching by keywords, or picking another month."
                          : "Try another month or adjust your filters."
                      }
                      showEnableLocation={
                        !hasBaseLocation &&
                        (geoPermission === "prompt" ||
                          geoPermission === "denied")
                      }
                      onEnableLocation={requestLocation}
                      onSearchFocus={() => {
                        // focus the search box or open your state autocomplete
                        const el = document.querySelector<HTMLInputElement>(
                          'input[placeholder="Search events..."]'
                        );
                        el?.focus();
                      }}
                      showWidenRadius={hasBaseLocation && !monthHasNearbyEvents}
                    />
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
