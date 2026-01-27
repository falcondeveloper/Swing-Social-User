"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Drawer,
  Badge,
  Dialog,
  DialogContent,
  Popover,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserProfileModal from "@/components/UserProfileModal";
import { InfoIcon, X } from "lucide-react";
import { sendNotification } from "@/utils/notifications";
import AppHeaderDesktop from "@/layout/AppHeaderDesktop";
import Picker from "emoji-picker-react";
import LazyAvatar from "@/utils/LazyAvatar";
import { useSocketContext } from "@/context/SocketProvider";

dayjs.extend(relativeTime);

interface DesktopChatListProps {
  userId?: string;
}

interface ChatMessage {
  ChatId?: string;
  ConversationId?: string;
  Conversation: string;
  CreatedAt: string;
  MemberIdFrom: string;
  MemberIdTo: string;
  FromUsername?: string;
  ToUsername?: string;
  AvatarFrom?: string;
  AvatarTo?: string;
  readAt?: string | null;
}

interface ChatListItem {
  ChatId: string;
  ToProfileId: string;
  Username: string;
  Avatar: string;
  Conversation: string;
  LastUp: string;
  NewMessages: number;
}

const DesktopChatList = ({ userId }: DesktopChatListProps) => {
  const { socket, isConnected } = useSocketContext();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>({});
  const [myProfile, setMyProfile] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userDeviceToken, setUserDeviceToken] = useState(null);
  const [profileId, setProfileId] = useState<any>();
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLElement | null>(null);
  const typingTimeouts = useRef<Record<string, any>>({});
  const [typingChats, setTypingChats] = useState<Record<string, boolean>>({});
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [chatListLoading, setChatListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const HEADER_HEIGHT = 90.5;

  const openEmoji = Boolean(emojiAnchorEl);

  useEffect(() => {
    if (!socket || !isConnected || !userId) return;

    socket.emit("user:online", profileId);

    socket.on(
      "user:status",
      ({
        userId: statusUserId,
        online,
        lastSeen,
      }: {
        userId: string;
        online: boolean;
        lastSeen: string | null;
      }) => {
        if (statusUserId !== userId) return;

        setIsUserOnline(online);
        setLastSeen(lastSeen);
      }
    );

    socket.on("typing:start", ({ from }) => {
      if (from !== userId) return;

      setTypingChats((prev) => ({ ...prev, [from]: true }));

      clearTimeout(typingTimeouts.current[from]);
      typingTimeouts.current[from] = setTimeout(() => {
        setTypingChats((prev) => ({ ...prev, [from]: false }));
      }, 2000);
    });

    socket.on("typing:stop", ({ from }) => {
      setTypingChats((prev) => ({ ...prev, [from]: false }));
    });

    socket.on("chat:receive", (msg: ChatMessage) => {
      const myId = localStorage.getItem("logged_in_profile");

      setTypingChats((prev) => ({
        ...prev,
        [msg.MemberIdFrom]: false,
      }));

      if (msg.MemberIdFrom === userId || msg.MemberIdTo === userId) {
        setMessages((prev) => [...prev, msg]);
      }

      setChatList((prev) => {
        const otherUserId =
          msg.MemberIdFrom === myId ? msg.MemberIdTo : msg.MemberIdFrom;

        const index = prev.findIndex((c) => c.ToProfileId === otherUserId);

        const isChatOpen =
          userId === otherUserId && document.visibilityState === "visible";

        if (index !== -1) {
          const updated = {
            ...prev[index],
            Conversation: msg.Conversation,
            LastUp: msg.CreatedAt,
            NewMessages:
              msg.MemberIdFrom === myId || isChatOpen
                ? 0
                : Number(prev[index].NewMessages || 0) + 1,
          };

          const copy = [...prev];
          copy.splice(index, 1);
          return [updated, ...copy];
        }

        return [
          {
            ChatId: `temp-${Date.now()}`,
            ToProfileId: otherUserId,
            Username: msg.FromUsername || "User",
            Avatar: msg.AvatarFrom || "/noavatar.png",
            Conversation: msg.Conversation,
            LastUp: msg.CreatedAt,
            NewMessages: isChatOpen ? 0 : 1,
          },
          ...prev,
        ];
      });
    });

    return () => {
      socket.off("user:status");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("chat:receive");
    };
  }, [socket, isConnected, profileId]);

  useEffect(() => {
    if (!socket || !profileId || !userId) return;

    socket.emit("chat:read", {
      from: userId,
      to: profileId,
    });
    setChatList((prev) =>
      prev.map((c) => (c.ToProfileId === userId ? { ...c, NewMessages: 0 } : c))
    );
  }, [userId, socket, profileId]);

  useEffect(() => {
    const handleUnload = () => {
      if (socket && profileId) {
        socket.emit("user:offline", profileId);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [socket, profileId]);

  useEffect(() => {
    const messageElements = document.querySelectorAll(".message-content img");

    const handleClick = (e: Event) => {
      const target = e.target as HTMLImageElement;
      if (target.src) {
        setOpenImage(target.src);
      }
    };

    messageElements.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      imageElement.style.cursor = "pointer";
      imageElement.addEventListener("click", handleClick);
    });

    return () => {
      messageElements.forEach((img) => {
        const imageElement = img as HTMLImageElement;
        imageElement.removeEventListener("click", handleClick);
      });
    };
  }, [messages]);

  const useImageClickHandler = (onImageClick: (src: string) => void) => {
    useEffect(() => {
      const handleDocumentClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        if (target.tagName === "IMG" && target.closest(".message-content")) {
          const imgSrc = target.getAttribute("src");
          if (imgSrc) {
            onImageClick(imgSrc);
          }
        }
      };

      document.addEventListener("click", handleDocumentClick);

      return () => {
        document.removeEventListener("click", handleDocumentClick);
      };
    }, [onImageClick]);
  };

  useImageClickHandler((src) => setOpenImage(src));

  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "IMG" && target.closest(".message-content")) {
        const imgElement = target as HTMLImageElement;
        if (imgElement.src) {
          setOpenImage(imgElement.src);
        }
      }
    };

    document.addEventListener("click", handleImageClick);

    return () => {
      document.removeEventListener("click", handleImageClick);
    };
  }, []);

  useEffect(() => {
    const storedProfileId = localStorage.getItem("logged_in_profile");
    if (storedProfileId) {
      setProfileId(storedProfileId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
    if (window.history.state?.modal === "userProfile") {
      window.history.back();
    }
  };

  const handleGrantAccess = async () => {
    try {
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;
    getUserProfile(userId);
  }, [userId]);

  useEffect(() => {
    if (userProfile) {
      setUserDeviceToken(userProfile?.Device_Token);
    }
  }, [userProfile]);

  const getUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const res = await fetch(`/api/user/sweeping/user?id=${userId}`);
      const { user } = await res.json();
      setUserProfile(user);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const getMyProfile = async (userId: string) => {
    if (userId) {
      try {
        const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
        if (!response.ok) {
          console.error(
            "Failed to fetch advertiser data:",
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { user: userData } = await response.json();
        if (!userData) {
          console.error("Advertiser not found");
        } else {
          setMyProfile(userData);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    }
  };

  const findExistingChatIndex = (username: string) => {
    return chatList.findIndex((chat: any) => chat.Username === username);
  };

  const existingChatIndex = userProfile
    ? findExistingChatIndex(userProfile.Username)
    : -1;

  const sendNotifications = async (message: any) => {
    if (!myProfile?.Id || !userProfile?.Id) return;

    await sendNotification({
      userId: userProfile.Id,
      body: message,
      title: myProfile?.Username || "New message",
      type: "message",
      url: `https://swing-social-user.vercel.app/messaging/${myProfile.Id}`,
    });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socket || !profileId || !userProfile?.Id) return;

    socket.emit("typing:start", {
      from: profileId,
      to: userProfile.Id,
    });

    clearTimeout(typingTimeouts.current["self"]);
    typingTimeouts.current["self"] = setTimeout(() => {
      socket.emit("typing:stop", {
        from: profileId,
        to: userProfile.Id,
      });
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profileId || !userProfile?.Id || !myProfile)
      return;

    socket.emit("typing:stop", {
      from: profileId,
      to: userProfile.Id,
    });

    const tempConversationId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newUserMessage = {
      AvatarFrom: myProfile?.Avatar || "/noavatar.png",
      AvatarTo: userProfile?.Avatar,
      ChatId: "temporary-chat-id",
      Conversation: newMessage,
      ConversationId: tempConversationId,
      CreatedAt: new Date().toISOString(),
      FromUsername: myProfile?.Username || "You",
      MemberIdFrom: profileId,
      MemberIdTo: userProfile?.Id,
      ToUsername: userProfile?.Username || "Recipient",
      lastcommentinserted: 1,
      readAt: null,
    };

    socket.emit("chat:send", {
      ...newUserMessage,
      ConversationId: tempConversationId,
    });

    setMessages((prev) => [...prev, newUserMessage]);

    setNewMessage("");

    if (userDeviceToken) {
      sendNotifications(newMessage);
    }

    const payload = {
      chatid:
        existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId,
      ProfileIdfrom: myProfile?.Id,
      ProfileIDto: userProfile?.Id,
      Conversation: newMessage,
    };

    try {
      const response = await fetch("/api/user/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving message:", errorData);
      }
    } catch (error) {
      console.error("Network error while sending message:", error);
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.emoji);
  };

  const uploadImage = async (imageData: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", imageData);
      const response = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      return data?.blobUrl || null;
    } catch (error) {
      console.error("Error during image upload:", error);
      return null;
    }
  };

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader: any = new FileReader();
      reader.onload = () => {
        const newUserMessage = {
          AvatarFrom: myProfile?.Avatar || "/noavatar.png",
          AvatarTo: userProfile?.Avatar,
          ChatId: "temporary-chat-id",
          Conversation: `<img src="${
            reader.result &&
            typeof reader.result === "string" &&
            reader.result.trim() !== ""
              ? reader.result
              : "/noavatar.png"
          }" alt="Uploaded" style="max-width:"100px";border-radius:"8px"/>`,
          ConversationId: "temporary-conversation-id",
          CreatedAt: new Date().toISOString(),
          FromUsername: userProfile?.Username || "You",
          MemberIdFrom: profileId,
          MemberIdTo: userProfile?.Id,
          ToUsername: userProfile?.Username || "Recipient",
          lastcommentinserted: 1,
        };

        setMessages([...messages, newUserMessage]);

        if (userDeviceToken) {
          sendNotifications(newUserMessage?.Conversation);
        }
      };
      reader.readAsDataURL(file);
      let imageUrl: any = await uploadImage(file);
      const messageData = {
        message: `<img src="${imageUrl}" alt="Uploaded" style="max-width:"100px";border-radius:"8px"/>`,
        from: profileId,
        to: userProfile?.Id,
      };
      setNewMessage("");
      const payload = {
        chatid:
          existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId,
        ProfileIdfrom: myProfile?.Id,
        ProfileIDto: userProfile?.Id,
        Conversation: `<img src="${imageUrl}" alt="Uploaded" style="max-width:"100px";border-radius:"8px"/>`,
      };
      setNewMessage("");

      try {
        const response: any = await fetch("/api/user/messaging", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const result = response.json();
        } else {
          const errorData = response.json();
          console.error("Error sending message:", errorData);
        }
      } catch (error) {
        console.error("Network error while sending message:", error);
        setMessages((prevMessages: any) => [
          ...prevMessages,
          {
            sender: "error",
            text: "Failed to send message. Please try again.",
          },
        ]);
      }
    }
  };

  useEffect(() => {
    if (profileId) {
      getCurrentLocation();
      getMyProfile(profileId);
      fetchAllChats();
    }
  }, [profileId]);

  const fetchAllChats = async () => {
    try {
      setChatListLoading(true);
      let profileid = localStorage.getItem("logged_in_profile");
      const response = await axios.get(
        `/api/user/messaging?profileid=${profileid}`
      );
      setChatList(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChatListLoading(false);
    }
  };

  useEffect(() => {
    if (profileId && userId) {
      fetchChatConversation(profileId, userId);
    }
  }, [profileId, userId]);

  const fetchChatConversation = async (profileId: any, userId: any) => {
    try {
      setMessagesLoading(true);
      const response = await fetch("/api/user/messaging/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProfileIdfrom: profileId,
          ProfileIDto: userId,
        }),
      });

      const result = await response.json();
      setMessages(result?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getUserProfile(userId);
    }
  }, [userId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          await sendLocationToAPI(locationName, latitude, longitude);
        },
        (error: any) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    const apiKey = "AIzaSyBEr0k_aQ_Sns6YbIQ4UBxCUTdPV9AhdF0";

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
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

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const keyboardHeight =
          window.innerHeight - window.visualViewport.height;

        document.documentElement.style.setProperty(
          "--keyboard-offset",
          `${Math.max(keyboardHeight, 0)}px`
        );
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () =>
      window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!profileId || !userProfile?.Id) return;

    const unreadIds = messages
      .filter((m: any) => m.MemberIdFrom === userProfile.Id && !m.readAt)
      .map((m: any) => m.ConversationId);

    if (!unreadIds.length) return;
  }, [messages.length]);

  const formatLastUpSmart = (value?: string) => {
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

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0A0A0A",
          color: "white",
          flexDirection: "column",
          display: "flex",
        }}
      >
        <AppHeaderDesktop />
        <Box
          sx={{
            display: "flex",
            flex: 1,
            height: "100vh",
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              width: 350,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: 350,
                boxSizing: "border-box",
                bgcolor: "#1A1A1A",
                color: "white",
                top: `${HEADER_HEIGHT}px`,
                height: `calc(100vh - ${HEADER_HEIGHT}px)`,
                borderRight: "1px solid rgba(255,255,255,0.08)",
              },
            }}
          >
            <Box sx={{ display: "flex", borderBottom: "1px solid #333" }}>
              <Typography
                onClick={() => router.push("/messaging")}
                sx={{
                  width: "50%",
                  textAlign: "center",
                  py: 2,
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 700,
                  borderBottom: "3px solid #FF1B6B",
                }}
              >
                Chat
              </Typography>

              <Typography
                onClick={() => router.push("/mailbox")}
                sx={{
                  width: "50%",
                  textAlign: "center",
                  py: 2,
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Mailbox
              </Typography>
            </Box>

            <List sx={{ px: 1 }}>
              {chatListLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ListItem key={i} sx={{ px: 1.5, py: 1.5 }}>
                    <Skeleton variant="circular" width={46} height={46} />
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Skeleton width="60%" height={18} />
                      <Skeleton width="90%" height={14} />
                    </Box>
                  </ListItem>
                ))
              ) : (
                <>
                  {chatList.map((chat: any) => {
                    const hasImage = /<img.*?src=/.test(chat.Conversation);
                    const isActive = userId === chat?.ToProfileId;

                    return (
                      <ListItem
                        key={chat.ToProfileId}
                        disableGutters
                        onClick={() =>
                          router.push(`/messaging/${chat.ToProfileId}`)
                        }
                        sx={{
                          px: 1.5,
                          py: 1.5,
                          mt: 0.8,
                          borderRadius: 3,
                          cursor: "pointer",
                          alignItems: "flex-start",
                          position: "relative",
                          bgcolor: isActive
                            ? "rgba(255,27,107,0.15)"
                            : "rgba(255,255,255,0.02)",
                          boxShadow: isActive
                            ? "inset 0 0 0 1px rgba(255,27,107,0.4)"
                            : "none",
                          transition: "all 0.2s ease",

                          "&:hover": {
                            bgcolor: isActive
                              ? "rgba(255,27,107,0.22)"
                              : "rgba(255,255,255,0.07)",
                          },
                          "&::before": isActive
                            ? {
                                content: '""',
                                position: "absolute",
                                left: 0,
                                top: "12%",
                                height: "76%",
                                width: 4,
                                borderRadius: "0 6px 6px 0",
                                bgcolor: "#FF1B6B",
                              }
                            : {},
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 56 }}>
                          {chat.NewMessages > 0 ? (
                            <Badge
                              badgeContent={chat.NewMessages}
                              color="error"
                              overlap="circular"
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                            >
                              <LazyAvatar
                                src={chat.Avatar}
                                size={46}
                                border="2px solid #FF1B6B"
                              />
                            </Badge>
                          ) : (
                            <LazyAvatar
                              src={chat.Avatar}
                              size={46}
                              border="2px solid #FF1B6B"
                            />
                          )}
                        </ListItemAvatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#FF1B6B",
                            }}
                          >
                            {chat.Username}
                          </Typography>

                          {typingChats[chat.ToProfileId] ? (
                            <Typography
                              sx={{ fontSize: 13, color: "#4CAF50", mt: 0.3 }}
                            >
                              Typing…
                            </Typography>
                          ) : (
                            <Typography
                              noWrap
                              sx={{
                                fontSize: 13,
                                color: "rgba(255,255,255,0.65)",
                                mt: 0.3,
                              }}
                            >
                              {hasImage
                                ? "📷 Sent an image"
                                : chat.Conversation}
                            </Typography>
                          )}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            height: 46,
                            ml: 1,
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.45)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatLastUpSmart(chat.LastUp)}
                          </Typography>
                        </Box>
                      </ListItem>
                    );
                  })}
                </>
              )}
            </List>
          </Drawer>

          <Box
            sx={{
              flex: 1,
              height: `calc(100vh - ${HEADER_HEIGHT}px)`,
              bgcolor: "#121212",
              color: "white",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              mt: `${HEADER_HEIGHT}px`,
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                flexShrink: 0,
                height: 62,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                bgcolor: "#1A1A1A",
              }}
            >
              {profileLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box>
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={12} />
                  </Box>
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowDetail(true);
                      setSelectedUserId(userProfile?.Id);
                      window.history.pushState({ modal: "userProfile" }, "");
                    }}
                  >
                    <Box>
                      <LazyAvatar
                        src={userProfile?.Avatar}
                        size={36}
                        border="2px solid #FF1B6B"
                      />
                    </Box>

                    <Box>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#FF1B6B",
                          letterSpacing: 0.6,
                        }}
                      >
                        {userProfile?.Username || "User"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: isUserOnline
                            ? "#4CAF50"
                            : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {isUserOnline
                          ? "Online"
                          : lastSeen
                          ? `Last seen at ${formatMessageTime(lastSeen)}`
                          : "Offline"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                      onClick={() => {
                        setShowDetail(true);
                        setSelectedUserId(userProfile?.Id);
                        window.history.pushState({ modal: "userProfile" }, "");
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>

            {/* Messages - ONLY this scrolls */}
            <List
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 2,
                py: 2,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#FF1B6B",
                  borderRadius: 3,
                },
              }}
            >
              {messagesLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ListItem key={i} disableGutters sx={{ mb: 1.5 }}>
                    <Skeleton
                      variant="rounded"
                      width={`${Math.random() * 20 + 40}%`}
                      height={36}
                      sx={{ borderRadius: 3 }}
                    />
                  </ListItem>
                ))
              ) : messages.length === 0 ? (
                <Typography sx={{ mt: 4, textAlign: "center", opacity: 0.6 }}>
                  💬 Say hi and start the spark
                </Typography>
              ) : (
                <>
                  {messages.map((message: any, index: number) => {
                    const isMine = message?.MemberIdFrom === profileId;

                    return (
                      <ListItem
                        key={index}
                        disableGutters
                        sx={{
                          justifyContent: isMine ? "flex-end" : "flex-start",
                          alignItems: "flex-end",
                          mb: 1.4,
                        }}
                      >
                        {/* Avatar (Only for received messages) */}
                        {!isMine && (
                          <ListItemAvatar sx={{ minWidth: 40, mr: 1 }}>
                            <Avatar
                              src={userProfile?.Avatar || "/noavatar.png"}
                              sx={{
                                width: 32,
                                height: 32,
                                border: "2px solid #FF1B6B",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setShowDetail(true);
                                setSelectedUserId(userProfile?.Id);
                                window.history.pushState({ modal: "userProfile" }, "");
                              }}
                            />
                          </ListItemAvatar>
                        )}

                        {/* Message Bubble */}
                        <Box
                          sx={{
                            maxWidth: "50%",
                            px: 2,
                            py: 1.2,
                            borderRadius: isMine
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            background: isMine
                              ? "linear-gradient(135deg, #FF1B6B 0%, #FF4D8D 100%)"
                              : "#2A2A2A",
                            color: "white",
                            wordBreak: "break-word",
                            position: "relative",
                          }}
                        >
                          {/* Message */}
                          <Typography
                            component="div"
                            className="message-content"
                            sx={{
                              fontSize: 14,
                              lineHeight: 1.5,
                              pr: 6,
                              "& img": {
                                // mt: 1,
                                maxWidth: "100%",
                                borderRadius: isMine
                                  ? "18px 18px 4px 18px"
                                  : "18px 18px 18px 4px",
                                cursor: "pointer",
                                transition: "transform 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.03)",
                                },
                              },
                            }}
                            dangerouslySetInnerHTML={{
                              __html: message?.Conversation,
                            }}
                          />

                          {/* Time INSIDE bubble */}
                          <Typography
                            sx={{
                              position: "absolute",
                              bottom: 6,
                              right: 10,
                              fontWeight: 500,
                              fontSize: 10,
                              color: isMine
                                ? "rgba(255,255,255,0.75)"
                                : "rgba(255,255,255,0.45)",
                              userSelect: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatMessageTime(message?.CreatedAt)}
                          </Typography>
                        </Box>

                        {isMine && (
                          <ListItemAvatar sx={{ minWidth: 40, ml: 1 }}>
                            <Avatar
                              src={message?.AvatarFrom || "/noavatar.png"}
                              sx={{
                                width: 32,
                                height: 32,
                                border: "2px solid #FF1B6B",
                              }}
                            />
                          </ListItemAvatar>
                        )}
                      </ListItem>
                    );
                  })}

                  <div ref={messagesEndRef} />

                  {userId && typingChats[userId] && (
                    <ListItem
                      disableGutters
                      sx={{
                        justifyContent: "flex-start",
                        alignItems: "flex-end",
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40, mr: 1 }}>
                        <Avatar
                          src={userProfile?.Avatar || "/noavatar.png"}
                          sx={{
                            width: 32,
                            height: 32,
                            border: "2px solid #FF1B6B",
                          }}
                        />
                      </ListItemAvatar>

                      <Box
                        sx={{
                          px: 2,
                          py: 1.7,
                          borderRadius: "18px 18px 18px 4px",
                          bgcolor: "#2A2A2A",
                          display: "flex",
                          alignItems: "center",
                          minWidth: 42,
                        }}
                      >
                        <Box className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </Box>
                      </Box>
                    </ListItem>
                  )}
                </>
              )}
            </List>

            {/* Message Input - FIXED inside panel */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              sx={{
                flexShrink: 0,
                px: 2,
                py: 1.5,
                bgcolor: "#161616",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Input Container */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#222",
                  borderRadius: "28px",
                  px: 1.5,
                  py: 1,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Emoji */}
                <IconButton
                  onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                  sx={{
                    color: "#FF1B6B",
                    "&:hover": {
                      bgcolor: "rgba(255,27,107,0.15)",
                    },
                  }}
                >
                  <EmojiIcon />
                </IconButton>

                {/* Emoji Picker */}
                <Popover
                  open={openEmoji}
                  anchorEl={emojiAnchorEl}
                  onClose={() => setEmojiAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  disableAutoFocus
                  disableEnforceFocus
                  PaperProps={{
                    sx: {
                      bgcolor: "#FFF0F6",
                      borderRadius: 3,
                      p: 1,
                      boxShadow: "0 12px 30px rgba(255,27,107,0.25)",
                    },
                  }}
                >
                  <Picker
                    onEmojiClick={(emoji) => {
                      handleEmojiClick(emoji);
                    }}
                  />
                </Popover>

                {/* Text Input */}
                <TextField
                  fullWidth
                  placeholder="Write something..."
                  variant="standard"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      color: "white",
                      fontSize: 14,
                      px: 1,
                    },
                  }}
                />

                {/* Image Upload */}
                <IconButton
                  component="label"
                  sx={{
                    color: "#FF1B6B",
                    "&:hover": {
                      bgcolor: "rgba(255,27,107,0.15)",
                    },
                  }}
                >
                  <ImageIcon />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </IconButton>

                {/* Send Button */}
                <IconButton
                  type="submit"
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #FF1B6B 0%, #FF4D8D 100%)",
                    color: "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FF4D8D 0%, #FF1B6B 100%)",
                      transform: "scale(1.08)",
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        <UserProfileModal
          handleGrantAccess={handleGrantAccess}
          handleClose={handleClose}
          open={showDetail}
          userid={selectedUserId}
        />

        <Dialog
          open={Boolean(openImage)}
          onClose={() => setOpenImage(null)}
          maxWidth="lg"
          disableScrollLock={false}
          BackdropProps={{
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          }}
          PaperProps={{
            sx: {
              backgroundColor: "#000",
              boxShadow: "none",
              borderRadius: 1,
              overflow: "hidden",
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
              height: "80vh",
            }}
          >
            <IconButton
              onClick={() => setOpenImage(null)}
              sx={{
                position: "absolute",
                top: 5,
                right: 8,
                color: "white",
                backgroundColor: "rgba(0,0,0,0.4)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
                zIndex: 2,
              }}
            >
              <X size={20} />
            </IconButton>
            {openImage && (
              <img
                src={openImage}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default DesktopChatList;
