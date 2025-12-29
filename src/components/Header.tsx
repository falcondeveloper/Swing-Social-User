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
  useMediaQuery,
  Chip,
  Skeleton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
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
  CheckCheck,
  Trash2,
  Sliders,
} from "lucide-react";
import NotificationModalPrompt from "./NotificationModalPrompt";
import { motion, AnimatePresence } from "framer-motion";

const drawerMotion = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 28,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};


const Header = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [avatar, setAvatar] = useState<string | null>(null);

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
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] =
    useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!profileId) return;

    setNotificationsLoading(true);

    try {
      const response = await fetch(
        `/api/user/notification/notifications-list?profileId=${profileId}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setNotificationCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchNotifications();
    }
  }, [profileId]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("loginInfo");
    const storedId = localStorage.getItem("logged_in_profile");
    if (storedId) setProfileId(storedId);

    if (!token) {
      router.push("/login");
      return;
    }

    if (token) {
      try {
        const decodeToken = jwtDecode<any>(token);

        if (decodeToken.profileId) {
          setProfileId(decodeToken.profileId);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("loginInfo");
        router.push("/login");
        return;
      }
    }

    checkNotificationPermission();
  }, []);


  const resetNewMessage = () => {
    setNewMessage(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("isNewMessage", "false");
    }
  };

  const handleNotificationClick = () => {
    setNotificationDrawerOpen(true);
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

  // Logout function
  const handleLogout = () => {
    router.push("/login");
    localStorage.clear();
  };

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
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      badge: notificationCount > 0,
    },
    { icon: Calendar, label: "Events", path: "/events" },
    {
      icon: "/images/dollar_img.png",
      label: "Earn $$ for Referrals!",
      path: "/earn-money-referrals",
    },
  ];

  const fetchData = async () => {
    if (!profileId) return;

    try {
      const response = await fetch(`/api/user/sweeping/user?id=${profileId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const { user: advertiserData } = await response.json();

      if (advertiserData) {
        setAdvertiser(advertiserData);
        setAvatar(advertiserData?.Avatar);
        setUserName(advertiserData?.Username);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notif: { id: string; is_read: boolean }
  ) => {
    e.stopPropagation();

    try {
      await fetch(`/api/user/notification/notifications-list?id=${notif.id}`, {
        method: "DELETE",
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));

      if (!notif.is_read) {
        setNotificationCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClickOpen = async (notif: {
    id: string;
    is_read: boolean;
    url?: string;
  }) => {
    try {
      if (!notif.is_read) {
        await fetch("/api/user/notification/notifications-list", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationIds: [notif.id],
          }),
        });

        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );

        setNotificationCount((prev) => Math.max(0, prev - 1));
      }

      if (notif.url) {
        router.push(notif.url);
      }
      setNotificationDrawerOpen(false);
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!profileId || notifications.length === 0) return;

    try {
      const response = await fetch(
        "/api/user/notification/notifications-list",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            markAllAsRead: true,
          }),
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (notificationDrawerOpen) {
      fetchNotifications();
    }
  }, [notificationDrawerOpen]);

  return (
    <>
      <NotificationModalPrompt />
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
                onClick={() => router.push("/profile")}
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
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : null}
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
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  onClick={() => router.push("/profile")}
                >
                  <Avatar
                    src={avatar || undefined}
                    sx={{
                      width: 48,
                      height: 48,
                      border: "2px solid #FF1B6B",
                    }}
                  >
                    {!avatar && userName?.charAt(0)}
                  </Avatar>

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
                  {mobileNavItems.map((item) => {
                    const isActive =
                      typeof window !== "undefined" &&
                      window.location.pathname === item.path;

                    return (
                      <ListItem
                        key={item.label}
                        onClick={() => {
                          if (item.label === "Notifications") {
                            setMobileMenuOpen(false);
                            handleNotificationClick();
                            return;
                          }
                          if (item.label === "Messaging") {
                            resetNewMessage();
                          }

                          router.push(item.path);
                          setMobileMenuOpen(false);
                        }}
                        sx={{
                          borderRadius: "14px",
                          mb: 0.5,
                          cursor: "pointer",
                          background: isActive
                            ? "linear-gradient(135deg, #FF1B6B, #FF6FA5)"
                            : "transparent",
                          "&:hover": {
                            background: isActive
                              ? "linear-gradient(135deg, #FF1B6B, #FF6FA5)"
                              : "rgba(255, 27, 107, 0.15)",
                          },
                          transition: "all 0.25s ease",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box
                            sx={{
                              position: "relative",
                              color: isActive ? "#fff" : "#FF6FA5",
                            }}
                          >
                            {typeof item.icon === "string" && item.icon ? (
                              <img
                                src={item.icon}
                                alt={item.label}
                                width={20}
                                height={20}
                              />
                            ) : typeof item.icon !== "string" ? (
                              <item.icon size={20} />
                            ) : null}
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
                                  boxShadow: "0 0 6px rgba(255, 27, 107, 0.9)",
                                  animation: "pulse 1.8s infinite",
                                }}
                              />
                            )}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            color: isActive ? "#FFFFFF" : "#FFD1E1",
                            fontWeight: isActive ? 700 : 500,
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
        <>
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
                                "50%": {
                                  transform: "scale(1.3)",
                                  opacity: 0.7,
                                },
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
                  onClick={handleNotificationClick}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    position: "relative",
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
                  {notificationCount > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        minWidth: 18,
                        height: 18,
                        bgcolor: "#FF1B6B",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "white",
                        border: "2px solid rgba(18, 18, 18, 0.9)",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Box>
                  )}
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
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        style={{
                          objectFit: "cover",
                          borderRadius: "10px",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>
        </>
      )}

      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 420,
            bgcolor: "rgba(14,14,14,0.98)",
            backdropFilter: "blur(18px)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          },
        }}
      >
        <AnimatePresence mode="wait">
          {notificationDrawerOpen && (
            <motion.div
              variants={drawerMotion}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* ================= HEADER ================= */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  bgcolor: "rgba(14,14,14,0.95)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  {notificationCount > 0 && (
                    <Chip
                      label={notificationCount}
                      size="small"
                      sx={{
                        bgcolor: "#FF1B6B",
                        color: "#fff",
                        fontWeight: 600,
                        height: 20,
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  {/* Preferences */}
                  <IconButton
                    onClick={() => router.push("/notifications")}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "#FF1B6B",
                        bgcolor: "rgba(255,27,107,0.12)",
                      },
                    }}
                  >
                    <Sliders size={18} />
                  </IconButton>

                  {/* Close */}
                  <IconButton
                    onClick={() => setNotificationDrawerOpen(false)}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "#FF1B6B",
                        bgcolor: "rgba(255,27,107,0.12)",
                      },
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </Box>
              </Box>

              {/* ================= ACTION BAR ================= */}
              {notifications.length > 0 && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<CheckCheck size={16} />}
                    onClick={handleMarkAllRead}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#FF1B6B",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: "rgba(255,27,107,0.12)",
                      },
                    }}
                  >
                    Mark all as read
                  </Button>
                </Box>
              )}

              {/* ================= LIST ================= */}
              <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
                {/* 🔹 Skeleton Loader */}
                {notificationsLoading && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <Skeleton width="40%" height={16} />
                        <Skeleton width="100%" height={14} />
                        <Skeleton width="70%" height={14} />
                      </Box>
                    ))}
                  </>
                )}

                {/* 🔹 Empty State */}
                {!notificationsLoading && notifications.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 10 }}>
                    <Bell size={44} color="rgba(255,255,255,0.25)" />
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", mt: 2 }}>
                      You're all caught up
                    </Typography>
                  </Box>
                )}

                {/* 🔹 Notification Items */}
                {!notificationsLoading &&
                  notifications.map((notif) => (
                    <Box
                      key={notif.id}
                      onClick={() => handleNotificationClickOpen(notif)}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        position: "relative",
                        bgcolor: notif.is_read
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(255,27,107,0.08)",
                        border: notif.is_read
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "1px solid rgba(255,27,107,0.25)",
                        "&:hover": {
                          bgcolor: "rgba(255,27,107,0.12)",
                        },
                      }}
                    >
                      {!notif.is_read && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#FF1B6B",
                          }}
                        />
                      )}

                      <Typography
                        sx={{ color: "#fff", fontWeight: 600, mb: 0.5 }}
                      >
                        {notif.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {notif.body}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteNotification(e, notif)}
                          sx={{
                            color: "rgba(255,255,255,0.4)",
                            "&:hover": {
                              color: "#F44336",
                              bgcolor: "rgba(244,67,54,0.12)",
                            },
                          }}
                        >
                          <Trash2 size={22} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      {/* Spacer to push content below fixed header */}
      {(() => {
        const pathsWithoutSpacer = ["/members", "/messaging"];
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        return (
          !pathsWithoutSpacer.includes(currentPath) && (
            <Box sx={{ height: isMobile ? "60.8px" : "90.5px" }} />
          )
        );
      })()}
    </>
  );
};

export default Header;
