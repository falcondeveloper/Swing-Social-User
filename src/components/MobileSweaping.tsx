"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  FormControlLabel,
  Checkbox,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  alpha,
} from "@mui/material";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { Flag } from "@mui/icons-material";
import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer";
import { jwtDecode } from "jwt-decode";
import profileInfoImage from "../../public/ProfileInfo.png";
import MobileAboutSection from "./MobileAboutSection";

export interface DetailViewHandle {
  open: (id: string) => void;
}

const spring = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";

const SwipeIndicator = ({ type, opacity }: any) => {
  if (!type) return null;
  const style = {
    position: "absolute",
    top: "40%",
    borderRadius: "12px",
    fontSize: "2rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    padding: "0.5rem 1rem",
    opacity: opacity,
    transition: "opacity 0.2s ease-in-out",
    zIndex: 10,
    userSelect: "none", // Prevent text selection during swipe
    pointerEvents: "none", // Ensure it doesn't interfere with touch events
  };
  const typeStyles: any = {
    delete: {
      right: "5%", // Adjusted for better visibility
      transform: "rotate(-25deg)",
      color: `#F44336`, // Tinder uses red for reject
    },
    like: {
      left: "5%", // Adjusted for better visibility
      transform: "rotate(25deg)",
      color: `#4CAF50`, // Tinder uses green for like
    },
    maybe: {
      left: "50%",
      top: "50%",
      transform: "translateX(-50%)",
      color: `#FFC107`,
    },
  };
  return (
    <div style={{ ...style, ...typeStyles[type] }}>
      {type === "maybe" ? (
        <img
          src="/maybe.png"
          alt="Maybe"
          style={{ width: "80px", height: "80px" }}
        />
      ) : type === "delete" ? (
        <img
          src="/delete.png"
          alt="Delete"
          style={{ width: "80px", height: "80px" }}
        />
      ) : (
        <img
          src="/like.png"
          alt="Like"
          style={{ width: "80px", height: "80px" }}
        />
      )}
    </div>
  );
};

export default function MobileSweaping() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
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

  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [cardStyles, setCardStyles] = useState<any>({ active: {}, next: {} });
  const [isExiting, setIsExiting] = useState(false); // New state for exit animation
  const [pendingSwipeAction, setPendingSwipeAction] = useState<string | null>(
    null
  ); // Store action during exit anim
  const lastSwipeTimeRef = useRef<number>(0);
  const SWIPE_THROTTLE_MS = 500;
  const currentCardRef = useRef<HTMLDivElement | null>(null);
  const isSwiping = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const router = useRouter();

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  };

  const visibleProfiles = useMemo(() => {
    return userProfiles.slice(currentIndex, currentIndex + 2);
  }, [userProfiles, currentIndex]);

  const preloadProfiles = useMemo(() => {
    return userProfiles.slice(currentIndex + 2, currentIndex + 7);
  }, [userProfiles, currentIndex]);

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

  const [isBlockingRefresh, setIsBlockingRefresh] = useState(false);

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
      preloadProfileImages(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const preloadProfileImages = useCallback(
    (profiles: any[]) => {
      if (!profiles || profiles.length === 0) return;

      const imageUrls = new Set<string>();

      profiles.forEach((profile) => {
        if (profile?.Avatar) {
          imageUrls.add(profile.Avatar);
        }
      });

      imageUrls.forEach((url) => {
        if (!preloadedImages.has(url)) {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            setPreloadedImages((prev) => {
              const updated = new Set(prev);
              updated.add(url);
              return updated;
            });
          };
        }
      });
    },
    [preloadedImages]
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

  const handleUpdateCategoryRelation = useCallback(
    async (category: any, targetProfile: any) => {
      try {
        setIdparam(null);
        const response = await fetch("/api/user/sweeping/relation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  const handleUpdateLikeMatch = useCallback(
    async (targetProfile: any) => {
      try {
        const response = await fetch("/api/user/sweeping/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  const isUserPremium = () => membership === 1;
  const hasReachedSwipeLimit = () => swipeCount >= DAILY_LIMIT;

  // This function now performs the actual backend updates and index increment
  const processSwipe = useCallback(
    (direction: string, targetProfile: any) => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCardStyles({
        active: {
          transform: "scale(1)",
          transition: `transform 0.5s ${spring}`,
        },
        next: {
          transform: "scale(0.95)",
          transition: `transform 0.5s ${spring}`,
        },
      });

      // Fire API calls in background without awaiting
      const apiCalls = [];

      if (direction === "left") {
        apiCalls.push(handleUpdateCategoryRelation("Denied", targetProfile));
      } else if (direction === "right") {
        apiCalls.push(handleUpdateCategoryRelation("Liked", targetProfile));
        apiCalls.push(handleUpdateLikeMatch(targetProfile));
      } else if (direction === "down") {
        apiCalls.push(handleUpdateCategoryRelation("Maybe", targetProfile));
      }

      Promise.all(apiCalls).catch((error) => {
        console.error("Swipe API error:", error);
      });

      if (currentIndex + 1 >= userProfiles.length) {
        setShowEndPopup(true);
      }

      if (!isUserPremium() && hasReachedSwipeLimit()) {
        setShowLimitPopup(true);
      } else if (!isUserPremium()) {
        setSwipeCount((prev) => prev + 1);
      }

      // Reset swipe state
      setIsProcessingSwipe(false);
      setIsExiting(false);
      setPendingSwipeAction(null);
    },
    [
      currentIndex,
      userProfiles.length,
      isUserPremium,
      hasReachedSwipeLimit,
      handleUpdateCategoryRelation,
      handleUpdateLikeMatch,
      setSwipeCount,
      setShowLimitPopup,
      setShowEndPopup,
      setCurrentIndex,
    ]
  );

  const getEventPoint = (e: any) => (e.touches ? e.touches[0] : e);

  const handleSwipeStart = (e: any) => {
    if (!currentProfile || isProcessingSwipe || isExiting) return; // Prevent start if already processing or exiting
    isSwiping.current = true;
    const point = getEventPoint(e);
    startPoint.current = { x: point.clientX, y: point.clientY };
    setCardStyles((prev: any) => ({
      ...prev,
      active: { ...prev.active, transition: "transform 0s" }, // Disable transition during drag
    }));
  };

  const handleSwipeMove = (e: any) => {
    if (!isSwiping.current || isProcessingSwipe || isExiting) return;
    const point = getEventPoint(e);
    const deltaX = point.clientX - startPoint.current.x;
    const deltaY = point.clientY - startPoint.current.y;
    const rotate = deltaX * 0.1;

    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

    // Prevent upward swipe
    if (isVertical && deltaY < 0) {
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    let swipeType = null;
    let swipeOpacity = 0;

    if (hasReachedSwipeLimit() && !isUserPremium()) {
      // If limit reached, just display popup, don't allow further movement
      // Optionally, you could disable movement here completely.
      // setShowLimitPopup(true); // Moved to handleSwipeEnd to not interrupt gesture
    }

    if (isVertical && deltaY > 0) {
      if (deltaY > 50) swipeType = "maybe";
      swipeOpacity = Math.min(deltaY / 100, 1); // Opacity based on positive deltaY
    } else {
      if (deltaX > 50) swipeType = "like";
      if (deltaX < -50) swipeType = "delete";
      swipeOpacity = Math.min(Math.abs(deltaX) / 100, 1); // Opacity based on deltaX
    }

    const nextCardScale = 0.95 + Math.min(Math.abs(deltaX) / 2000, 0.05); // Scale up next card slightly

    setCardStyles({
      active: {
        transform: `translateX(${deltaX}px) translateY(${
          isVertical ? deltaY : 0
        }px) rotate(${rotate}deg)`,
        swipeType, // Pass to component for indicator logic
        swipeOpacity, // Pass to component for indicator logic
        transition: "transform 0s", // Ensure no transition during move
      },
      next: {
        transform: `scale(${nextCardScale})`,
        transition: `transform 0.2s ease-out`, // Smooth scaling for next card
      },
    });
  };

  const triggerExitAnimation = useCallback(
    (action: string) => {
      const now = Date.now();
      if (now - lastSwipeTimeRef.current < SWIPE_THROTTLE_MS) {
        return;
      }
      lastSwipeTimeRef.current = now;

      if (isProcessingSwipe || isExiting) return;

      const targetProfile = currentProfile;
      if (!targetProfile) return;

      if (idParam != null) {
        router.push("/members");
        return;
      }

      setIsExiting(true); // Start exit animation phase
      setIsProcessingSwipe(true); // Prevent new gestures
      setPendingSwipeAction(action); // Store action to process after animation

      let exitTransform = "";
      let finalRotate = 0;
      if (action === "like") {
        exitTransform = "translateX(200vw)";
        finalRotate = 30; // Rotate when it flies off
      } else if (action === "delete") {
        exitTransform = "translateX(-200vw)";
        finalRotate = -30;
      } else if (action === "maybe") {
        exitTransform = "translateY(200vh)";
        finalRotate = 0; // No rotation for 'maybe'
      }

      setCardStyles((prev: any) => ({
        ...prev,
        active: {
          transform: `${exitTransform} rotate(${finalRotate}deg)`,
          transition: `transform 0.5s ${spring}`, // Fast, smooth exit
          swipeType: action, // Keep indicator visible during exit
          swipeOpacity: 1, // Full opacity during exit
        },
        next: {
          transform: "scale(1)", // Animate next card to full size quickly
          transition: `transform 0.3s ${spring}`,
        },
      }));
    },
    [
      currentProfile,
      idParam,
      router,
      isProcessingSwipe,
      isExiting,
      setCardStyles,
      setPendingSwipeAction,
      setIsExiting,
      setIsProcessingSwipe,
    ]
  );

  const handleSwipeEnd = useCallback(() => {
    if (!isSwiping.current || isProcessingSwipe || isExiting) return;
    isSwiping.current = false;

    const swipeThreshold = 120; // Distance in pixels to confirm a swipe
    const { transform = "" } = cardStyles.active || {};
    const deltaX = parseFloat(
      transform.match(/translateX\(([^p]+)px\)/)?.[1] || "0"
    );
    const deltaY = parseFloat(
      transform.match(/translateY\(([^p]+)px\)/)?.[1] || "0"
    );

    let action = null;
    // Determine action based on threshold
    if (deltaX > swipeThreshold) action = "like";
    else if (deltaX < -swipeThreshold) action = "delete";
    else if (deltaY > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX))
      action = "maybe"; // Ensure vertical swipe is dominant for 'maybe'

    if (action) {
      // Check limits before performing action
      if (!isUserPremium() && hasReachedSwipeLimit()) {
        setShowLimitPopup(true);
        // Animate card back if limit reached and swipe action not taken
        setCardStyles({
          active: {
            transform: "scale(1)",
            transition: `transform 0.4s ${spring}`,
            swipeType: null, // Clear indicator
            swipeOpacity: 0,
          },
          next: {
            transform: "scale(0.95)",
            transition: `transform 0.4s ${spring}`,
          },
        });
        return;
      }
      // If action is valid, trigger the exit animation
      triggerExitAnimation(action);
    } else {
      // If no action, reset card position
      setCardStyles({
        active: {
          transform: "scale(1)",
          transition: `transform 0.4s ${spring}`,
          swipeType: null, // Clear indicator
          swipeOpacity: 0,
        },
        next: {
          transform: "scale(0.95)",
          transition: `transform 0.4s ${spring}`,
        },
      });
    }
  }, [
    cardStyles,
    isProcessingSwipe,
    isExiting,
    isUserPremium,
    hasReachedSwipeLimit,
    triggerExitAnimation, // Now a dependency
  ]);

  useEffect(() => {
    const cardElement = currentCardRef.current;
    if (!cardElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      handleSwipeStart(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      if (e.cancelable) {
        e.preventDefault();
      }
      handleSwipeMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      handleSwipeEnd();
    };

    // Add passive: false to touchmove listener to allow preventDefault
    cardElement.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    cardElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    cardElement.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });
    cardElement.addEventListener("touchcancel", handleTouchEnd, {
      passive: false,
    }); // Important for interrupted gestures

    return () => {
      cardElement.removeEventListener("touchstart", handleTouchStart);
      cardElement.removeEventListener("touchmove", handleTouchMove);
      cardElement.removeEventListener("touchend", handleTouchEnd);
      cardElement.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    currentIndex, // Re-attach listeners when current card changes
    isProcessingSwipe,
    isExiting,
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
  ]);

  // Global touchmove listener to prevent scrolling *if* a swipe is active (for body scroll)
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isSwiping.current && e.cancelable) {
        e.preventDefault();
      }
    };
    window.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    return () => {
      window.removeEventListener("touchmove", handleGlobalTouchMove);
    };
  }, []);

  // Initial and subsequent card style resets for new active card
  useEffect(() => {
    // This effect runs when currentIndex changes, after a card has exited
    // It resets the styles for the *new* active card (which was previously the 'next' card)
    setCardStyles({
      active: { transform: "scale(1)", transition: `transform 0.5s ${spring}` },
      next: {
        transform: "scale(0.95)",
        transition: `transform 0.5s ${spring}`,
      },
    });
  }, [currentIndex]); // Depend on currentIndex

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (
        window.scrollY === 0 &&
        e.touches &&
        e.touches.length === 1 &&
        e.touches[0].clientY > 0
      ) {
        if (e.cancelable) e.preventDefault();
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

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
          sx={{ width: 50, height: "auto" }}
        />
        <span style={{ color: "#C2185B", paddingLeft: 10, fontSize: 32 }}>
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
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={{ display: "none" }}>
        {preloadProfiles.map((profile, index) =>
          profile?.Avatar ? (
            <img
              key={`preload-${index}`}
              src={profile.Avatar}
              alt="preload"
              onLoad={() => {
                setPreloadedImages((prev) => {
                  const updated = new Set(prev);
                  updated.add(profile.Avatar);
                  return updated;
                });
              }}
            />
          ) : null
        )}
      </div>

      <div className="mobile-sweeping-container">
        {idParam !== null ? (
          <Card
            elevation={0}
            sx={{
              border: "none",
              width: "100%",
              maxWidth: "100vw",
              minWidth: "100%",
              marginLeft: 0,
              marginRight: 0,
              height: "calc(100vh - 180px)",
              marginTop: { sm: "20px" },
              boxShadow: "none",
              position: "absolute",
              left: 0,
              right: 0,
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
                imgProps={{
                  loading: "eager", // Cargar la imagen con alta prioridad
                  style: { objectFit: "cover" },
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
              key={profile.Id}
              ref={index === 0 ? currentCardRef : null}
              elevation={0}
              sx={{
                border: "none",
                width: "100%",
                maxWidth: "100vw",
                minWidth: "100%",
                height: "calc(100vh - 120px)",
                marginTop: { sm: "30px" },
                boxShadow: "none",
                position: "absolute",
                left: 0,
                right: 0,
                backgroundColor: "#121212",
                color: "white",
                // Apply cardStyles based on index
                transform:
                  index === 0
                    ? cardStyles.active.transform
                    : cardStyles.next.transform,
                transition:
                  index === 0
                    ? cardStyles.active.transition
                    : cardStyles.next.transition,
                zIndex: index === 0 ? 2 : 1, // Active card on top
              }}
              // onTransitionEnd event for the active card
              onTransitionEnd={(e) => {
                if (
                  index === 0 && // Only for the active card
                  isExiting && // Only if an exit animation was triggered
                  e.propertyName === "transform" && // Ensure it's the transform ending
                  pendingSwipeAction // Ensure there's a pending action
                ) {
                  const actionMap: { [key: string]: string } = {
                    delete: "left",
                    like: "right",
                    maybe: "down",
                  };
                  const direction = actionMap[pendingSwipeAction];
                  // Perform the actual processing AFTER the card has animated out
                  if (currentProfile) {
                    processSwipe(direction, currentProfile);
                  }
                }
              }}
            >
              <div className="profile-main-box">
                {index === 0 && cardStyles.active && (
                  <SwipeIndicator
                    type={cardStyles.active.swipeType}
                    opacity={cardStyles.active.swipeOpacity}
                  />
                )}
                <img
                  src={profile?.Avatar || ""}
                  alt={profile?.Username || "Unknown"}
                  className="profile-img"
                />

                <img
                  src="/ProfileInfo.png"
                  alt="Profile Info"
                  onClick={() => {
                    setShowDetail(true);
                    setSelectedUserId(userProfiles[currentIndex]?.Id);
                  }}
                  className="profile-info"
                />
                <div className="report-flag" onClick={handleReportModalToggle}>
                  <Flag sx={{ color: "#9c27b0" }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    background:
                      "linear-gradient(to top, rgb(18, 18, 18) 3%, rgba(18, 18, 18, 0.25) 25%, rgba(18, 18, 18, 0) 40%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ paddingLeft: "10px", fontWeight: 800 }}
                  >
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
                    style={{
                      fontSize: "1.0rem",
                      fontWeight: "bold",
                      paddingLeft: "10px",
                    }}
                  >
                    {profile?.Location?.replace(", USA", "") || ""}
                  </Typography>
                </div>
              </div>
              {/* <CardContent sx={{ padding: "5px 0", pb: 0 }}>

                <MobileAboutSection aboutText={profile?.About} />
              </CardContent> */}
            </Card>
          ))
        )}
      </div>

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

      {/* Popup #2: Match! */}
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

      {/* Popup #3: No more profiles */}
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
