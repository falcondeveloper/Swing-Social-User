"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
export interface DetailViewHandle {
  open: (id: string) => void;
}

const spring = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

const SwipeIndicator = ({ type, opacity }: any) => {
  if (!type) return null;
  const style = {
    position: 'absolute',
    top: '40px',
    borderRadius: '12px',
    fontSize: '2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: '0.5rem 1rem',
    opacity: opacity,
    transition: 'opacity 0.2s ease-in-out',
    zIndex: 10,
  };
  const typeStyles: any = {
    delete: {
      left: '65%',
      top: '40%',
      transform: 'rotate(-25deg)',
      color: `#4CAF50`,
    },
    like: {
      right: '65%',
      top: '40%',
      transform: 'rotate(25deg)',
      color: `#F44336`,
    },
    maybe: {
      left: '50%',
      top: '70%',
      transform: 'translateX(-50%)',
      color: `#FFC107`,
    }
  };
  return <div style={{ ...style, ...typeStyles[type] }}>
    {type === "maybe" ?
      <img
        src="/maybe.png"
        alt="Maybe"
        style={{ width: "80px", height: "80px" }}
      />
      : type === "delete" ?
        <img
          src="/delete.png"
          alt="Delete"
          style={{ width: "80px", height: "80px" }}
        />
        : <img
          src="/like.png"
          alt="Like"
          style={{ width: "80px", height: "80px" }}
        />
    }
  </div>;
};

export default function MobileSweaping() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
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

  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [pendingSwipeDirection, setPendingSwipeDirection] = useState<
    string | null
  >(null);
  const [cardStyles, setCardStyles] = useState<any>({ active: {}, next: {} });
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

  const profilesToRender = useMemo(() => ({
    visible: userProfiles.slice(currentIndex, currentIndex + 2),
    preload: userProfiles.slice(currentIndex + 2, currentIndex + 7),
    current: userProfiles[currentIndex] ?? null,
  }), [userProfiles, currentIndex]);

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
      preloadProfileImages(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const preloadProfileImages = useCallback((profiles: any[]) => {

    if (!Array.isArray(profiles) || profiles.length === 0) return;
    const newUrls = new Set<string>();
    for (const profile of profiles) {
      const url = profile?.Avatar;
      if (url && !preloadedImages.has(url)) newUrls.add(url);
    }
    if (newUrls.size === 0) return;
    newUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => setPreloadedImages((prev) => new Set(prev).add(url));
    });
  }, [preloadedImages]);

  const handleUpdateCategoryRelation = useCallback(
    async (category: any, targetProfile: any) => {
      try {
        setIdparam(null);
        const response = await fetch("/api/user/sweeping/relation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pid: profileId, targetid: targetProfile?.Id, newcategory: category }),
        });
        return await response.json();
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    }, [profileId]);

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileid: profileId, targetid: targetProfile?.Id }),
        });
        const username = localStorage.getItem("profileUsername");
        const data = await response.json();
        if (data?.isMatch) {
          setMatchedProfile(targetProfile);
          setShowMatchPopup(true);
          setId(targetProfile?.Id);
          sendNotification(`You have a new match with ${username}!`, targetProfile);
        }
        return data;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    }, [profileId, sendNotification]);

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
          targetid: profilesToRender?.current?.Id,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }, [profileId, profilesToRender?.current]);

  const [swipeOffset, setSwipeOffset] = useState(0);

  const isUserPremium = () => membership === 1;
  const hasReachedSwipeLimit = () => swipeCount >= DAILY_LIMIT;

  const processSwipe = useCallback(async (action: string, targetProfile: any) => {
    if (isProcessingSwipe) return;
    setIsProcessingSwipe(true);

    const now = Date.now();
    if (now - lastSwipeTimeRef.current < SWIPE_THROTTLE_MS) {
      setIsProcessingSwipe(false);
      return;
    }
    lastSwipeTimeRef.current = now;

    if (idParam != null) {
      router.push("/members");
      setIsProcessingSwipe(false);
      return;
    }

    if (membership !== 1) {
      setCardStyles({
        active: { transform: 'scale(1)', transition: `transform 0.4s ${spring}` },
        next: { transform: 'scale(0.95)', transition: `transform 0.4s ${spring}` }
      });
      setShowLimitPopup(true);
      setIsProcessingSwipe(false);
      return;
    }

    if (action === "delete") await handleUpdateLikeMatch(targetProfile);
    else if (action === "like") await handleUpdateCategoryRelation(1, targetProfile);
    else if (action === "maybe") await handleUpdateCategoryRelation(2, targetProfile);

    if (membership !== 1) {
      setSwipeCount((p) => p + 1);
    }

    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= userProfiles.length) {
        setShowEndPopup(true);
      }
      return nextIndex;
    });

    setIsProcessingSwipe(false);
  }, [
    isProcessingSwipe, currentIndex, userProfiles.length, idParam, membership,
    handleUpdateLikeMatch, handleUpdateCategoryRelation
  ]);

  const getEventPoint = (e: any) => e.touches ? e.touches[0] : e;

  const handleSwipeStart = (e: any) => {
    if (!profilesToRender.current || isProcessingSwipe) return;
    isSwiping.current = true;
    const point = getEventPoint(e);
    startPoint.current = { x: point.clientX, y: point.clientY };
    setCardStyles((prev: any) => ({
      ...prev,
      active: { ...prev.active, transition: 'transform 0s' },
    }));
  };

  const handleSwipeMove = (e: any) => {
    if (!isSwiping.current) return;
    const point = getEventPoint(e);
    const deltaX = point.clientX - startPoint.current.x;
    const deltaY = point.clientY - startPoint.current.y;
    const rotate = deltaX * 0.1;
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

    let swipeType = null;
    let swipeOpacity = 0;
    if (isVertical) {
      if (deltaY > 50) swipeType = 'maybe';
      swipeOpacity = Math.min(Math.abs(deltaY) / 100, 1);
    } else {
      if (deltaX > 50) swipeType = 'like';
      if (deltaX < -50) swipeType = 'delete';
      swipeOpacity = Math.min(Math.abs(deltaX) / 100, 1);
    }

    const nextCardScale = 0.95 + Math.min(Math.abs(deltaX) / 2000, 0.05);

    setCardStyles({
      active: {
        transform: `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotate}deg)`,
        swipeType,
        swipeOpacity,
      },
      next: {
        transform: `scale(${nextCardScale})`
      }
    });
  };

  const handleSwipeEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    const swipeThreshold = 120;
    const { transform = '' } = cardStyles.active || {};
    const deltaX = parseInt(transform.match(/translateX\(([^p]+)px\)/)?.[1] || '0');
    const deltaY = parseInt(transform.match(/translateY\(([^p]+)px\)/)?.[1] || '0');

    let action = null;
    if (deltaX > swipeThreshold) action = 'like';
    if (deltaX < -swipeThreshold) action = 'delete';
    if (deltaY > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) action = 'maybe';

    if (action) {
      handleSwipeAction(action);
    } else {
      // Snap back
      setCardStyles({
        active: { transform: 'scale(1)', transition: `transform 0.4s ${spring}` },
        next: { transform: 'scale(0.95)', transition: `transform 0.4s ${spring}` }
      });
    }
  };

  const handleSwipeAction = useCallback((action: string) => {
    const targetProfile = profilesToRender.current;
    if (!targetProfile || isProcessingSwipe) return;

    let finalStyle: any = {
      transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      swipeType: action,
      swipeOpacity: 0
    };

    if (action === 'delete') finalStyle.transform = 'translateX(-150%) rotate(-45deg)';
    else if (action === 'like') finalStyle.transform = 'translateX(150%) rotate(45deg)';
    else if (action === 'maybe') finalStyle.transform = 'translateY(150%)';

    setCardStyles({
      active: finalStyle,
      next: { transform: 'scale(1)', transition: `transform 0.6s ${spring}` }
    });

    processSwipe(action, targetProfile);
  }, [profilesToRender.current, isProcessingSwipe, processSwipe]);


  useEffect(() => {
    setCardStyles({
      active: { transform: 'scale(1)', transition: `transform 0.5s ${spring}` },
      next: { transform: 'scale(0.95)', transition: `transform 0.5s ${spring}` }
    });
  }, [currentIndex]);

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
    if (profilesToRender?.current) {
      handleReportUser(profilesToRender?.current);
    }
  }, [handleReportUser, profilesToRender?.current]);

  const handleChatAction = () => {
    router.push(`/messaging/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#121212">
        <Box component="img" src="/loading.png" alt="Logo" sx={{ width: 50, height: "auto" }} />
        <span style={{ color: "#C2185B", paddingLeft: 10, fontSize: 32 }}>SWINGSOCIAL</span>
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
        {profilesToRender.preload.map((p, i) => p?.Avatar ? <img key={i} src={p.Avatar} alt="preload" /> : null)}
      </div>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        position="relative"
        overflow="hidden"
        sx={{ width: { lg: 514, md: 514 }, background: "#0a0a0a", mx: "auto" }}
      >

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
                imgProps={{
                  loading: 'eager', // Cargar la imagen con alta prioridad
                  style: { objectFit: 'cover' }
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
        ) : profilesToRender.visible.length > 0 ? (
          profilesToRender?.visible.map((profile: any, index: number) => (
            <Card
              key={profile.Id}
              ref={index === 0 ? currentCardRef : null}
              elevation={0}
              onMouseDown={index === 0 ? handleSwipeStart : undefined}
              onTouchStart={index === 0 ? handleSwipeStart : undefined}
              onMouseMove={index === 0 ? handleSwipeMove : undefined}
              onTouchMove={index === 0 ? handleSwipeMove : undefined}
              onMouseUp={index === 0 ? handleSwipeEnd : undefined}
              onMouseLeave={index === 0 ? handleSwipeEnd : undefined}
              onTouchEnd={index === 0 ? handleSwipeEnd : undefined}
              sx={{
                border: "none",
                marginLeft: "5px",
                marginRight: "5px",
                width: { xs: 395, sm: 405, md: 300 },
                height: "calc(100vh - 180px)",
                marginTop: { sm: "30px" },
                boxShadow: "none",
                position: "absolute",
                // Apply cardStyles based on index
                ...(index === 0 ? cardStyles.active : {
                  ...cardStyles.next,
                  zIndex: 1, // Ensure the next card is behind the active one
                }),
                // For the "next" card, ensure it's not translated initially
                transform: index === 1 ? cardStyles.next.transform : cardStyles.active.transform,
                zIndex: index === 0 ? 2 : 1, // Active card on top
                backgroundColor: "black",
                color: "white",
                overflow: "auto",
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
              >              {index === 0 && cardStyles.active && <SwipeIndicator type={cardStyles.active.swipeType} opacity={cardStyles.active.swipeOpacity} />}

                <Avatar
                  alt={profile?.Username || "Unknown"}
                  src={profile?.Avatar || ""}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 0,
                  }}
                  imgProps={{
                    loading: 'eager', // Cargar la imagen con alta prioridad
                    style: { objectFit: 'cover' }
                  }}
                />

                {/* Overlaying ProfileInfo.png */}
                <Box
                  position="absolute"
                  top="70px"
                  right="5px"
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
                    right: { sm: 30, xs: 30, lg: 8, md: 8 },
                  }}
                  onClick={handleReportModalToggle}
                >
                  <Flag sx={{ color: "#9c27b0" }} />
                </Box>
              </Box>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom style={{ paddingLeft: "10px" }}>
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
                  style={{ fontSize: "1.0rem", fontWeight: "bold", paddingLeft: "10px" }}
                >
                  {profile?.Location?.replace(", USA", "") || ""}
                </Typography>
                <AboutSection aboutText={profile?.About} />
              </CardContent>
            </Card>
          ))
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
            <Typography variant="h6" color="white">Please wait...</Typography>
          </Box>
        )}
      </Box>

      {memberalarm && parseInt(memberalarm) > 2 ? null : <InstructionModal />}
      {selectedUserId && <UserProfileModal
        handleGrantAccess={handleGrantAccess}
        handleClose={handleClose}
        open={showDetail}
        userid={selectedUserId}
      />}

      {isReportModalOpen && <Modal open={isReportModalOpen} onClose={handleReportModalToggle}>
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
      </Modal>}

      {/* Popup #1: Daily Limit */}
      {showLimitPopup && <Dialog
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
      </Dialog>}

      {/* Popup #2: Match Found */}
      {showMatchPopup && <Dialog
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
      </Dialog>}

      {/* Popup #3: End of Records */}
      {showEndPopup && <Dialog
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
      </Dialog>}

      <Footer />
    </>
  );
}
