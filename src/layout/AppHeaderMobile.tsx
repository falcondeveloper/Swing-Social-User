"use client";

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Home,
  Users,
  MessageCircle,
  Heart,
  Menu,
  X,
  LogOut,
  Bell,
  Calendar,
} from "lucide-react";

const AppHeaderMobile = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("loginInfo");
    const pid = localStorage.getItem("logged_in_profile");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setProfileId(decoded.profileId || pid);
    } catch {
      localStorage.clear();
      router.replace("/login");
    }
  }, []);

  useEffect(() => {
    if (!profileId) return;

    fetch(`/api/user/sweeping/user?id=${profileId}`)
      .then((res) => res.json())
      .then(({ user }) => {
        setAvatar(user?.Avatar || null);
        setUserName(user?.Username || "");
      })
      .catch(console.error);
  }, [profileId]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  if (!isMobile) return null;

  const navItems = [
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
    },
    { icon: Heart, label: "Matches", path: "/matches" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Calendar, label: "Events", path: "/events" },
    {
      icon: "/images/dollar_img.png",
      label: "Earn $$ for Referrals!",
      path: "/earn-money-referrals",
    },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 0.5, py: 1 }}>
          <IconButton onClick={() => setMobileMenuOpen(true)}>
            <Menu color="#FF1B6B" size={25} />
          </IconButton>

          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ height: 34, cursor: "pointer" }}
            onClick={() => router.push("/home")}
          />

          <IconButton onClick={() => router.push("/profile")}>
            <Avatar
              src={avatar || undefined}
              sx={{
                width: 36,
                height: 36,
                border: "2px solid #FF1B6B",
                borderRadius: "10px",
              }}
            >
              {!avatar && userName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "rgba(16,16,16,0.95)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          },
        }}
      >
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography sx={{ color: "#FF1B6B", fontWeight: 600 }}>
                SwingSocial
              </Typography>
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <X color="white" size={20} />
              </IconButton>
            </Box>

            <Box
              sx={{ display: "flex", gap: 2, cursor: "pointer" }}
              onClick={() => {
                router.push("/profile");
                setMobileMenuOpen(false);
              }}
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
                <Typography color="white" fontWeight={600}>
                  {userName}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.6)">
                  View Profile
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, py: 2 }}>
            <List sx={{ px: 2 }}>
              {navItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <ListItem
                    key={item.label}
                    onClick={() => {
                      router.push(item.path);
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      cursor: "pointer",
                      bgcolor: isActive
                        ? "linear-gradient(135deg,#FF1B6B,#FF6FA5)"
                        : "transparent",
                      "&:hover": {
                        bgcolor: isActive
                          ? "linear-gradient(135deg,#FF1B6B,#FF6FA5)"
                          : "rgba(255,27,107,0.15)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {typeof item.icon === "string" ? (
                        <img src={item.icon} width={20} height={20} />
                      ) : (
                        <item.icon
                          size={20}
                          color={isActive ? "#fff" : "#FF6FA5"}
                        />
                      )}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        color: isActive ? "#fff" : "#FFD1E1",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Box sx={{ p: 3, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <ListItem
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: "rgba(244,67,54,0.08)",
                "&:hover": { bgcolor: "rgba(244,67,54,0.15)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogOut size={18} color="#F44336" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  color: "#F44336",
                  fontWeight: 600,
                }}
              />
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ height: 68 }} />
    </>
  );
};

export default AppHeaderMobile;
