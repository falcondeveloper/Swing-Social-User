import React, { useEffect, useMemo, useRef, useState } from "react";
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
  alpha,
  Tab,
  Drawer,
  IconButton,
  Divider,
} from "@mui/material";
import Loader from "@/commonPage/Loader";
import { CalendarMonth, ExpandMore } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PublicEventsDesktop from "./PublicEventsDesktop";
import { FilterList } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [tabValue, setTabValue] = useState<"upcoming" | "past">("upcoming");
  const [sortedEvents, setSortedEvents] = useState<EventItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleSearch = (val: string) => {};

  const handleCityChange = async (_: any, v: any) => {};

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
  }, [currentDate]);

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

                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />

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
                </Box>
              </Drawer>

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
                        const isCurrentMonth =
                          eventDate.getMonth() === currentDate.getMonth() &&
                          eventDate.getFullYear() === currentDate.getFullYear();

                        return (
                          <Card
                            key={post.Id}
                            data-event-id={post.Id}
                            ref={isCurrentMonth ? currentMonthRef : null}
                            // onClick={() =>
                            //   router.push("/events/detail/" + post?.Id)
                            // }
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
                    <></>
                  )}
                </Box>
              </CardContent>
            </>
          ) : (
            <>
              <PublicEventsDesktop />
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default PublicEvents;
