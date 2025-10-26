"use client";
import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
} from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Modal,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  keyframes,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Flag } from "@mui/icons-material";
import TinderCard from "react-tinder-card";
import { useRouter, useSearchParams } from "next/navigation";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { toast } from "react-toastify";
import MobileAttendeeSwing from "@/components/MobileAttendeeSwing";
import { useTheme, useMediaQuery } from "@mui/material";
import ProfileCard from "@/components/ProfileCard";
import { Bold } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const [userProfiles, setUserProfiles] = useState<any[]>([]); // User profiles fetched from API
  const [totalUsers, setTotalUsers] = useState<any>(0); // User profiles fetched from API
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null); // Track swipe direction for animations
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [profileId, setProfileId] = useState<any>(null);
  const [customProfile, setCustomProfile] = useState<any>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [dailyLimit, setDailyLimit] = useState(15);
  const [isSwipingDisabled, setSwipingDisable] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [membership, setMembership] = useState(0);
  const [reportOptions, setReportOptions] = useState({
    reportUser: false,
    blockUser: false,
    reportImage: false,
  });
  const [id, setId] = useState("");
  const [memberalarm, setMemberAlarm] = useState("0");

  const router = useRouter();
  const theme = useTheme();
  //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const refs = useRef<{ [key: string]: React.RefObject<any> }>({});
  const [idParam, setIdparam] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
    }
    100% {
      transform: translateX(100%) skewX(-15deg);
    }
  }
`;

  const loadingBarKeyframes = `
  @keyframes loadingBar {
    0% {
      left: -30%;
      width: 30%;
    }
    50% {
      width: 40%;
    }
    100% {
      left: 100%;
      width: 30%;
    }
  }
`;

  interface LoadingScreenProps {
    logoSrc?: string;
  }

  interface LoadingScreenProps {
    logoSrc?: string;
  }

  const LoadingScreen: React.FC<LoadingScreenProps> = ({
    logoSrc = "/loading.png",
  }) => {
    return (
      <>
        <style>
          {shimmerKeyframes}
          {loadingBarKeyframes}
        </style>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#121212",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: 1,
              gap: "12px",
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt="Logo"
              sx={{
                width: "50px",
                height: "auto",
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: "32px",
                letterSpacing: "-0.02em", // Reduced letter spacing
                fontWeight: "bold",
                color: "#C2185B",
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                },
              }}
            >
              SWINGSOCIAL
            </Typography>
          </Box>

          {/* Loading Bar */}
          <Box
            sx={{
              position: "relative",
              width: "120px",
              height: "2px",
              backgroundColor: "rgba(194,24,91,0.2)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                backgroundColor: "#C2185B",
                borderRadius: "4px",
                animation: "loadingBar 1.5s infinite",
              }}
            />
          </Box>

          {/* Subtitle */}
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "14px",
                letterSpacing: "0.02em",
                opacity: 0.9,
                color: "#C2185B",
                position: "relative",
                overflow: "hidden",
                fontWeight: "bold",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                },
              }}
            >
              The best dating and events platform for Swingers
            </Typography>
          </Box>
        </Box>
      </>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);

      if (queryParams.get("q")) {
        var targetId = queryParams.get("q");
        var loginId = queryParams.get("id");
        var eventId = queryParams.get("eventid");
        if (loginId) {
          localStorage.setItem("loginId", loginId);
          if (targetId) {
            localStorage.setItem("targetId", targetId);
          }
          if (eventId) {
            localStorage.setItem("eventId", eventId);
          }
        }
        const token = localStorage.getItem("loginInfo");
        const count = localStorage.getItem("memberalarm");
        setMemberAlarm(count ?? "0");

        if (token) {
          const decodeToken = jwtDecode<any>(token);
          if (decodeToken.profileId) {
            setProfileId(decodeToken.profileId);
            fetchCurrentLoginProfileId(decodeToken.profileId);
            fetchAllUserProfiles(loginId, targetId, eventId);
          }
          setMembership(decodeToken.membership);
        } else {
          router.push("/login");
        }
      } else {
        const token = localStorage.getItem("loginInfo");
        const count = localStorage.getItem("memberalarm");
        const loginId = localStorage.getItem("loginId");
        const targetId = localStorage.getItem("targetId");
        const eventId = localStorage.getItem("eventId");
        setMemberAlarm(count ?? "0");

        if (token) {
          const decodeToken = jwtDecode<any>(token);
          if (decodeToken.profileId) {
            setProfileId(decodeToken.profileId);
            fetchCurrentLoginProfileId(decodeToken.profileId);
            fetchAllUserProfiles(loginId, targetId, eventId);
          }
          setMembership(decodeToken.membership);
        } else {
          router.push("/login");
        }
      }
    }
  }, []);

  useEffect(() => {
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    var param = queryParams.get("q");

    setIdparam(param);

    if (userProfiles?.length > 0) {
      if (param != null) {
        fetchCurrentProfileInfo(param);

        if (param && !refs.current[param]) {
          refs.current[param] = React.createRef();
        }
      } else {
        fetchCurrentProfileInfo(userProfiles[currentIndex]?.Id);
      }
    }
  }, [currentIndex, userProfiles]);

  const fetchCurrentProfileInfo = async (currentProfileId: any) => {
    if (currentProfileId) {
      try {
        const response = await fetch(
          `/api/user/sweeping/user?id=${currentProfileId}`
        );
        if (!response.ok) {
          console.error(
            "Failed to fetch advertiser data:",
            response.statusText
          );
          setCustomProfile(undefined);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { user: advertiserData } = await response.json();
        if (!advertiserData) {
          console.error("Advertiser not found");
        } else {
          setSelectedUserProfile(advertiserData);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      } finally {
      }
    }
  };

  const fetchCurrentLoginProfileId = async (currentLoginProfileId: string) => {
    if (currentLoginProfileId) {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/user/sweeping/user?id=${currentLoginProfileId}`
        );
        if (!response.ok) {
          console.error(
            "Failed to fetch advertiser data:",
            response.statusText
          );
          setCustomProfile(undefined);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { user: advertiserData } = await response.json();
        if (!advertiserData) {
          console.error("Advertiser not found");
          setCustomProfile(undefined);
        } else {
          setCustomProfile(advertiserData);
          setSwipeCount(advertiserData?.SwipeCount);
          setDailyLimit(advertiserData?.SwipeMax);
          if (
            parseInt(advertiserData?.SwipeCount) >=
            parseInt(advertiserData?.SwipeMax)
          ) {
            setSwipingDisable(true);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAllUserProfiles = async (
    userid: any,
    targetId: any,
    eventId: any
  ) => {
    try {
      const response = await fetch("/api/user/sweeping/attendee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginid: userid,
          targetid: targetId,
          eventid: eventId,
        }),
      });

      const data = await response.json();

      setUserProfiles(data?.swipes || []);
      setTotalUsers(data?.totalRows);
      if (data?.totalRows !== undefined && data.totalRows <= 0) {
        setShowEndPopup(true);
      }
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: string) => {
    if (currentIndex + 1 >= userProfiles.length) {
      setShowEndPopup(true); // Show the preferences modal
    }

    if (idParam != null) {
      router.push("/attendeeswing");
    }

    if (swipeCount >= dailyLimit) {
      if (membership == 1) {
        setSwipeCount(0);
        setSwipeDirection(direction);

        if (direction === "left") {
          await handleUpdateCategoryRelation("Denied");
          setSwipeCount((prev) => prev + 1);
        } else if (direction === "right") {
          await handleUpdateCategoryRelation("Liked");
          await handleUpdateLikeMatch();
          setSwipeCount((prev) => prev + 1);
        } else if (direction === "down") {
          await handleUpdateCategoryRelation("Maybe");
          setSwipeCount((prev) => prev + 1);
        }

        setTimeout(() => {
          setSwipeDirection(null);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }, 500);
      } else {
        setShowLimitPopup(true);
        setSwipingDisable(true);
        setTimeout(() => {
          setSwipeDirection(null);
        }, 500);
      }
    } else {
      setSwipeDirection(direction);

      if (direction === "left") {
        await handleUpdateCategoryRelation("Denied");
        setSwipeCount((prev) => prev + 1);
      } else if (direction === "right") {
        await handleUpdateCategoryRelation("Liked");
        await handleUpdateLikeMatch();
        setSwipeCount((prev) => prev + 1);
      } else if (direction === "down") {
        await handleUpdateCategoryRelation("Maybe");
        setSwipeCount((prev) => prev + 1);
      }

      setTimeout(() => {
        setSwipeDirection(null);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 500);
    }
  };

  const handleButtonSwipe = async (direction: "left" | "right" | "down") => {
    const currentProfile = userProfiles[currentIndex];

    if (swipeCount >= dailyLimit) {
      if (membership == 1) {
        setSwipeCount(0);
        setSwipeDirection(direction);

        if (idParam && selectedUserProfile) {
          // Use selectedUserProfile's ID for param case
          const cardRef = refs.current[selectedUserProfile.Id]?.current;
          if (cardRef && typeof cardRef.swipe === "function") {
            await cardRef.swipe(direction);
          }
        } else {
          // Use current profile from userProfiles for regular case
          const currentProfile = userProfiles[currentIndex];
          if (currentProfile && refs.current[currentProfile.Id]) {
            const cardRef = refs.current[currentProfile.Id].current;
            if (cardRef && typeof cardRef.swipe === "function") {
              await cardRef.swipe(direction);
            }
          }
        }
      } else {
        setShowLimitPopup(true);
        return;
      }
    }

    setSwipeDirection(direction);

    if (idParam && selectedUserProfile) {
      // Use selectedUserProfile's ID for param case
      const cardRef = refs.current[selectedUserProfile.Id]?.current;
      if (cardRef && typeof cardRef.swipe === "function") {
        await cardRef.swipe(direction);
      }
    } else {
      // Use current profile from userProfiles for regular case
      const currentProfile = userProfiles[currentIndex];
      if (currentProfile && refs.current[currentProfile.Id]) {
        const cardRef = refs.current[currentProfile.Id].current;
        if (cardRef && typeof cardRef.swipe === "function") {
          await cardRef.swipe(direction);
        }
      }
    }
  };

  const handleGrantAccess = async () => {
    try {
      const checkResponse = await fetch("/api/user/sweeping/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileid: profileId,
          targetid: userProfiles[currentIndex]?.Id,
        }),
      });

      const checkData = await checkResponse.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateCategoryRelation = async (category: any) => {
    try {
      if (idParam != null) {
        const checkResponse = await fetch("/api/user/sweeping/relation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pid: profileId,
            targetid: idParam,
            newcategory: category,
          }), // Pass the username to check
        });
      } else {
        const checkResponse = await fetch("/api/user/sweeping/relation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pid: profileId,
            targetid: userProfiles[currentIndex]?.Id,
            newcategory: category,
          }), // Pass the username to check
        });

        const checkData = await checkResponse.json();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendNotification = async (message: any) => {
    if (idParam != null) {
      const id = idParam;
      const response = await fetch("/api/user/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          body: message,
          image: "https://example.com/path/to/image.jpg",
          url: `https://swing-social-user.vercel.app/members/${profileId}`,
        }),
      });

      const result = await response.json();
    } else {
      const id = userProfiles[currentIndex]?.Id;
      const response = await fetch("/api/user/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          body: message,
          image: "https://example.com/path/to/image.jpg",
          url: `https://swing-social-user.vercel.app/members/${profileId}`,
        }),
      });

      return await response.json();
    }
  };

  const handleUpdateLikeMatch = async () => {
    try {
      if (idParam != null) {
        const response = await fetch("/api/user/sweeping/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileid: profileId, targetid: idParam }), // Pass the username to check
        });

        const username = localStorage.getItem("profileUsername");
        const data = await response.json();

        if (data?.isMatch == 1) {
          setMatchedProfile(userProfiles[currentIndex]);
          setShowMatchPopup(true);
          setId(idParam);
          sendNotification(`You have a new match with ${username}!`);
        }
      } else {
        const response = await fetch("/api/user/sweeping/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileid: profileId,
            targetid: userProfiles[currentIndex]?.Id,
          }), // Pass the username to check
        });

        const username = localStorage.getItem("profileUsername");
        const data = await response.json();

        if (data?.isMatch == 1) {
          setMatchedProfile(userProfiles[currentIndex]);
          setShowMatchPopup(true);
          setId(userProfiles[currentIndex]?.Id);
          sendNotification(`You have a new match with ${username}!`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  };

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

  const reportImageApi = async ({
    reportedById,
    reportedByName,
    reportedUserId,
    reportedUserName,
    image,
  }: {
    reportedById: string;
    reportedByName: string;
    reportedUserId: string;
    reportedUserName: string;
    image: string;
  }) => {
    try {
      const response = await fetch("/api/user/reportedUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedById,
          reportedByName,
          reportedUserId,
          reportedUserName,
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || "Failed to report image.");
        return false;
      }

      toast.success("Image reported successfully!");
      return true;
    } catch (err) {
      console.error("Error reporting image:", err);
      toast.error("Error reporting image.");
      return false;
    }
  };

  const handleReportSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("loginInfo");
    const decodeToken = token ? jwtDecode<any>(token) : {};
    const reportedByName = decodeToken?.profileName || "Me";

    try {
      if (reportOptions.reportImage) {
        await reportImageApi({
          reportedById: profileId,
          reportedByName,
          reportedUserId: userProfiles[currentIndex]?.Id,
          reportedUserName: userProfiles[currentIndex]?.Username,
          image: userProfiles[currentIndex]?.Avatar,
        });
      }

      if (reportOptions.reportUser || reportOptions.blockUser) {
        const res = await fetch("/api/user/sweeping/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileid: profileId,
            targetid: userProfiles[currentIndex]?.Id,
          }),
        });

        if (!res.ok) {
          toast.error("Failed to report user.");
          return null;
        }

        await res.json();
        toast.success("User reported successfully");
      }

      if (
        reportOptions.reportImage ||
        reportOptions.reportUser ||
        reportOptions.blockUser
      ) {
        setIsReportModalOpen(false);
        setReportOptions({
          reportUser: false,
          blockUser: false,
          reportImage: false,
        });
      }
    } catch (err) {
      toast.error("An error occurred while reporting.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [profileId, reportOptions]);

  const checkIfMobile = () => {
    setIsMobileDevice(isMobile);
  };

  const handleChatAction = () => {
    router.push(`/messaging/${id}`);
  };

  useEffect(() => {
    if (profileId) {
      getCurrentLocation();
    }
  }, [profileId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get the location name (you may need a third-party service here)
          const locationName = await getLocationName(latitude, longitude);

          // Send the location to your API
          await sendLocationToAPI(locationName, latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    const apiKey = "AIzaSyDv-b2OlvhI1HmMyfHoSEwHkKpPkKlX4vc"; // Replace with your actual API key

    try {
      // Call the Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract the location name from the response
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // Return the formatted address of the first result
      }

      console.error("No results found or status not OK:", data);
      return "Unknown Location";
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Unknown Location";
    }
  };

  const sendLocationToAPI = async (
    locationName: string,
    latitude: number,
    longitude: number
  ) => {
    if (!profileId) {
      console.error("Profile ID is missing.");
      return;
    }

    try {
      const response = await fetch("/api/user/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          locationName,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();
      if (response.ok) {
      } else {
        console.error("Error sending location:", data.message);
      }
    } catch (error) {
      console.error("Error sending location to API:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center" // Centers horizontally
        alignItems="center" // Centers vertically
        height="100vh" // Full viewport height
        bgcolor="#121212" // Background color
      >
        <LoadingScreen logoSrc="/loading.png"></LoadingScreen>
      </Box>
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
    return <MobileAttendeeSwing />;
  }

  return (
    <>
      {isMobile ? (
        <MobileAttendeeSwing />
      ) : (
        <Box
          display="flex"
          height="100vh"
          position="relative"
          overflow="hidden"
        >
          <Header />
          {memberalarm && parseInt(memberalarm) > 1 ? null : (
            <InstructionModal />
          )}
          <Box
            flex={1}
            display="flex"
            sx={{ pb: 3, paddingTop: "64px", backgroundColor: "#121212" }}
          >
            <ProfileCard profile={selectedUserProfile} />
          </Box>
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              position="relative"
              width="100%"
              height="100%"
              sx={{
                overflow: "hidden",
                position: "relative",
              }}
            >
              <UserProfileModal
                handleGrantAccess={handleGrantAccess}
                handleClose={handleClose}
                open={showDetail}
                userid={selectedUserId}
              />
              {idParam && isMobile === false
                ? // Display selectedUserProfile when param exists
                  selectedUserProfile && (
                    <TinderCard
                      key={selectedUserProfile.Id}
                      ref={refs.current[selectedUserProfile.Id]}
                      onSwipe={(dir) => handleSwipe(dir)}
                      preventSwipe={["up"]}
                    >
                      <Box
                        position="absolute"
                        left="50%"
                        top="50%"
                        sx={{
                          transform: "translate(-50%, -50%)",
                          // zIndex: 1,
                        }}
                      >
                        <Card
                          sx={{
                            width: 400,
                            height: 550,
                            boxShadow: 5,
                            backgroundColor: "#1e1e1e",
                            color: "white",
                            borderRadius: "16px",
                            position: "relative",
                          }}
                        >
                          <Box position="relative" width="100%" height="400px">
                            <Box
                              position="absolute"
                              top={0}
                              left={0}
                              width="100%"
                              height="100%"
                              zIndex={2}
                              sx={{ cursor: "grab" }}
                            ></Box>
                            <Avatar
                              src={selectedUserProfile?.Avatar}
                              alt={selectedUserProfile?.Username}
                              sx={{
                                position: "relative",
                                zIndex: 1,
                                width: "100%",
                                height: "100%",
                                borderTopLeftRadius: "0px",
                                borderTopRightRadius: "0px",
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

                            {/* Info Button */}

                            <Tooltip title="Click here if you find this photo offensive">
                              <Box
                                position="absolute"
                                top={8}
                                right={8}
                                color="rgba(11, 170, 243, 0.6)"
                                p={1}
                                borderRadius={1}
                                fontSize={16}
                                sx={{ cursor: "pointer", zIndex: 4 }}
                              >
                                <InfoIcon
                                  onClick={() => {
                                    setShowDetail(true);
                                    setSelectedUserId(selectedUserProfile?.Id);
                                  }}
                                />
                              </Box>
                            </Tooltip>

                            {/* Report Button */}
                            <Box
                              position="absolute"
                              bottom={8}
                              right={8}
                              color="white"
                              p={1}
                              borderRadius={1}
                              fontSize={12}
                              sx={{ cursor: "pointer", zIndex: 4 }}
                              onClick={handleReportModalToggle}
                            >
                              <Flag sx={{ color: "red" }} />
                            </Box>
                          </Box>
                          <CardContent>
                            <Typography variant="h6">
                              {selectedUserProfile?.Username}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "1.0rem",
                                fontWeight: "bold",
                                marginTop: "1px",
                                marginBottom: "5px",
                              }}
                              color="#C2185B"
                            >
                              {selectedUserProfile?.Location?.replace(
                                ", USA",
                                ""
                              )}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="secondary"
                              dangerouslySetInnerHTML={{
                                __html: selectedUserProfile?.Tagline,
                              }}
                              sx={{
                                display: "-webkit-box", // Enables a flex container for text truncation
                                WebkitLineClamp: 3, // Limits the text to 3 lines
                                WebkitBoxOrient: "vertical", // Establishes vertical orientation for line clamping
                                overflow: "hidden", // Hides overflowing text
                                textOverflow: "ellipsis", // Ensures the "..." is visible for truncated text
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Box>
                    </TinderCard>
                  )
                : // Display userProfiles when param is null
                  userProfiles
                    .slice(currentIndex, currentIndex + 1)
                    .map((profile: any, index: number) => {
                      if (!refs.current[profile.Id]) {
                        refs.current[profile.Id] = React.createRef();
                      }
                      return (
                        // Your existing TinderCard code for userProfiles
                        <TinderCard
                          key={profile.Id}
                          ref={refs.current[profile.Id]}
                          onSwipe={(dir) => handleSwipe(dir)}
                          preventSwipe={["up"]}
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
                                width: 400,
                                height: 550,
                                boxShadow: 5,
                                backgroundColor: "#1e1e1e",
                                color: "white",
                                borderRadius: "16px",
                                position: "relative",
                              }}
                            >
                              {/* Card content */}
                              <Box
                                position="relative"
                                width="100%"
                                height="400px"
                              >
                                {/* Swipe gesture overlay */}
                                <Box
                                  position="absolute"
                                  top={0}
                                  left={0}
                                  width="100%"
                                  height="100%"
                                  zIndex={2}
                                  sx={{ cursor: "grab" }}
                                ></Box>

                                {/* Avatar */}
                                <Avatar
                                  src={profile?.Avatar}
                                  alt={profile?.Username}
                                  sx={{
                                    position: "relative",
                                    zIndex: 1,
                                    width: "100%",
                                    height: "100%",
                                    borderTopLeftRadius: "0px",
                                    borderTopRightRadius: "0px",
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
                                        style={{
                                          width: "100px",
                                          height: "100px",
                                        }}
                                      />
                                    )}
                                    {swipeDirection === "right" && (
                                      <img
                                        src="/like.png"
                                        alt="Like"
                                        style={{
                                          width: "100px",
                                          height: "100px",
                                        }}
                                      />
                                    )}
                                    {swipeDirection === "down" && (
                                      <img
                                        src="/maybe.png"
                                        alt="Maybe"
                                        style={{
                                          width: "100px",
                                          height: "100px",
                                        }}
                                      />
                                    )}
                                  </Box>
                                )}

                                {/* Info Button */}
                                <Tooltip title="Click here if you find this photo offensive">
                                  <Box
                                    position="absolute"
                                    top={8}
                                    right={8}
                                    color="rgba(11, 170, 243, 0.6)"
                                    p={1}
                                    borderRadius={1}
                                    fontSize={16}
                                    sx={{ cursor: "pointer", zIndex: 4 }}
                                  >
                                    <InfoIcon
                                      onClick={() => {
                                        setShowDetail(true);
                                        setSelectedUserId(profile?.Id);
                                      }}
                                    />
                                  </Box>
                                </Tooltip>

                                {/* Report Button */}
                                <Tooltip title="Click here if you would like to report this user">
                                  <Box
                                    position="absolute"
                                    bottom={8}
                                    right={8}
                                    color="white"
                                    p={1}
                                    borderRadius={1}
                                    fontSize={12}
                                    sx={{ cursor: "pointer", zIndex: 4 }}
                                    onClick={handleReportModalToggle}
                                  >
                                    <Flag sx={{ color: "red" }} />
                                  </Box>
                                </Tooltip>
                              </Box>

                              {/* Card Content */}
                              <CardContent>
                                <Typography variant="h6">
                                  {profile?.Username}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "1.0rem",
                                    fontWeight: "bold",
                                    marginTop: "1px",
                                    marginBottom: "5px",
                                  }}
                                  color="#C2185B"
                                >
                                  {profile?.Location?.replace(", USA", "")}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="secondary"
                                  dangerouslySetInnerHTML={{
                                    __html: profile?.Tagline,
                                  }}
                                  sx={{
                                    display: "-webkit-box", // Enables a flex container for text truncation
                                    WebkitLineClamp: 3, // Limits the text to 3 lines
                                    WebkitBoxOrient: "vertical", // Establishes vertical orientation for line clamping
                                    overflow: "hidden", // Hides overflowing text
                                    textOverflow: "ellipsis", // Ensures the "..." is visible for truncated text
                                  }}
                                />
                              </CardContent>
                            </Card>
                          </Box>
                        </TinderCard>
                      );
                    })}
            </Box>
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: "20px", sm: "50px" },
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: { xs: "1rem", sm: "2rem" },
                zIndex: 1000,
                "@media (max-height: 700px)": {
                  // Add responsive styling for small heights
                  bottom: "10px",
                  "& .MuiButton-root": {
                    // Target all buttons
                    width: "60px",
                    height: "60px",
                    "& img": {
                      // Target the images inside buttons
                      width: "30px",
                      height: "30px",
                    },
                  },
                },
              }}
            >
              <Button
                onClick={() => handleButtonSwipe("left")}
                sx={{
                  width: { xs: "70px", sm: "90px" },
                  height: { xs: "70px", sm: "90px" },
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "5px solid #C2185B",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#C2185B",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/delete.png"
                  alt="Dislike"
                  sx={{
                    width: { xs: "35px", sm: "50px" },
                    height: { xs: "35px", sm: "50px" },
                  }}
                />
              </Button>

              <Button
                onClick={() => handleButtonSwipe("down")}
                sx={{
                  width: { xs: "70px", sm: "90px" },
                  height: { xs: "70px", sm: "90px" },
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "5px solid #C2185B",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#C2185B",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/maybe.png"
                  alt="Maybe"
                  sx={{
                    width: { xs: "35px", sm: "50px" },
                    height: { xs: "35px", sm: "50px" },
                  }}
                />
              </Button>

              <Button
                onClick={() => handleButtonSwipe("right")}
                sx={{
                  width: { xs: "70px", sm: "90px" },
                  height: { xs: "70px", sm: "90px" },
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "5px solid #C2185B",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#C2185B",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/like.png"
                  alt="Like"
                  sx={{
                    width: { xs: "35px", sm: "50px" },
                    height: { xs: "35px", sm: "50px" },
                  }}
                />
              </Button>
            </Box>
          </Box>
        </Box>
      )}
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
              color: "white",
              "& .MuiCheckbox-root": {
                color: "#9c27b0",
              },
              "& .MuiCheckbox-root.Mui-checked": {
                color: "#9c27b0",
              },
            }}
            control={
              <Checkbox
                checked={reportOptions.reportImage}
                onChange={handleCheckboxChange}
                name="reportImage"
              />
            }
            label="Inappropriate Image"
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
            <Button
              onClick={handleReportSubmit}
              variant="contained"
              color="secondary"
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Popup #1: Daily Limit */}
      {/* <Dialog
				open={showLimitPopup}
				onClose={() => setShowLimitPopup(false)}
				PaperProps={{
					sx: {
						backgroundColor: "#121212", // Dark background
						color: "#ffffff", // White text
					},
				}}
			>
				<DialogTitle sx={{ color: "#e91e63" }}>End Of Attendees Reached</DialogTitle> 
				<DialogContent>
					<Typography>End Of Attendees Reached</Typography>
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
							"&:hover": {
								backgroundColor: "#d81b60", // Slightly darker pink on hover
							},
						}}
					>
						Close
					</Button>
				</DialogContent>
			</Dialog> */}

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
              <Typography
                sx={{ mt: 2 }}
              >{`You've matched with ${matchedProfile.Username}!`}</Typography>
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
                    "&:hover": {
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
                    "&:hover": {
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
                    "&:hover": {
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
            color: "#ffffff", // White text
          },
        }}
      >
        {/* <DialogTitle sx={{ color: "white" }}>End of Records</DialogTitle> */}
        <DialogContent>
          <Typography>End Of Attendees Reached</Typography>
          <Button
            onClick={() => {
              router.push("/events"); // Invoke the reload function
              setShowLimitPopup(false); // Close the popup
            }}
            sx={{
              mt: 2,
              marginLeft: 1,
              color: "white",
              "&:hover": {
                backgroundColor: "#d81b60", // Slightly darker pink on hover
              },
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={matchesOpen}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Matches
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>This feature is in development</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setMatchesOpen(false)}
            sx={{ color: "red" }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={messageOpen}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Messages
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>This feature is in development</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setMessageOpen(false)}
            sx={{ color: "red" }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
