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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { Flag } from "@mui/icons-material";
import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
export interface DetailViewHandle {
    open: (id: string) => void;
}

export default function Home() {

    const [profilesModal, setProfilesModal] = useState<boolean>(false);
    const handleCloseProfileModal = () => {
        setProfilesModal(false);
    };

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
    const [profileId, setProfileId] = useState<any>("7c4cabe7-f7d2-4577-a9c2-de8b9c2af2c7"); // Animation direction

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

    const handleGetUserSwipes = async (userId: any) => {
        try {
            const response = await fetch("/api/user/sweeping/swipes?id=" + userId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            setDailyLimit(data?.SwipeCount || 15);
        } catch (error) {
            console.error("Error fetching user profiles:", error);
        }
    }

    useEffect(() => {
        setProfilesModal(true);
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
        fetchData(profileId);
        handleGetUserSwipes(profileId);
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
            // Check if t
            // he username exists
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
                    setDailyLimit(advertiserData?.SwipeCount)
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
    const swipeHandlers = useSwipeable({
        onSwiping: (eventData) => {
            const offset = eventData.deltaX;
            const offetY = eventData.deltaY;
            if (eventData.dir === "Down") {
                setSwipeOffset(offetY);
            } else {
                setSwipeOffset(offset)
            }
            console.log(offetY, offset, "==============");
            // Track swipe distance dynamically
            setIsSwiping(true); // Start swiping
            setSwipeDirection(eventData.dir.toLowerCase()); // Set swipe direction
            if (eventData.dir === "Left") {
                setDynmicPosition("77%");
                setCurrentSwipeImage("delete.png");
            } else if (eventData.dir === "Right") {
                setDynmicPosition("30%");
                setCurrentSwipeImage("like.png");
            } else if (eventData.dir === "Down") {
                setDynmicPosition("77%");
                console.log(eventData.dir, "========down");
                setCurrentSwipeImage("maybe.png");
            } else {
                setCurrentSwipeImage(null); // No image for other directions
            }
        },
        onSwiped: (eventData) => {
            const direction = eventData.dir.toLowerCase();
            const isLeft = direction === "left" && Math.abs(eventData.deltaX) > 100;
            const isRight = direction === "right" && Math.abs(eventData.deltaX) > 100;
            const isDown = direction === "down" && Math.abs(eventData.deltaY) > 100; // Use deltaY for down swipe

            if (swipeCount >= dailyLimit) {
                setShowLimitPopup(true);
                return;
            }
            if (isLeft || isRight || isDown) {
                setSwipeCount((prev) => prev + 1);
                setSwipeOffset(0); // Reset offset after swipe
                setIsSwiping(false); // End swiping state
                setCurrentSwipeImage(null);
                handleSwipe(direction)
                setCurrentIndex((prev) => (prev + 1) % userProfiles.length);
            }
            if (currentIndex === userProfiles.length - 1) {
                setShowEndPopup(true);
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

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



            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                bgcolor="#121212"
                position="relative"
                overflow="hidden"
                {...swipeHandlers}
            >
                <InstructionModal />
                <Box
                    sx={{
                        position: "absolute",
                        top: "20px", // Adjust the top margin
                        right: "0px", // Adjust the right margin
                        zIndex: 10, // Ensure the button stays on top
                    }}
                >
                    <Button
                        onClick={() => router.push("/profile/")} // Navigate to /profile page on click
                        sx={{
                            backgroundColor: "transparent",
                            padding: 0,
                            minWidth: 0,
                            "&:hover": {
                                backgroundColor: "transparent",
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src="/ProfileEdit.png"
                            alt="Edit Profile"
                            sx={{
                                width: "50px", // Set a fixed width
                                height: "auto", // Maintain aspect ratio
                                flexShrink: 0,
                            }}
                        />
                    </Button>
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="absolute"
                    zIndex={1}
                    sx={{
                        top: '30px'
                    }}
                >
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Logo"
                        sx={{
                            width: '200px', // Set a fixed width
                            height: 'auto', // Maintain aspect ratio
                            flexShrink: 0,
                        }}
                    />
                </Box>
                <UserProfileModal handleGrantAccess={handleGrantAccess} handleClose={handleClose} open={showDetail} userid={selectedUserId} />


                {userProfiles.slice(currentIndex, currentIndex + 2).map((profile: any, index: number) => (

                    <Card
                        key={index}
                        elevation={0} // Removes default shadow from MUI's Paper component
                        sx={{

                            border: 'none',
                            marginLeft: "5px",
                            marginRight: "5px",
                            width: { xs: 400, sm: 410, md: 300 },
                            height: { md: 450, lg: 450, sm: 700, xs: 700 },
                            boxShadow: 'none',
                            position: "absolute",
                            transform: index === 0
                                ? swipeDirection === "down"
                                    ? `translateY(${swipeOffset}px)` // Move down dynamically
                                    : `translateX(${swipeOffset}px)` // Move left or right dynamically
                                : "translate(0px, 0px)", // Reset other cards to their original position
                            zIndex: index === 0 ? 2 : 1,
                            backgroundColor: "#121212",
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
                                marginBottom: "5px"
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
                                    width: "100%", // Make icon size dynamic
                                }}
                            />
                        </Box>
                        <Box position="relative" width="100%" sx={{ height: { lg: 300, md: 300, sm: 500, xs: 500 } }}>

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
                                right={8}
                                bgcolor="rgba(0,0,0,0.6)"
                                color="white"
                                p={1}
                                borderRadius={1}
                                fontSize={12}
                                sx={{ cursor: "pointer" }}
                                onClick={handleReportModalToggle}
                            >
                                <Flag sx={{ color: "#9c27b0" }} />
                            </Box>
                            {/* Icon at the top-right corner */}
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

                                {/* Conditionally render partner's age and gender if PartnerDateOfBirth is available */}
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
                            color: "#ffffff",          // White text
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
                                        border: "2px solid #03dac5" // Border for visibility
                                    }}
                                />
                                <Typography sx={{ mt: 2 }}>{`You've matched with ${matchedProfile.Username}!`}</Typography>
                                <Button
                                    onClick={() => {
                                        setShowDetail(true);
                                        setSelectedUserId(userProfiles[currentIndex]?.Id);
                                    }}
                                    variant="contained"
                                    sx={{
                                        mt: 2,
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
                                    onClick={() => setShowMatchPopup(false)}
                                    variant="outlined"
                                    sx={{
                                        mt: 2,
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
                    <DialogTitle sx={{ color: "#ff5722" }}>End of Records</DialogTitle>
                    <DialogContent>
                        <Typography>
                            You've run out of matches. Adjust your preferences to view more members.
                        </Typography>
                        <Button
                            onClick={() => router.push("/profile/prefrences")}
                            variant="outlined"
                            sx={{
                                mt: 2,
                                color: "#ff5722",
                                borderColor: "#ff5722",
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
                <Dialog
                    open={profilesModal}
                    onClose={handleCloseProfileModal}
                    fullWidth
                    maxWidth="md" // Medium size dialog
                    PaperProps={{
                        style: {
                            backgroundColor: "#121212", // Dark background
                            color: "white", // White text
                        },
                    }}
                >
                    <DialogTitle>Select User</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <InputLabel
                                id="user-select-label"
                                style={{ color: "white" }} // White label text
                            >
                                User
                            </InputLabel>
                            <Select
                                labelId="user-select-label"
                                value={profileId}
                                onChange={(e) => setProfileId(e.target.value)}
                                style={{
                                    color: "white", // Dropdown text color
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            backgroundColor: "#1e1e1e", // Dropdown background color
                                            color: "white", // Dropdown text color
                                        },
                                    },
                                }}
                            >
                                {userProfiles.map((user: any) => (
                                    <MenuItem key={user.Id} value={user.Id}>
                                        {user.Username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseProfileModal} style={{ color: "white" }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Bottom Navigation Bar */}
                <UserBottomNavigation />
            </Box>
        </>
    );
}
