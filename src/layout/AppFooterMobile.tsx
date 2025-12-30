"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  alpha,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

const ACTIVE_COLOR = "#FF1B6B";

const AppFooterMobile = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    const handleReceive = () => {
      if (pathname !== "/messaging") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("chat:receive", handleReceive);

    if (pathname === "/messaging") {
      setUnreadCount(0);
    }

    return () => {
      socket.off("chat:receive", handleReceive);
    };
  }, [pathname]);

  if (!isMobile) return null;

  const navItems = [
    { label: "Home", path: "/home", icon: "/icons/home.png" },
    { label: "Members", path: "/members", icon: "/icons/members.png" },
    { label: "Pineapple", path: "/pineapple", icon: "/icons/pineapple.png" },
    { label: "Messaging", path: "/messaging", icon: "/icons/messaging.png" },
    { label: "Matches", path: "/matches", icon: "/icons/matches.png" },
  ];

  const currentIndex = navItems.findIndex((item) => pathname === item.path);

  return (
    <BottomNavigation
      value={currentIndex === -1 ? 0 : currentIndex}
      onChange={(_, newValue) => {
        router.push(navItems[newValue].path);
      }}
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        bgcolor: alpha("#121212", 0.92),
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        height: {
          xs: "calc(72px + env(safe-area-inset-bottom))",
          sm: "calc(72px + env(safe-area-inset-bottom))",
        },
        pb: "env(safe-area-inset-bottom)",
        "& .MuiBottomNavigationAction-root": {
          minWidth: 0,
          paddingTop: "8px",
          color: "rgba(255,255,255,0.45)",
        },
        "& .Mui-selected": {
          color: ACTIVE_COLOR,
        },
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const isMessaging = item.path === "/messaging";

        return (
          <BottomNavigationAction
            key={item.label}
            icon={
              <Badge
                color="error"
                overlap="circular"
                badgeContent={
                  isMessaging && unreadCount > 0 ? unreadCount : null
                }
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 10,
                    height: 18,
                    minWidth: 18,
                    top: 6,
                    right: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    background: isActive
                      ? "linear-gradient(135deg, #FF1B6B, #FF6FA5)"
                      : "transparent",
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    width={45}
                    height={35}
                  />
                </Box>
              </Badge>
            }
          />
        );
      })}
    </BottomNavigation>
  );
};

export default AppFooterMobile;
