"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import Footer from "./Footer";
import { jwtDecode } from "jwt-decode";
export interface DetailViewHandle {
  open: (id: string) => void;
}

export default function MobileSweaping() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<any>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const DAILY_LIMIT = 15;
  const [profileId, setProfileId] = useState<any>();
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [idParam, setIdparam] = useState<any>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [membership, setMembership] = useState(0);
  const [id, setId] = useState("");
  const [memberalarm, setMemberAlarm] = useState("0");

  // Nuevas variables de estado para optimización
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [pendingSwipeDirection, setPendingSwipeDirection] = useState<
    string | null
  >(null);
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSwipeTimeRef = useRef<number>(0);
  const SWIPE_THROTTLE_MS = 300; // Throttle swipes to prevent lag

  const router = useRouter();

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  };

  // Memoizar perfiles visibles para evitar re-renders innecesarios
  const visibleProfiles = useMemo(() => {
    return userProfiles.slice(currentIndex, currentIndex + 2);
  }, [userProfiles, currentIndex]);

  // Memoizar perfil actual
  const currentProfile = useMemo(() => {
    return userProfiles[currentIndex];
  }, [userProfiles, currentIndex]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);
      var param = queryParams.get("q");

      setIdparam(param);
      const id = localStorage.getItem("logged_in_profile");
      if (id) {
        getUserList(id);
        fetchCurrentProfileInfo(param);
        setProfileId(id);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("loginInfo");
      const count = localStorage.getItem("memberalarm");
      setMemberAlarm(count ?? "0");

      if (token) {
        const decodeToken = jwtDecode<any>(token);
        setProfileId(decodeToken.profileId);
        setMembership(decodeToken.membership);
        fetchCurrentProfileInfo(decodeToken.profileId);
        getUserList(decodeToken.profileId);
      } else {
        router.push("/login");
      }
    }
  }, []);

  const fetchCurrentProfileInfo = useCallback(async (currentProfileId: any) => {
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
      }
    }
  }, []);

  const getUserList = useCallback(async (profileId: string) => {
    try {
      const response = await fetch(
        "/api/user/sweeping/swipes?id=" + profileId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const profiles = data?.swipes || [];
      setUserProfiles(profiles);

      if (data?.totalRows !== undefined && data.totalRows <= 0) {
        setShowEndPopup(true);
      }
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimizar las llamadas API con debounce
  const debouncedApiCall = useCallback(
    (apiCall: () => Promise<void>, delay: number = 300) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await apiCall();
          resolve();
        }, delay);
      });
    },
    []
  );

  const handleUpdateCategoryRelation = useCallback(
    async (category: any, targetProfile: any) => {
      try {
        setIdparam(null);
        const response = await fetch("/api/user/sweeping/relation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pid: profileId,
            targetid: targetProfile?.Id,
            newcategory: category,
          }),
        });

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    },
    [profileId]
  );

  const sendNotification = useCallback(
    async (message: any, targetProfile: any) => {
      const response = await fetch("/api/user/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: targetProfile?.Id,
          body: message,
          image: "https://example.com/path/to/image.jpg",
          url: `https://swing-social-website.vercel.app/members/${profileId}`,
        }),
      });

      return await response.json();
    },
    [profileId]
  );

  const handleUpdateLikeMatch = useCallback(
    async (targetProfile: any) => {
      try {
        const response = await fetch("/api/user/sweeping/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileid: profileId,
            targetid: targetProfile?.Id,
          }),
        });

        const username = localStorage.getItem("profileUsername");
        const data = await response.json();

        if (data?.isMatch) {
          setMatchedProfile(targetProfile);
          setShowMatchPopup(true);
          setId(targetProfile?.Id);
          sendNotification(
            `You have a new match with ${username}!`,
            targetProfile
          );
        }

        return data;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    },
    [profileId, sendNotification]
  );

  const handleReportUser = useCallback(
    async (targetProfile: any) => {
      try {
        const response = await fetch("/api/user/sweeping/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileid: profileId,
            targetid: targetProfile?.Id,
          }),
        });

        return await response.json();
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    },
    [profileId]
  );

  const handleGrantAccess = useCallback(async () => {
    try {
      const response = await fetch("/api/user/sweeping/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileid: profileId,
          targetid: currentProfile?.Id,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }, [profileId, currentProfile]);

  const [currentSwipeImage, setCurrentSwipeImage] = useState<string | null>(
    null
  );
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [dynamicPosition, setDynamicPosition] = useState<any>("77%");

  // Helper functions
  const isUserPremium = () => membership === 1;
  const hasReachedSwipeLimit = () => swipeCount >= DAILY_LIMIT;

  // Función principal de swipe optimizada
  const processSwipe = useCallback(
    async (direction: string, targetProfile: any) => {
      if (isProcessingSwipe) return;

      setIsProcessingSwipe(true);

      try {
        // Realizar todas las operaciones API de forma paralela cuando sea posible
        const promises: Promise<any>[] = [];

        if (direction === "left") {
          promises.push(handleUpdateCategoryRelation("Denied", targetProfile));
        } else if (direction === "right") {
          promises.push(handleUpdateCategoryRelation("Liked", targetProfile));
          promises.push(handleUpdateLikeMatch(targetProfile));
        } else if (direction === "down") {
          promises.push(handleUpdateCategoryRelation("Maybe", targetProfile));
        }

        // Ejecutar todas las promesas en paralelo
        await Promise.all(promises);

        // Actualizar el índice inmediatamente después de las operaciones API
        setCurrentIndex((prevIndex) => prevIndex + 1);

        // Verificar límites y mostrar popups si es necesario
        if (currentIndex + 1 >= userProfiles.length) {
          setShowEndPopup(true);
        }

        if (!isUserPremium() && hasReachedSwipeLimit()) {
          setShowLimitPopup(true);
        } else if (!isUserPremium()) {
          setSwipeCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error processing swipe:", error);
      } finally {
        setIsProcessingSwipe(false);
      }
    },
    [
      isProcessingSwipe,
      currentIndex,
      userProfiles.length,
      isUserPremium,
      hasReachedSwipeLimit,
      handleUpdateCategoryRelation,
      handleUpdateLikeMatch,
    ]
  );

  // Optimizar handleSwipeAction con throttling
  const handleSwipeAction = useCallback(
    async (action: string) => {
      const now = Date.now();

      // Throttle swipes to prevent rapid fire
      if (now - lastSwipeTimeRef.current < SWIPE_THROTTLE_MS) {
        return;
      }

      lastSwipeTimeRef.current = now;

      if (isProcessingSwipe) return;

      const targetProfile = currentProfile;
      if (!targetProfile) return;

      if (idParam != null) {
        router.push("/members");
        return;
      }

      // Mapear acciones a direcciones
      const actionMap: { [key: string]: string } = {
        deiend: "left",
        delete: "left",
        like: "right",
        maybe: "down",
      };

      const direction = actionMap[action] || action;
      await processSwipe(direction, targetProfile);
    },
    [currentProfile, idParam, router, processSwipe, isProcessingSwipe]
  );

  // Optimizar swipe handlers
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isProcessingSwipe) return;

      const offsetX = eventData.deltaX;
      const offsetY = eventData.deltaY;

      if (hasReachedSwipeLimit() && !isUserPremium()) {
        setShowLimitPopup(true);
        return;
      }

      // Set offset based on swipe direction
      if (eventData.dir === "Down") {
        setSwipeOffset(offsetY);
      } else {
        setSwipeOffset(offsetX);
      }

      setSwipeDirection(eventData.dir.toLowerCase());

      // Set dynamic position and swipe image based on direction
      switch (eventData.dir) {
        case "Left":
          setDynamicPosition("77%");
          setCurrentSwipeImage("delete.png");
          break;
        case "Right":
          setDynamicPosition("30%");
          setCurrentSwipeImage("like.png");
          break;
        case "Down":
          setDynamicPosition("77%");
          setCurrentSwipeImage("maybe.png");
          break;
        default:
          setCurrentSwipeImage(null);
          break;
      }
    },
    onSwiped: (eventData) => {
      if (isProcessingSwipe) return;

      const direction = eventData.dir.toLowerCase();
      const isLeft = direction === "left" && Math.abs(eventData.deltaX) > 100;
      const isRight = direction === "right" && Math.abs(eventData.deltaX) > 100;
      const isDown = direction === "down" && Math.abs(eventData.deltaY) > 100;

      // Reset visual states immediately
      setSwipeOffset(0);
      setCurrentSwipeImage(null);

      if (isLeft || isRight || isDown) {
        if (hasReachedSwipeLimit() && !isUserPremium()) {
          setShowLimitPopup(true);
          return;
        }

        // Clear any existing timeout
        if (swipeTimeoutRef.current) {
          clearTimeout(swipeTimeoutRef.current);
        }

        // Set pending direction and process after a short delay
        setPendingSwipeDirection(direction);

        // Process swipe immediately instead of waiting
        const targetProfile = currentProfile;
        if (targetProfile) {
          processSwipe(direction, targetProfile);
        }

        // Clean up animation state
        swipeTimeoutRef.current = setTimeout(() => {
          setSwipeDirection(null);
          setPendingSwipeDirection(null);
        }, 300);
      } else {
        // Reset states for incomplete swipes
        setSwipeDirection(null);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Report modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    reportUser: false,
    blockUser: false,
  });

  const handleReportModalToggle = useCallback(() => {
    setIsReportModalOpen((prev) => !prev);
  }, []);

  const handleCheckboxChange = useCallback((event: any) => {
    const { name, checked } = event.target;
    setReportOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }, []);

  const handleReportSubmit = useCallback(() => {
    setIsReportModalOpen(false);
    if (currentProfile) {
      handleReportUser(currentProfile);
    }
  }, [handleReportUser, currentProfile]);

  const handleChatAction = () => {
    router.push(`/messaging/${id}`);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#121212"
      >
        <Box
          component="img"
          src="/loading.png"
          alt="Logo"
          sx={{
            width: "50px",
            height: "auto",
            flexShrink: 0,
          }}
        />
        <span
          style={{ color: "#C2185B", paddingLeft: "10px", fontSize: "32px" }}
        >
          SWINGSOCIAL
        </span>
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
          width: { lg: 514, md: 514 },
          background: { lg: "#0a0a0a", md: "#0a0a0a" },
          marginLeft: "auto",
          marginRight: "auto",
        }}
        {...swipeHandlers}
      >
        <Header />

        {/** Like Button */}
        <Box
          sx={{
            display: { lg: "flex", md: "flex", sm: "none", xs: "none" },
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: "47%",
            right: "0%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            borderRadius: "50%",
            bgcolor: alpha("#FF1B6B", 0.1),
            padding: "0px 7px 5px 8px",
            textAlign: "center",
            width: 80,
            height: 80,
          }}
          onClick={() => handleSwipeAction("like")}
        >
          <img
            src="/like.png"
            alt="Like"
            style={{ width: "50px", height: "50px" }}
          />
        </Box>

        {/** Delete Button */}
        <Box
          sx={{
            display: { lg: "flex", md: "flex", sm: "none", xs: "none" },
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: "47%",
            left: "0%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            borderRadius: "50%",
            bgcolor: alpha("#FF1B6B", 0.1),
            padding: "0px 14px 3px 8px",
            textAlign: "center",
            width: 80,
            height: 80,
          }}
          onClick={() => handleSwipeAction("delete")}
        >
          <img
            src="/delete.png"
            alt="Delete"
            style={{ width: "50px", height: "50px" }}
          />
        </Box>

        {/** Maybe Button */}
        <Box
          sx={{
            display: { lg: "flex", md: "flex", sm: "none", xs: "none" },
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: "77%",
            left: "56%",
            transform: "translateX(-50%)",
            cursor: "pointer",
            borderRadius: "50%",
            bgcolor: alpha("#FF1B6B", 0.1),
            padding: "0px 10px 5px 8px",
            textAlign: "center",
            width: 80,
            height: 80,
            zIndex: 999,
          }}
          onClick={() => handleSwipeAction("maybe")}
        >
          <img
            src="/maybe.png"
            alt="Maybe"
            style={{ width: "50px", height: "50px" }}
          />
        </Box>

        {idParam !== null ? (
          <Card
            elevation={0}
            sx={{
              border: "none",
              marginLeft: "5px",
              marginRight: "5px",
              width: { xs: 395, sm: 405, md: 300 },
              // height: { md: 450, lg: 450, sm: 580, xs: 580 },
              height: "calc(100vh - 20px)",
              marginTop: { sm: "20px" },
              boxShadow: "none",
              position: "absolute",
              zIndex: 2,
              backgroundColor: "#121212",
              color: "white",
            }}
          >
            <Box
              position="relative"
              width="100%"
              sx={{
                height: {
                  lg: 450,
                  md: 380,
                  sm: 380,
                  xs: "calc(100vh - 210px)",
                  mb: 15,
                },
              }}
            >
              <Avatar
                alt={selectedUserProfile?.Username || "Unknown"}
                src={selectedUserProfile?.Avatar || ""}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                }}
              />

              <Box
                position="absolute"
                top="120px"
                right="-10px"
                sx={{
                  transform: "translate(-50%, -50%)",
                  width: "40px", // Adjust the size as needed
                  height: "auto",
                  zIndex: 2,
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
                    height: "100%",
                  }}
                />
              </Box>

              <Box
                position="absolute"
                bottom={8}
                bgcolor="rgba(0,0,0,0.6)"
                color="white"
                p={1}
                borderRadius={1}
                fontSize={12}
                sx={{
                  cursor: "pointer",
                  right: { sm: 20, xs: 20, lg: 8, md: 8 },
                }}
                onClick={handleReportModalToggle}
              >
                <Flag sx={{ color: "#9c27b0" }} />
              </Box>
            </Box>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {selectedUserProfile?.Username || "Unknown"} ,{" "}
                {selectedUserProfile?.DateOfBirth
                  ? new Date().getFullYear() -
                    new Date(selectedUserProfile.DateOfBirth).getFullYear()
                  : ""}
                {selectedUserProfile?.Gender === "Male"
                  ? "M"
                  : selectedUserProfile?.Gender === "Female"
                  ? "F"
                  : ""}
                {selectedUserProfile?.PartnerDateOfBirth && (
                  <>
                    {" | "}
                    {new Date().getFullYear() -
                      new Date(
                        selectedUserProfile.PartnerDateOfBirth
                      ).getFullYear()}
                    {selectedUserProfile?.PartnerGender === "Male"
                      ? "M"
                      : selectedUserProfile?.PartnerGender === "Female"
                      ? "F"
                      : ""}
                  </>
                )}
              </Typography>
              <Typography variant="body2" color="#C2185B">
                {selectedUserProfile?.Location?.replace(", USA", "") || ""}
              </Typography>
              <AboutSection aboutText={selectedUserProfile?.About} />
            </CardContent>
          </Card>
        ) : (
          visibleProfiles.map((profile: any, index: number) => (
            <Card
              key={index}
              elevation={0}
                sx={{
                  border: "none",
                  marginLeft: "5px",
                  marginRight: "5px",
                  width: { xs: 395, sm: 405, md: 300 },
                  // height: { md: 450, lg: 450, sm: 580, xs: 580 },
                  height: "calc(100vh - 20px)",
                  marginTop: { sm: "30px" },
                  boxShadow: "none",
                  position: "absolute",
                  transform:
                    index === 0
                      ? swipeDirection === "down"
                        ? `translateY(${swipeOffset}px)`
                        : `translateX(${swipeOffset}px)`
                      : "translate(0px, 0px)",
                  zIndex: index === 0 ? 2 : 1,
                  backgroundColor: "black",
                  color: "white",
                }}
              >
                <Box
                  position="relative"
                  width="100%"
                  sx={{
                    height: {
                      lg: 450,
                      md: 380,
                      sm: 380,
                      xs: "calc(100vh - 210px)",
                      mb: 15,
                    },
                  }}
                >
                  <Avatar
                    alt={profile?.Username || "Unknown"}
                    src={profile?.Avatar || ""}
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 0,
                    }}
                  />

                  {/* Overlaying ProfileInfo.png */}
                  <Box
                    position="absolute"
                    top="120px"
                    right="-15px"
                    sx={{
                      transform: "translate(-50%, -50%)",
                      width: "40px", // Adjust the size as needed
                      height: "auto",
                      zIndex: 2,
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
                        height: "100%",
                      }}
                    />
                  </Box>

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
                    sx={{
                      cursor: "pointer",
                      right: { sm: 20, xs: 20, lg: 8, md: 8 },
                    }}
                    onClick={handleReportModalToggle}
                  >
                    <Flag sx={{ color: "#9c27b0" }} />
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {profile?.Username || "Unknown"} ,{" "}
                    {profile?.DateOfBirth
                      ? new Date().getFullYear() -
                        new Date(profile.DateOfBirth).getFullYear()
                      : ""}
                    {profile?.Gender === "Male"
                      ? "M"
                      : profile?.Gender === "Female"
                      ? "F"
                      : ""}
                    {profile?.PartnerDateOfBirth && (
                      <>
                        {" | "}
                        {new Date().getFullYear() -
                          new Date(
                            profile.PartnerDateOfBirth
                          ).getFullYear()}{" "}
                        {profile?.PartnerGender === "Male"
                          ? "M"
                          : profile?.PartnerGender === "Female"
                          ? "F"
                          : ""}
                      </>
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#C2185B"
                    style={{ fontSize: "1.0rem", fontWeight: "bold" }}
                  >
                    {profile?.Location?.replace(", USA", "") || ""}
                  </Typography>
                  <AboutSection aboutText={profile?.About} />
                </CardContent>
              </Card>
            ))
        )}
      </Box>
      {memberalarm && parseInt(memberalarm) > 2 ? null : <InstructionModal />}
      <UserProfileModal
        handleGrantAccess={handleGrantAccess}
        handleClose={handleClose}
        open={showDetail}
        userid={selectedUserId}
      />

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
            <Button
              onClick={handleReportSubmit}
              variant="contained"
              color="secondary"
            >
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
            color: "#ffffff", // White text
          },
        }}
      >
        <DialogTitle sx={{ color: "#e91e63" }}>Daily Limit Reached</DialogTitle>
        <DialogContent>
          <Typography>
            You've reached your daily limit of {DAILY_LIMIT} swipes. Upgrade
            your membership to swipe more!
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
            onClick={() => setShowLimitPopup(false)}
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

      <Footer />
    </>
  );
}
