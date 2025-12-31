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
  Typography,
  Avatar,
  Button,
  FormControlLabel,
  Checkbox,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Fade,
  Chip,
} from "@mui/material";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { Close, MoreHoriz } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import PreferencesSheet from "./PreferencesSheet";
import Loader from "@/commonPage/Loader";
import AppFooterMobile from "@/layout/AppFooterMobile";
import AppHeaderMobile from "@/layout/AppHeaderMobile";
import { motion, AnimatePresence } from "framer-motion";

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
    userSelect: "none",
    pointerEvents: "none",
  };
  const typeStyles: any = {
    delete: {
      right: "5%",
      transform: "rotate(-25deg)",
      color: `#F44336`,
    },
    like: {
      left: "5%",
      transform: "rotate(25deg)",
      color: `#4CAF50`,
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
  const lastSwipeTimeRef = useRef<number>(0);
  const SWIPE_THROTTLE_MS = 0;
  const currentCardRef = useRef<HTMLDivElement | null>(null);
  const isSwiping = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const router = useRouter();

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
  const DAILY_LIMIT = 30;
  const [profileId, setProfileId] = useState<any>();
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [membership, setMembership] = useState(0);
  const [id, setId] = useState("");
  const [memberalarm, setMemberAlarm] = useState("0");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    reportUser: false,
    blockUser: false,
    reportImage: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [cardStyles, setCardStyles] = useState<any>({ active: {}, next: {} });
  const [isExiting, setIsExiting] = useState(false);
  const [pendingSwipeAction, setPendingSwipeAction] = useState<string | null>(
    null
  );
  const [emptyMessage, setEmptyMessage] = useState<string>("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [prefsOpen, setPrefsOpen] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const openPrefs = () => setPrefsOpen(true);
  const closePrefs = () => setPrefsOpen(false);

  const visibleProfiles = useMemo(() => {
    return userProfiles.slice(currentIndex, currentIndex + 2);
  }, [userProfiles, currentIndex]);

  const preloadProfiles = useMemo(() => {
    return userProfiles.slice(currentIndex + 2, currentIndex + 7);
  }, [userProfiles, currentIndex]);

  const currentProfile = useMemo(() => {
    return userProfiles[currentIndex];
  }, [userProfiles, currentIndex]);

  const sendNotification = useCallback(
    async (message: any, targetProfile: any) => {
      const response = await fetch("/api/user/notification/requestfriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetProfile?.Id,
          title: "❤️ New Match!",
          body: message,
          type: "new_match",
          url: `https://swing-social-user.vercel.app/members/${profileId}`,
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

      setEmptyMessage(data?.message || "");

      if (data?.totalRows !== undefined && data.totalRows <= 0) {
        setShowEndPopup(true);
      } else if (profiles.length === 0) {
        setShowEndPopup(true);
      }

      preloadProfileImages(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrefsSaved = useCallback(() => {
    setLoading(true);
    if (profileId) {
      getUserList(profileId);
      setSnack({
        open: true,
        message: "Preferences updated successfully",
        severity: "success",
      });
    }
  }, [getUserList, profileId]);

  const handleSnackClose = useCallback(
    (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") return;
      setSnack((prev) => ({ ...prev, open: false }));
    },
    []
  );

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
          const img = document.createElement("img");
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

  const handleUpdateCategoryRelation = useCallback(
    async (category: any, targetProfile: any) => {
      try {
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

  const fetchNextBatchAndAppend = useCallback(async () => {
    if (!profileId) return;

    if (isFetchingMore) return;
    setIsFetchingMore(true);

    const MAX_RETRIES = 4;
    const RETRY_DELAY_MS = 700;
    const PREFETCH_THRESHOLD = 4;
    let attempt = 0;
    let appended = false;

    while (attempt < MAX_RETRIES && !appended) {
      attempt += 1;
      try {
        const response = await fetch(
          `/api/user/sweeping/swipes?id=${profileId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        const profiles = data?.swipes || [];

        // Filter out any IDs we already have locally (defensive)
        const existingIds = new Set(userProfiles.map((p) => p.Id));
        const newProfiles = profiles.filter((p: any) => !existingIds.has(p.Id));

        if (newProfiles.length > 0) {
          // append
          setUserProfiles((prev) => [...prev, ...newProfiles]);
          preloadProfileImages(newProfiles);
          appended = true;
          break;
        } else {
          // If backend returned 0 or only already-known IDs, wait and retry once or twice
          // This helps in case the relationship write hasn't fully committed yet
          await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        }
      } catch (err) {
        console.error("Error while trying to fetch next batch:", err);
        // wait a bit and retry
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      }
    }

    if (!appended) {
      // after retries we still have no new profiles — show end popup
      setShowEndPopup(true);
    }

    setIsFetchingMore(false);
  }, [profileId, userProfiles, preloadProfileImages]);

  const isUserPremium = () => membership === 1;
  const hasReachedSwipeLimit = () => swipeCount >= DAILY_LIMIT;

  const processSwipe = useCallback(
    (direction: string, targetProfile: any) => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        const PREFETCH_THRESHOLD = 20;
        const remaining = Math.max(0, userProfiles.length - nextIndex);

        if (profileId && !isFetchingMore && remaining <= PREFETCH_THRESHOLD) {
          fetchNextBatchAndAppend().catch((err) =>
            console.error("Prefetch failed:", err)
          );
        }

        if (profileId && nextIndex >= userProfiles.length && !isFetchingMore) {
          fetchNextBatchAndAppend().catch((err) =>
            console.error("fetchNextBatch error:", err)
          );
        }

        return nextIndex;
      });

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

      const apiCalls: Promise<any>[] = [];

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

      if (!isUserPremium() && hasReachedSwipeLimit()) {
        setShowLimitPopup(true);
      } else if (!isUserPremium()) {
        setSwipeCount((prev) => prev + 1);
      }

      setIsProcessingSwipe(false);
      setIsExiting(false);
      setPendingSwipeAction(null);
    },
    [
      userProfiles.length,
      isUserPremium,
      hasReachedSwipeLimit,
      handleUpdateCategoryRelation,
      handleUpdateLikeMatch,
      setSwipeCount,
      setShowLimitPopup,
      setShowEndPopup,
      setCurrentIndex,
      fetchNextBatchAndAppend,
      isFetchingMore,
      profileId,
    ]
  );

  const getEventPoint = (e: any) => (e.touches ? e.touches[0] : e);

  const handleSwipeStart = (e: any) => {
    if (!currentProfile || isProcessingSwipe || isExiting) return;
    isSwiping.current = true;
    const point = getEventPoint(e);
    startPoint.current = { x: point.clientX, y: point.clientY };
    setCardStyles((prev: any) => ({
      ...prev,
      active: { ...prev.active, transition: "transform 0s" },
    }));
  };

  const handleSwipeMove = (e: any) => {
    if (!isSwiping.current || isProcessingSwipe || isExiting) return;
    const point = getEventPoint(e);
    const deltaX = point.clientX - startPoint.current.x;
    const deltaY = point.clientY - startPoint.current.y;
    const rotate = deltaX * 0.1;

    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

    if (isVertical && deltaY < 0) {
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    let swipeType = null;
    let swipeOpacity = 0;

    if (hasReachedSwipeLimit() && !isUserPremium()) {
      setShowLimitPopup(true);
    }

    if (isVertical && deltaY > 0) {
      if (deltaY > 50) swipeType = "maybe";
      swipeOpacity = Math.min(deltaY / 100, 1);
    } else {
      if (deltaX > 50) swipeType = "like";
      if (deltaX < -50) swipeType = "delete";
      swipeOpacity = Math.min(Math.abs(deltaX) / 100, 1);
    }

    const nextCardScale = 0.95 + Math.min(Math.abs(deltaX) / 2000, 0.05);

    setCardStyles({
      active: {
        transform: `translateX(${deltaX}px) translateY(${
          isVertical ? deltaY : 0
        }px) rotate(${rotate}deg)`,
        swipeType,
        swipeOpacity,
        transition: "transform 0s",
      },
      next: {
        transform: `scale(${nextCardScale})`,
        transition: `transform 0.2s ease-out`,
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

      setIsExiting(true);
      setIsProcessingSwipe(true);
      setPendingSwipeAction(action);

      let exitTransform = "";
      let finalRotate = 0;
      if (action === "like") {
        exitTransform = "translateX(200vw)";
        finalRotate = 30;
      } else if (action === "delete") {
        exitTransform = "translateX(-200vw)";
        finalRotate = -30;
      } else if (action === "maybe") {
        exitTransform = "translateY(200vh)";
        finalRotate = 0;
      }

      setCardStyles((prev: any) => ({
        ...prev,
        active: {
          transform: `${exitTransform} rotate(${finalRotate}deg)`,
          transition: `transform 0.1s ease-out`,
          swipeType: action,
          swipeOpacity: 1,
        },
        next: {
          transform: "scale(1)",
          transition: `transform 0.01s ease-in`,
        },
      }));
    },
    [
      currentProfile,
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

    const swipeThreshold = 120;
    const { transform = "" } = cardStyles.active || {};
    const deltaX = parseFloat(
      transform.match(/translateX\(([^p]+)px\)/)?.[1] || "0"
    );
    const deltaY = parseFloat(
      transform.match(/translateY\(([^p]+)px\)/)?.[1] || "0"
    );

    let action = null;
    if (deltaX > swipeThreshold) action = "like";
    else if (deltaX < -swipeThreshold) action = "delete";
    else if (deltaY > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX))
      action = "maybe";

    if (action) {
      if (!isUserPremium() && hasReachedSwipeLimit()) {
        setShowLimitPopup(true);
        setCardStyles({
          active: {
            transform: "scale(1)",
            transition: `transform 0.4s ${spring}`,
            swipeType: null,
            swipeOpacity: 0,
          },
          next: {
            transform: "scale(0.95)",
            transition: `transform 0.4s ${spring}`,
          },
        });
        return;
      }
      triggerExitAnimation(action);
    } else {
      setCardStyles({
        active: {
          transform: "scale(1)",
          transition: `transform 0.4s ${spring}`,
          swipeType: null,
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
    triggerExitAnimation,
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
    });

    return () => {
      cardElement.removeEventListener("touchstart", handleTouchStart);
      cardElement.removeEventListener("touchmove", handleTouchMove);
      cardElement.removeEventListener("touchend", handleTouchEnd);
      cardElement.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    currentIndex,
    isProcessingSwipe,
    isExiting,
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
  ]);

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

  useEffect(() => {
    setCardStyles({
      active: { transform: "scale(1)", transition: `transform 0.5s ${spring}` },
      next: {
        transform: "scale(0.95)",
        transition: `transform 0.5s ${spring}`,
      },
    });
  }, [currentIndex]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (prefsOpen) return;

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
  }, [prefsOpen]);

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  };

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
      setIsReportModalOpen(false);
      setReportOptions({
        reportUser: false,
        blockUser: false,
        reportImage: false,
      });
    } catch (err) {
      console.error("Error reporting image:", err);
      toast.error("Error reporting image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = useCallback(async () => {
    if (!currentProfile) return;

    setIsSubmitting(true);

    const token = localStorage.getItem("loginInfo");
    const decodeToken = token ? jwtDecode<any>(token) : {};
    const reportedByName = decodeToken?.profileName || "Me";

    try {
      if (reportOptions.reportImage) {
        await reportImageApi({
          reportedById: profileId,
          reportedByName,
          reportedUserId: currentProfile?.Id,
          reportedUserName: currentProfile?.Username,
          image: currentProfile?.Avatar,
        });
      }

      if (reportOptions.reportUser || reportOptions.blockUser) {
        const res = await fetch("/api/user/sweeping/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileid: profileId,
            targetid: currentProfile?.Id,
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
  }, [currentProfile, profileId, reportOptions]);

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
        <AppHeaderMobile />
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
        <AppFooterMobile />
      </Box>
    );
  }

  const swingStyleConfig: Record<string, { bg: string; color?: string }> = {
    exploring: {
      bg: "#3B4C6B",
    },
    fullSwap: {
      bg: "#6B2F3B",
    },
    softSwap: {
      bg: "#3B6B5A",
    },
    voyeur: {
      bg: "#6B5A3B",
    },
  };

  const menuBtnStyle = {
    width: 36,
    height: 36,
    bgcolor: "rgba(114,114,148,0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: "50%",
    "&:hover": {
      bgcolor: "rgba(114,114,148,0.65)",
    },
  };

  return (
    <>
      <AppHeaderMobile />
      <div style={{ display: "none" }}>
        {preloadProfiles.map((profile, index) =>
          profile?.Avatar ? (
            <img
              key={index}
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
        {visibleProfiles.map((profile: any, index: number) => (
          <Card
            key={profile.Id}
            ref={index === 0 ? currentCardRef : null}
            elevation={0}
            sx={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              boxShadow: "none",
              transform:
                index === 0
                  ? cardStyles.active.transform
                  : cardStyles.next.transform,
              transition:
                index === 0
                  ? cardStyles.active.transition
                  : cardStyles.next.transition,
              zIndex: index === 0 ? 2 : 1,
            }}
            onTransitionEnd={(e) => {
              if (
                index === 0 &&
                isExiting &&
                e.propertyName === "transform" &&
                pendingSwipeAction
              ) {
                const actionMap: any = {
                  delete: "left",
                  like: "right",
                  maybe: "down",
                };
                processSwipe(actionMap[pendingSwipeAction], profile);
              }
            }}
          >
            <Box
              sx={{
                height: "100%",
                px: "18px",
                paddingTop: "18px",
                background:
                  "linear-gradient(180deg, rgba(86,30,67,1) 0%, rgba(72,26,55,1) 50%, rgba(25,14,15,1) 100%)",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box sx={{ height: "65%", position: "relative" }}>
                  <Box
                    component="img"
                    src={profile.Avatar || "/fallback-avatar.png"}
                    alt={profile.Username}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      border: "2px solid rgba(255, 255, 255, 0.35)",
                      borderRadius: "20px",
                    }}
                  />

                  {/* <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      right: 12,
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {[1, 2, 3, 4].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: "5px",
                          bgcolor: i === 0 ? "#fff" : "rgba(255,255,255,0.35)",
                        }}
                      />
                    ))}
                  </Box> */}

                  {index === 0 && cardStyles.active && (
                    <SwipeIndicator
                      type={cardStyles.active.swipeType}
                      opacity={cardStyles.active.swipeOpacity}
                    />
                  )}

                  <IconButton
                    onClick={openPrefs}
                    sx={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      width: 36,
                      height: 36,
                      bgcolor: "rgba(114, 114, 148, 0.5)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderRadius: "50%",
                      "&:hover": {
                        bgcolor: "rgba(114, 114, 148, 0.65)",
                      },
                    }}
                  >
                    <img
                      src="/swiping-card/preferences.svg"
                      alt="preferences"
                      style={{
                        width: 16,
                        height: 16,
                        objectFit: "contain",
                      }}
                    />
                  </IconButton>

                  {/* <IconButton
                    onClick={handleReportModalToggle}
                    sx={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 36,
                      height: 36,
                      bgcolor: "rgba(114, 114, 148, 0.5)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderRadius: "50%",
                      "&:hover": {
                        bgcolor: "rgba(114, 114, 148, 0.65)",
                      },
                    }}
                  >
                    <Flag sx={{ color: "#fff", fontSize: 18 }} />
                  </IconButton> */}

                  <IconButton
                    onClick={toggleMenu}
                    sx={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 36,
                      height: 36,
                      bgcolor: isMenuOpen
                        ? "rgba(255, 138, 155, 0.86)"
                        : "rgba(114,114,148,0.5)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "50%",
                      zIndex: 5,
                      transition: "all 0.25s ease",
                      "&:hover": {
                        bgcolor: isMenuOpen
                          ? "#FF6FA3" // hover pink
                          : "rgba(114,114,148,0.65)",
                      },
                    }}
                  >
                    {isMenuOpen ? (
                      <Close sx={{ color: "#fff", fontSize: 18 }} />
                    ) : (
                      <MoreHoriz sx={{ color: "#fff", fontSize: 20 }} />
                    )}
                  </IconButton>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          top: 60,
                          right: 14,
                          zIndex: 4,
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <IconButton
                          sx={menuBtnStyle}
                          onClick={() => {
                            setShowDetail(true);
                            setSelectedUserId(profile?.Id);
                          }}
                        >
                          <Box component="img" src="/swiping-card/info.svg" />
                        </IconButton>

                        <IconButton
                          onClick={handleReportModalToggle}
                          sx={menuBtnStyle}
                        >
                          <Box component="img" src="/swiping-card/flag.svg" />
                        </IconButton>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* <Box
                    sx={{
                      position: "absolute",
                      bottom: 30,
                      right: 14,
                      gap: "8px",
                      display: "flex",
                    }}
                  >
                    <IconButton
                      sx={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "30px",
                      }}
                    >
                      <ArrowBackIosNew
                        sx={{ fontSize: 18, color: "##72729480" }}
                      />
                    </IconButton>

                    <IconButton
                      sx={{
                        bgcolor: "rgba(0,0,0,0.5)",
                      }}
                    >
                      <ArrowForwardIos sx={{ fontSize: 18, color: "#fff" }} />
                    </IconButton>
                  </Box> */}
                </Box>

                <Box sx={{ pt: "18px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                      gap: 1,
                      mb: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#F50057",
                        lineHeight: "34px",
                        letterSpacing: 0,
                      }}
                    >
                      {profile.Username},{" "}
                      {profile.DateOfBirth
                        ? new Date().getFullYear() -
                          new Date(profile.DateOfBirth).getFullYear()
                        : ""}
                    </Typography>

                    <Box
                      component="img"
                      src={
                        profile.Gender === "Male"
                          ? "/swiping-card/male.svg"
                          : "/swiping-card/female.svg"
                      }
                      alt={profile.Gender}
                      sx={{ width: 16, height: 16 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      mb: "12px",
                    }}
                  >
                    <Box
                      component="img"
                      src="/swiping-card/location.svg"
                      alt="Location"
                      sx={{ width: 16, height: 16 }}
                    />
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "#FFFFFF",
                        fontWeight: "400",
                        lineHeight: "18px",
                      }}
                    >
                      {profile.Location?.replace(", USA", "")}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "13px",
                      mb: "12px",
                      lineHeight: "16px",
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 400,
                      letterSpacing: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    dangerouslySetInnerHTML={{ __html: profile?.About }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "nowrap",
                      gap: 1,
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {profile?.SwingStyleTags?.slice(0, 4).map(
                      (tag: string, index: number) => {
                        const style = swingStyleConfig[tag] || {
                          bg: "#4D354B",
                        };

                        return (
                          <Chip
                            key={`${tag}-${index}`}
                            label={tag}
                            sx={{
                              bgcolor: style.bg,
                              color: "rgba(255,255,255,0.7)",
                              fontSize: "13px",
                              height: "24px",
                              borderRadius: "8px",
                              fontWeight: 400,
                              textTransform: "capitalize",
                              flexShrink: 1,
                              minWidth: 0,
                              maxWidth: "25%",

                              "& .MuiChip-label": {
                                px: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                            }}
                          />
                        );
                      }
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </div>
      <AppFooterMobile />

      <PreferencesSheet
        open={prefsOpen}
        onOpen={openPrefs}
        onClose={closePrefs}
        profileId={profileId}
        onSaved={handlePrefsSaved}
      />

      {memberalarm && parseInt(memberalarm) > 2 ? null : <InstructionModal />}

      {selectedUserId && (
        <UserProfileModal
          handleGrantAccess={handleGrantAccess}
          handleClose={handleClose}
          open={showDetail}
          userid={selectedUserId}
        />
      )}

      <Modal
        open={isReportModalOpen}
        onClose={handleReportModalToggle}
        closeAfterTransition
      >
        <Fade in={isReportModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "#1E1E1E",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" color="white" gutterBottom>
              Report or Block User
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.reportImage}
                  onChange={(e) =>
                    setReportOptions((prev) => ({
                      ...prev,
                      reportImage: e.target.checked,
                    }))
                  }
                  sx={{
                    color: "#f50057",
                    "&.Mui-checked": { color: "#f50057" },
                  }}
                  name="reportImage"
                />
              }
              label="Inappropriate Image"
              sx={{ color: "white", display: "block", mb: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.reportUser}
                  onChange={(e) =>
                    setReportOptions((prev) => ({
                      ...prev,
                      reportUser: e.target.checked,
                    }))
                  }
                  sx={{
                    color: "#f50057",
                    "&.Mui-checked": { color: "#f50057" },
                  }}
                />
              }
              label="Report User"
              sx={{ color: "white", display: "block", mb: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.blockUser}
                  onChange={(e) =>
                    setReportOptions((prev) => ({
                      ...prev,
                      blockUser: e.target.checked,
                    }))
                  }
                  sx={{
                    color: "#f50057",
                    "&.Mui-checked": { color: "#f50057" },
                  }}
                />
              }
              label="Block User"
              sx={{ color: "white", display: "block", mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleReportModalToggle}
                sx={{ bgcolor: "#333", "&:hover": { bgcolor: "#444" } }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleReportSubmit}
                sx={{ bgcolor: "#f50057", "&:hover": { bgcolor: "#c51162" } }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Popup #1: Daily Limit */}
      <Dialog
        open={showLimitPopup}
        onClose={() => setShowLimitPopup(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#121212",
            color: "#ffffff",
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
              backgroundColor: "#e91e63",
              color: "white",
              "&:hover": {
                backgroundColor: "#d81b60",
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
                backgroundColor: "#d81b60",
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
            backgroundColor: "#121212",
            color: "#ffffff",
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
                  border: "2px solid #03dac5",
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
                  onClick={() => router.push(`/messaging/${id}`)}
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
            backgroundColor: "#121212",
            color: "#ffffff",
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>End of Records</DialogTitle>
        <DialogContent>
          <Typography>
            {emptyMessage ||
              "You've run out of matches. Adjust your preferences to view more members."}
          </Typography>
          <Button
            onClick={() => {
              openPrefs();
              setShowEndPopup(false);
            }}
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

      <Snackbar
        open={snack.open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={2000}
        onClose={handleSnackClose}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snack.severity}
          variant="filled"
          sx={{
            backgroundColor: "white",
            color: "#fc4c82",
            fontWeight: "bold",
            alignItems: "center",
            borderRight: "5px solid #fc4c82",
          }}
          icon={
            <Box
              component="img"
              src="/icon.png"
              alt="Logo"
              sx={{ width: 20, height: 20 }}
            />
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
