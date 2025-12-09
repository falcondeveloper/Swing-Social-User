"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Typography,
  IconButton,
  TextField,
  Drawer,
  CircularProgress,
  Button,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  Badge,
  Avatar,
} from "@mui/material";
import axios from "axios";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
  Delete,
  ArrowBack,
  Search,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import AddIcon from "@mui/icons-material/Add";

const socket = io("https://api.nomolive.com/");

export default function ChatPage() {
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;

  const router = useRouter();
  const [profileId, setProfileId] = useState<any>();
  const [chatOpen, setChat] = useState(false);
  const [userProfiles, setUserProfiles] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {});
    socket.on("disconnect", () => {});
    socket.on("message", (message) => {
      fetchAllChats();
    });
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileId(localStorage.getItem("logged_in_profile"));
    }
  }, []);

  const handleCloseChatBox = () => {
    const token = localStorage.getItem("loginInfo");

    if (token) {
      const decodeToken = jwtDecode<any>(token);
      if (decodeToken?.membership == 0) {
        Swal.fire({
          title: `Upgrade your membership.`,
          text: `Sorry, to access this page, you need to upgrade your membership`,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Upgrade the membership",
          cancelButtonText: "Continue as the free member",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/membership");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            router.push("/messaging");
          } else {
            router.back();
          }
        });
      } else {
        setChat(!chatOpen);
        setSearchQuery("");
      }
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (profileId) {
      getCurrentLocation();
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          await sendLocationToAPI(locationName, latitude, longitude);
        },
        (error) => {
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

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchChange = debounce((value: string) => {
    setPage(1);
    setHasMore(true);
    setSearchQuery(value);
  }, 300);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (loading || !hasMore) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/user/sweeping?page=${page}&size=50&search=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await response.json();

        if (data?.profiles?.length > 0) {
          setUserProfiles((prevProfiles: any) =>
            page === 1 ? data.profiles : [...prevProfiles, ...data.profiles]
          );
        } else {
          setHasMore(false); // No more results
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profiles:", error);
        setLoading(false);
      }
    };

    fetchUserProfiles();
  }, [page, searchQuery]);

  const deleteChat = async (chatId: any) => {
    const token = localStorage.getItem("loginInfo");

    if (!token) {
      router.push("/login");
      return;
    }

    const decodeToken = jwtDecode<any>(token);

    if (decodeToken?.membership === 0) {
      Swal.fire({
        title: "Upgrade your membership.",
        text: "Sorry, to delete chats, you need to upgrade your membership",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Upgrade the membership",
        cancelButtonText: "Continue as the free member",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/membership");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          router.push("/messaging");
        } else {
          router.back();
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This chat will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/user/messaging/chat/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete chat. Status: ${response.status}`);
        }

        Swal.fire("Deleted!", "The chat has been deleted.", "success");
        fetchAllChats();
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to delete the chat.", "error");
      }
    }
  };

  const messageClick = () => {
    router.push("/messaging");
  };

  const mailClick = () => {
    router.push("/mailbox");
  };

  const openChatDetails = (chat: any) => {
    const token = localStorage.getItem("loginInfo");

    if (token) {
      const decodeToken = jwtDecode<any>(token);
      if (decodeToken?.membership == 0) {
        Swal.fire({
          title: `Upgrade your membership.`,
          text: `Sorry, to access this page, you need to upgrade your membership`,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Upgrade the membership",
          cancelButtonText: "Continue as the free member",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/membership");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            router.push("/messaging");
          } else {
            router.back();
          }
        });
      } else {
        router.push(`/messaging/${chat}`);
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#0A0A0A",
          minHeight: "100vh",
          color: "white",
          display: "flex",
          background: "linear-gradient(to bottom, #0A0A0A, #1A1A1A)",
        }}
      >
        <Header />
        {isMobile ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              backgroundColor: "#2d2d2d",
              mt: 7.5,
            }}
          >
            {/* Buttons */}
            <Box
              sx={{
                display: "flex",
                borderTop: "1px solid #333",
              }}
            >
              <Typography
                onClick={messageClick}
                sx={{
                  width: "50%",
                  textAlign: "center",
                  padding: "16px",
                  cursor: "pointer",
                  fontSize: "24px",
                  fontWeight: "bold",
                  "&:hover": { opacity: 0.8 },
                  borderBottom: "3px solid #FF1B6B",
                }}
              >
                Chat
              </Typography>

              <Typography
                onClick={mailClick}
                sx={{
                  width: "50%",
                  textAlign: "center",
                  padding: "16px",
                  cursor: "pointer",
                  fontSize: "24px",
                  fontWeight: "bold",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                Mailbox
              </Typography>
            </Box>

            <Box>
              <>
                <List>
                  {chatList.length === 0 && (
                    <Typography
                      variant="body2"
                      color="gray"
                      textAlign="center"
                      sx={{ py: 2 }}
                    >
                      No Chats Found
                    </Typography>
                  )}

                  {chatList.map((chat: any, index: number) => {
                    const hasImage = /<img.*?src=["'](.*?)["']/.test(
                      chat.Conversation
                    );

                    return (
                      <ListItem
                        key={chat.ChatId}
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: "#000",
                          borderRadius: 2,
                          cursor: "pointer",
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                        }}
                        onClick={() => openChatDetails(chat?.ToProfileId)}
                      >
                        {/* Avatar */}
                        <ListItemAvatar>
                          <Badge
                            badgeContent={
                              chat?.NewMessages > 0 ? chat.NewMessages : 0
                            }
                            color="error"
                            invisible={chat?.NewMessages == 0}
                          >
                            <Box
                              sx={{
                                width: 35,
                                height: 35,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "#FF1B6B",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={chat.Avatar || "/noavatar.png"}
                                alt="Profile"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          </Badge>
                        </ListItemAvatar>

                        {/* Chat Info */}
                        <ListItemText
                          primaryTypographyProps={{
                            color: "#FF1B6B",
                            fontWeight: "bold",
                          }}
                          secondaryTypographyProps={{ color: "gray" }}
                          primary={<span>{chat.Username}</span>}
                          secondary={
                            hasImage
                              ? "Sent an Image"
                              : chat.Conversation || "No message yet"
                          }
                          sx={{ flex: 1, ml: 1 }}
                        />

                        {/* Last Updated & Delete */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "gray", fontSize: "0.75rem" }}
                          >
                            {chat.LastUp || "N/A"}
                          </Typography>

                          <IconButton
                            sx={{
                              backgroundColor: "rgba(255, 0, 0, 0.2)",
                              color: "red",
                              "&:hover": {
                                backgroundColor: "rgba(255, 0, 0, 0.4)",
                              },
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteChat(chat?.ChatId);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
                <Button
                  onClick={handleCloseChatBox}
                  variant="contained"
                  sx={{
                    backgroundColor: "#FF1B6B",
                    mt: 2,
                    padding: 2,
                    bottom: "80px",
                    right: "20px",
                    position: "fixed",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "50%",
                  }}
                >
                  <AddIcon />
                </Button>
              </>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flex: 1 }}>
            {/* Left Sidebar for Chat List */}
            <Drawer
              variant="permanent"
              sx={{
                width: 300,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                  width: 300,
                  boxSizing: "border-box",
                  bgcolor: "#1A1A1A",
                  color: "white",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  borderBottom: "1px solid #333",
                }}
              >
                <Typography
                  onClick={() => router.push("/messaging")}
                  sx={{
                    width: "50%",
                    textAlign: "center",
                    padding: "16px",
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "bold",
                    "&:hover": { opacity: 0.8 },
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
                    padding: "16px",
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "bold",
                    "&:hover": { opacity: 0.8 },
                  }}
                >
                  Mailbox
                </Typography>
              </Box>

              {/* Search Bar */}
              <Box sx={{ px: 2, py: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search users..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": { borderColor: "gray" },
                      "&:hover fieldset": { borderColor: "white" },
                      "&.Mui-focused fieldset": { borderColor: "#FF1B6B" },
                    },
                    input: { color: "white" },
                  }}
                />
              </Box>

              {/* Search Suggestions */}
              {searchQuery && (
                <List>
                  {loading && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 2,
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  {userProfiles.map((user: any) => (
                    <ListItem
                      key={user.id}
                      onClick={() => openChatDetails(user?.Id)}
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "#333333",
                        borderRadius: 2,
                        cursor: "pointer",
                        mt: 1,
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                      }}
                    >
                      <ListItemAvatar>
                        <Box
                          sx={{
                            width: 35,
                            height: 35,
                            borderRadius: "50%",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={user.Avatar || "/noavatar.png"}
                            alt="Avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{ color: "white" }}
                        secondaryTypographyProps={{ color: "gray" }}
                        primary={user.Username}
                        secondary={user.Location || "N/A"}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Chat List */}
              {!searchQuery && (
                <List>
                  {chatList.length === 0 && (
                    <Typography
                      variant="body2"
                      color="gray"
                      textAlign="center"
                      sx={{ py: 2 }}
                    >
                      No Chats Found
                    </Typography>
                  )}

                  {chatList.map((chat: any, index: number) => {
                    // Check if Conversation contains an <img> tag
                    const hasImage = /<img.*?src=["'](.*?)["']/.test(
                      chat.Conversation
                    );

                    return (
                      <ListItem
                        key={chat.ChatId}
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: "#000",
                          borderRadius: 2,
                          cursor: "pointer",
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                        }}
                        onClick={() => openChatDetails(chat?.ToProfileId)}
                      >
                        {/* Avatar */}
                        <ListItemAvatar>
                          <Badge
                            badgeContent={
                              chat?.NewMessages > 0 ? chat.NewMessages : 0
                            }
                            color="error"
                            invisible={chat?.NewMessages == 0}
                          >
                            <Box
                              sx={{
                                width: 35,
                                height: 35,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "#FF1B6B",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={chat.Avatar || "/noavatar.png"}
                                alt="Profile"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          </Badge>
                        </ListItemAvatar>

                        {/* Chat Info */}
                        <ListItemText
                          primaryTypographyProps={{
                            color: "#FF1B6B",
                            fontWeight: "bold",
                          }}
                          secondaryTypographyProps={{ color: "gray" }}
                          primary={<span>{chat.Username}</span>}
                          secondary={
                            hasImage
                              ? "Sent an Image"
                              : chat.Conversation || "No message yet"
                          } // Show "Sent an Image" if image is detected
                          sx={{ flex: 1, ml: 1 }}
                        />

                        {/* Last Updated & Delete */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "gray", fontSize: "0.75rem" }}
                          >
                            {chat.LastUp || "N/A"}
                          </Typography>

                          <IconButton
                            sx={{
                              backgroundColor: "rgba(255, 0, 0, 0.2)",
                              color: "red",
                              "&:hover": {
                                backgroundColor: "rgba(255, 0, 0, 0.4)",
                              },
                            }}
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent the redirection
                              deleteChat(chat?.ChatId); // Call the delete function
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Drawer>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100vh - 64px)",
                marginTop: "50px",
                bgcolor: "#121212",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#555",
                }}
              >
                <i
                  className="fas fa-comments"
                  style={{
                    fontSize: "80px",
                    color: "#FF1B6B",
                    marginBottom: "20px",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FF1B6B",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Please select a chat
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#aaa",
                  }}
                >
                  Start messaging your friends by selecting a chat from the
                  list.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* chatBoxModal */}
        <Dialog
          open={chatOpen}
          onClose={handleCloseChatBox}
          fullWidth
          maxWidth="xs"
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#121212",
              color: "white",
              borderRadius: 3,
              overflow: "hidden",
            },
          }}
        >
          {/* Header */}
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "linear-gradient(90deg, #000, #1a1a1a)",
              py: 1.5,
              px: 2,
            }}
          >
            <IconButton onClick={handleCloseChatBox} sx={{ color: "white" }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
              New Chat
            </Typography>
          </DialogTitle>

          {/* Body */}
          <DialogContent sx={{ p: 2 }}>
            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#1E1E1E",
                borderRadius: 5,
                px: 2,
                py: 0.5,
                mb: 2,
              }}
            >
              <Search sx={{ color: "gray", mr: 1 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { color: "white" },
                }}
              />
            </Box>

            {/* Search Results */}
            {searchQuery && (
              <List disablePadding>
                {loading && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 2 }}
                  >
                    <CircularProgress size={28} sx={{ color: "#FF1B6B" }} />
                  </Box>
                )}

                {!selectedUser &&
                  userProfiles.map((user: any) => (
                    <ListItem
                      key={user.Id}
                      onClick={() => router.push("/messaging/" + user?.Id)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                        },
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={user.Avatar || "/noavatar.png"}
                          sx={{ width: 42, height: 42 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.Username}
                        secondary={user.Location || "Unknown"}
                        primaryTypographyProps={{
                          color: "white",
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{ color: "gray" }}
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </DialogContent>
        </Dialog>
      </Box>
      {isMobile ? <Footer /> : <></>}
    </>
  );
}
