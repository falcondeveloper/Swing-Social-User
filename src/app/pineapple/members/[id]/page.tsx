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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { Flag } from "@mui/icons-material";
import UserBottomNavigation from "@/components/BottomNavigation";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
export interface DetailViewHandle {
    open: (id: string) => void;
}
interface OtpProps {
    params: any;
}
type Params = Promise<{ id: string }>
export default function Home(props: { params: Params }) {
    const [id, setId] = useState<string>(''); // State for error messages
    useEffect(() => {
        const getIdFromParam = async () => {
            const params = await props.params;
            const pid: any = params.id;

            setId(pid)
            if (pid) {
                console.log(pid, "=========pid");
                await fetchData(pid);
            }
        }
        getIdFromParam();
        // toast.success('For testing use code 122.');
    }, [props]);
    const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * 1000) + 1);
    const [userProfiles, setUserProfiles] = useState<any>([]); // User profiles fetched from API
    const [loading, setLoading] = useState(true); // Tracks loading state
    const [swipeDirection, setSwipeDirection] = useState<any>(null); // Animation direction

    const [profileId, setProfileId] = useState<any>("7c4cabe7-f7d2-4577-a9c2-de8b9c2af2c7"); // Animation direction

    const [showDetail, setShowDetail] = useState<any>(false);
    const [selectedUserId, setSelectedUserId] = useState<any>(null);
    const [relationCategory, setRelationCategory] = useState(null);

    const router = useRouter();

    const handleClose = () => {
        setShowDetail(false);
        setSelectedUserId(null);
    }
    const [bottomNav, setBottomNav] = useState(); // Bottom navigation state
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
            // Check if t
            // he username exists
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
    const fetchData = async (userId: any) => {
        console.log(userId, "===========userId")
        if (userId) {
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
                    setCustomProfile(advertiserData);
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
        setIsReportModalOpen(false);
        handleReportUser();
        // Add logic to handle report or block user action
    };


    const [dynamicPosition, setDynmicPosition] = useState<any>("77%");
    const swipeHandlers = useSwipeable({
        onSwiping: (eventData) => {
            setCustomProfile(null);
            const offset = eventData.deltaX;
            const offetY = eventData.deltaY;
            if (eventData.dir === "Down") {
                setSwipeOffset(offetY);
            } else {
                setSwipeOffset(offset)
            }
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
                setCurrentSwipeImage("maybe.png");
            } else {
                setCurrentSwipeImage(null); // No image for other directions
            }
        },
        onSwiped: (eventData) => {
            setCustomProfile(null);

            const direction = eventData.dir.toLowerCase();
            const isLeft = direction === "left" && Math.abs(eventData.deltaX) > 100;
            const isRight = direction === "right" && Math.abs(eventData.deltaX) > 100;
            const isDown = direction === "down" && Math.abs(eventData.deltaY) > 100; // Use deltaY for down swipe

            if (isLeft) {
                setCurrentIndex((prev) => (prev + 1) % userProfiles.length); // Move to the next profile
            } else if (isRight) {
                setCurrentIndex((prev) => (prev + 1) % userProfiles.length); // Move to the next profile
            } else if (isDown) {
                setCurrentIndex((prev) => (prev + 1) % userProfiles.length); // Move to the next profile
            }

            setSwipeOffset(0); // Reset offset after swipe
            setIsSwiping(false); // End swiping state
            setCurrentSwipeImage(null);
            handleSwipe(direction)
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
                {customProfile &&
                    <Card
                        key={0}
                        elevation={0} // Removes default shadow from MUI's Paper component
                        sx={{
                            border: 'none',
                            marginLeft: "5px",
                            marginRight: "5px",
                            width: { xs: 400, sm: 410, md: 300 },
                            height: { md: 450, lg: 450, sm: 700, xs: 700 },
                            boxShadow: 'none',
                            position: "absolute",
                            transform: swipeDirection === "down"
                                ? `translateY(${swipeOffset}px)` // Move down dynamically
                                : `translateX(${swipeOffset}px)`, // Move left or right dynamically
                            zIndex: 2,
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
                                setSelectedUserId(customProfile?.Id);
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
                                alt={customProfile?.Username}
                                src={customProfile?.Avatar}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 0,
                                }}
                            />
                            {currentSwipeImage && (
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
                                {customProfile?.Username || "Unknown"} ,{" "}
                                {customProfile?.DateOfBirth
                                    ? new Date().getFullYear() - new Date(customProfile.DateOfBirth).getFullYear()
                                    : ""}
                                {customProfile?.Gender === "Male"
                                    ? "M"
                                    : customProfile?.Gender === "Female"
                                        ? "F"
                                        : ""}

                                {/* Conditionally render partner's age and gender if PartnerDateOfBirth is available */}
                                {customProfile?.PartnerDateOfBirth && (
                                    <>
                                        {" | "}
                                        {new Date().getFullYear() - new Date(customProfile.PartnerDateOfBirth).getFullYear()}{" "}
                                        {customProfile?.PartnerGender === "Male"
                                            ? "M"
                                            : customProfile?.PartnerGender === "Female"
                                                ? "F"
                                                : ""}
                                    </>
                                )}
                            </Typography>
                            <Typography variant="body2" color="secondary">
                                {customProfile?.Location || ""}
                            </Typography>
                            <AboutSection aboutText={customProfile.About} />
                        </CardContent>
                    </Card>
                }
                {!customProfile && userProfiles.slice(currentIndex, currentIndex + 2).map((profile: any, index: number) => (

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
                            <Typography variant="body2" color="secondary">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: profile?.About,
                                    }}
                                />
                            </Typography>
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
                {/* Bottom Navigation Bar */}
                <Footer />
            </Box>
        </>
    );
}
