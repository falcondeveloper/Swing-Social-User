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
} from "@mui/material";
import { ThumbUp, Comment, Flag, Add } from "@mui/icons-material"; // Import icons for like, comment, and flag
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarList from "@/components/SidebarList";

export default function Whatshot() {
    const router = useRouter();

    const [posts, setPosts] = useState<any>([]);
    const [likesCount, setLikesCount] = useState(posts?.LikesCount || 0);
    const [hasLiked, setHasLiked] = useState(false); // Track if the user has liked the post
    const [profileId, setProfileId] = useState<any>(""); // Animation direction
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
        handleWhatshotPosts();
    }, [hasLiked]);

    const handleWhatshotPosts = async () => {
        try {

            console.log(localStorage.getItem('logged_in_profile'));
            const userid = localStorage.getItem('logged_in_profile');
            const checkResponse = await fetch('/api/user/whatshot?id=' + userid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const posts = await checkResponse.json();
            console.log(posts?.posts, "===========posts");
            setPosts(posts?.posts)

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
                body: JSON.stringify({ profileid: localStorage.getItem('logged_in_profile'), targetid: targetId }), // Pass the username to check
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

            if (hasLiked) {
                // If already liked, decrement the like count
                setLikesCount(parseInt(likesCount) - 1);
            } else {
                // If not liked yet, increment the like count
                setLikesCount(parseInt(likesCount) + 1);
            }

            setHasLiked(!hasLiked);

            console.log(postId);
            console.log(localStorage.getItem('logged_in_profile'));
            const response = await fetch('/api/user/whatshot/post/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: postId,
                    profileId: localStorage.getItem('logged_in_profile'),
                }),
            });

            const data = await response.json();

            console.log(data);

            if (data.likeExist)

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

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />

            <Grid container sx={{ marginTop: 10 }}>
                {/* Left Column (col-2) */}
                <Grid item xs={3} sm={3} md={2} lg={2}>
                    <SidebarList />
                </Grid>


                {/* Right Column (col-10) */}
                <Grid
                    item
                    xs={9}
                    sm={9}
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
                                What's Hot
                            </Typography>
                            {/* Create New Post Button */}
                            <Button
                                onClick={() => router.push("/whatshot/post/create")}
                                startIcon={<Add />}
                                variant="contained"
                                color="primary"
                                sx={{
                                    mt: 1,
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
                                Create New Post
                            </Button>

                            <Box
                                sx={{
                                    maxHeight: "700px", // Set max height for scroll
                                    overflowY: "auto", // Enable vertical scroll
                                    marginTop: "10px",
                                }}
                            >

                                {/* Post Card */}
                                {posts.map((post: any, index: number) => {
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
                                                    onClick={() => router.push("/whatshot/post/detail/" + post?.Id)}
                                                    src={post?.PhotoLink}
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
                                                {post?.ImageCaption ? (
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            marginBottom: "10px",
                                                            color: "#fff",
                                                            backgroundColor: "#f50057",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {post?.ImageCaption}
                                                    </Typography>
                                                ) : (
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            marginBottom: "10px",
                                                            color: "#fff",
                                                            backgroundColor: "#f50057",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        No Caption
                                                    </Typography>
                                                )}

                                                <Grid container justifyContent="space-between">
                                                    <Grid item lg={5} md={5} sm={5} xs={5}>
                                                        <Button
                                                            onClick={() => handlePostLike(post?.Id)}
                                                            fullWidth
                                                            variant="contained"
                                                            color="primary"
                                                            sx={{
                                                                textTransform: "none",
                                                                backgroundColor: "#f50057",
                                                                py: 1.5,
                                                                fontSize: "16px",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            Like {post?.LikesCount}
                                                        </Button>
                                                    </Grid>
                                                    <Grid item lg={5} md={5} sm={5} xs={5}>
                                                        <Button
                                                            onClick={() => router.push("/whatshot/post/detail/" + post?.Id)}
                                                            fullWidth
                                                            sx={{
                                                                color: "#fff",
                                                                backgroundColor: "transparent",
                                                                textTransform: "none",
                                                                py: 1.5,
                                                                fontSize: { lg: "16px", md: "16px", sm: 12, xs: 12 },
                                                                fontWeight: "bold",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                                },
                                                            }}
                                                        >
                                                            Comment {post?.CommentsCount}
                                                        </Button>
                                                    </Grid>
                                                    <Grid item lg={2} md={2} sm={2} xs={2} sx={{ textAlign: "right" }}>
                                                        <IconButton
                                                            sx={{ color: "#f50057" }}
                                                            onClick={() => handleReportModalToggle(post?.UserId)}
                                                        >
                                                            <Flag />
                                                        </IconButton>
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
            <UserBottomNavigation />
        </Box>
    );
}
