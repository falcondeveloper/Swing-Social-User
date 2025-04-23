"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
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
    TextField,
} from "@mui/material";
import { ThumbUp, Comment, Flag, Add } from "@mui/icons-material"; // Import icons for like, comment, and flag
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarList from "@/components/SidebarList";
import Footer from "@/components/Footer";

export default function MatchesPage() {
    const router = useRouter();

    const [profiles, setProfiles] = useState<any>([]);
    const [profileId, setProfileId] = useState<any>(); // Animation direction
    const [currentMatch, setCurrentMatch] = useState<any>('Liked')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);
    useEffect(() => {
        if (profileId) {
            handleGetMatch(profileId, currentMatch);
        }
    }, [profileId, currentMatch]);
    const handleGetMatch = async (userid: any, match: any) => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch("/api/user/matches?id=" + userid + "&match=" + match, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await checkResponse.json();
            setProfiles(data?.profiles)

        } catch (error) {
            console.error('Error:', error);
        }
    };
    const [targetId, setTargetId] = useState<any>(null); // Animation direction

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const handleReportModalToggle = (pid: string) => {
        setTargetId(pid);
        setIsReportModalOpen((prev) => !prev);
    };

    const [reportOptions, setReportOptions] = useState({
        reportUser: false,
        blockUser: false,
    });

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

    const handlePostLike = async (postId: string) => {
        try {
            const response = await fetch('/api/user/whatshot/post/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: postId,
                    profileId: profileId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Comment submitted successfully:', data.message);
                // Optionally update UI or clear form fields here
            } else {
                console.error('Failed to submit comment:', data.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }

    const handleSelectMatch = (match: string) => {
        router.push(match);
    };
    const sidebarItems = [
        { label: "Liked", match: "Liked" },
        { label: "Maybe", match: "Maybe" },
        { label: "Likes Me", match: "LikesMe" },
        { label: "Friends", match: "Friends" },
        { label: "Denied", match: "Denied" },
        { label: "Online", match: "Online" },
        { label: "Search", match: "Search" },
        { label: "Blocked", match: "Blocked" },
    ];

    const [search, setSearch] = useState<any>(null);
    const [errors, setErrors] = useState<any>({ search: null });
    const handleSearch = () => {
        if (!search) {
            setErrors({ search: "Please input keywords" });
            return;
        }

        // Assuming `profiles` contains the data to filter
        const filteredProfiles = profiles.filter((profile: any) =>
            profile.Username.toLowerCase().includes(search.toLowerCase()) // Adjust 'name' to the appropriate key in your data
        );

        // Update the filtered profiles in the state
        setProfiles(filteredProfiles);

        // Clear any existing errors
        setErrors({});
    };

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />

            <Grid container sx={{ marginTop: 10 }}>

                {/* Left Column (col-2) */}
                <Grid item xs={1} sm={1} md={2} lg={2}>
                    <List>
                        {sidebarItems.map((item, index) => (
                            <ListItem
                                key={index}
                                onClick={() => setCurrentMatch(item.label)}
                                sx={{
                                    paddingTop: "0px",
                                    paddingBottom: "0px",
                                    paddingLeft: "0px",
                                    paddingRight: "0px",
                                    backgroundColor: "#2d2d2d",
                                    borderRadius: "4px",
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
                                        sx: { fontSize: "10px", textAlign: "center" },
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>


                {/* Right Column (col-10) */}
                <Grid
                    item
                    xs={11}
                    sm={11}
                    lg={10}
                    md={10}
                    sx={{
                        px: { xs: 0, sm: 0 }, // Remove horizontal padding for xs and sm breakpoints
                    }}

                >
                    <Card
                        sx={{
                            borderRadius: "10px",
                            backgroundColor: "#0a0a0a",
                            padding: "0px",
                            mx: { xs: 0, sm: 0 }, // Remove horizontal margin for xs and sm breakpoints
                        }}
                    >
                        <CardContent>

                            <Typography variant="h5" color="white" textAlign={"center"}>
                                {currentMatch}
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column", // Stack input+button and error vertically
                                    background: "#2d2d2d",
                                    padding: "5px",
                                    width: "100%", // Ensure consistent layout
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <TextField
                                        placeholder="Search Name..."
                                        fullWidth
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setErrors((prev: any) => ({ ...prev, search: "" })); // Clear error
                                        }}
                                        sx={{
                                            backgroundColor: "#1a1a1a", // Dark background for search box
                                            input: {
                                                color: "#fff", // White text color for input
                                                textAlign: "center",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: errors?.search ? "red" : "rgba(255, 255, 255, 0.23)", // Conditional border color
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: errors?.search ? "red" : "rgba(255, 255, 255, 0.5)", // Hover effect
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: errors?.search ? "red" : "#fff", // Focused state
                                                },
                                            },
                                        }}
                                        variant="outlined"
                                        inputProps={{
                                            style: {
                                                textAlign: "center",
                                            },
                                        }}
                                        error={Boolean(errors?.search)} // Show red border for validation error
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            textTransform: "none",
                                            backgroundColor: "#f50057",
                                            py: 1.5,
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            marginLeft: "10px", // Space between input and button
                                            "&:hover": {
                                                backgroundColor: "#c51162",
                                            },
                                        }}
                                    >
                                        Search
                                    </Button>
                                </Box>
                                {errors?.search && (
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{ mt: 1, textAlign: "left", width: "100%" }}
                                    >
                                        {errors?.search}
                                    </Typography>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    maxHeight: "700px", // Set max height for scroll
                                    overflowY: "auto", // Enable vertical scroll
                                    marginTop: "10px",
                                }}
                            >

                                {/* Post Card */}
                                {profiles.map((profile: any, index: number) => {
                                    return (
                                        <Card
                                            key={index}
                                            sx={{
                                                borderRadius: "10px",
                                                marginBottom: "20px",
                                                marginTop: "20px",
                                                backgroundColor: "#2d2d2d",
                                                mx: { xs: 0, sm: 0 }, // Remove horizontal margin for xs and sm breakpoints
                                            }}
                                        >
                                            <Box sx={{ padding: "10px", }}>
                                                <img
                                                    onClick={() => router.push('/pineapple/members/' + profile?.Id)}
                                                    src={profile?.Avatar}
                                                    alt="Post Image"
                                                    style={{
                                                        width: "100%",
                                                        borderTopLeftRadius: "10px",
                                                        borderTopRightRadius: "10px",
                                                    }}
                                                />

                                            </Box>
                                            <CardContent
                                                sx={{
                                                    padding: 0,
                                                    paddingBottom: { xs: 0, sm: 0, md: 0 },
                                                    "&:last-child": {
                                                        paddingBottom: 0,
                                                    },
                                                }}
                                            >

                                                <Grid container justifyContent="space-between">
                                                    <Grid item lg={8} md={8} sm={8} xs={8}>
                                                        <Box sx={{ pl: { xs: 1, sm: 2 } }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    color: '#e91e63',
                                                                    fontWeight: 600,
                                                                    mb: 0.5,
                                                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                                                }}
                                                            >
                                                                {profile.Username}
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5,
                                                                    mb: 0.5,
                                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                                }}
                                                            >
                                                                {profile?.DateOfBirth && (
                                                                    <>
                                                                        {new Date().getFullYear() - new Date(profile.DateOfBirth).getFullYear()}
                                                                        {profile?.Gender === "Male" ? "M" : profile?.Gender === "Female" ? "F" : ""}
                                                                    </>
                                                                )}
                                                                {profile?.PartnerDateOfBirth && (
                                                                    <>
                                                                        {" | "}
                                                                        {new Date().getFullYear() - new Date(profile.PartnerDateOfBirth).getFullYear()}
                                                                        {profile?.PartnerGender === "Male" ? "M" : profile?.PartnerGender === "Female" ? "F" : ""}
                                                                    </>
                                                                )}
                                                            </Typography>

                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    flexWrap: 'wrap',
                                                                    gap: { xs: 0.5, sm: 1 }
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5,
                                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                                    }}
                                                                >
                                                                    {profile.Location}
                                                                </Typography>
                                                                <Typography
                                                                    component="span"
                                                                    sx={{
                                                                        color: 'rgba(255, 255, 255, 0.5)',
                                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                                    }}
                                                                >
                                                                    • {profile.Distance}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    <Grid item lg={4} md={4} sm={4} xs={4} sx={{ textAlign: "right" }}>
                                                        <Box sx={{ display: 'inline-grid' }}>
                                                            <IconButton
                                                                sx={{ color: "white" }}
                                                                onClick={() => handleReportModalToggle(profile?.UserId)}
                                                            >
                                                                {currentMatch}
                                                            </IconButton>
                                                            <IconButton
                                                                sx={{ color: "#f50057" }}
                                                                onClick={() => handleReportModalToggle(profile?.UserId)}
                                                            >
                                                                <Flag />
                                                            </IconButton>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
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
            <Footer />
        </Box>
    );
}
