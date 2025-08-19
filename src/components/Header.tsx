import {
  Box,
  AppBar,
  Toolbar,
  useTheme,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode properly
import { useIsMobile } from "@/hooks/useResponsive";
import {
  Home,
  Users,
  MessageCircle,
  Heart,
  Menu,
  Search,
  Bell,
  X,
  LogOut,
  Calendar,
} from "lucide-react";

const socket = io("https://api.nomolive.com/");

const Header = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [avatar, setAvatar] = useState<string>("");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [advertiser, setAdvertiser] = useState<any>([]);
  const [isNewMessage, setNewMessage] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isNewMessage") === "true";
    }
    return false;
  });
  const [profileId, setProfileId] = useState<any>();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("loginInfo");
    if (token) {
      try {
        const decodeToken = jwtDecode<any>(token);
        setAvatar(decodeToken?.avatar || "");
        setUserName(decodeToken?.profileName || "User");
      } catch (error) {
        console.error("Invalid token:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    socket.on("connect", () => {});
    socket.on("disconnect", () => {});
    socket.on("message", (message) => {
      const profileid = localStorage.getItem("logged_in_profile");
      if (message?.from === profileid || message?.to === profileid) {
        setNewMessage(true);
        localStorage.setItem("isNewMessage", "true");
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("error");
    };
  }, []);

  const resetNewMessage = () => {
    setNewMessage(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("isNewMessage", "false");
    }
  };

  const checkNotificationPermission = () => {
    if (!("Notification" in window)) {
      return;
    }

    switch (Notification.permission) {
      case "granted":
        break;

      case "denied":
        setNotificationModalOpen(true);
        break;

      case "default":
        Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") {
            } else if (permission === "denied") {
              setNotificationModalOpen(true);
            }
          })
          .catch((error) => {
            console.error("Error requesting notification permission:", error);
          });
        break;

      default:
        console.error(
          "Unknown notification permission state:",
          Notification.permission
        );
    }
  };

  // Close notification settings modal
  const handleCloseNotificationModal = () => {
    setNotificationModalOpen(false);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("loginInfo");
    localStorage.removeItem("logged_in_profile");
    localStorage.removeItem("email");
    localStorage.removeItem("userName");
    localStorage.removeItem("password");
    router.push("/login");
    localStorage.clear();
  };

  // Mobile navigation items
  const mobileNavItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Members", path: "/members" },
    {
      icon: "/661764-removebg-preview.png",
      label: "PineApple",
      path: "/pineapple",
    },
    {
      icon: MessageCircle,
      label: "Messaging",
      path: "/messaging",
      badge: isNewMessage,
    },
    { icon: Heart, label: "Matches", path: "/matches" },
    { icon: Calendar, label: "Events", path: "/events" },
  ];

  useEffect(() => {
    setProfileId(localStorage.getItem("logged_in_profile"));
  }, [profileId]);

  const fetchData = async () => {
    if (!profileId) return;

    try {
      const response = await fetch(`/api/user/sweeping/user?id=${profileId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const { user: advertiserData } = await response.json();

      if (advertiserData) {
        setAdvertiser(advertiserData);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  return (
    <>
      {/* <NotificationModalPrompt /> */}
      {isMobile ? (
        <>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              zIndex: 1200,
              bgcolor: "transparent",
            }}
          >
            <Toolbar sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
              {/* Hamburger Menu */}
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  color: "#FF1B6B",
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 27, 107, 0.1)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Menu size={24} />
              </IconButton>

              {/* Logo */}
              <Box
                component="img"
                src="/logo.png"
                alt="Logo"
                onClick={() => router.push("/home")}
                sx={{
                  height: 35,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />

              {/* Profile Avatar */}
              <Box
                onClick={() => router.push("/profile/")}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "2px solid #FF1B6B",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 15px rgba(255, 27, 107, 0.3)",
                  },
                }}
              >
                {/* <img
                  src={avatar || advertiser?.Avatar}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                /> */}
                <Avatar
                  src={avatar || advertiser?.Avatar}
                  alt="Profile"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Toolbar>
          </AppBar>

          {/* Modern Mobile Drawer */}
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            PaperProps={{
              sx: {
                width: 280,
                background: "rgba(16, 16, 16, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderLeft: "none",
              },
            }}
          >
            <Box
              sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#FF1B6B", fontWeight: 600 }}
                  >
                    SwingSocial
                  </Typography>
                  <IconButton
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      width: 36,
                      height: 36,
                      "&:hover": {
                        color: "#FF1B6B",
                        backgroundColor: "rgba(255, 27, 107, 0.1)",
                      },
                    }}
                  >
                    <X size={20} />
                  </IconButton>
                </Box>

                {/* User Info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={avatar || advertiser?.Avatar}
                    sx={{
                      width: 48,
                      height: 48,
                      border: "2px solid #FF1B6B",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#FFFFFF", fontWeight: 600 }}
                    >
                      {userName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      View Profile
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Navigation Items */}
              <Box sx={{ flex: 1, py: 2 }}>
                <List sx={{ px: 2 }}>
                  {mobileNavItems.map((item, index) => {
                    const isImage = typeof item.icon === "string";
                    const Icon = item.icon;
                    const isActive =
                      typeof window !== "undefined" &&
                      window.location.pathname === item.path;

                    return (
                      <ListItem
                        key={item.label}
                        onClick={() => {
                          router.push(item.path);
                          if (item.label === "Messaging") {
                            resetNewMessage();
                          }
                          setMobileMenuOpen(false);
                        }}
                        sx={{
                          borderRadius: "12px",
                          mb: 1,
                          cursor: "pointer",
                          backgroundColor: isActive
                            ? "rgba(255, 27, 107, 0.1)"
                            : "transparent",
                          border: isActive
                            ? "1px solid rgba(255, 27, 107, 0.2)"
                            : "1px solid transparent",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 27, 107, 0.05)",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box sx={{ position: "relative" }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {typeof item.icon === "string" ? (
                                <img
                                  src={item.icon}
                                  alt={item.label}
                                  width={20}
                                  height={20}
                                  style={{
                                    filter: isActive
                                      ? "none"
                                      : "brightness(0.8)",
                                  }}
                                />
                              ) : (
                                <item.icon
                                  size={20}
                                  color={
                                    isActive
                                      ? "#FF1B6B"
                                      : "rgba(255, 255, 255, 0.7)"
                                  }
                                />
                              )}
                            </ListItemIcon>

                            {item.badge && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: -4,
                                  right: -4,
                                  width: 8,
                                  height: 8,
                                  bgcolor: "#FF1B6B",
                                  borderRadius: "50%",
                                  animation: "pulse 2s infinite",
                                  "@keyframes pulse": {
                                    "0%": { transform: "scale(1)", opacity: 1 },
                                    "50%": {
                                      transform: "scale(1.3)",
                                      opacity: 0.7,
                                    },
                                    "100%": {
                                      transform: "scale(1)",
                                      opacity: 1,
                                    },
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            color: isActive ? "#FF1B6B" : "#FFFFFF",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: "15px",
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>

              {/* Bottom Actions */}
              <Box
                sx={{ p: 3, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <ListItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid rgba(244, 67, 54, 0.2)",
                    backgroundColor: "rgba(244, 67, 54, 0.05)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LogOut size={20} color="#F44336" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      color: "#F44336",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  />
                </ListItem>
              </Box>
            </Box>
          </Drawer>
        </>
      ) : (
        // Header for Desktop
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: isScrolled ? "rgba(18, 18, 18, 0.9)" : "transparent",
            backdropFilter: isScrolled ? "blur(10px)" : "none",
            boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Toolbar sx={{ minHeight: "80px !important", px: 4, py: 2 }}>
            {/* Logo Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                "&:hover img": {
                  transform: "scale(1.05)",
                  filter: "drop-shadow(0 4px 20px rgba(255, 27, 107, 0.3))",
                },
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  height: 44,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/home")}
              />
            </Box>

            {/* Center Navigation */}
            <Box
              sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  padding: "5px 0",
                }}
              >
                {/* Navigation Items */}
                {[
                  { icon: Home, label: "Home", path: "/home" },
                  { icon: Users, label: "Members", path: "/members" },
                  {
                    icon: "/661764-removebg-preview.png",
                    label: "PineApple",
                    path: "/pineapple",
                  },
                  {
                    icon: MessageCircle,
                    label: "Messaging",
                    path: "/messaging",
                    badge: isNewMessage,
                  },
                  { icon: Heart, label: "Matches", path: "/matches" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  const isActive =
                    typeof window !== "undefined" &&
                    window.location.pathname === item.path;

                  return (
                    <Box key={item.label} sx={{ position: "relative" }}>
                      {item.badge && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            bgcolor: "#FF1B6B",
                            borderRadius: "50%",
                            zIndex: 2,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                              "0%": { transform: "scale(1)", opacity: 1 },
                              "50%": { transform: "scale(1.3)", opacity: 0.7 },
                              "100%": { transform: "scale(1)", opacity: 1 },
                            },
                          }}
                        />
                      )}
                      <Button
                        startIcon={
                          typeof Icon === "string" ? (
                            <img
                              src={Icon}
                              alt={item.label}
                              style={{
                                width: 22,
                                height: 22,
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Icon size={18} />
                          )
                        }
                        variant="text"
                        sx={{
                          color: isActive
                            ? "#FF1B6B"
                            : "rgba(255, 255, 255, 0.7)",
                          fontWeight: isActive ? "600" : "500",
                          borderRadius: "16px",
                          px: 3,
                          py: 1.5,
                          minWidth: "auto",
                          textTransform: "none",
                          fontSize: "14px",
                          position: "relative",
                          background: isActive
                            ? "rgba(255, 27, 107, 0.1)"
                            : "transparent",
                          "&:hover": {
                            color: "#FF1B6B",
                            background: "rgba(255, 27, 107, 0.05)",
                            transform: "translateY(-2px)",
                            "& .MuiButton-startIcon": {
                              transform: "scale(1.1) rotate(5deg)",
                            },
                          },
                          "&:active": {
                            transform: "translateY(0)",
                          },
                          "& .MuiButton-startIcon": {
                            marginRight: "8px",
                            transition:
                              "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          },
                          transition:
                            "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          "&::after": isActive
                            ? {
                                content: '""',
                                position: "absolute",
                                bottom: -8,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#FF1B6B",
                                boxShadow: "0 0 12px rgba(255, 27, 107, 0.6)",
                              }
                            : {},
                        }}
                        onClick={() => {
                          router.push(item.path);
                          if (item.label === "Messaging") {
                            resetNewMessage();
                          }
                        }}
                      >
                        {item.label}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Right Section - User Actions */}
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              {/* Search Button */}
              <IconButton
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  "&:hover": {
                    color: "#FF1B6B",
                    backgroundColor: "rgba(255, 27, 107, 0.05)",
                    transform: "translateY(-2px) scale(1.05)",
                    "& svg": {
                      transform: "rotate(90deg)",
                    },
                  },
                  "& svg": {
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  },
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <Search size={20} />
              </IconButton>

              {/* Notifications Button */}
              <IconButton
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  "&:hover": {
                    color: "#FF1B6B",
                    backgroundColor: "rgba(255, 27, 107, 0.05)",
                    transform: "translateY(-2px) scale(1.05)",
                    "& svg": {
                      animation: "ring 0.5s ease-in-out",
                    },
                  },
                  "@keyframes ring": {
                    "0%": { transform: "rotate(0)" },
                    "25%": { transform: "rotate(-10deg)" },
                    "75%": { transform: "rotate(10deg)" },
                    "100%": { transform: "rotate(0)" },
                  },
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <Bell size={20} />
              </IconButton>

              {/* User Avatar */}
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  border: "2px solid transparent",
                  background:
                    "linear-gradient(135deg, rgba(255, 27, 107, 0.1), rgba(194, 24, 91, 0.1))",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&:hover": {
                    transform: "translateY(-2px) scale(1.05)",
                    boxShadow: "0 8px 25px rgba(255, 27, 107, 0.25)",
                    "&::before": {
                      opacity: 1,
                    },
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: "linear-gradient(135deg, #FF1B6B, #c2185b)",
                    borderRadius: "14px",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    zIndex: -1,
                  },
                }}
                onClick={() => router.push("/profile")}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={avatar || advertiser?.Avatar}
                    alt="Avatar"
                    style={{
                      objectFit: "cover",
                      borderRadius: "10px",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Spacer to push content below fixed header */}
      {(() => {
        const pathsWithoutSpacer = ["/members", "/messaging"];
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        return (
          !pathsWithoutSpacer.includes(currentPath) && (
            <Box sx={{ height: isMobile ? "64px" : "90.5px" }} />
          )
        );
      })()}
    </>
  );
};

export default Header;
