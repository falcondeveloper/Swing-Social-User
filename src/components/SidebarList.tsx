import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import EventIcon from "@mui/icons-material/Event";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useRouter } from "next/navigation";

interface SidebarListItem {
  label: string;
  route: string;
  icon: React.ReactNode;
}

const SidebarList: React.FC = () => {
  const router = useRouter();

  const sidebarItems: SidebarListItem[] = [
    { label: "What's Hot", route: "/whatshot", icon: <WhatshotIcon /> },
    { label: "Events", route: "/events", icon: <EventIcon /> },
    {
      label: "Travel",
      route: "https://swingsocial.co/travel/",
      icon: <TravelExploreIcon />,
    },
    {
      label: "Learn",
      route: "https://swingsocial.co/blog/",
      icon: <MenuBookIcon />,
    },
    { label: "Marketplace", route: "/marketplace", icon: <StorefrontIcon /> },
  ];

  const handleNavigation = (route: string) => {
    if (route.startsWith("http")) {
      window.open(route, "_blank");
    } else {
      router.push(route);
    }
  };

  return (
    <Box
      sx={{
        overflowX: { xs: "auto", sm: "visible" },
        whiteSpace: { xs: "nowrap", sm: "normal" },
        bgcolor: "#1a1a1a",
        px: 1,
        py: 1,
        borderRadius: 2,
      }}
    >
      <List
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          gap: 1,
          padding: 0,
        }}
      >
        {sidebarItems.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={() => handleNavigation(item.route)}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              minWidth: { xs: "max-content", sm: "100%" },
              bgcolor: "#2d2d2d",
              borderRadius: 2,
              cursor: "pointer",
              px: 2,
              py: 1,
              whiteSpace: "nowrap",
              transition: "background 0.2s",
              "&:hover": {
                bgcolor: "#3a3a3a",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "white",
                minWidth: 32,
                mr: 1,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: {
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default SidebarList;
