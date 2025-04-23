"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    CircularProgress,
    Button,
    IconButton,
    BottomNavigation,
    BottomNavigationAction,
    FormControlLabel,
    Checkbox,
    Modal,
    Dialog,
    DialogTitle,
    DialogContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    alpha,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { Flag } from "@mui/icons-material";
import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
export interface DetailViewHandle {
    open: (id: string) => void;
}

export default function Home() {

    const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * 1000) + 1);
    const [userProfiles, setUserProfiles] = useState<any>([]); // User profiles fetched from API
    const [loading, setLoading] = useState(true); // Tracks loading state
    const [swipeDirection, setSwipeDirection] = useState<any>(null); // Animation direction
    const [showMatchPopup, setShowMatchPopup] = useState(false);
    const [showLimitPopup, setShowLimitPopup] = useState(false);
    const [showEndPopup, setShowEndPopup] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState<any>(null);
    const [swipeCount, setSwipeCount] = useState(0);
    console.log(swipeCount, "========swipeCount");
    const [dailyLimit, setDailyLimit] = useState(15);
    const [profileId, setProfileId] = useState<any>(); // Animation direction
    const [showDetail, setShowDetail] = useState<any>(false);
    const [selectedUserId, setSelectedUserId] = useState<any>(null);
    const [relationCategory, setRelationCategory] = useState(null);

    const router = useRouter();

    const handleClose = () => {
        setShowDetail(false);
        setSelectedUserId(null);
    }
    console.log(selectedUserId);
    const [bottomNav, setBottomNav] = useState(); // Bottom navigation state

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);
    useEffect(() => {
        if (profileId) {
            fetchData(profileId);
        }
    }, [profileId]);
    useEffect(() => {
        const getUserList = async () => {
            try {
                const response = await fetch("/api/user/sweeping?page=1&size=1000", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                console.log(profileId);
                setUserProfiles(data?.profiles || []);
            } catch (error) {
                console.error("Error fetching user profiles:", error);
            } finally {
                setLoading(false);
            }
        };
        getUserList();
    }, []);
    const handleUpdateCategoryRelation = async (category: any) => {
        try {
            // Check if the username exists
            console.log(profileId);
            console.log(userProfiles[currentIndex]?.Id)
            console.log(category)
            const checkResponse = await fetch('/api/user/sweeping/relation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pid: profileId, targetid: userProfiles[currentIndex]?.Id, newcategory: category }), // Pass the username to check
            });

            const checkData = await checkResponse.json();

        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleUpdateLikeMatch = async () => {
        try {
            const response = await fetch('/api/user/sweeping/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }), // Pass the username to check
            });

            const data = await response.json();

            if (data?.isMatch) {
                setMatchedProfile(userProfiles[currentIndex]);
                setShowMatchPopup(true);
            }

        } catch (error) {
            console.error('Error:', error);
        }
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
                body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }), // Pass the username to check
            });

            const checkData = await checkResponse.json();

        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleGrantAccess = async () => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/sweeping/grant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }), // Pass the username to check
            });

            const checkData = await checkResponse.json();

        } catch (error) {
            console.error('Error:', error);
        }
    };
    const [isSwiping, setIsSwiping] = useState(false);
    const [currentSwipeImage, setCurrentSwipeImage] = useState<string | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const handleSwipe = (direction: string) => {
        handleUpdateLikeMatch();
        // Update category relation based on direction
        if (direction === "left") {
            handleUpdateCategoryRelation("Denied");
        } else if (direction === "right") {
            handleUpdateCategoryRelation("Liked");
        } else if (direction === "down") {
            handleUpdateCategoryRelation("Maybe");
        }
    };





    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [showCustomProfile, setShowCustomProfile] = useState(true);
    const [customProfile, setCustomProfile] = useState<any>(null);
    const fetchData = async (userId: string) => {
        if (userId) {
            console.log(userId, "======userId in view");
            setLoading(true);
            try {
                // Fetch advertiser data using the custom API
                const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
                if (!response.ok) {
                    console.error('Failed to fetch advertiser data:', response.statusText);
                    setCustomProfile(undefined);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const { user: advertiserData } = await response.json();
                if (!advertiserData) {
                    console.error('Advertiser not found');
                    setCustomProfile(undefined);
                } else {
                    console.log(advertiserData, "=========advertiser data");
                    setCustomProfile(advertiserData);
                    setSwipeCount(advertiserData?.SwipeCount)
                    setDailyLimit(advertiserData?.SwipeMax)
                    if (parseInt(advertiserData?.SwipeCount) >= parseInt(advertiserData?.SwipeMax)) {
                        setShowEndPopup(true);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching data:', error.message);
            } finally {
                setLoading(false);
            }

        }
    };
    const [reportOptions, setReportOptions] = useState({
        reportUser: false,
        blockUser: false,
    });

    const handleReportModalToggle = () => {
        setIsReportModalOpen((prev) => !prev);
    };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setReportOptions((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleReportSubmit = () => {
        console.log("Report Options:", reportOptions);
        setIsReportModalOpen(false);
        handleReportUser();
        // Add logic to handle report or block user action
    };


    const [dynamicPosition, setDynmicPosition] = useState<any>("77%");
    const handleSwipeAction = (action: string) => {
        if (swipeCount >= dailyLimit) {
            setShowLimitPopup(true);
            return;
        }
        setCurrentIndex((prev) => (prev + 1) % userProfiles.length);
        handleUpdateLikeMatch();
        // Update category relation based on direction
        if (action === "deiend") {
            handleUpdateCategoryRelation("Denied");
        } else if (action === "like") {
            handleUpdateCategoryRelation("Liked");
        } else if (action === "maybe") {
            handleUpdateCategoryRelation("Maybe");
        }
    }
    const swipeHandlers = useSwipeable({
        onSwiping: (eventData) => {
            if (swipeCount >= dailyLimit) {
                setShowLimitPopup(true);
                return;
            }

            const offsetX = eventData.deltaX;
            const offsetY = eventData.deltaY;

            if (eventData.dir === "Down") {
                setSwipeOffset(offsetY);
            } else {
                setSwipeOffset(offsetX);
            }

            console.log(offsetY, offsetX, "Swiping...");
            setIsSwiping(true);
            setSwipeDirection(eventData.dir.toLowerCase());

            // Set dynamic position and swipe image based on direction
            switch (eventData.dir) {
                case "Left":
                    setDynmicPosition("77%");
                    setCurrentSwipeImage("delete.png");
                    break;
                case "Right":
                    setDynmicPosition("30%");
                    setCurrentSwipeImage("like.png");
                    break;
                case "Down":
                    setDynmicPosition("77%");
                    setCurrentSwipeImage("maybe.png");
                    break;
                default:
                    setCurrentSwipeImage(null);
                    break;
            }
        },
        onSwiped: (eventData) => {
            if (swipeCount >= dailyLimit) {
                setShowLimitPopup(true);
                return;
            }

            const direction = eventData.dir.toLowerCase();
            const isLeft = direction === "left" && Math.abs(eventData.deltaX) > 100;
            const isRight = direction === "right" && Math.abs(eventData.deltaX) > 100;
            const isDown = direction === "down" && Math.abs(eventData.deltaY) > 100;

            if (isLeft || isRight || isDown) {
                setSwipeCount((prev) => prev + 1);
                setSwipeOffset(0);
                setIsSwiping(false);
                setCurrentSwipeImage(null);

                // Handle swipe and move to the next profile
                handleSwipe(direction);
                setCurrentIndex((prev) => (prev + 1) % userProfiles.length);
            } else {
                // Reset states for incomplete swipes
                setIsSwiping(false);
                setSwipeOffset(0);
                setCurrentSwipeImage(null);
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    // Mouse event listeners for desktop
    // useEffect(() => {
    //     const handleMouseUp = () => {
    //         if (isSwiping) {
    //             setIsSwiping(false);
    //             setSwipeOffset(0);
    //             setCurrentSwipeImage(null);
    //         }
    //     };

    //     // Add event listener for mouseup
    //     window.addEventListener("mouseup", handleMouseUp);

    //     // Clean up listener on component unmount
    //     return () => {
    //         window.removeEventListener("mouseup", handleMouseUp);
    //     };
    // }, [isSwiping]);

    const handleChatAction = () => {
        toast.success('It is in Development mode');
    }

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center" // Centers horizontally
                alignItems="center" // Centers vertically
                height="100vh" // Full viewport height
                bgcolor="#121212" // Background color
            >
                <Box
                    component="img"
                    src="/loading.png"
                    alt="Logo"
                    sx={{
                        width: '50px', // Set a fixed width
                        height: 'auto', // Maintain aspect ratio
                        flexShrink: 0,
                    }}
                />
                <span style={{ color: '#C2185B', paddingLeft: '10px', fontSize: '32px' }}>SWINGSOCIAL</span>
            </Box >
        );
    }

    if (userProfiles.length === 0) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                bgcolor="#121212"
            >
                <Typography variant="h6" color="white">
                    Please wait...
                </Typography>
            </Box>
        );
    }

    return (
        <>

            <ToastContainer position="top-right" autoClose={3000} />

            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                position="relative"
                overflow="hidden"
                sx={{
                    width:{lg:514,md:514},
                    background:{lg:"#0a0a0a",md:"#0a0a0a"},
                    marginLeft:"auto",
                    marginRight:"auto"
                }}
                {...swipeHandlers}
            >
                <Header />

                {/** Like Button */}
                <Box
                    sx={{
                        display:{lg:"flex",md:"flex",sm:"none",xs:"none"},
                        justifyContent:"center",
                        alignItems:"center",
                        position: "absolute",
                        top: "47%",
                        right: "0%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        borderRadius: "50%",
                        bgcolor: alpha('#FF1B6B', 0.1),
                        padding: "0px 7px 5px 8px",
                        textAlign: 'center',
                        width: 80,
                        height: 80,
                    }}
                    onClick={() => handleSwipeAction("like")}
                >
                    <img src="/like.png" alt="Like" style={{ width: "50px", height: "50px" }} />
                </Box>
                {/** Delete Button */}
                <Box
                    sx={{
                        display:{lg:"flex",md:"flex",sm:"none",xs:"none"},
                        justifyContent:"center",
                        alignItems:"center",
                        position: "absolute",
                        top: "47%",
                        left: "0%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        borderRadius: "50%",
                        bgcolor: alpha('#FF1B6B', 0.1),
                        padding: "0px 14px 3px 8px",
                        textAlign: 'center',
                        width: 80,
                        height: 80,
                    }}
                    onClick={() => handleSwipeAction("delete")}
                >
                    <img src="/delete.png" alt="Delete" style={{ width: "50px", height: "50px" }} />
                </Box>

                {/** Maybe Button */}
                <Box
                    sx={{
                        display:{lg:"flex",md:"flex",sm:"none",xs:"none"},
                        justifyContent:"center",
                        alignItems:"center",
                        position: "absolute",
                        top: "77%",
                        left: "56%",
                        transform: "translateX(-50%)",
                        cursor: "pointer",
                        borderRadius: "50%",
                        bgcolor: alpha('#FF1B6B', 0.1),
                        padding: "0px 10px 5px 8px",
                        textAlign: 'center',
                        width: 80,
                        height: 80,
                        zIndex: 999
                    }}
                    onClick={() => handleSwipeAction("maybe")}
                >
                    <img src="/maybe.png" alt="Maybe" style={{ width: "50px", height: "50px" }} />
                </Box>
                {userProfiles.slice(currentIndex, currentIndex + 2).map((profile: any, index: number) => (
                    <Card
                        key={index}
                        elevation={0}
                        sx={{
                            border: 'none',
                            marginLeft: "5px",
                            marginRight: "5px",
                            width: { xs: 395, sm: 405, md: 300 },
                            height: { md: 450, lg: 450, sm: 580, xs: 580 },
                            marginTop: { sm: "30px" },
                            boxShadow: 'none',
                            position: "absolute",
                            transform: index === 0
                                ? swipeDirection === "down"
                                    ? `translateY(${swipeOffset}px)`
                                    : `translateX(${swipeOffset}px)`
                                : "translate(0px, 0px)",
                            zIndex: index === 0 ? 2 : 1,
                            backgroundColor: "#0a0a0a",
                            color: "white",
                        }}
                    >
                        <Box
                            color="white"
                            p={1}
                            sx={{
                                width: 55,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                marginLeft: 'auto',
                                marginBottom: "5px",
                                marginRight: { sm: "10px", xs: "10px" }
                            }}
                            onClick={() => {
                                setShowDetail(true);
                                setSelectedUserId(userProfiles[currentIndex]?.Id);
                            }}
                        >
                            <img
                                src="/ProfileInfo.png"
                                alt="Profile Info"
                                style={{
                                    width: "100%",
                                }}
                            />
                        </Box>
                        <Box position="relative" width="100%" sx={{ height: { lg: 270, md: 270, sm: 380, xs: 380 } }}>
                            <Avatar
                                alt={profile?.Username}
                                src={profile?.Avatar}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 0,
                                }}
                            />

                            {currentSwipeImage && index === 0 && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: dynamicPosition,
                                        transform: "translate(-50%, -50%)",
                                        zIndex: 2,
                                        borderRadius: 1,
                                        padding: 2,
                                    }}
                                >
                                    <img
                                        src={`/${currentSwipeImage}`}
                                        alt={currentSwipeImage}
                                        style={{ width: "150px", height: "150px" }}
                                    />
                                </Box>
                            )}

                            <Box
                                position="absolute"
                                bottom={8}
                                bgcolor="rgba(0,0,0,0.6)"
                                color="white"
                                p={1}
                                borderRadius={1}
                                fontSize={12}
                                sx={{ cursor: "pointer", right: { sm: 20, xs: 20, lg: 8, md: 8 } }}
                                onClick={handleReportModalToggle}
                            >
                                <Flag sx={{ color: "#9c27b0" }} />
                            </Box>

                        </Box>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                                {profile?.Username || "Unknown"} ,{" "}
                                {profile?.DateOfBirth
                                    ? new Date().getFullYear() - new Date(profile.DateOfBirth).getFullYear()
                                    : ""}
                                {profile?.Gender === "Male"
                                    ? "M"
                                    : profile?.Gender === "Female"
                                        ? "F"
                                        : ""}

                                {profile?.PartnerDateOfBirth && (
                                    <>
                                        {" | "}
                                        {new Date().getFullYear() - new Date(profile.PartnerDateOfBirth).getFullYear()}{" "}
                                        {profile?.PartnerGender === "Male"
                                            ? "M"
                                            : profile?.PartnerGender === "Female"
                                                ? "F"
                                                : ""}
                                    </>
                                )}
                            </Typography>
                            <Typography variant="body2" color="secondary">
                                {profile?.Location || ""}
                            </Typography>
                            <AboutSection aboutText={profile?.About} />

                        </CardContent>

                    </Card>
                ))}


            </Box>
            <InstructionModal />
            <UserProfileModal handleGrantAccess={handleGrantAccess} handleClose={handleClose} open={showDetail} userid={selectedUserId} />

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
                    </Box>
                </Box>
            </Modal>

            {/* Popup #1: Daily Limit */}
            <Dialog
                open={showLimitPopup}
                onClose={() => setShowLimitPopup(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: "#121212", // Dark background
                        color: "#ffffff",          // White text
                    },
                }}
            >
                <DialogTitle sx={{ color: "#e91e63" }}>Daily Limit Reached</DialogTitle>
                <DialogContent>
                    <Typography>
                        You've reached your daily limit of {dailyLimit} swipes. Upgrade your membership to swipe more!
                    </Typography>
                    <Button
                        onClick={() => router.push(`/membership`)}
                        sx={{
                            mt: 2,
                            backgroundColor: "#e91e63", // Pink color
                            color: "white",
                            '&:hover': {
                                backgroundColor: "#d81b60", // Slightly darker pink on hover
                            },
                        }}
                    >
                        Upgrade
                    </Button>
                    <Button
                        onClick={() => setShowLimitPopup(false)}
                        sx={{
                            mt: 2,
                            marginLeft: 1,
                            color: "white",
                            '&:hover': {
                                backgroundColor: "#d81b60", // Slightly darker pink on hover
                            },
                        }}
                    >
                        Close
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Popup #2: Match Found */}
            <Dialog
                open={showMatchPopup}
                onClose={() => setShowMatchPopup(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: "#121212", // Dark background
                        color: "#ffffff", // White text
                    },
                }}
            >
                <DialogTitle sx={{ color: "#03dac5" }}>It's a Match!</DialogTitle>
                <DialogContent>
                    {matchedProfile && (
                        <Box textAlign="center">
                            <Avatar
                                src={matchedProfile.Avatar}
                                alt={matchedProfile.Username}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: "auto",
                                    border: "2px solid #03dac5", // Border for visibility
                                }}
                            />
                            <Typography sx={{ mt: 2 }}>{`You've matched with ${matchedProfile.Username}!`}</Typography>
                            <Box display="flex" justifyContent="center" gap={2} mt={2}>
                                <Button
                                    onClick={() => {
                                        setShowDetail(true);
                                        setSelectedUserId(matchedProfile?.Id);
                                    }}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#03dac5",
                                        color: "#121212",
                                        '&:hover': {
                                            backgroundColor: "#00c4a7",
                                        },
                                    }}
                                >
                                    View Profile
                                </Button>
                                <Button
                                    onClick={handleChatAction}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#03dac5",
                                        color: "#121212",
                                        '&:hover': {
                                            backgroundColor: "#00c4a7",
                                        },
                                    }}
                                >
                                    Chat
                                </Button>
                                <Button
                                    onClick={() => setShowMatchPopup(false)}
                                    variant="outlined"
                                    sx={{
                                        color: "#03dac5",
                                        borderColor: "#03dac5",
                                        '&:hover': {
                                            borderColor: "#00c4a7",
                                            color: "#00c4a7",
                                        },
                                    }}
                                >
                                    Continue Swiping
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>


            {/* Popup #3: End of Records */}
            <Dialog
                open={showEndPopup}
                onClose={() => setShowEndPopup(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: "#121212", // Dark background
                        color: "#ffffff",          // White text
                    },
                }}
            >
                <DialogTitle sx={{ color: "white" }}>End of Records</DialogTitle>
                <DialogContent>
                    <Typography>
                        You've run out of matches. Adjust your preferences to view more members.
                    </Typography>
                    <Button
                        onClick={() => router.push("/prefrences")}
                        variant="outlined"
                        sx={{
                            mt: 2,
                            color: "white",
                            borderColor: "#e91e63",
                            '&:hover': {
                                borderColor: "#e64a19",
                                color: "#e64a19",
                            },
                        }}
                    >
                        Update Preferences
                    </Button>
                </DialogContent>
            </Dialog>
            {/* Bottom Navigation Bar */}
            <UserBottomNavigation />
        </>
    );
}
