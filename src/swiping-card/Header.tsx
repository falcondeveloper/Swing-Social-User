"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Home,
  Users,
  MessageCircle,
  Heart,
  Menu,
  Calendar,
  LogOut,
  X,
} from "lucide-react";

const SOCKET_URL = "https://api.nomolive.com/";
const LS_KEYS = {
  LOGIN_INFO: "loginInfo",
  LOGGED_IN_PROFILE: "logged_in_profile",
  NEW_MESSAGE: "isNewMessage",
} as const;

interface MobileNavItem {
  icon: string | React.ComponentType<any>;
  label: string;
  path: string;
  badge?: boolean;
}

let socket: Socket | null = null;
const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ["websocket"] });
  }
  return socket;
};

const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [profileId, setProfileId] = useState<string>("");
  const [isNewMessage, setIsNewMessage] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const mobileNavItems = useMemo<MobileNavItem[]>(
    () => [
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
      {
        icon: "/images/dollar_img.png",
        label: "Earn $$ for Referrals!",
        path: "/earn-money-referrals",
      },
    ],
    [isNewMessage]
  );

  const handleLogout = useCallback(() => {
    localStorage.clear();
    router.push("/login");
  }, [router]);

  const resetNewMessage = useCallback(() => {
    setIsNewMessage(false);
    localStorage.setItem(LS_KEYS.NEW_MESSAGE, "false");
  }, []);

  const handleNavClick = useCallback(
    (path: string, label: string) => {
      if (label === "Messaging") {
        resetNewMessage();
      }
      router.push(path);
      setDrawerOpen(false);
    },
    [router, resetNewMessage]
  );

  useEffect(() => {
    const newMessageFlag = localStorage.getItem(LS_KEYS.NEW_MESSAGE) === "true";
    setIsNewMessage(newMessageFlag);

    const token = localStorage.getItem(LS_KEYS.LOGIN_INFO);
    const storedId = localStorage.getItem(LS_KEYS.LOGGED_IN_PROFILE);

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const { profileId: decodedId } = jwtDecode<{ profileId: string }>(token);
      if (decodedId) {
        setProfileId(decodedId);
      } else if (storedId) {
        setProfileId(storedId);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!profileId) return;

      try {
        const response = await fetch(`/api/user/sweeping/user?id=${profileId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const { user } = await response.json();
        if (user) {
          setAvatar(user.Avatar || "");
          setUserName(user.Username || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [profileId]);

  useEffect(() => {
    const socketInstance = getSocket();

    const handleMessage = (message: any) => {
      const profileId = localStorage.getItem(LS_KEYS.LOGGED_IN_PROFILE);
      if (message?.from === profileId || message?.to === profileId) {
        setIsNewMessage(true);
        localStorage.setItem(LS_KEYS.NEW_MESSAGE, "true");
      }
    };

    socketInstance.on("message", handleMessage);
    socketInstance.on("error", (error) =>
      console.error("WebSocket error:", error)
    );

    return () => {
      socketInstance.off("message", handleMessage);
      socketInstance.off("error");
    };
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "denied") {
    } else if (Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  const renderIcon = useCallback((item: MobileNavItem, isActive: boolean) => {
    if (typeof item.icon === "string") {
      return (
        <img
          src={item.icon}
          alt={item.label}
          width={20}
          height={20}
          style={{
            filter: isActive ? "none" : "brightness(0.8)",
          }}
        />
      );
    }
    const IconComponent = item.icon;
    return (
      <IconComponent
        size={20}
        color={isActive ? "#FF1B6B" : "rgba(255, 255, 255, 0.7)"}
      />
    );
  }, []);

  const renderNavItem = useCallback(
    (item: MobileNavItem) => {
      const isActive = pathname === item.path;
      const isMessaging = item.label === "Messaging";

      return (
        <ListItem
          key={item.label}
          onClick={() => handleNavClick(item.path, item.label)}
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
            position: "relative",
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, position: "relative" }}>
            {renderIcon(item, isActive)}
            {item.badge && isMessaging && (
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
                }}
              />
            )}
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
    },
    [pathname, handleNavClick, renderIcon]
  );

  return (
    <>
      {/* Mobile Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          bgcolor: "transparent",
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 60,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: "#FF1B6B",
              width: 44,
              height: 44,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,27,107,0.1)",
                transform: "scale(1.05)",
              },
            }}
          >
            <Menu size={24} />
          </IconButton>

          <Box
            onClick={() => router.push("/home")}
            sx={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="/logo.png"
              alt="SwingSocial"
              width={120}
              height={32}
              priority
              style={{ objectFit: "contain" }}
            />
          </Box>

          <Box
            onClick={() => router.push("/profile")}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              overflow: "hidden",
              border: "2px solid #FF1B6B",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 4px 15px rgba(255,27,107,0.3)",
              },
            }}
          >
            <Avatar
              src={avatar || undefined}
              sx={{ width: "100%", height: "100%" }}
            >
              {!avatar && userName?.charAt(0)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            background: "rgba(16,16,16,0.95)",
            backdropFilter: "blur(20px)",
            color: "white",
          },
        }}
      >
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Drawer Header */}
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
                onClick={() => setDrawerOpen(false)}
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

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
              onClick={() => router.push("/profile")}
            >
              <Avatar
                src={avatar}
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
                  {userName || "User"}
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

          {/* Navigation */}
          <Box sx={{ flex: 1, py: 2, overflowY: "auto" }}>
            <List sx={{ px: 2 }}>{mobileNavItems.map(renderNavItem)}</List>
          </Box>

          {/* Logout */}
          <Box sx={{ p: 3, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
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
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
