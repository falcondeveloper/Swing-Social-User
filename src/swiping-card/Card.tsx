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
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";
import { Flag } from "@mui/icons-material";
import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import TuneIcon from "@mui/icons-material/Tune";
import Loader from "@/commonPage/Loader";
import PreferencesSheet from "@/components/PreferencesSheet";

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

const SwipeCardComponent: React.FC = () => {
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
  const [idParam, setIdparam] = useState<any>(null);
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
      const response = await fetch("/api/user/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: targetProfile?.Id,
          body: message,
          image: "https://example.com/path/to/image.jpg",
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
      // update index using functional updater so we can compute the next index reliably
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // PREFETCH when remaining cards after this swipe are <= threshold
        const PREFETCH_THRESHOLD = 20;
        const remaining = Math.max(0, userProfiles.length - nextIndex);

        // If we're near the end (<= threshold) and not already fetching, prefetch
        if (profileId && !isFetchingMore && remaining <= PREFETCH_THRESHOLD) {
          fetchNextBatchAndAppend().catch((err) =>
            console.error("Prefetch failed:", err)
          );
        }

        // If we've actually advanced to or past the end, try to fetch more as a fallback
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

      if (idParam != null) {
        router.push("/members");
        return;
      }

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
      const queryParams = new URLSearchParams(window.location.search);
      var param = queryParams.get("q");
      setIdparam(param);
      const id = localStorage.getItem("logged_in_profile");
      const token = localStorage.getItem("loginInfo");
      const count = localStorage.getItem("memberalarm");
      setMemberAlarm(count ?? "0");
      if (id) {
        getUserList(id);
        fetchCurrentProfileInfo(param);
        setProfileId(id);
      }
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
      <>
        <Header />
        <Loader />
      </>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: "calc(100vh - 60px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div className="mobile-sweeping-container">
        {visibleProfiles.map((profile: any, index: number) => (
          <div
            key={profile.Id}
            ref={index === 0 ? currentCardRef : null}
            className="swipe-card"
            style={{
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
                const actionMap: { [key: string]: string } = {
                  delete: "left",
                  like: "right",
                  maybe: "down",
                };
                const direction = actionMap[pendingSwipeAction];
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

              {/* Profile Image with gradient overlay */}
              <div className="profile-img-container">
                <img
                  src={profile?.Avatar || "/fallback-avatar.png"}
                  alt={profile?.Username || "Unknown"}
                  className="profile-img"
                />
                {/* Gradient overlay for better text readability */}
                <div className="image-gradient-overlay"></div>
              </div>

              {/* Top Left Settings Button */}
              <button
                onClick={openPrefs}
                aria-label="open preferences"
                className="settings-button"
              >
                <svg
                  className="settings-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.45C21.34 9.29 21.39 9.03 21.29 8.82L19.35 5.12C19.25 4.91 19.01 4.82 18.8 4.88L16.42 5.64C15.95 5.27 15.43 4.97 14.87 4.74L14.5 2.28C14.46 2.06 14.28 1.9 14.06 1.9H9.96C9.74 1.9 9.56 2.06 9.52 2.28L9.15 4.74C8.59 4.97 8.07 5.27 7.6 5.64L5.22 4.88C5.01 4.82 4.77 4.91 4.67 5.12L2.73 8.82C2.63 9.03 2.68 9.29 2.86 9.45L4.88 11.06C4.84 11.36 4.82 11.67 4.82 12C4.82 12.33 4.84 12.64 4.88 12.94L2.86 14.55C2.68 14.71 2.63 14.97 2.73 15.18L4.67 18.88C4.77 19.09 5.01 19.18 5.22 19.12L7.6 18.36C8.07 18.73 8.59 19.03 9.15 19.26L9.52 21.72C9.56 21.94 9.74 22.1 9.96 22.1H14.06C14.28 22.1 14.46 21.94 14.5 21.72L14.87 19.26C15.43 19.03 15.95 18.73 16.42 18.36L18.8 19.12C19.01 19.18 19.25 19.09 19.35 18.88L21.29 15.18C21.39 14.97 21.34 14.71 21.16 14.55L19.14 12.94ZM12 15.6C10.34 15.6 9 14.26 9 12.6C9 10.94 10.34 9.6 12 9.6C13.66 9.6 15 10.94 15 12.6C15 14.26 13.66 15.6 12 15.6Z"
                    fill="white"
                  />
                </svg>
              </button>

              {/* Top Right Info Button */}
              <button
                onClick={() => {
                  setShowDetail(true);
                  setSelectedUserId(userProfiles[currentIndex]?.Id);
                }}
                aria-label="view profile details"
                className="info-button"
              >
                <svg
                  className="info-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
                    fill="white"
                  />
                </svg>
              </button>

              {/* Bottom Right Report Button */}
              <button
                className="report-button"
                onClick={handleReportModalToggle}
              >
                <svg
                  className="flag-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.4 6L14 4H5V21H7V14H12.6L13 16H20V6H14.4Z"
                    fill="#9c27b0"
                  />
                </svg>
              </button>

              {/* Profile Details Container */}
              <div className="profile-details-container">
                {/* Name and Age with gender symbols */}
                <div className="profile-header">
                  <h1 className="profile-name">
                    {profile?.Username || "Unknown"},{" "}
                    {profile?.DateOfBirth
                      ? new Date().getFullYear() -
                        new Date(profile.DateOfBirth).getFullYear()
                      : ""}
                    <span className="gender-symbol">
                      {profile?.Gender === "Male"
                        ? " ♂"
                        : profile?.Gender === "Female"
                        ? " ♀"
                        : ""}
                    </span>
                    {profile?.PartnerDateOfBirth && (
                      <>
                        <span className="partner-info">
                          {" "}
                          {new Date().getFullYear() -
                            new Date(profile.PartnerDateOfBirth).getFullYear()}
                          {profile?.PartnerGender === "Male"
                            ? " ♂"
                            : profile?.PartnerGender === "Female"
                            ? " ♀"
                            : ""}
                        </span>
                      </>
                    )}
                  </h1>
                </div>

                {/* Location with pin icon */}
                <div className="profile-location">
                  <svg
                    className="pin-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                      fill="#C2185B"
                    />
                  </svg>
                  <span className="location-text">
                    {profile?.Location?.replace(", USA", "") ||
                      "Location not specified"}
                  </span>
                </div>

                {/* About section */}
                <div className="profile-about">
                  <p className="about-text">
                    {profile?.About || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      <Modal open={isReportModalOpen} onClose={handleReportModalToggle}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "#1e1e1e",
            color: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Report or Block User
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.reportImage}
                onChange={handleCheckboxChange}
                name="reportImage"
                sx={{
                  color: "white",
                  "& .MuiCheckbox-root": {
                    color: "#9c27b0",
                  },
                  "& .MuiCheckbox-root.Mui-checked": {
                    color: "#9c27b0",
                  },
                }}
              />
            }
            label="Inappropriate Image"
            sx={{ display: "block" }}
          />
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
                checked={reportOptions.reportUser}
                onChange={handleCheckboxChange}
                name="reportUser"
              />
            }
            label="Report User"
          />
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
    </Box>
  );
};

export default SwipeCardComponent;
