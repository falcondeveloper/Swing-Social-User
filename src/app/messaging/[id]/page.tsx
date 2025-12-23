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
import io from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserProfileModal from "@/components/UserProfileModal";
import { X } from "lucide-react";
import Footer from "@/components/Footer";

dayjs.extend(relativeTime);

type Params = Promise<{ id: string }>;

export default function ChatPage(props: { params: Params }) {
  const socketRef = useRef<any>(null);

  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>({});
  const [myProfile, setMyProfile] = useState<any>({});
  const [userId, setUserId] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<any>({});
  const [messages, setMessages] = useState<any>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");
  const [realtimeMessage, setRealTimeMessage] = useState<any>();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [userDeviceToken, setUserDeviceToken] = useState(null);
  const [profileId, setProfileId] = useState<any>();

  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleImageClick = (e: any) => {
      if (e.target.tagName === "IMG") {
        setOpenImage(e.target.src);
      }
    };

    const containers = document.querySelectorAll(".message-content");
    containers.forEach((container) =>
      container.addEventListener("click", handleImageClick)
    );

    return () => {
      containers.forEach((container) =>
        container.removeEventListener("click", handleImageClick)
      );
    };
  }, [messages]);

  useEffect(() => {
    setProfileId(localStorage.getItem("logged_in_profile"));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!profileId) return;

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current.id);
        setIsConnected(true);
        socketRef.current.emit("user:join", profileId);
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on("message:receive", (data: any) => {
        if (data.from === userId) {
          setMessages((prev: any) => [
            ...prev,
            {
              AvatarFrom: userProfile?.Avatar || "/noavatar.png",
              AvatarTo: myProfile?.Avatar,
              ChatId: data.roomId,
              Conversation: data.message,
              ConversationId: `temp-${Date.now()}`,
              CreatedAt: data.timestamp,
              FromUsername: userProfile?.Username || "User",
              MemberIdFrom: data.from,
              MemberIdTo: data.to,
            },
          ]);
        }
      });

      socketRef.current.on("typing:start", ({ from }: any) => {
        if (from === userId) setIsTyping(true);
      });

      socketRef.current.on("typing:stop", ({ from }: any) => {
        if (from === userId) setIsTyping(false);
      });
    }

    return () => {
      // ❗ DO NOT DISCONNECT HERE
    };
  }, [profileId, userId]);

  const sendMessage = (messageContent: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn("⏳ Socket not ready, message skipped");
      return;
    }

    const roomId = [profileId, userId].sort().join("-");

    socket.emit("message:send", {
      message: messageContent,
      from: profileId,
      to: userId,
      roomId,
      timestamp: new Date().toISOString(),
    });

    socket.emit("typing:stop", { to: userId, from: profileId });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (value.length > 0) {
      socket.emit("typing:start", { to: userId, from: profileId });

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { to: userId, from: profileId });
      }, 1500);
    } else {
      socket.emit("typing:stop", { to: userId, from: profileId });
    }
  };

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
  }, [props]);

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

  const sendNotification = async (message: any) => {
    if (!myProfile?.Id || !userProfile?.Id) return;
    console.log("userProfile", userProfile);
    const response = await fetch("/api/user/notification/requestfriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userProfile.Id,
        body: message,
        title: myProfile?.Username || "New message",
        type: "message",
        url: `https://swing-social-user.vercel.app/messaging/${myProfile.Id}`,
      }),
    });

    const result = await response.json();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Create optimistic message
    const optimisticMessage = {
      AvatarFrom: myProfile?.Avatar || "/noavatar.png",
      AvatarTo: userProfile?.Avatar,
      ChatId: [profileId, userId].sort().join("-"),
      Conversation: newMessage,
      ConversationId: `temp-${Date.now()}`,
      CreatedAt: new Date().toISOString(),
      FromUsername: myProfile?.Username || "You",
      MemberIdFrom: profileId,
      MemberIdTo: userId,
      ToUsername: userProfile?.Username || "Recipient",
      lastcommentinserted: 1,
      sending: true,
    };

    // Add to UI immediately
    setMessages((prev: any) => [...prev, optimisticMessage]);

    // Send via socket
    sendMessage(newMessage);

    // Send notification if user has device token
    if (userDeviceToken) {
      sendNotification(newMessage);
    }

    // Save to database
    const payload = {
      chatid:
        existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId,
      ProfileIdfrom: myProfile?.Id,
      ProfileIDto: userProfile?.Id,
      Conversation: newMessage,
    };

    setNewMessage("");

    try {
      const response = await fetch("/api/user/messaging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Message saved to DB:", result);

        // Update message with actual chat ID
        setMessages((prev: any) =>
          prev.map((msg: any) =>
            msg.ConversationId === optimisticMessage.ConversationId
              ? { ...msg, ChatId: result.ChatId, sending: false }
              : msg
          )
        );

        // Refresh chat list
        fetchAllChats();
      } else {
        const errorData = await response.json();
        console.error("Error saving message:", errorData);

        // Mark message as failed
        setMessages((prev: any) =>
          prev.map((msg: any) =>
            msg.ConversationId === optimisticMessage.ConversationId
              ? { ...msg, failed: true, sending: false }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Network error while sending message:", error);

      // Mark message as failed
      setMessages((prev: any) =>
        prev.map((msg: any) =>
          msg.ConversationId === optimisticMessage.ConversationId
            ? { ...msg, failed: true, sending: false }
            : msg
        )
      );
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
    if (!file) return;

    // Upload image first
    const imageUrl = await uploadImage(file);
    if (!imageUrl) {
      console.error("Failed to upload image");
      return;
    }

    const imageHtml = `<img src="${imageUrl}" alt="Uploaded" style="max-width:100px;border-radius:8px"/>`;

    // Create optimistic message
    const optimisticMessage = {
      AvatarFrom: myProfile?.Avatar || "/noavatar.png",
      AvatarTo: userProfile?.Avatar,
      ChatId: [profileId, userId].sort().join("-"),
      Conversation: imageHtml,
      ConversationId: `temp-${Date.now()}`,
      CreatedAt: new Date().toISOString(),
      FromUsername: myProfile?.Username || "You",
      MemberIdFrom: profileId,
      MemberIdTo: userId,
      ToUsername: userProfile?.Username || "Recipient",
      lastcommentinserted: 1,
      sending: true,
    };

    setMessages((prev: any) => [...prev, optimisticMessage]);

    // Send via socket
    sendMessage(imageHtml);

    // Send notification
    if (userDeviceToken) {
      sendNotification("📷 Sent an image");
    }

    // Save to database
    const payload = {
      chatid:
        existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId,
      ProfileIdfrom: myProfile?.Id,
      ProfileIDto: userProfile?.Id,
      Conversation: imageHtml,
    };

    try {
      const response = await fetch("/api/user/messaging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Image message saved:", result);

        setMessages((prev: any) =>
          prev.map((msg: any) =>
            msg.ConversationId === optimisticMessage.ConversationId
              ? { ...msg, ChatId: result.ChatId, sending: false }
              : msg
          )
        );

        fetchAllChats();
      } else {
        const errorData = await response.json();
        console.error("Error saving image message:", errorData);
      }
    } catch (error) {
      console.error("Network error while sending image:", error);
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

      {!isConnected && (
        <Box
          sx={{
            bgcolor: "#FF9800",
            color: "white",
            py: 0.5,
            px: 2,
            textAlign: "center",
            fontSize: "12px",
          }}
        >
          Reconnecting...
        </Box>
      )}

      {isMobile ? (
        <>
          {/* Chat Header */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              overflow: "hidden",
              mb: "64px",
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
                  <Typography variant="body2" color="#FF1B6B" fontSize="12px">
                    {isTyping
                      ? "typing..."
                      : activeUsers[userId]
                      ? "online"
                      : userProfile?.LastOnline
                      ? dayjs(userProfile.LastOnline).fromNow()
                      : "offline"}
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
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  // pb: "60px",
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
                            dangerouslySetInnerHTML={{
                              __html: m?.Conversation,
                            }}
                          />
                          {m?.failed && (
                            <Typography fontSize="10px" color="error">
                              Failed to send
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    )
                )}

                {messages?.length === 0 && (
                  <Typography textAlign="center" color="gray">
                    No messages yet. Start the conversation!
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
                  position: "sticky",
                  bottom: 0,
                  bgcolor: "#1A1A1A",
                  px: 2,
                  py: 1.5,
                  borderTop: "1px solid #333",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  zIndex: 2000,
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
                  onChange={(e) => setNewMessage(e.target.value)}
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

                <IconButton onClick={handleSendMessage}>
                  <SendIcon />
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
                    bgcolor: "white",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 3,
                  }}
                >
                  <Picker onEmojiClick={handleEmojiClick} />
                </Box>
              </Modal>
            </Box>
          </Box>

          <Footer />
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
                    <Avatar
                      src={userProfile?.Avatar || "/noavatar.png"}
                      sx={{
                        width: 36,
                        height: 36,
                        border: "2px solid #FF1B6B",
                        mr: 1,
                      }}
                    />
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
                      dangerouslySetInnerHTML={{
                        __html: message?.Conversation,
                      }}
                    />
                  </Box>
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
                onChange={(e) => setNewMessage(e.target.value)}
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
