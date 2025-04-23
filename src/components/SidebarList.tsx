import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import { useRouter } from "next/navigation";

interface SidebarListItem {
    label: string;
    route: string;
}

interface SidebarListProps {
    items: SidebarListItem[];
}

const SidebarList: React.FC = () => {
    const router = useRouter();

    const handleNavigation = (route: string) => {
        router.push(route);
    };
    const sidebarItems = [
        { label: "What's Hot", route: "/whatshot" },
        { label: "Events", route: "/events" },
        { label: "Travel", route: "https://swingsocial.co/travel/" },
        { label: "Learn", route: "https://swingsocial.co/blog/" },
        { label: "Marketplace", route: "/marketplace" },
        { label: "Coming soon...", route: "/coming-soon" },
        { label: "Playdates", route: "/playdates" },
        { label: "Groups", route: "/groups" },
        
    ];
    return (
        <List sx={{ paddingTop: '20px', paddingBottom: '12px' }}>
            {sidebarItems.map((item, index) => (
                <ListItem
                    key={index}
                    onClick={() => handleNavigation(item.route)}
                    sx={{
                        paddingTop: "0px",
                        paddingBottom: "0px",
                        paddingLeft: "0px",
                        paddingRight: "0px",
                        backgroundColor: "#2d2d2d",
                        textAlign: "center",
                        marginBottom: "10px",
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: "#3a3a3a",
                        },
                    }}
                >
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            sx: { fontSize: "10px", textAlign: "center", color: "white" },
                        }}
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default SidebarList;
