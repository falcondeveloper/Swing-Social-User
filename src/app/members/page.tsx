"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { notify, handleGeolocationError } from "@/lib/notifications";
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
  Container,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Flag } from "@mui/icons-material";
import TinderCard from "react-tinder-card";
import { useRouter } from "next/navigation";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { toast } from "react-toastify";
import MobileSweaping from "@/components/MobileSweaping";
import { useMediaQuery } from "@mui/material";
import ProfileCard from "@/components/ProfileCard";
import { jwtDecode } from "jwt-decode";
import ProfileImgCheckerModel from "@/components/ProfileImgCheckerModel";
import AppFooterMobile from "@/layout/AppFooterMobile";
import AppFooterDesktop from "@/layout/AppFooterDesktop";
import AppHeaderDesktop from "@/layout/AppHeaderDesktop";
import Loader from "@/commonPage/Loader";

export default function Home() {
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [profileId, setProfileId] = useState<any>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [isSwipingDisabled, setSwipingDisable] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [membership, setMembership] = useState(0);
  const [reportOptions, setReportOptions] = useState({
    reportUser: false,
    blockUser: false,
    reportImage: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [id, setId] = useState("");
  const [memberalarm, setMemberAlarm] = useState("0");

  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const refs = useRef<{ [key: string]: React.RefObject<any> }>({});
  const [idParam, setIdparam] = useState<any>(null);

  useEffect(() => {
    if (userProfiles.length > 0) {
      setLoading(false);
    }
  }, [userProfiles]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("loginInfo");
      const count = localStorage.getItem("memberalarm");
      setMemberAlarm(count ?? "0");

      if (token) {
        const decodeToken = jwtDecode<any>(token);
        if (decodeToken.profileId) {
          setProfileId(decodeToken.profileId);
          fetchCurrentLoginProfileId(decodeToken.profileId);
          fetchAllUserProfiles(decodeToken.profileId);
        }
        setMembership(decodeToken.membership);
      } else {
        router.push("/login");
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
      try {
        const response = await fetch(
          `/api/user/sweeping/user?id=${currentLoginProfileId}`
        );
        if (!response.ok) {
          console.error(
            "Failed to fetch advertiser data:",
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { user: advertiserData } = await response.json();
        if (!advertiserData) {
          console.error("Advertiser not found");
        } else {
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
        // setLoading(false);
      }
    }
  };

  const fetchAllUserProfiles = async (userid: any) => {
    try {
      const response = await fetch("/api/user/sweeping/swipes?id=" + userid, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const profiles = data?.swipes || [];
      setUserProfiles(profiles);

      if (data?.totalRows !== undefined && data.totalRows <= 0) {
        setShowEndPopup(true);
      } else if (profiles.length === 0) {
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
      setShowEndPopup(true);
      console.log("No more profiles to swipe.");
    }

    if (idParam != null) {
      router.push("/members");
    }

    setLoading(true);

    const processSwipe = async (status: "Denied" | "Liked" | "Maybe") => {
      await handleUpdateCategoryRelation(status);
      if (status === "Liked") await handleUpdateLikeMatch();
      setSwipeCount((prev) => prev + 1);
    };

    const endSwipe = () => {
      setTimeout(() => {
        setSwipeDirection(null);
        setCurrentIndex((prev) => prev + 1);
        setLoading(false);
      }, 500);
    };

    setSwipeDirection(direction);

    if (swipeCount >= dailyLimit) {
      if (membership === 1) {
        switch (direction) {
          case "left":
            await processSwipe("Denied");
            break;
          case "right":
            await processSwipe("Liked");
            break;
          case "down":
            await processSwipe("Maybe");
            break;
        }
        setLoading(false);
        endSwipe();
      } else {
        setShowLimitPopup(true);
        setSwipingDisable(true);
        endSwipe();
      }
    } else {
      switch (direction) {
        case "left":
          await processSwipe("Denied");
          break;
        case "right":
          await processSwipe("Liked");
          break;
        case "down":
          await processSwipe("Maybe");
          break;
      }
      endSwipe();
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
      const checkResponse = await fetch("/api/user/sweeping/relation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid: profileId,
          targetid: userProfiles[currentIndex]?.Id,
          newcategory: category,
        }),
      });

      const checkData = await checkResponse.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendNotification = async (message: string) => {
    if (!id) return;

    const response = await fetch("/api/user/notification/requestfriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: id,
        title: "❤️ New Match!",
        body: message,
        type: "new_match",
        url: `https://swing-social-user.vercel.app/members/${profileId}`,
      }),
    });

    return await response.json();
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
    if (!navigator.geolocation) {
      notify.location.notSupported();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get the location name
          const locationName = await getLocationName(latitude, longitude);

          // Send the location to your API
          await sendLocationToAPI(locationName, latitude, longitude);
        } catch (error) {
          console.error("Error processing location:", error);
          //    notify.error("Failed to process your location. Please try again.");
        }
      },
      (error) => {
        handleGeolocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    const apiKey = "AIzaSyBEr0k_aQ_Sns6YbIQ4UBxCUTdPV9AhdF0"; // Replace with your actual API key

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

  if (isMobile) {
    return <MobileSweaping />;
  }

  if (loading) {
    return (
      <Box
        sx={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#121212",
        }}
      >
        <AppHeaderDesktop />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <AppHeaderDesktop />
      <Container maxWidth={false} disableGutters>
        <Box
          display="flex"
          height="100vh"
          position="relative"
          overflow="hidden"
          marginTop="30px"
        >
          {memberalarm && parseInt(memberalarm) > 2 ? null : (
            <InstructionModal />
          )}
          <Box
            flex={1}
            display="flex"
            sx={{
              pb: { xs: 1, sm: 2, md: 3 },
              paddingTop: { xs: "56px", sm: "64px" },
              backgroundColor: "#121212",
            }}
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
              width="100%"
              height="100%"
              sx={{ overflow: "hidden", position: "relative" }}
            >
              {idParam && isMobile === false
                ? selectedUserProfile && (
                    <TinderCard
                      key={selectedUserProfile.Id}
                      ref={refs.current[selectedUserProfile.Id]}
                      onSwipe={(dir) => handleSwipe(dir)}
                      preventSwipe={["up"]}
                      flickOnSwipe
                    >
                      <Card
                        sx={{
                          width: "100%",
                          height: "100%",
                          boxShadow: 5,
                          backgroundColor: "#1e1e1e",
                          color: "white",
                          borderRadius: "16px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: "400px",
                            position: "relative",
                          }}
                        >
                          <Avatar
                            src={selectedUserProfile?.Avatar}
                            alt={selectedUserProfile?.Username}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 0,
                            }}
                            variant="square"
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
                              color="rgba(255, 45, 85, 0.9)" // Changed to match app's primary color (#FF2D55)
                              p={1}
                              borderRadius={1}
                              fontSize={32} // Increased from 16
                              sx={{ cursor: "pointer", zIndex: 4 }}
                            >
                              <InfoIcon
                                onClick={() => {
                                  setShowDetail(true);
                                  setSelectedUserId(selectedUserProfile?.Id);
                                }}
                                sx={{ fontSize: 48 }} // Added explicit size control
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
                                    color="rgba(255, 45, 85, 0.9)" // Changed to match app's primary color (#FF2D55)
                                    p={1}
                                    borderRadius={1}
                                    fontSize={32} // Increased from 16
                                    sx={{ cursor: "pointer", zIndex: 4 }}
                                  >
                                    <InfoIcon
                                      onClick={() => {
                                        setShowDetail(true);
                                        setSelectedUserId(profile?.Id);
                                      }}
                                      sx={{ fontSize: 48 }} // Added explicit size control
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
      </Container>
      {isMobile ? <AppFooterMobile /> : <AppFooterDesktop />}
      <UserProfileModal
        handleGrantAccess={handleGrantAccess}
        handleClose={handleClose}
        open={showDetail}
        userid={selectedUserId}
      />

      {profileId && <ProfileImgCheckerModel profileId={profileId} />}

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
      <Dialog
        open={showLimitPopup}
        onClose={() => setShowLimitPopup(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#121212", // Dark background
            color: "#ffffff", // White text
          },
        }}
      >
        <DialogTitle sx={{ color: "#e91e63" }}>Daily Limit Reached</DialogTitle>
        <DialogContent>
          <Typography>
            You've reached your daily limit of {dailyLimit} swipes. Upgrade your
            membership to swipe more!
          </Typography>
          <Button
            onClick={() => router.push(`/membership`)}
            sx={{
              mt: 2,
              backgroundColor: "#e91e63", // Pink color
              color: "white",
              "&:hover": {
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
        <DialogTitle sx={{ color: "white" }}>End of Records</DialogTitle>
        <DialogContent>
          <Typography>
            You've run out of matches. Adjust your preferences to view more
            members.
          </Typography>
          <Button
            onClick={() => router.push("/prefrences")}
            variant="outlined"
            sx={{
              mt: 2,
              color: "white",
              borderColor: "#e91e63",
              "&:hover": {
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
