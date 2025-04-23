"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Chip,
    Avatar,
    Card,
    CardContent,
    Paper,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip,
    Fade,
    Divider,
    Table,
    TableRow,
    TableBody,
    TableCell,
    FormControlLabel,
    Checkbox,
    BottomNavigation,
    BottomNavigationAction
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
    Edit as EditIcon,
    Logout as LogoutIcon,
    LocationOn as LocationIcon,
    Style as StyleIcon,
    Info as InfoIcon,
    CameraAlt as CameraIcon,
    Details as DetailsIcon,
} from "@mui/icons-material";

import Diversity1Icon from '@mui/icons-material/Diversity1';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Edit, PersonPinCircle } from "@mui/icons-material";

export default function Profile() {
    const [loading, setLoading] = useState(true); // Tracks loading state
    const [customProfile, setCustomProfile] = useState<any>(null);
    const [privateImages, setPrivateImages] = useState<any>([]);
    const [profileImages, setProfileImages] = useState<any>([]);
    const [advertiser, setAdvertiser] = useState<any>({});
    const [enableNotifications, setEnableNotifications] = useState(false);
    const [bottomNav, setBottomNav] = useState(); // Bottom navigation state
    const [profileId, setProfileId] = useState<any>(); // Animation direction

    const router = useRouter();
    const theme = useTheme();
    //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

    const fetchData = async (userId: string) => {
        if (userId) {
            console.log(userId, "======userId in view");
            setLoading(true);
            try {
                const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
                if (!response.ok) {
                    console.error("Failed to fetch advertiser data:", response.statusText);
                    setCustomProfile(undefined);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const { user: advertiserData } = await response.json();
                if (!advertiserData) {
                    console.error("Advertiser not found");
                    setCustomProfile(undefined);
                } else {
                    console.log(advertiserData, "=========advertiser data");
                    setAdvertiser(advertiserData);
                }
            } catch (error: any) {
                console.error("Error fetching data:", error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGetProfileImages = async (userid: string) => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/sweeping/images/profile?id=' + userid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const checkData = await checkResponse.json();
            setProfileImages(checkData?.images)

        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleGetPrivateImages = async (userid: string) => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/sweeping/images?id=' + userid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const checkData = await checkResponse.json();
            setPrivateImages(checkData?.images)

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);

    useEffect(() => {
        if (profileId) {
            fetchData(profileId);enableNotifications
            handleGetProfileImages(profileId);
            handleGetPrivateImages(profileId);
        }
    }, [profileId]);

    return (
        <>
            {
                isMobile ? (
                    <Box sx={{
                        position: "relative", background: "#000", padding: {
                            xs: 2, // Small padding for mobile screens
                            sm: 3, // Slightly larger padding for tablets
                            md: 4, // Medium padding for laptops
                            lg: 30, // Larger padding for desktops
                        },
                    }}>
                        {/* Banner Section */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between", // Ensure buttons are spaced apart
                                alignItems: "center",           // Align buttons vertically
                                borderRadius: 2,
                                marginBottom: "10px",
                            }}
                        >
                            <Button
                                onClick={() => router.push('/membership')}
                                variant="contained"
                                sx={{
                                    width: "130px",             // Fixed width for Logout button
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "grey",   // Background color
                                    color: "white",
                                    borderRadius: 1,
                                    padding: 1,
                                }}
                            >
                                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Logout</span>
                            </Button>

                            <Button
                                onClick={() => router.push('/profile/edit')}
                                sx={{
                                    width: "150px",            // Fixed width for Edit button
                                    display: "flex",
                                    alignItems: "right",      // Align the icon properly
                                    justifyContent: "right",  // Center the icon in the button
                                    color: "white",
                                    borderRadius: 1,
                                    padding: 1,
                                }}
                            >
                                <Edit />
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 1, // Reduce gap between boxes
                                borderRadius: 2,
                                marginBottom: "10px"
                            }}
                        >
                            {/* Pink Buttons */}
                            <Button
                                onClick={() => router.push('/membership')}
                                variant="contained"
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#e91e63", // Pink color
                                    color: "white",
                                    borderRadius: 1,
                                    padding: 1,
                                    minWidth: "80px",
                                }}
                            >
                                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Billing</span>
                            </Button>

                            <Button
                                onClick={() => router.push('/prefrences')}
                                variant="contained"
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#e91e63", // Pink color
                                    color: "white",
                                    borderRadius: 1,
                                    padding: 1,
                                    minWidth: "80px",
                                }}
                            >
                                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Prefernces</span>
                            </Button>

                            <Button
                                variant="contained"
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#e91e63", // Pink color
                                    color: "white",
                                    borderRadius: 1,
                                    padding: 1,
                                    minWidth: "80px",
                                }}
                            >
                                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Available</span>
                            </Button>
                        </Box>


                        <Box
                            sx={{
                                height: 200,
                                backgroundImage: `url(${advertiser?.ProfileBanner})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        ></Box>

                        {/* Avatar and Basic Info */}
                        <Box sx={{ position: "relative", mt: -8, px: 3 }}>
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <Avatar
                                    src={advertiser?.Avatar}
                                    alt="user-avatar"
                                    sx={{
                                        width: 128,
                                        height: 128,
                                        border: "4px solid white",
                                        boxShadow: 2,
                                    }}
                                />
                                <Box>
                                    <Chip
                                        label={advertiser?.AccountType}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Content Section */}
                        <CardContent>
                            <Typography
                                color="white"
                                variant="h5"
                                sx={{ fontWeight: "bold", marginLeft: "15px", marginBottom: "10px" }}
                            >
                                {/* {advertiser?.Username + " , " + advertiser?.Age} */}
                                <span>
                                    {advertiser?.Username + " , " +
                                        (new Date().getFullYear() - new Date(advertiser?.DateOfBirth).getFullYear() -
                                            (new Date() < new Date(new Date().getFullYear(), new Date(advertiser?.DateOfBirth).getMonth(), new Date(advertiser?.DateOfBirth).getDate()) ? 1 : 0))}
                                </span>
                            </Typography>
                            <Typography sx={{ color: "white", marginTop: '20px' }}>Tagline</Typography>
                            <Typography
                                variant="subtitle1"
                                color="white"
                                sx={{ background: "#272525", padding: "15px", borderRadius: "10px", marginTop: "5px" }}
                            >
                                {advertiser?.Tagline}
                            </Typography>
                            <Typography sx={{ color: "white", marginTop: '20px' }}>Your city</Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ color: "#9c27b0", marginLeft: "15px", marginTop: "5px" }}
                            >
                                {advertiser?.Location}
                            </Typography>
                            <Typography sx={{ color: "white", marginTop: "20px" }}>Swing Style</Typography>
                            <Box
                                sx={{
                                    display: "flex", // Display items in a row
                                    flexWrap: "wrap", // Allow wrapping if the content overflows
                                    gap: 1, // Space between items
                                    padding: 1, // Padding inside the container                        
                                    borderRadius: "8px", // Rounded corners
                                    marginLeft: "15px", // Align with other content
                                    marginTop: "5px", // Space above
                                }}
                            >
                                {advertiser?.SwingStyleTags?.length > 0 ? (
                                    advertiser.SwingStyleTags.map((tag: string, index: number) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                padding: "5px 10px", // Padding inside each location box
                                                backgroundColor: "#272727", // Slightly darker gray for contrast
                                                color: "white", // Text color
                                                borderRadius: "4px", // Rounded corners for each item
                                                fontSize: "14px", // Adjust font size
                                            }}
                                        >
                                            {tag}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography sx={{ color: "white" }}>No locations available</Typography>
                                )}
                            </Box>
                            <Typography variant="subtitle1" sx={{ marginTop: "15px" }} color="white">
                                <strong>About:</strong>{" "}
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: advertiser.About,
                                    }}
                                />
                            </Typography>
                            <Typography sx={{ color: "white", marginTop: '20px' }}>Account Type</Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ color: "white", marginTop: "5px" }}
                            >
                                {advertiser?.AccountType}
                            </Typography>

                            <Grid container spacing={3} mt={2}>
                                {/* Right Column */}
                                <Grid item xs={12} md={12}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" color="white">
                                            Details
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Table sx={{ borderRadius: 4 }}>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            backgroundColor: "lightgray",
                                                            width: "30%",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="white">
                                                            Body Type:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                        <Typography color="white">
                                                            {advertiser?.BodyType || "N/A"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            backgroundColor: "lightgray",
                                                            width: "30%",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="white">
                                                            Hair Color:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                        <Typography color="white">
                                                            {advertiser?.HairColor || "N/A"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            backgroundColor: "lightgray",
                                                            width: "30%",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="white">
                                                            Eye Color:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                        <Typography color="white">
                                                            {advertiser?.EyeColor || "N/A"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            backgroundColor: "lightgray",
                                                            width: "30%",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="white">
                                                            Miles:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                        <Typography color="white">
                                                            {advertiser?.miles?.toFixed(2) || "N/A"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Profile Photos */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: 2,
                                    color: "white",
                                    borderRadius: 2,
                                    gap: 2,
                                    width: "100%",
                                    overflowX: "auto", // Allow horizontal scrolling if needed
                                }}
                            >
                                <Typography
                                    sx={{
                                        marginTop: 2,
                                        color: "white",
                                        textAlign: "center",
                                        marginBottom: 2,
                                    }}
                                >
                                    Update Checked Public Images (Available to Everyone)
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center", // Center images horizontally
                                        alignItems: "center", // Center images vertically
                                        gap: {
                                            xs: 2, // Smallest screens: image width is 10px
                                            sm: 3, // Small screens: image width is 50px
                                            md: 3, // Medium screens: image width is 75px
                                            lg: 7, // Large screens: image width is 100px
                                        },
                                        width: "100%",
                                        flexWrap: "nowrap", // Prevent wrapping
                                        overflowX: "auto", // Enable horizontal scrolling for smaller screens
                                    }}
                                >
                                    {Array.from({ length: Math.max(5, profileImages?.length || 0) }).map((_, index) => {
                                        const image = profileImages?.[index];
                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    flexShrink: 0, // Prevent images from shrinking when scrolling
                                                    width: {
                                                        xs: "40px", // Smallest screens: image width is 10px
                                                        sm: "50px", // Small screens: image width is 50px
                                                        md: "75px", // Medium screens: image width is 75px
                                                        lg: "200px", // Large screens: image width is 100px
                                                    },
                                                    height: {
                                                        xs: "40px", // Smallest screens: image height is 10px
                                                        sm: "50px", // Small screens: image height is 50px
                                                        md: "75px", // Medium screens: image height is 75px
                                                        lg: "200px", // Large screens: image height is 100px
                                                    },
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                                                }}
                                            >
                                                <img
                                                    src={image?.Url || "./photocamera.png"}
                                                    alt={`Profile Photo ${index + 1}`}
                                                    style={{
                                                        width: "100%", // Make image take the full width of its container
                                                        height: "100%", // Make image take the full height of its container
                                                        objectFit: "cover", // Ensure image maintains aspect ratio and fills its container
                                                        display: "block", // Fix inline spacing issues
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>

                            <hr />

                            {/* Profile Photos */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: 2,
                                    color: "white",
                                    borderRadius: 2,
                                    gap: 2,
                                    width: "100%",
                                    overflowX: "auto", // Allow horizontal scrolling if needed
                                }}
                            >
                                <Typography
                                    sx={{
                                        marginTop: 2,
                                        color: "white",
                                        textAlign: "center",
                                        marginBottom: 2,
                                    }}
                                >
                                    Update Checked Private Images (Only for those you authorize)
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center", // Center images horizontally
                                        alignItems: "center", // Center images vertically
                                        gap: {
                                            xs: 2, // Smallest screens: image width is 10px
                                            sm: 3, // Small screens: image width is 50px
                                            md: 3, // Medium screens: image width is 75px
                                            lg: 7, // Large screens: image width is 100px
                                        },
                                        width: "100%",
                                        flexWrap: "nowrap", // Prevent wrapping
                                        overflowX: "auto", // Enable horizontal scrolling for smaller screens
                                    }}
                                >
                                    {Array.from({ length: Math.max(5, privateImages?.length || 0) }).map((_, index) => {
                                        const image = privateImages?.[index];
                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    flexShrink: 0, // Prevent images from shrinking when scrolling
                                                    width: {
                                                        xs: "40px", // Smallest screens: image width is 10px
                                                        sm: "50px", // Small screens: image width is 50px
                                                        md: "75px", // Medium screens: image width is 75px
                                                        lg: "200px", // Large screens: image width is 100px
                                                    },
                                                    height: {
                                                        xs: "40px", // Smallest screens: image height is 10px
                                                        sm: "50px", // Small screens: image height is 50px
                                                        md: "75px", // Medium screens: image height is 75px
                                                        lg: "200px", // Large screens: image height is 100px
                                                    },
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                                                }}
                                            >
                                                <img
                                                    src={image?.Url || "./photocamera.png"}
                                                    alt={`Profile Photo ${index + 1}`}
                                                    style={{
                                                        width: "100%", // Make image take the full width of its container
                                                        height: "100%", // Make image take the full height of its container
                                                        objectFit: "cover", // Ensure image maintains aspect ratio and fills its container
                                                        display: "block", // Fix inline spacing issues
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>

                            {/* Enable Notifications & Delete Account */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    padding: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={enableNotifications}
                                            onChange={(e) => setEnableNotifications(e.target.checked)}
                                            sx={{ color: "pink" }}
                                        />
                                    }
                                    label="Enable notifications"
                                />

                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#e91e63", // Pink color
                                        color: "white",
                                        fontWeight: "bold",
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        marginBottom: "15px"
                                    }}
                                >
                                    Delete Account
                                </Button>
                            </Box>
                        </CardContent>

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
                                label="Home"
                                icon={<img src="/icons/home.png" alt="Home" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                                sx={{
                                    color: "#c2185b",
                                    transition: "transform 0.3s ease-in-out",
                                    "&:hover": { transform: "translateY(-10px)" },
                                }}
                            />
                            <BottomNavigationAction
                                label="Members"
                                icon={<img src="/icons/members.png" alt="Members" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                                sx={{
                                    color: "#c2185b",
                                    transition: "transform 0.3s ease-in-out",
                                    "&:hover": { transform: "translateY(-10px)" },
                                }}
                                onClick={() => router.push("/members")} // Navigate to /members when clicked
                            />
                            <BottomNavigationAction
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
                                icon={<img src="/icons/messaging.png" alt="Messaging" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                                sx={{
                                    color: "#c2185b",
                                    transition: "transform 0.3s ease-in-out",
                                    "&:hover": { transform: "translateY(-10px)" },
                                }}
                            />
                            <BottomNavigationAction
                                label="Matches"
                                icon={<img src="/icons/matches.png" alt="Matches" style={{ width: 40, height: 60, paddingTop: 15 }} />}
                                sx={{
                                    color: "#c2185b",
                                    transition: "transform 0.3s ease-in-out",
                                    "&:hover": { transform: "translateY(-10px)" },
                                }}
                            />
                        </BottomNavigation>
                    </Box >
                ) : (
                    <>
                        <Box sx={{
                            bgcolor: "#0a0a0a",
                            minHeight: "100vh",
                            pb: 8,
                            mt: 12,
                            position: "relative"
                        }}>
                            {/* Header */}
                            <Header />
                            <Paper
                                elevation={0}
                                sx={{
                                    background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                                    position: "fixed",
                                    top: 60,
                                    left: 0,
                                    right: 0,
                                    zIndex: 10,
                                    borderRadius: 0
                                }}
                            >
                                <Container maxWidth="xl">
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 2
                                    }}>
                                        <Tooltip title="Go to home" placement="bottom">
                                            <IconButton
                                                onClick={() => router.push('/home')}
                                                sx={{ color: "white" }}
                                            >
                                                <LogoutIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Profile" placement="bottom">
                                            <IconButton
                                                onClick={() => router.push('/profile/edit')}
                                                sx={{ color: "white" }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Container>
                            </Paper>

                            <Container maxWidth="xl" sx={{ top: 60, position: "relative", zIndex: 2 }}>
                                {/* Profile Overview */}
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 2
                                }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => router.push('/membership')}
                                        sx={{
                                            bgcolor: "#e91e63",
                                            color: "white",
                                            flex: 1,
                                            "&:hover": { bgcolor: "#c2185b" }
                                        }}
                                    >
                                        Billing
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => router.push('/prefrences')}
                                        sx={{
                                            bgcolor: "#e91e63",
                                            color: "white",
                                            flex: 1,
                                            "&:hover": { bgcolor: "#c2185b" }
                                        }}
                                    >
                                        Prefernces
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: "#e91e63",
                                            color: "white",
                                            flex: 1,
                                            "&:hover": { bgcolor: "#c2185b" }
                                        }}
                                    >
                                        Available
                                    </Button>
                                </Box>
                                <Card sx={{
                                    bgcolor: "rgba(20,20,20,0.95)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: 4,
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    overflow: "visible",
                                    mb: 4,
                                    mt: 4
                                }}>
                                    <Box sx={{
                                        height: 200,
                                        position: "relative",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: "50%",
                                            background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,1) 100%)",
                                            zIndex: 1
                                        }
                                    }}>
                                        <Box
                                            component="img"
                                            src={advertiser?.ProfileBanner || "/default-banner.jpg"}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                backgroundPosition: "center",
                                                filter: "brightness(0.8)"
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ position: "relative", pt: 10 }}>
                                        {/* Avatar */}
                                        <Avatar
                                            src={advertiser?.Avatar}
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                border: "4px solid #0a0a0a",
                                                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                                                position: "absolute",
                                                top: -75,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                zIndex: 3
                                            }}
                                        />

                                        {/* Quick Actions */}
                                        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4, mt: 1 }}>
                                            <Grid item key={advertiser?.AccountType}>
                                                <Chip
                                                    label={advertiser?.AccountType}
                                                    sx={{
                                                        bgcolor: advertiser?.AccountType === "Man" ? "#2196f3" :
                                                            advertiser?.AccountType === "Female" ? "#e91e63" : "#4caf50",
                                                        color: "white",
                                                        fontWeight: "bold"
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        {/* Basic Info */}
                                        <Typography variant="h4" align="center" sx={{
                                            color: "white",
                                            fontWeight: "bold",
                                            mb: 1
                                        }}>
                                            {advertiser?.Username}, {(new Date().getFullYear() - new Date(advertiser?.DateOfBirth).getFullYear() -
                                                (new Date() < new Date(new Date().getFullYear(), new Date(advertiser?.DateOfBirth).getMonth(), new Date(advertiser?.DateOfBirth).getDate()) ? 1 : 0))}
                                        </Typography>

                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1,
                                            mb: 3
                                        }}>
                                            <LocationIcon sx={{ color: "#e91e63" }} />
                                            <Typography color="grey.400">
                                                {advertiser?.Location}
                                            </Typography>
                                        </Box>

                                        {/* About Section */}
                                        <Typography
                                            variant="h6"
                                            color="white"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mb: 1
                                            }}
                                        >
                                            <Diversity1Icon sx={{ color: "#e91e63" }} />
                                            Tagline
                                        </Typography>
                                        <Paper sx={{
                                            bgcolor: "rgba(255,255,255,0.05)",
                                            p: 3,
                                            borderRadius: 2,
                                            mb: 4
                                        }}>
                                            <Typography color="white" variant="body1" sx={{ lineHeight: 1.8 }}>
                                                {advertiser?.Tagline}
                                            </Typography>
                                        </Paper>

                                        {/* Swing Style Tags */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="h6"
                                                color="white"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    mb: 1
                                                }}
                                            >
                                                <StyleIcon sx={{ color: "#e91e63" }} />
                                                Swing Style
                                            </Typography>
                                            <Box sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 1
                                            }}>
                                                {advertiser?.SwingStyleTags?.map((tag: string, index: number) => (
                                                    <Chip
                                                        key={index}
                                                        label={tag}
                                                        sx={{
                                                            bgcolor: "rgba(255,255,255,0.05)",
                                                            color: "white",
                                                            '&:hover': {
                                                                bgcolor: "rgba(255,255,255,0.1)"
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="h6"
                                                color="white"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    mb: 1
                                                }}
                                            >
                                                <InfoIcon sx={{ color: "#e91e63" }} />
                                                About
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{ color: "white", marginTop: "5px" }}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: advertiser.About,
                                                    }}
                                                />
                                            </Typography>
                                        </Box>

                                        {/* Account Type */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="h6"
                                                color="white"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    mb: 1
                                                }}
                                            >
                                                <StyleIcon sx={{ color: "#e91e63" }} />
                                                Account Type
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{ color: "white", marginTop: "5px" }}
                                            >
                                                <Chip
                                                    label={advertiser?.AccountType}
                                                    sx={{
                                                        bgcolor: "rgba(255,255,255,0.05)",
                                                        color: "white",
                                                        '&:hover': {
                                                            bgcolor: "rgba(255,255,255,0.1)"
                                                        }
                                                    }}
                                                />
                                            </Typography>
                                        </Box>

                                        {/* Details Grid */}
                                        <Typography
                                            variant="h6"
                                            color="white"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mb: 1
                                            }}
                                        >
                                            <DetailsIcon sx={{ color: "#e91e63" }} />
                                            Details
                                        </Typography>
                                        <Grid container spacing={3} sx={{ mb: 4 }}>
                                            {[
                                                { label: "Body Type", value: advertiser?.BodyType },
                                                { label: "Hair Color", value: advertiser?.HairColor },
                                                { label: "Eye Color", value: advertiser?.EyeColor },
                                                { label: "Distance", value: `${advertiser?.miles?.toFixed(1)} miles` }
                                            ].map((detail) => (
                                                <Grid item xs={6} sm={3} key={detail.label}>
                                                    <Paper sx={{
                                                        bgcolor: "rgba(255,255,255,0.05)",
                                                        p: 2,
                                                        borderRadius: 2,
                                                        height: "100%"
                                                    }}>
                                                        <Typography color="grey.400" variant="body2" gutterBottom>
                                                            {detail.label}
                                                        </Typography>
                                                        <Typography color="white" variant="body1">
                                                            {detail.value || "N/A"}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Photos Sections */}
                                {[
                                    { title: "Update Checked Public Images (Available to Everyone)", images: profileImages },
                                    { title: "Update Checked Private Images (Only for those you authorize)", images: privateImages }
                                ].map((section) => (
                                    <Card key={section.title} sx={{
                                        bgcolor: "rgba(20,20,20,0.95)",
                                        borderRadius: 4,
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        mb: 4
                                    }}>
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                color="white"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    mb: 3
                                                }}
                                            >
                                                <CameraIcon sx={{ color: "#e91e63" }} />
                                                {section.title}
                                            </Typography>

                                            <Grid container spacing={2}>
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <Grid item xs={6} sm={4} md={2.4} key={index}>
                                                        <Fade in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                                                            <Paper sx={{
                                                                paddingTop: "100%",
                                                                position: "relative",
                                                                borderRadius: 2,
                                                                overflow: "hidden",
                                                                bgcolor: "rgba(255,255,255,0.05)",
                                                                transition: "transform 0.3s ease",
                                                                "&:hover": {
                                                                    transform: "scale(1.05)"
                                                                }
                                                            }}>
                                                                {section.images?.[index]?.Url ? (
                                                                    <Box
                                                                        component="img"
                                                                        src={section.images[index].Url}
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 0,
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover"
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Box sx={{
                                                                        position: "absolute",
                                                                        top: "50%",
                                                                        left: "50%",
                                                                        transform: "translate(-50%, -50%)"
                                                                    }}>
                                                                        <CameraIcon sx={{ color: "grey.600", fontSize: 40 }} />
                                                                    </Box>
                                                                )}
                                                            </Paper>
                                                        </Fade>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Delete Account Button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        bgcolor: "#e91e63",
                                        color: "white",
                                        py: 1.5,
                                        fontWeight: "bold",
                                        borderRadius: 2,
                                        mb: 9,
                                        "&:hover": {
                                            bgcolor: "#c2185b"
                                        }
                                    }}
                                >
                                    Delete Account
                                </Button>
                            </Container>
                        </Box>
                        <Footer />
                    </>
                )
            }
        </>
    );
}