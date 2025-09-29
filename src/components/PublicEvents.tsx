import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  useMediaQuery,
  Stack,
  Tabs,
  Tab,
  Drawer,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Chip,
  Avatar,
} from "@mui/material";
import Loader from "@/commonPage/Loader";
import {
  FilterList as FilterListIcon,
  Close as CloseIcon,
  CalendarMonth,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PublicEventsDesktop from "./PublicEventsDesktop";

type EventItem = {
  Id: string | number;
  Name: string;
  Category?: string;
  StartTime: string;
  Venue?: string;
  Description?: string;
  CoverImageUrl?: string;
};

const sameMonth = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const PublicEvents: React.FC = () => {
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const [currentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [tabValue, setTabValue] = useState<"upcoming" | "past">("upcoming");
  const [sortedEvents, setSortedEvents] = useState<EventItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const now = useMemo(() => new Date(), []);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/events/publicEvents");
        const data = await res.json();
        const list = data?.events;
        setSortedEvents(list || []);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submitLead = async (eventId?: string | number) => {
    if (!leadEmail || !/\S+@\S+\.\S+/.test(leadEmail)) {
      alert("Please enter a valid email.");
      return;
    }
    setLeadSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail,
          source: "events-seo",
          eventId: eventId || null,
        }),
      });
      alert(
        "Thanks — we saved your spot! Check your email to complete signup."
      );
      setLeadEmail("");
      router.push("/register");
    } catch (e) {
      console.error(e);
      alert("Something went wrong — please try again.");
    } finally {
      setLeadSubmitting(false);
      setOpenEvent(null);
    }
  };

  const ldJson = {
    "@context": "https://schema.org",
    "@graph": (upcomingEvents.slice(0, 5) || []).map((ev) => ({
      "@type": "Event",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || ""}/events/${ev.Id}`,
      name: ev.Name,
      startDate: new Date(ev.StartTime).toISOString(),
      location: ev.Venue || { "@type": "Place", name: "Online / Venue TBA" },
      description: ev.Description || "",
      image:
        ev.CoverImageUrl ||
        `${
          process.env.NEXT_PUBLIC_SITE_URL || ""
        }/images/event-placeholder-mobile.jpg`,
      eventStatus: "https://schema.org/EventScheduled",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/events/detail/${ev.Id}`,
      performer: { "@type": "PerformingGroup", name: ev.Category || "Event" },
    })),
  };

  if (loading) return <Loader />;

  const parseSafeDate = (dateLike?: string | null) => {
    if (!dateLike) return null;
    const d = new Date(dateLike);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateShort = (dateStr?: string | null) => {
    const d = parseSafeDate(dateStr);
    if (!d) return "TBA";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  return (
    <>
      {/* SEO head + JSON-LD */}
      <Head>
        <title>Events · Discover local events near you — [YourSiteName]</title>
        <meta
          name="description"
          content="Discover local events and RSVP. Create a free account to save events, get reminders, and unlock exclusive content."
        />
        <meta name="robots" content="index,follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </Head>

      <Box
        sx={{
          bgcolor: "#0A0A0A",
          mt: 2,
          color: "white",
          background: "linear-gradient(to bottom,#0A0A0A,#1A1A1A)",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, pb: { xs: 8 } }}>
          {isMobile ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                  px: { xs: 0.5, sm: 0 },
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

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{
                    mt: { xs: 1, sm: 0 },
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => router.push("/register")}
                    aria-label="Create account"
                    sx={{
                      textTransform: "none",
                      bgcolor: "#f50057",
                      px: { xs: 2, sm: 2.5 },
                      py: { xs: 1, sm: 0.8 },
                      fontWeight: 700,
                      width: { xs: "100%", sm: "auto" },
                      boxShadow: {
                        xs: "none",
                        sm: "0 6px 16px rgba(245,0,87,0.18)",
                      },
                      "&:hover": { bgcolor: "#ff2d78" },
                    }}
                  >
                    Create account
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  px: 1,
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
                  onClick={() => setDrawerOpen(true)}
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
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                  sx: {
                    bgcolor: "#1a1a1a",
                    color: "white",
                    maxHeight: "100vh",
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
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
                      onClick={() => setDrawerOpen(false)}
                      sx={{ color: "white" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.12)", my: 1 }} />
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => {
                      setTabValue(newValue);
                      setDrawerOpen(false);
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
                  {/* Add more filters here: city, category, free/paid, online/local */}
                </Box>
              </Drawer>

              {/* Event List */}
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    maxHeight: { xs: "unset", sm: "60vh" },
                    overflowY: { xs: "visible", sm: "auto" },
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
                        const isCurrentMonth = sameMonth(
                          eventDate,
                          currentDate
                        );

                        return (
                          <Card
                            key={post.Id}
                            data-event-id={post.Id}
                            ref={isCurrentMonth ? currentMonthRef : null}
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
                              />
                            </Box>

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

                              {/* Right-aligned action button (drop-in replacement) */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                  mt: 1.5,
                                }}
                              >
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenEvent(post);
                                  }}
                                  variant="contained"
                                  aria-label={`Details for ${post.Name}`}
                                  sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    minWidth: { xs: 92, sm: 110 },
                                    px: { xs: 1.5, sm: 2.5 },
                                    py: { xs: 0.9, sm: 0.7 },
                                    borderRadius: 2.5,
                                    bgcolor: "#ffffff",
                                    color: "rgb(245, 0, 87)",
                                    "&:hover": {
                                      bgcolor: "rgba(255,255,255,0.9)",
                                    },
                                    width: { xs: "100%", sm: "auto" },
                                  }}
                                >
                                  Details
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        py: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="rgba(255,255,255,0.7)">
                        No events yet. Check back soon or create an account to
                        get notified.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>

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
          ) : (
            <PublicEventsDesktop />
          )}
        </Container>
      </Box>
    </>
  );
};

export default PublicEvents;
