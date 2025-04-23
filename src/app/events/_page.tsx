"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import AddIcon from "@mui/icons-material/Add";

import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Modal,
    FormControlLabel,
    Checkbox,
    Stack,
} from "@mui/material";
import { ThumbUp, Comment, Flag, PostAddOutlined, CalendarMonth, Add } from "@mui/icons-material"; // Import icons for like, comment, and flag
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarList from "@/components/SidebarList";

export default function Events() {
    const router = useRouter();

    const [events, setEvents] = useState<any>([]);
    const [profileId, setProfileId] = useState<any>(); // Animation direction
    const [targetId, setTargetId] = useState<any>(null); // Animation direction
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportOptions, setReportOptions] = useState({
        reportUser: false,
        blockUser: false,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);

    useEffect(() => {
        if (profileId) {
            handleGetPosts(profileId);
        }
    }, [profileId]);

    const handleGetPosts = async (userid: any) => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/events?id=' + userid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const eventsData = await checkResponse.json();
            setEvents(eventsData?.events)

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReportModalToggle = (pid: string) => {
        setTargetId(pid);
        setIsReportModalOpen((prev) => !prev);
    };



    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setReportOptions((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleReportUser = async () => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/sweeping/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profileid: profileId, targetid: targetId }), // Pass the username to check
            });
            setIsReportModalOpen((prev) => !prev);
            const checkData = await checkResponse.json();

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReportSubmit = () => {
        console.log("Report Options:", reportOptions);
        setIsReportModalOpen(false);
        handleReportUser();
        // Add logic to handle report or block user action
    };

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />

            <Grid container spacing={0} sx={{ marginTop: 10 }}>
                {/* Left Column (col-2) */}
                <Grid item xs={3} sm={3} md={2} lg={2}>
                    <SidebarList />
                </Grid>

                {/* Right Column (col-10) */}
                <Grid item
                    xs={9}
                    sm={9}
                    lg={10}
                    md={10}
                    sx={{
                        px: { xs: 0, sm: 0 }, // Remove horizontal padding for xs and sm breakpoints
                    }}>
                    <Card sx={{ borderRadius: "10px", backgroundColor: "#0a0a0a", padding: "0px", paddingLeft: "5px", mx: { xs: 0, sm: 0 } }}>
                        <CardContent sx={{ padding: "5px" }}> {/* Set padding to 5px */}
                            <Typography variant="h5" color="white" textAlign={"center"}>
                                Events
                            </Typography>
                            {/* Create New Post Button */}
                            <Box>
                                <Stack direction="row" spacing={2} mt={1}>
                                    <Button
                                        onClick={() => router.push("/events/create")}
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Add />}
                                        sx={{
                                            width: "100%",
                                            textTransform: "none",
                                            backgroundColor: "#f50057",
                                            py: 1.5,
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            "&:hover": {
                                                backgroundColor: "#c51162",
                                            },
                                        }}
                                    >
                                        Create
                                    </Button>

                                    <Button
                                        onClick={() => router.push("/events/calendar")}
                                        variant="contained"
                                        color="primary"
                                        endIcon={<CalendarMonth />}
                                        sx={{
                                            width: "100%",
                                            textTransform: "none",
                                            backgroundColor: "#f50057",
                                            py: 1.5,
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            "&:hover": {
                                                backgroundColor: "#c51162",
                                            },
                                        }}
                                    >
                                        Calendar
                                    </Button>
                                </Stack>
                            </Box>
                            <Box
                                sx={{
                                    maxHeight: "700px", // Set max height for scroll
                                    overflowY: "auto", // Enable vertical scroll
                                    marginTop: "10px",
                                }}
                            >

                                {/* Post Card */}
                                {events.map((post: any, index: number) => {
                                    return (
                                        <Card
                                            onClick={() => router.push('/events/detail/' + post?.Id)}
                                            sx={{ borderRadius: "10px", marginBottom: "20px", marginTop: "20px", backgroundColor: "#f50057" }}
                                        >
                                            <Box sx={{ padding: 1, marginTop: "55px", backgroundColor: "#2d2d2d" }}>
                                                <img
                                                    onClick={() => router.push("/whatshot/post/detail/" + post?.Id)}
                                                    src={post?.CoverImageUrl} // Placeholder image for the post
                                                    alt="Post Image"
                                                    style={{ width: "100%", borderTopLeftRadius: "10px" }}
                                                />
                                            </Box>

                                            <CardContent sx={{
                                                background: "#f50057",
                                                color: "white",
                                                textAlign: "center",
                                                padding: "5px", // Ensure padding is also 5px here
                                            }}>
                                                <Typography variant="h6" component="div">
                                                    {post.Name}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" mt={1} style={{ color: "white" }}>
                                                    <strong style={{ color: "white" }}>Start at:</strong> {new Intl.DateTimeFormat('en-US', {
                                                        month: 'short',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    }).format(new Date(post.StartTime))}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            <Modal open={isReportModalOpen} onClose={handleReportModalToggle}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 300,
                        bgcolor: "#1e1e1e", // Dark background
                        color: "white", // Default text color for dark background
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Report or Block User
                    </Typography>
                    <FormControlLabel
                        sx={{
                            color: "white", // Label color
                            "& .MuiCheckbox-root": {
                                color: "#9c27b0", // Checkbox color
                            },
                            "& .MuiCheckbox-root.Mui-checked": {
                                color: "#9c27b0", // Checked checkbox color
                            },
                        }}
                        control={
                            <Checkbox
                                checked={reportOptions.reportUser}
                                onChange={handleCheckboxChange}
                                name="reportUser"
                            />
                        }
                        label="Report User"
                    />
                    <FormControlLabel
                        sx={{
                            color: "white", // Label color
                            "& .MuiCheckbox-root": {
                                color: "#9c27b0", // Checkbox color
                            },
                            "& .MuiCheckbox-root.Mui-checked": {
                                color: "#9c27b0", // Checked checkbox color
                            },
                        }}
                        control={
                            <Checkbox
                                checked={reportOptions.blockUser}
                                onChange={handleCheckboxChange}
                                name="blockUser"
                            />
                        }
                        label="Block User"
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handleReportSubmit} variant="contained" color="secondary">
                            Submit
                        </Button>
                        <Button style={{ marginLeft: 10 }} onClick={() => handleReportModalToggle("null")} variant="contained" color="secondary">
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Bottom Navigation Bar */}
            <UserBottomNavigation />
        </Box>
    );
}
