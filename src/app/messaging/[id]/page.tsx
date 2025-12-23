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

dayjs.extend(relativeTime);

type Params = Promise<{ id: string }>;

export default function ChatPage(props: { params: Params }) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>({});
  const [myProfile, setMyProfile] = useState<any>({});
  const [userId, setUserId] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [profileId, setProfileId] = useState<any>();

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
    const getIdFromParam = async () => {
      const params = await props.params;
      setUserId(params.id);
    };
    getIdFromParam();
  }, [props]);

  useEffect(() => {
    if (profileId) {
      getMyProfile(profileId);
      fetchAllChats();
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId && userId) {
      fetchChatConversation(profileId, userId);
      getUserProfile(userId);
    }
  }, [profileId, userId]);

  const getUserProfile = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
      if (response.ok) {
        const { user: userData } = await response.json();
        setUserProfile(userData);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
    }
  };

  const getMyProfile = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
      if (response.ok) {
        const { user: userData } = await response.json();
        setMyProfile(userData);
      }
    } catch (error: any) {
      console.error("Error fetching my profile:", error.message);
    }
  };

  const fetchAllChats = async () => {
    try {
      const profileid = localStorage.getItem("logged_in_profile");
      const response = await axios.get(
        `/api/user/messaging?profileid=${profileid}`
      );
      setChatList(response.data.data);
    } catch (err: any) {
      console.error("Error fetching chats:", err);
    }
  };

  const fetchChatConversation = async (profileId: any, userId: any) => {
    try {
      const payload = { ProfileIdfrom: profileId, ProfileIDto: userId };
      const response = await fetch("/api/user/messaging/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const result = await response.json();
        setMessages(result?.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching conversation:", err);
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
    await fetch("/api/user/notification/requestfriend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userProfile.Id,
        body: message,
        title: myProfile?.Username || "New message",
        type: "message",
        url: `https://swing-social-user.vercel.app/messaging/${myProfile.Id}`,
      }),
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newUserMessage = {
      AvatarFrom: myProfile?.Avatar || "/noavatar.png",
      AvatarTo: userProfile?.Avatar,
      ChatId: "temporary-chat-id",
      Conversation: newMessage,
      ConversationId: "temporary-conversation-id",
      CreatedAt: new Date().toISOString(),
      FromUsername: myProfile?.Username || "You",
      MemberIdFrom: profileId,
      MemberIdTo: userProfile?.Id,
      ToUsername: userProfile?.Username || "Recipient",
      lastcommentinserted: 1,
    };

    setMessages([...messages, newUserMessage]);
    sendNotification(newMessage);

    const payload = {
      chatid:
        existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId,
      ProfileIdfrom: myProfile?.Id,
      ProfileIDto: userProfile?.Id,
      Conversation: newMessage,
    };

    setNewMessage("");

    try {
      await fetch("/api/user/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data?.blobUrl || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (!imageUrl) return;

    const imageHtml = `<img src="${imageUrl}" alt="Uploaded" style="max-width:100px;border-radius:8px"/>`;

    const newUserMessage = {
      AvatarFrom: myProfile?.Avatar || "/noavatar.png",
      AvatarTo: userProfile?.Avatar,
      ChatId: "temporary-chat-id",
      Conversation: imageHtml,
      ConversationId: "temporary-conversation-id",
      CreatedAt: new Date().toISOString(),
      FromUsername: myProfile?.Username || "You",
      MemberIdFrom: profileId,
      MemberIdTo: userProfile?.Id,
      ToUsername: userProfile?.Username || "Recipient",
      lastcommentinserted: 1,
    };

    setMessages([...messages, newUserMessage]);
    sendNotification(imageHtml);

    const payload = {
      chatid:
        existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId,
      ProfileIdfrom: myProfile?.Id,
      ProfileIDto: userProfile?.Id,
      Conversation: imageHtml,
    };

    try {
      await fetch("/api/user/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.emoji);
  };

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
                  <Typography variant="body2" color="#FF1B6B">
                    {userProfile?.LastOnline
                      ? dayjs(userProfile.LastOnline).fromNow()
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>

              <List
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: 2,
                  py: 2,
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
          sx={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}
        >
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
              minHeight: 0,
            }}
          >
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
        handleGrantAccess={() => {}}
        handleClose={() => {
          setShowDetail(false);
          setSelectedUserId(null);
        }}
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
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
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
