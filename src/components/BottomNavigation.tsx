import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";

export default function UserBottomNavigation(props: any) {
    const [bottomNav, setBottomNav] = useState(); // Bottom navigation state
    const router = useRouter();
    return (
        <BottomNavigation
            sx={{
                position: "fixed", // Keeps it fixed at the bottom
                bottom: 0, // Aligns it to the bottom
                left: 0,
                right: 0,
                zIndex: 10, // Keeps it above other elements
                width: "100%", // Full width to avoid content spilling
                maxWidth: "500px", // Optional: Limit the maximum width for large screens
                margin: "0 auto", // Centers it on larger screens
                bgcolor: "#1e1e1e", // Background color
                boxShadow: "0px -1px 5px rgba(0,0,0,0.5)", // Adds shadow for better visibility
                display: "flex",
                justifyContent: "space-around", // Evenly distributes the actions
                padding: "0 10px", // Padding for the content
                borderRadius: "30px 30px 0 0", // Rounded corners on the top
                "& .MuiBottomNavigationAction-root": {
                    minWidth: "auto", // Ensures no unnecessary width
                    padding: "6px 8px", // Makes items smaller
                },
            }}
            value={bottomNav}
            onChange={() => console.log("tab")}
        >
            <BottomNavigationAction
                onClick={() => router.push('/home')}
                label="Home"
                icon={<img src="/icons/home.png" alt="Home" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                sx={{
                    color: "#c2185b",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "translateY(-10px)" },
                }}
            />
            <BottomNavigationAction
                onClick={() => router.push('/members')}
                label="Members"
                icon={<img src="/icons/members.png" alt="Members" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                sx={{
                    color: "#c2185b",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "translateY(-10px)" },
                }}
            />
            <BottomNavigationAction
                onClick={() => router.push('/pineapple')}
                label="Pineapples"
                icon={<img src="/icons/pineapple.png" alt="Pineapples" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                sx={{
                    color: "#c2185b",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "translateY(-10px)" },
                }}
            />
            <BottomNavigationAction
                label="Messaging"
                onClick={() => router.push('/messaging')}
                icon={<img src="/icons/messaging.png" alt="Messaging" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                sx={{
                    color: "#c2185b",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "translateY(-10px)" },
                }}
            />
            <BottomNavigationAction
                label="Matches"
                onClick={() => router.push('/matches')}
                icon={<img src="/icons/matches.png" alt="Matches" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                sx={{
                    color: "#c2185b",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "translateY(-10px)" },
                }}
            />
        </BottomNavigation>
    );
}
