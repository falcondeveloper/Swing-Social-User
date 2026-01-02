"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  List,
  ListItem,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  Avatar,
  Skeleton,
} from "@mui/material";
import { ArrowBack, Search } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import AppHeaderMobile from "@/layout/AppHeaderMobile";
import AppFooterMobile from "@/layout/AppFooterMobile";
import { useSocketContext } from "@/context/SocketProvider";

const formatFullTime = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const now = new Date();

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ChatListSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <List sx={{ width: "100%", p: 0 }}>
      {Array.from({ length: count }).map((_, index) => (
        <ListItem
          key={index}
          sx={{
            px: 1.5,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#121212",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Skeleton
            variant="circular"
            width={48}
            height={48}
            sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
          />

          <Box sx={{ flex: 1 }}>
            <Skeleton
              width="55%"
              height={16}
              sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
            />
            <Skeleton
              width="80%"
              height={14}
              sx={{ mt: 0.8, bgcolor: "rgba(255,255,255,0.06)" }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            <Skeleton
              width={40}
              height={12}
              sx={{ bgcolor: "rgba(255,255,255,0.06)" }}
            />
            <Skeleton
              variant="rounded"
              width={22}
              height={22}
              sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

const ChatTypingIndicator = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Typography fontSize={13} color="#4CAF50">
      Typing
    </Typography>
    <Box sx={{ display: "flex", gap: 0.3 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            bgcolor: "#4CAF50",
            animation: "typing 1.4s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>

    <style jsx>{`
      @keyframes typing {
        0% {
          opacity: 0.3;
        }
        20% {
          opacity: 1;
        }
        100% {
          opacity: 0.3;
        }
      }
    `}</style>
  </Box>
);

const MobileChat = () => {
  const router = useRouter();
  const { socket, isConnected } = useSocketContext();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);

  const [swipeX, setSwipeX] = useState<number | null>(null);
  const [swipeChatId, setSwipeChatId] = useState<string | null>(null);
  const [typingChats, setTypingChats] = useState<Record<string, boolean>>({});

  const startXRef = useRef(0);
  const isSwipingRef = useRef(false);
  const activeSearchRef = useRef("");
  const typingTimeouts = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!isConnected) return;
    socket.on("typing:start", ({ from }) => {
      setTypingChats((prev) => ({ ...prev, [from]: true }));

      clearTimeout(typingTimeouts.current[from]);
      typingTimeouts.current[from] = setTimeout(() => {
        setTypingChats((prev) => ({ ...prev, [from]: false }));
      }, 3000);
    });

    socket.on("typing:stop", ({ from }) => {
      setTypingChats((prev) => ({
        ...prev,
        [from]: false,
      }));
    });

    socket.on("chat:receive", (msg) => {
      setChatList((prev) => {
        if (!profileId) return prev;

        const otherUserId =
          msg.MemberIdFrom === profileId ? msg.MemberIdTo : msg.MemberIdFrom;

        const existingIndex = prev.findIndex(
          (c) => c.ToProfileId === otherUserId
        );

        const lastUp = msg.CreatedAt;

        if (existingIndex !== -1) {
          const existingChat = prev[existingIndex];

          const updatedChat = {
            ...existingChat,
            Conversation: msg.Conversation,
            LastUp: lastUp,
            NewMessages:
              msg.MemberIdFrom === profileId
                ? 0
                : Number(existingChat.NewMessages || 0) + 1,
          };

          const newList = [...prev];
          newList.splice(existingIndex, 1);

          return [updatedChat, ...newList];
        }

        return [
          {
            ChatId: `temp-${Date.now()}`,
            ToProfileId: otherUserId,
            Username: msg.FromUsername || "User",
            Avatar: msg.AvatarFrom || "/noavatar.png",
            Conversation: msg.Conversation,
            LastUp: lastUp,
            ReceiptStatus: "delivered",
            NewMessages: msg.MemberIdFrom === profileId ? 0 : 1,
            IsOnline: true,
          },
          ...prev,
        ];
      });

      setTypingChats((prev) => ({
        ...prev,
        [msg.MemberIdFrom]: false,
      }));
    });

    return () => {
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("chat:receive");
    };
  }, [isConnected]);

  useEffect(() => {
    const pid = localStorage.getItem("logged_in_profile");
    setProfileId(pid);
  }, []);

  useEffect(() => {
    if (profileId) fetchAllChats();
  }, [profileId]);

  const fetchAllChats = async () => {
    setLoadingChats(true);
    try {
      const res = await axios.get(`/api/user/messaging?profileid=${profileId}`);
      setChatList(res.data.data || []);
    } catch (err) {
      console.error("Chat fetch error:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const openChatDetails = (toProfileId: string) => {
    const token = localStorage.getItem("loginInfo");
    if (!token) return router.push("/login");

    const decoded: any = jwtDecode(token);
    if (decoded?.membership === 0) {
      Swal.fire({
        title: "Upgrade required",
        text: "Upgrade to start chatting 💖",
        icon: "info",
        confirmButtonText: "Upgrade",
      }).then(() => router.push("/membership"));
      return;
    }

    router.push(`/messaging/${toProfileId}`);
  };

  const deleteChat = async (chatId: string) => {
    const confirm = await Swal.fire({
      title: "Delete chat?",
      text: "This conversation will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF1B6B",
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetch("/api/user/messaging/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      fetchAllChats();
    } catch {
      Swal.fire("Error", "Could not delete chat", "error");
    }
  };

  const handleOpenNewChat = () => {
    setChatOpen(true);
    setSearchQuery("");
    setUserProfiles([]);
    setPage(1);
    setHasMore(true);
  };

  const handleCloseNewChat = () => {
    setChatOpen(false);
    setSearchQuery("");
    setUserProfiles([]);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUserProfiles([]);
      setHasMore(true);
      setPage(1);
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchUserProfiles(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUserProfiles = async (isNewSearch = false) => {
    if (loading || (!hasMore && !isNewSearch)) return;

    const currentSearch = searchQuery.trim();
    activeSearchRef.current = currentSearch;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/user/sweeping?page=${
          isNewSearch ? 1 : page
        }&size=100&search=${encodeURIComponent(currentSearch)}`
      );

      const data = await res.json();

      if (activeSearchRef.current !== currentSearch) return;

      if (data?.profiles?.length) {
        setUserProfiles((prev) =>
          isNewSearch ? data.profiles : [...prev, ...data.profiles]
        );
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, chatId: string) => {
    startXRef.current = e.touches[0].clientX;
    isSwipingRef.current = true;
    setSwipeChatId(chatId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;

    const diffX = e.touches[0].clientX - startXRef.current;

    if (diffX < 0) {
      setSwipeX(Math.max(diffX, -100));
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipingRef.current) return;

    if (swipeX && swipeX < -80 && swipeChatId) {
      deleteChat(swipeChatId);
    }

    setSwipeX(null);
    setSwipeChatId(null);
    isSwipingRef.current = false;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppHeaderMobile />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pb: "90px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {["Chat", "Mailbox"].map((tab) => {
            const active = tab === "Chat";
            return (
              <Box
                key={tab}
                onClick={() =>
                  router.push(tab === "Chat" ? "/messaging" : "/mailbox")
                }
                sx={{
                  flex: 1,
                  textAlign: "center",
                  py: 2.5,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  color: active ? "#FF1B6B" : "rgba(255,255,255,0.5)",
                  borderBottom: active
                    ? "3px solid #FF1B6B"
                    : "3px solid transparent",
                }}
              >
                {tab}
              </Box>
            );
          })}
        </Box>

        {loadingChats ? (
          <ChatListSkeleton />
        ) : (
          <List sx={{ width: "100%", p: 0 }}>
            {chatList.map((chat) => {
              const hasImage = /<img/i.test(chat.Conversation || "");
              const isOnline = chat.IsOnline;
              const chatId = String(chat.ChatId);

              const isTyping = typingChats[chat.ToProfileId];
              const hasUnread = chat.NewMessages > 0;

              return (
                <Box
                  key={chat.ChatId}
                  sx={{ position: "relative", overflow: "hidden" }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      pr: 2,
                    }}
                  >
                    <Typography fontSize={14} fontWeight={600} color="white">
                      Delete
                    </Typography>
                  </Box>

                  <ListItem
                    onClick={() => {
                      if (swipeX) return;
                      openChatDetails(chat.ToProfileId);
                    }}
                    onTouchStart={(e) => handleTouchStart(e, chatId)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    sx={{
                      px: 1.5,
                      py: 2.5,
                      backgroundColor: "#121212",
                      transform:
                        swipeChatId === chatId && swipeX
                          ? `translateX(${swipeX}px)`
                          : "translateX(0)",
                      transition: swipeX ? "none" : "transform 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={chat.Avatar || "/noavatar.png"}
                        sx={{ width: 48, height: 48 }}
                      />
                      {isOnline && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            width: 10,
                            height: 10,
                            bgcolor: "#4CAF50",
                            borderRadius: "50%",
                            border: "2px solid #121212",
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        fontSize={15}
                        fontWeight={600}
                        color="white"
                        noWrap
                      >
                        {chat.Username}
                      </Typography>

                      <Box mt={0.4}>
                        {typingChats[chat.ToProfileId] ? (
                          <ChatTypingIndicator />
                        ) : (
                          <Typography
                            fontSize={13}
                            color="rgba(255,255,255,0.6)"
                            noWrap
                          >
                            {hasImage
                              ? "📷 Photo"
                              : chat.Conversation || "Say hi 👋"}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        minHeight: 44,
                        ml: 1,
                      }}
                    >
                      {/* Time */}
                      {!isTyping && (
                        <Typography
                          fontSize={12}
                          color="rgba(255,255,255,0.45)"
                        >
                          {formatFullTime(chat.LastUp)}
                        </Typography>
                      )}

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {!isTyping && hasUnread && (
                          <Box
                            sx={{
                              minWidth: 22,
                              height: 22,
                              px: 0.8,
                              borderRadius: 9,
                              bgcolor: "#ff2f92",
                              color: "white",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {chat.NewMessages}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                </Box>
              );
            })}
          </List>
        )}

        <Button
          onClick={handleOpenNewChat}
          sx={{
            position: "fixed",
            right: 24,
            bottom: 90,
            width: 56,
            height: 56,
            minWidth: 0,
            borderRadius: "50%",
            bgcolor: "#FF1B6B",
            color: "#fff",
          }}
        >
          <AddIcon sx={{ fontSize: "32px" }} />
        </Button>
      </Box>

      <AppFooterMobile />

      <Dialog
        open={chatOpen}
        onClose={handleCloseNewChat}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            position: "fixed",
            bottom: 0,
            m: 0,
            width: "100%",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bgcolor: "#121212",
            height: "70vh",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "sticky",
            top: 0,
            bgcolor: "#121212",
            zIndex: 2,
          }}
        >
          <IconButton onClick={handleCloseNewChat}>
            <ArrowBack sx={{ color: "#fff" }} />
          </IconButton>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            New Message
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#1E1E1E",
              px: 2,
              py: 1,
              borderRadius: 3,
            }}
          >
            <Search sx={{ color: "rgba(255,255,255,0.5)" }} />
            <TextField
              variant="standard"
              placeholder="Search profiles"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  color: "#fff",
                  ml: 1,
                  fontSize: 14,
                },
              }}
            />
          </Box>
        </Box>

        <DialogContent
          sx={{
            p: 1,
            overflowY: "auto",
          }}
        >
          {searchQuery.trim() && userProfiles.length === 0 && !loading && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                mt: 4,
                fontSize: 14,
              }}
            >
              No profiles found
            </Typography>
          )}

          <List>
            {userProfiles.map((user) => (
              <ListItem
                key={user.Id}
                onClick={() => openChatDetails(user.Id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1.2,
                  px: 1.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(255,27,107,0.12)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #FF1B6B",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={user.Avatar || "/noavatar.png"}
                    alt={user.Username}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 15,
                      lineHeight: 1.2,
                    }}
                  >
                    {user.Username}
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 13,
                    }}
                  >
                    Tap to start chatting 💬
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          {loading && (
            <Box textAlign="center" py={3}>
              <CircularProgress size={22} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MobileChat;
