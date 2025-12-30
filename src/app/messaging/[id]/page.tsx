"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Drawer,
  Modal,
  useMediaQuery,
  Badge,
  Dialog,
  DialogContent,
} from "@mui/material";
import axios from "axios";
import Header from "@/components/Header";
import Picker from "emoji-picker-react";
import { useRouter } from "next/navigation";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserProfileModal from "@/components/UserProfileModal";
import { X } from "lucide-react";
import Footer from "@/components/Footer";
import { sendNotification } from "@/utils/notifications";
import { getSocket } from "@/lib/socket";
import AppFooterMobile from "@/layout/AppFooterMobile";
import AppFooterDesktop from "@/layout/AppFooterDesktop";

const typingDots = (
  <Box sx={{ display: "inline-flex", ml: 0.5 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          width: 4,
          height: 4,
          bgcolor: "#4CAF50",
          borderRadius: "50%",
          mx: 0.3,
          animation: "typing 1.4s infinite",
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}

    <style>
      {`
        @keyframes typing {
          0% { opacity: 0.3; }
          20% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}
    </style>
  </Box>
);

dayjs.extend(relativeTime);

type Params = Promise<{ id: string }>;

export default function ChatPage(props: { params: Params }) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>({});
  const [myProfile, setMyProfile] = useState<any>({});
  const [userId, setUserId] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [userDeviceToken, setUserDeviceToken] = useState(null);
  const [profileId, setProfileId] = useState<any>();
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const listenersSetupRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    const setupSocketListeners = () => {
      if (listenersSetupRef.current) return;

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        // Re-emit online status when reconnecting
        if (profileId) {
          socket.emit("user:online", profileId);
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      // Online/offline status
      socket.on("user:status", ({ userId, online, lastSeen }) => {
        console.log("📡 user:status event received:", {
          userId,
          online,
          lastSeen,
        });
        if (userId === userProfile?.Id) {
          setIsOnline(online);
          setLastSeen(lastSeen);
          setUserProfile((prev: any) => ({
            ...prev,
            isOnline: online,
            LastOnline: online ? null : lastSeen,
          }));
        }
      });

      // Typing indicators
      socket.on("typing:start", ({ from }) => {
        console.log("⌨️ typing:start from:", from);
        if (from === userProfile?.Id) {
          setIsTyping(true);
        }
      });

      socket.on("typing:stop", ({ from }) => {
        console.log("⌨️ typing:stop from:", from);
        if (from === userProfile?.Id) {
          setIsTyping(false);
        }
      });

      // Live messages
      socket.on("chat:receive", (msg) => {
        console.log("📩 chat:receive event:", msg);
        setMessages((prev: any) => [...prev, msg]);

        // Mark as read immediately if we're the recipient
        if (msg.MemberIdTo === profileId) {
          setTimeout(() => {
            socket.emit("message:read", {
              from: profileId,
              to: msg.MemberIdFrom,
              messageIds: [msg.ConversationId || Date.now().toString()],
            });
          }, 500);
        }
      });

      // Read receipts
      socket.on("message:read", ({ messageIds, readAt }) => {
        console.log("✓✓ message:read event:", { messageIds, readAt });
        setMessages((prev: any[]) =>
          prev.map((m) =>
            messageIds.includes(m.ConversationId) ? { ...m, readAt } : m
          )
        );
      });

      listenersSetupRef.current = true;
    };

    setupSocketListeners();

    return () => {
      // Don't remove all listeners on cleanup to maintain connection
      // Just remove specific ones if needed
      socket.off("chat:receive");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("message:read");
      listenersSetupRef.current = false;
    };
  }, [profileId, userProfile?.Id]);

  useEffect(() => {
    const socket = getSocket();

    const onReceive = (msg: any) => {
      setMessages((prev: any[]) => {
        // prevent duplicates
        if (prev.some((m) => m.ConversationId === msg.ConversationId)) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    socket.on("chat:receive", onReceive);

    return () => {
      socket.off("chat:receive", onReceive);
    };
  }, []);

  useEffect(() => {
    if (!profileId) return;

    const socket = getSocket();
    if (socket.connected) {
      socket.emit("user:online", profileId);
    } else {
      socket.once("connect", () => {
        socket.emit("user:online", profileId);
      });
    }
  }, [profileId]);

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
  };

  const handleGrantAccess = async () => {
    try {
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      setUserId(pid);
    };
    getIdFromParam();
  }, [props.params]);

  useEffect(() => {
    if (userProfile) {
      setUserDeviceToken(userProfile?.Device_Token);
    }
  }, [userProfile]);

  const getUserProfile = async (userId: string) => {
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
          setUserProfile(userData);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
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
    const socket = getSocket();
    setNewMessage(value);

    if (!userProfile?.Id) return;

    socket.emit("typing:start", {
      from: profileId,
      to: userProfile?.Id,
    });

    clearTimeout((window as any).__typingTimer);
    (window as any).__typingTimer = setTimeout(() => {
      socket.emit("typing:stop", {
        from: profileId,
        to: userProfile?.Id,
      });
    }, 800);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profileId || !userProfile?.Id || !myProfile)
      return;

    const socket = getSocket();
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

    // Optimistic update
    setMessages((prev: any) => [...prev, newUserMessage]);
    setNewMessage("");

    // Emit socket message
    socket.emit("chat:send", {
      ...newUserMessage,
      ConversationId: tempConversationId,
    });

    // Send notification if needed
    if (userDeviceToken) {
      sendNotifications(newMessage);
    }

    // Save to database
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
      let profileid = await localStorage.getItem("logged_in_profile");
      const response = await axios.get(
        `/api/user/messaging?profileid=${profileid}`
      );
      setChatList(response.data.data);
    } catch (err: any) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    if (profileId && userId) {
      fetchChatConversation(profileId, userId);
    }
  }, [profileId, userId]);

  const fetchChatConversation = async (profileId: any, userId: any) => {
    try {
      const payload = {
        ProfileIdfrom: profileId,
        ProfileIDto: userId,
      };
      const response = await fetch("/api/user/messaging/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const result = await response.json();
        setMessages((prevMessages: any) => [...prevMessages, ...result?.data]);
      } else {
        const errorData = await response.json();
        console.error("Error sending message:", errorData);
      }
    } catch (err: any) {
      console.error("Error fetching chats:", err);
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
    const socket = getSocket();

    socket.on("typing:start", ({ from }) => {
      if (from === userProfile?.Id) {
        setIsTyping(true);
      }
    });

    socket.on("typing:stop", ({ from }) => {
      if (from === userProfile?.Id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [userProfile?.Id]);

  useEffect(() => {
    if (!profileId || !userProfile?.Id) return;

    const unreadIds = messages
      .filter((m: any) => m.MemberIdFrom === userProfile.Id && !m.readAt)
      .map((m: any) => m.ConversationId);

    if (!unreadIds.length) return;

    const socket = getSocket();
    socket.emit("message:read", {
      from: profileId,
      to: userProfile.Id,
      messageIds: unreadIds,
    });
  }, [messages.length]);

  useEffect(() => {
    const socket = getSocket();

    const handler = ({ messageIds, readAt }: any) => {
      setMessages((prev: any) =>
        prev.map((m: any) =>
          messageIds.includes(m.ConversationId) ? { ...m, readAt } : m
        )
      );
    };

    socket.on("message:read", handler);

    return () => {
      socket.off("message:read", handler);
    };
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "#0A0A0A",
        height: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header />
      {isMobile ? (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                bgcolor: "#121212",
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "#1A1A1A",
                  px: 2,
                  py: 2,
                  borderBottom: "1px solid #333",
                  position: "sticky",
                  top: 0,
                  zIndex: 20,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowDetail(true);
                  setSelectedUserId(userProfile?.Id);
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    border: "2px solid",
                    borderColor: userProfile?.isOnline ? "#4CAF50" : "#FF1B6B",
                  }}
                  alt={userProfile?.Username}
                  src={userProfile?.Avatar}
                />
                <Box>
                  <Typography variant="h6" color="white">
                    {userProfile?.Username || "User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={isTyping ? "#4CAF50" : isOnline ? "#4CAF50" : "gray"}
                    sx={{ minHeight: 18 }}
                  >
                    {isTyping ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography fontSize={13} color="#4CAF50">
                          typing
                        </Typography>
                        {typingDots}
                      </Box>
                    ) : isOnline ? (
                      <Typography fontSize={13} color="#4CAF50">
                        Online
                      </Typography>
                    ) : (
                      <Typography fontSize={13} color="gray">
                        {lastSeen
                          ? `Last seen ${dayjs(lastSeen).fromNow()}`
                          : "Offline"}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Messages List */}
              <List
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: 2,
                  py: 2,
                  pb: "140px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {messages?.map(
                  (m: any, i: number) =>
                    m?.ChatId && (
                      <ListItem
                        key={i}
                        disableGutters
                        sx={{
                          justifyContent:
                            m?.MemberIdFrom === profileId
                              ? "flex-end"
                              : "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor:
                              m?.MemberIdFrom === profileId
                                ? "#1976D2"
                                : "#262626",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            color: "white",
                            maxWidth: "75%",
                            whiteSpace: "pre-wrap",
                            boxShadow: 1,
                            "& img": {
                              width: "100%",
                              height: "auto",
                              borderRadius: "8px",
                              marginTop: "6px",
                              display: "block",
                              objectFit: "contain",
                            },
                          }}
                        >
                          <Typography
                            component="div"
                            className="message-content"
                            sx={{
                              "& img": {
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              },
                            }}
                            dangerouslySetInnerHTML={{
                              __html: m?.Conversation,
                            }}
                          />
                        </Box>
                      </ListItem>
                    )
                )}

                {messages?.length === 0 && (
                  <Typography textAlign="center" color="gray">
                    No messages found
                  </Typography>
                )}

                <div ref={messagesEndRef} />
              </List>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                sx={{
                  position: "fixed",
                  bottom: 72,
                  bgcolor: "#1A1A1A",
                  px: 2,
                  py: 1.5,
                  borderTop: "1px solid #333",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                <IconButton
                  sx={{ color: "#FF1B6B" }}
                  onClick={() => setEmojiPickerOpen(true)}
                >
                  <EmojiIcon />
                </IconButton>

                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Type a message..."
                  InputProps={{ disableUnderline: true }}
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  sx={{ input: { color: "white" } }}
                />

                <IconButton component="label">
                  <ImageIcon />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </IconButton>

                <IconButton
                  onClick={handleSendMessage}
                  sx={{
                    bgcolor: "#FF1B6B",
                    color: "#fff",
                    width: 35,
                    height: 35,
                    "&:hover": {
                      bgcolor: "#E0175F",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              <Modal
                open={emojiPickerOpen}
                onClose={() => setEmojiPickerOpen(false)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "#FFF0F6",
                    borderRadius: 3,
                    p: 1.5,
                    boxShadow: "0 12px 30px rgba(255, 27, 107, 0.25)",
                    border: "1px solid rgba(255, 27, 107, 0.25)",
                  }}
                >
                  <Picker onEmojiClick={handleEmojiClick} />
                </Box>
              </Modal>
            </Box>
          </Box>
          {isMobile ? <AppFooterMobile /> : <AppFooterDesktop />}
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Left Sidebar (Chat List) */}
          <Drawer
            variant="permanent"
            sx={{
              width: { xs: 80, sm: 250, md: 300 },
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: { xs: 80, sm: 250, md: 300 },
                bgcolor: "#181818",
                color: "white",
                borderRight: "1px solid #333",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            {/* Sidebar Header */}
            <Box
              sx={{
                display: "flex",
                borderBottom: "1px solid #333",
                flexShrink: 0,
              }}
            >
              <Typography
                onClick={() => router.push("/messaging")}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  p: 2,
                  fontWeight: "bold",
                  fontSize: "18px",
                  borderBottom: "3px solid #FF1B6B",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#222" },
                }}
              >
                Chat
              </Typography>
              <Typography
                onClick={() => router.push("/mailbox")}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  p: 2,
                  fontWeight: "bold",
                  fontSize: "18px",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#222" },
                }}
              >
                Mailbox
              </Typography>
            </Box>

            {/* Chat List (only this scrolls) */}
            <List
              sx={{
                overflowY: "auto",
                flex: 1,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#555",
                  borderRadius: 3,
                },
              }}
            >
              {chatList.map((chat: any, index: number) => {
                const hasImage = /<img.*?src=["'](.*?)["']/.test(
                  chat.Conversation
                );
                return (
                  <ListItem
                    key={chat.ChatId}
                    onClick={() =>
                      router.push(`/messaging/${chat?.ToProfileId}`)
                    }
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor:
                        existingChatIndex === index
                          ? "rgba(255, 27, 107, 0.15)"
                          : "transparent",
                      "&:hover": { bgcolor: "rgba(255, 27, 107, 0.1)" },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={
                          chat?.NewMessages > 0 ? chat.NewMessages : 0
                        }
                        color="error"
                      >
                        <Avatar
                          src={chat.Avatar || "/noavatar.png"}
                          sx={{
                            width: 40,
                            height: 40,
                            border: "2px solid #FF1B6B",
                          }}
                        />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{
                        color: "white",
                        fontWeight: "bold",
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{ color: "gray", noWrap: true }}
                      primary={chat.Username}
                      secondary={
                        hasImage ? "📷 Sent an image" : chat.Conversation
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Drawer>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#121212",
              minHeight: 0, // <-- critical for inner scroll
            }}
          >
            {/* Chat Header - FIXED inside panel */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderBottom: "1px solid #333",
                bgcolor: "#181818",
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={() => {
                setShowDetail(true);
                setSelectedUserId(userProfile?.Id);
              }}
            >
              <Avatar
                src={userProfile?.Avatar}
                alt={userProfile?.Username}
                sx={{
                  width: 50,
                  height: 50,
                  border: "2px solid",
                  borderColor: userProfile?.isOnline ? "#4CAF50" : "#FF1B6B",
                }}
              />
              <Box>
                <Typography variant="h6" color="white">
                  {userProfile?.Username || "User"}
                </Typography>
                <Typography variant="body2" color="gray">
                  {userProfile?.LastOnline
                    ? dayjs(userProfile.LastOnline).fromNow()
                    : "Offline"}
                </Typography>
              </Box>
            </Box>

            {/* Messages - ONLY this scrolls */}
            <List
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                px: 2,
                py: 1,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#555",
                  borderRadius: 3,
                },
              }}
            >
              {messages.length === 0 && (
                <Typography color="gray" textAlign="center" sx={{ mt: 2 }}>
                  No messages yet
                </Typography>
              )}

              {messages.map((message: any, index: number) => (
                <ListItem
                  key={index}
                  sx={{
                    justifyContent:
                      message?.MemberIdFrom === profileId
                        ? "flex-end"
                        : "flex-start",
                    mb: 1,
                  }}
                >
                  {message?.MemberIdFrom !== profileId && (
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          border: "2px solid",
                          borderColor: "#FF1B6B",
                        }}
                        alt={message?.ToUsername || "User"}
                        src={userProfile?.Avatar || "/noavatar.png"}
                        onClick={() => {
                          setShowDetail(true);
                          setSelectedUserId(userProfile?.Id);
                        }}
                      />
                    </ListItemAvatar>
                  )}
                  <Box
                    sx={{
                      bgcolor:
                        message?.MemberIdFrom === profileId
                          ? "#1976D2"
                          : "#2C2C2C",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: "70%",
                      wordWrap: "break-word",
                      boxShadow: 2,
                    }}
                  >
                    <Typography
                      component="div"
                      className="message-content"
                      sx={{
                        "& img": {
                          cursor: "pointer",
                          width: "40%",
                          height: "40%",
                          borderRadius: "8px",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: message?.Conversation,
                      }}
                    />
                  </Box>
                  {message?.MemberIdFrom === profileId && (
                    <Typography
                      fontSize={10}
                      sx={{
                        textAlign: "right",
                        mt: 0.3,
                        color: message.readAt ? "#4FC3F7" : "gray",
                      }}
                    >
                      {message.readAt ? "✓✓ Seen" : "✓ Sent"}
                    </Typography>
                  )}
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>

            {/* Message Input - FIXED inside panel */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                bgcolor: "#181818",
                borderTop: "1px solid #333",
                flexShrink: 0,
              }}
            >
              <IconButton onClick={() => setEmojiPickerOpen(true)}>
                <EmojiIcon sx={{ color: "#FF1B6B" }} />
              </IconButton>
              <TextField
                fullWidth
                placeholder="Type a message..."
                variant="outlined"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                sx={{
                  input: { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#2C2C2C",
                    borderRadius: "20px",
                  },
                }}
              />
              <IconButton component="label">
                <ImageIcon sx={{ color: "#FF1B6B" }} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </IconButton>
              <IconButton color="primary" onClick={handleSendMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

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
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
