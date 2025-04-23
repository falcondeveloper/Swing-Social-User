"use client";
import React, { useEffect, useRef, useState } from "react";
import { Box, Card, CardContent, Typography, Avatar, Modal, Button, Checkbox, FormControlLabel, BottomNavigation, BottomNavigationAction, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Flag } from "@mui/icons-material";
import TinderCard from "react-tinder-card";
import { useRouter } from "next/navigation";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { toast } from "react-toastify";
import MobileSweaping from "@/components/MobileSweaping";

interface TinderCardRef {
    current: {
        swipe: (dir: 'left' | 'right' | 'down') => Promise<void>;
    } | null;
}

interface CardRefs {
    [key: string]: TinderCardRef;
}

import { useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    breakpoints: {
        // Breakpoints config (you can define your custom breakpoints here)
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
});

export default function Home() {
    const [userProfiles, setUserProfiles] = useState<any[]>([]); // User profiles fetched from API
    const [totalUsers, setTotalUsers] = useState<any>(0); // User profiles fetched from API

    const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * 1000) + 1);
    const [loading, setLoading] = useState(true); // Tracks loading state
    const [swipeDirection, setSwipeDirection] = useState<string | null>(null); // Track swipe direction for animations
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [showDetail, setShowDetail] = useState<any>(false);
    const [selectedUserId, setSelectedUserId] = useState<any>(null);
    const [relationCategory, setRelationCategory] = useState(null);
    const [profileId, setProfileId] = useState<any>(null);
    const [bottomNav, setBottomNav] = useState();
    const [customProfile, setCustomProfile] = useState<any>(null);

    const [showMatchPopup, setShowMatchPopup] = useState(false);

    const [messageOpen, setMessageOpen] = useState(false);
    const [matchesOpen, setMatchesOpen] = useState(false);

    const [showLimitPopup, setShowLimitPopup] = useState(false);
    const [showEndPopup, setShowEndPopup] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState<any>(null);
    const [swipeCount, setSwipeCount] = useState(0);
    console.log(swipeCount, "========swipeCount");
    const [dailyLimit, setDailyLimit] = useState(15);

    // const createRefs = (profiles: any) => {
    //     const newRefs = {};
    //     profiles.forEach((profile: any) => {
    //         newRefs[profile.Id] = React.createRef();
    //     });
    //     return newRefs;
    // };

    const router = useRouter();

    useEffect(() => {
        // Simulate fetching user profiles
        const fetchUserProfiles = async () => {
            try {
                const response = await fetch("/api/user/sweeping?page=1&size=1000", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                setUserProfiles(data?.profiles || []);
                setTotalUsers(data?.totalRows)
                if (data?.totalRows !== undefined && data.totalRows <= 0) {
                    setShowEndPopup(true);
                }

            } catch (error) {
                console.error("Error fetching user profiles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfiles();
    }, []);
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

    const fetchData = async (userId: string) => {
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
                    console.log(advertiserData, "=========advertiser data");
                    setCustomProfile(advertiserData);
                    setSwipeCount(advertiserData?.SwipeCount)
                    setDailyLimit(advertiserData?.SwipeMax)
                    if (parseInt(advertiserData?.SwipeCount) >= parseInt(advertiserData?.SwipeMax)) {

                        setSwipingDisable(true);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching data:', error.message);
            } finally {
                setLoading(false);
            }

        }
    };

    const handleClose = () => {
        setShowDetail(false);
        setSelectedUserId(null);
    }

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
    const [isSwipingDisabled, setSwipingDisable] = useState(false);
    const handleSwipe = (direction: string) => {
        if (swipeCount >= dailyLimit) {

            setShowLimitPopup(true);
            setSwipingDisable(true);
            // Move to the next card after a small delay
            setTimeout(() => {
                console.log("this is useEffect");
                setSwipeDirection(null); // Reset swipe direction

            }, 500); // Reset after animation
        } else {
            // Set swipe direction state for feedback
            setSwipeDirection(direction);

            handleUpdateLikeMatch();
            // Update category relation based on direction
            if (direction === "left") {
                handleUpdateCategoryRelation("Denied");
                setSwipeCount((prev) => prev + 1);
            } else if (direction === "right") {
                handleUpdateCategoryRelation("Liked");
                setSwipeCount((prev) => prev + 1);
            } else if (direction === "down") {
                handleUpdateCategoryRelation("Maybe");
                setSwipeCount((prev) => prev + 1);
            }

            // Move to the next card after a small delay
            setTimeout(() => {
                console.log("this is useEffect");
                setSwipeDirection(null); // Reset swipe direction
                setCurrentIndex(Math.floor(Math.random() * 1000) + 1);
            }, 500); // Reset after animation
        }

    };

    const handleButtonSwipe = async (direction: 'left' | 'right' | 'down') => {
        const currentProfile = userProfiles[currentIndex];

        if (swipeCount >= dailyLimit) {
            setShowLimitPopup(true);
            return;
        }

        // Set swipe direction state for feedback
        setSwipeDirection(direction);

        // Trigger swipe animation using the ref
        if (currentProfile && refs.current[currentProfile.Id]) {
            const cardRef = refs.current[currentProfile.Id].current;
            if (cardRef && typeof cardRef.swipe === 'function') {
                await cardRef.swipe(direction);  // Ensure swipe method is available and called correctly
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
    const handleReportSubmit = () => {
        console.log("Report Options:", reportOptions);
        setIsReportModalOpen(false);
        handleReportUser();
        // Add logic to handle report or block user action
    };

    const handleChatAction = () => {
        toast.success('It is in Development mode');
    }
    const refs = useRef<{ [key: string]: React.RefObject<any> }>({});
    const currentCardRef = useRef<any>(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobileDevice(window.innerWidth <= 768); // Adjust the breakpoint as needed
        };

        checkIfMobile(); // Initial check

        // Add a resize listener
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile); // Cleanup listener
        };
    }, []);

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
    if (isMobileDevice) {
        return <MobileSweaping />
    }

    return (
        <>
            <Box
                display="flex"
                height="100vh"
                bgcolor="#121212"
                position="relative"
                overflow="hidden"
            >
                <Header />
                {/* Left half of the screen */}
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{
                        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d1f3d 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '2rem',
                    }}
                >
                    {/* Animated background elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            opacity: 0.1,
                            background: 'radial-gradient(circle at 50% 50%, rgba(194, 24, 91, 0.3) 0%, transparent 60%)',
                            animation: 'pulse 8s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.2)' },
                                '100%': { transform: 'scale(1)' },
                            },
                        }}
                    />

                    {/* Logo section */}
                    <Box
                        sx={{
                            marginTop: '4rem',
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Logo"
                            sx={{
                                width: '300px',
                                height: 'auto',
                                marginBottom: '2rem',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#fff',
                                opacity: 0.9,
                                fontWeight: 300,
                                marginBottom: '1rem',
                            }}
                        >
                            Connect. Share. Experience.
                        </Typography>
                    </Box>

                    {/* Features section */}
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            marginTop: '4rem',
                            width: '100%',
                            maxWidth: '400px',
                        }}
                    >
                        <Box
                            onClick={() => setMatchesOpen(true)}
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '2rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'translateX(10px)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src="/icons/matches.png"
                                alt="Matches"
                                sx={{
                                    width: '40px',
                                    height: '40px',
                                    marginRight: '1rem',
                                }}
                            />
                            <Box >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
                                    Smart Matching
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Find your perfect match with our intelligent algorithm
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            onClick={() => setMessageOpen(true)}
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '2rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'translateX(10px)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src="/icons/messaging.png"
                                alt="Messaging"
                                sx={{
                                    width: '40px',
                                    height: '40px',
                                    marginRight: '1rem',
                                }}
                            />
                            <Box >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
                                    Instant Connect
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Chat and connect with your matches instantly
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            onClick={() => router.push('/pineapple')}
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'translateX(10px)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src="/icons/pineapple.png"
                                alt="Pineapple"
                                sx={{
                                    width: '40px',
                                    height: '40px',
                                    marginRight: '1rem',
                                }}
                            />
                            <Box >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
                                    Pineapple Features
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Discover unique connections and experiences
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Stats section */}
                    <Box
                        sx={{
                            marginTop: 'auto',
                            marginBottom: '4rem',
                            display: 'flex',
                            justifyContent: 'space-around',
                            width: '100%',
                            maxWidth: '400px',
                        }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                padding: '1rem',
                            }}
                        >
                            <Typography variant="h4" sx={{ color: '#C2185B', fontWeight: 'bold' }}>
                                {totalUsers}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Active Users
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                textAlign: 'center',
                                padding: '1rem',
                            }}
                        >
                            <Typography variant="h4" sx={{ color: '#C2185B', fontWeight: 'bold' }}>
                                1M+
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Matches Made
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right half of the screen */}
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                >
                    {/* Swiping cards */}
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        position="relative"
                        width="100%"
                        height="100%"
                        sx={{
                            overflow: "hidden", // Contain swipe animations
                            position: "relative",
                        }}
                    >
                        <UserProfileModal handleGrantAccess={handleGrantAccess} handleClose={handleClose} open={showDetail} userid={selectedUserId} />
                        {userProfiles.slice(currentIndex, currentIndex + 1).map((profile: any, index: number) => {
                            if (!refs.current[profile.Id]) {
                                refs.current[profile.Id] = React.createRef();
                            }
                            return (
                                <TinderCard
                                    key={profile.Id}
                                    // ref={cardRef}
                                    ref={refs.current[profile.Id]} // Attach the ref
                                    onSwipe={(dir) => handleSwipe(dir)}
                                    preventSwipe={["up"]}
                                    swipeThreshold={80}
                                >
                                    <Box
                                        position="absolute"
                                        left="50%"
                                        top="50%"
                                        sx={{
                                            transform: "translate(-50%, -50%)",
                                            zIndex: userProfiles.length - index,
                                        }}
                                    >
                                        <Card
                                            sx={{
                                                width: 300,
                                                height: 450,
                                                boxShadow: 5,
                                                backgroundColor: "#1e1e1e",
                                                color: "white",
                                                borderRadius: "16px",
                                                position: "relative",
                                            }}
                                        >
                                            {/* Card content remains the same */}
                                            <Box position="relative" width="100%" height="300px">
                                                <Avatar
                                                    src={profile?.Avatar}
                                                    alt={profile?.Username}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        borderTopLeftRadius: "16px",
                                                        borderTopRightRadius: "16px",
                                                        borderBottomLeftRadius: "0px",
                                                        borderBottomRightRadius: "0px",
                                                    }}
                                                />
                                                {/* Swipe direction indicators */}
                                                {swipeDirection && (
                                                    <Box
                                                        position="absolute"
                                                        top="50%"
                                                        left="50%"
                                                        sx={{
                                                            transform: "translate(-50%, -50%)",
                                                            zIndex: 3,
                                                        }}
                                                    >
                                                        {swipeDirection === "left" && (
                                                            <img
                                                                src="/delete.png"
                                                                alt="Dislike"
                                                                style={{ width: "100px", height: "100px" }}
                                                            />
                                                        )}
                                                        {swipeDirection === "right" && (
                                                            <img
                                                                src="/like.png"
                                                                alt="Like"
                                                                style={{ width: "100px", height: "100px" }}
                                                            />
                                                        )}
                                                        {swipeDirection === "down" && (
                                                            <img
                                                                src="/maybe.png"
                                                                alt="Maybe"
                                                                style={{ width: "100px", height: "100px" }}
                                                            />
                                                        )}
                                                    </Box>
                                                )}
                                                <Box
                                                    position="absolute"
                                                    top={8}
                                                    right={8}
                                                    bgcolor="rgba(0,0,0,0.6)"
                                                    color="white"
                                                    p={1}
                                                    borderRadius={1}
                                                    fontSize={12}
                                                    sx={{ cursor: "pointer" }}
                                                >
                                                    <InfoIcon
                                                        onClick={() => {
                                                            setShowDetail(true);
                                                            setSelectedUserId(profile?.Id);
                                                        }}
                                                    />
                                                </Box>
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
                                            </Box>
                                            <CardContent>
                                                <Typography variant="h6">{profile?.Username}</Typography>
                                                <Typography variant="body2" color="secondary">
                                                    {profile?.Location}
                                                </Typography>
                                                <Typography variant="body2" color="secondary">
                                                    {profile?.About}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </TinderCard>
                            );
                        })}
                    </Box>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '2rem',
                            zIndex: 1000,
                        }}
                    >
                        <Button
                            onClick={() => handleButtonSwipe('left')}
                            sx={{
                                width: '90px',
                                height: '90px',
                                borderRadius: '50%',
                                backgroundColor: '#FF4B4B',
                                border: 'none',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#FF3333',
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src="/delete.png"
                                alt="Dislike"
                                sx={{ width: '50px', height: '50px' }}
                            />
                        </Button>

                        <Button
                            onClick={() => handleButtonSwipe('down')}
                            sx={{
                                width: '90px',
                                height: '90px',
                                borderRadius: '50%',
                                backgroundColor: '#FFB02E',
                                border: 'none',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#FFA000',
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src="/maybe.png"
                                alt="Maybe"
                                sx={{ width: '50px', height: '50px' }}
                            />
                        </Button>

                        <Button
                            onClick={() => handleButtonSwipe('right')}
                            sx={{
                                width: '90px',
                                height: '90px',
                                borderRadius: '50%',
                                backgroundColor: '#4CAF50',
                                border: 'none',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#43A047',
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src="/like.png"
                                alt="Like"
                                sx={{ width: '50px', height: '50px' }}
                            />
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Footer />
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
                        onClick={() => {
                            window.location.reload(); // Invoke the reload function
                            setShowLimitPopup(false); // Close the popup
                        }}
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

            <Dialog open={matchesOpen}>
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Matches
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        This feature is in development
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setMatchesOpen(false)} sx={{ color: 'red' }}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={messageOpen}>
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Messages
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        This feature is in development
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setMessageOpen(false)} sx={{ color: 'red' }}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}