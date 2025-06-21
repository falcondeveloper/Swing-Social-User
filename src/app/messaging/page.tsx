"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Drawer,
  Divider,
  Modal,
  CircularProgress,
  Button,
  useMediaQuery,
  Tabs,
  Tab,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Badge,
} from "@mui/material";
import axios from "axios";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserBottomNavigation from "@/components/BottomNavigation";
import Picker from "emoji-picker-react";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
  Delete,
  ArrowBack,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { DeleteIcon, Search, SearchIcon } from "lucide-react";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import AddIcon from "@mui/icons-material/Add";

const socket = io("https://api.nomolive.com/");

export default function ChatPage() {
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;

  const router = useRouter();
  const [myProfile, setMyProfile] = useState<any>({});
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [mailBoxOpen, setMailbox] = useState(false);
  const [profileId, setProfileId] = useState<any>();
  const [chatOpen, setChat] = useState(false);
  const [userProfiles, setUserProfiles] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(0);
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [userDeviceToken, setUserDeviceToken] = useState(null);
  const [membership, setMembership] = useState(0);
  const [messages, setMessages] = useState<any>([
    { sender: "user", text: "Hello! How are you?" },
    { sender: "other", text: "I'm good, thanks! How about you?" },
  ]);
  const [chatList, setChatList] = useState([
    {
      id: 1,
      name: "John Doe",
      lastMessage: "See you tomorrow!",
      avatar: "/path-to-avatar1.jpg",
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "Got it, thanks!",
      avatar: "/path-to-avatar2.jpg",
    },
  ]);

  const [sentMails, setSentMails] = useState([
    {
      id: 1,
      to: "user1@example.com",
      subject: "Hello",
      message: "How are you?",
    },
    {
      id: 2,
      to: "user2@example.com",
      subject: "Meeting",
      message: "Let's meet at 4 PM",
    },
  ]);
  const [newMail, setNewMail] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("loginInfo");
    console.log(token);
    if (token) {
      const decodeToken = jwtDecode<any>(token);
      setMembership(decodeToken?.membership);
      console.log(decodeToken);

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
            router.back();
          } else {
            router.back();
          }
        });
      } else {
        router.push("/messaging");
      }
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });
    socket.on("message", (message) => {
      // Handle incoming message
      fetchAllChats();
    });
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      // Handle error, e.g., display an error message to the user
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

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

  console.log(chatList, "========================");

  const handleCloseMailBox = () => {
    setMailbox(!mailBoxOpen);
  };

  const handleCloseChatBox = () => {
    setChat(!chatOpen);
    setSearchQuery("");
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "user", text: newMessage }]);
      setNewMessage("");
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.emoji);
  };

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader: any = new FileReader();
      reader.onload = () => {
        setMessages([
          ...messages,
          {
            sender: "user",
            text: (
              <img
                src={reader.result}
                alt="Uploaded"
                style={{ maxWidth: "100px", borderRadius: "8px" }}
              />
            ),
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileId(localStorage.getItem("logged_in_profile"));
    }
  }, []);
  useEffect(() => {
    if (profileId) {
      getCurrentLocation();
      fetchAllChats();
      getMyProfile(profileId);
    }
  }, [profileId]);
  // Function to fetch all chats
  const fetchAllChats = async () => {
    try {
      let profileid = await localStorage.getItem("logged_in_profile");
      const response = await axios.get(
        `/api/user/messaging?profileid=${profileid}`
      );
      setChatList(response.data.data); // Assuming the data is in `data.data`
    } catch (err: any) {
      console.error("Error fetching chats:", err);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get the location name (you may need a third-party service here)
          const locationName = await getLocationName(latitude, longitude);

          // Send the location to your API
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
    const apiKey = "AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0"; // Replace with your actual API key

    try {
      // Call the Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract the location name from the response
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // Return the formatted address of the first result
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
        // console.log('Location sent successfully:', data);
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
    setPage(1); // Reset to first page for new search
    setHasMore(true); // Reset pagination
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

  const handleChange = (event: any, newValue: any) => {
    setActiveTab(newValue);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (selectedUser) {
      setUserDeviceToken(selectedUser?.Device_Token);
    }
  }, [selectedUser]);

  const handleSendMail = async () => {
    if (!selectedUser || !newMail.subject || !newMail.message) {
      alert("Please fill in all fields.");
      return;
    }
    // Send the email
    const response = await fetch("/api/user/messaging/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: selectedUser?.Email,
        htmlBody: newMail.message,
        subject: newMail.subject,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email. Status: ${response.status}`);
    }
    sendNotification("Mail From Swing Social");
    setCreatingNew(false);
    setSelectedUser("");
    setNewMail({ subject: "", message: "" });
    router.push("/mailbox");
  };

  const sendNotification = async (message: any) => {
    const response = await fetch("/api/user/notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: userDeviceToken, // Replace with the recipient's FCM token
        title: myProfile?.Username,
        body: message,
        image: "https://example.com/path/to/image.jpg",
        clickAction: "https://swing-social-website.vercel.app/",
      }),
    });

    const result = await response.json();
    console.log(result);
  };

  const deleteChat = async (chatId: any) => {
    // Show confirmation alert
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This chat will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    // If user confirms deletion
    if (result.isConfirmed) {
      try {
        // console.log(chatId);
        const response = await fetch("/api/user/messaging/chat/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete chat. Status: ${response.status}`);
        }
        // Show success alert
        Swal.fire("Deleted!", "The chat has been deleted.", "success");
        fetchAllChats();
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to delete the chat.", "error");
      }
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
              height: "calc(100vh - 150px)",
              width: "100%",
              backgroundColor: "#2d2d2d",
              mt: 10,
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
                onClick={() => router.push("/messaging")}
                sx={{
                  width: "50%", // Divide width evenly
                  textAlign: "center", // Center the text
                  padding: "16px", // Add some padding
                  // color: "#FF1B6B",
                  cursor: "pointer",
                  fontSize: "24px",
                  fontWeight: "bold",
                  "&:hover": { opacity: 0.8 },
                  borderBottom: "3px solid #FF1B6B", // Add a divider between buttons
                }}
              >
                Chat
              </Typography>
              <Typography
                onClick={() => router.push("/mailbox")}
                sx={{
                  width: "50%", // Divide width evenly
                  textAlign: "center", // Center the text
                  padding: "16px", // Add some padding
                  // color: "#1E88E5",
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
                        onClick={() =>
                          router.push(`/messaging/${chat?.ToProfileId}`)
                        } // Redirect when clicking anywhere except the delete button
                      >
                        {/* Avatar */}
                        <ListItemAvatar>
                          <Badge
                            badgeContent={
                              chat?.NewMessages > 0 ? chat.NewMessages : 0
                            }
                            color="error"
                            invisible={chat?.NewMessages == 0} // Hide badge if no new messages
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
                <Button
                  onClick={handleCloseChatBox}
                  variant="contained"
                  sx={{
                    backgroundColor: "#FF1B6B",
                    mt: 2,
                    padding: 2,
                    bottom: "60px",
                    right: "20px",
                    position: "fixed",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "100px 100px 100px",
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
                      onClick={() => router.push(`/messaging/${user.Id}`)}
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
                        onClick={() =>
                          router.push(`/messaging/${chat?.ToProfileId}`)
                        } // Redirect when clicking anywhere except the delete button
                      >
                        {/* Avatar */}
                        <ListItemAvatar>
                          <Badge
                            badgeContent={
                              chat?.NewMessages > 0 ? chat.NewMessages : 0
                            }
                            color="error"
                            invisible={chat?.NewMessages == 0} // Hide badge if no new messages
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

        {/* Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="xs" // Make the dialog width full on mobile
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#121212",
              color: "white",
              width: "100%",
              margin: 1,
            },
          }}
        >
          {/* Title Row */}
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#000",
              py: 2,
              paddingLeft: 0, // Align the back button to the left
            }}
          >
            {/* Back Icon */}
            <IconButton
              onClick={handleClose}
              sx={{
                color: "white",
                marginRight: "auto", // Push the back icon to the left
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Sent Mails
            </Typography>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#FF1B6B" }}
              onClick={handleClose}
            >
              Inbox
            </Button>
          </DialogTitle>

          {/* Search Row */}
          <DialogContent dividers>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  sx: {
                    backgroundColor: "white",
                    borderBottom: "2px solid black",
                    "&:focus-within": { borderBottom: "2px solid #FF1B6B" },
                    px: 1,
                  },
                }}
              />
              <Button variant="contained" sx={{ backgroundColor: "#FF1B6B" }}>
                <Search />
              </Button>
            </Box>

            {/* Sent Mails List */}
            <List>
              {chatList.length === 0 ? (
                <Typography
                  variant="body2"
                  color="gray"
                  textAlign="center"
                  sx={{ py: 2 }}
                >
                  No Sent Mails Found
                </Typography>
              ) : (
                chatList.map((chat: any) => (
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                    }}
                  >
                    {/* Avatar */}
                    <ListItemAvatar>
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
                    </ListItemAvatar>

                    {/* Chat Info */}
                    <ListItemText
                      primary={
                        <Typography
                          sx={{ color: "#FF1B6B", fontWeight: "bold" }}
                        >
                          {chat.Username}
                        </Typography>
                      }
                      secondary={chat.Conversation || "No message yet"}
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
                        onClick={() => deleteChat(chat?.ChatId)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </DialogContent>
        </Dialog>

        {/* mailBoxModal */}
        <Dialog
          open={mailBoxOpen}
          onClose={handleCloseMailBox}
          fullWidth
          maxWidth="xs"
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#121212",
              color: "white",
            },
          }}
        >
          {/* Title Row */}
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#000",
              py: 2,
              paddingLeft: 0,
            }}
          >
            {/* Back Icon */}
            <IconButton
              onClick={handleCloseMailBox}
              sx={{
                color: "white",
                marginRight: "auto",
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Create New Mail
            </Typography>
          </DialogTitle>

          {/* Mail Form */}
          <DialogContent dividers>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  sx: {
                    backgroundColor: "white",
                    borderBottom: "2px solid black",
                    "&:focus-within": { borderBottom: "2px solid #FF1B6B" },
                    px: 1,
                  },
                }}
              />
              <Button variant="contained" sx={{ backgroundColor: "#FF1B6B" }}>
                <Search />
              </Button>
            </Box>
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

                {!selectedUser &&
                  userProfiles.map((user: any) => (
                    <ListItem
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
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
            <Box sx={{ width: "100%", mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Create New Mail
              </Typography>
              {selectedUser && (
                <>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    <strong>From:</strong>
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>To:</strong> {selectedUser?.Username}
                  </Typography>

                  {/* Subject Field */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Subject"
                    value={newMail.subject}
                    onChange={(e) =>
                      setNewMail((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "gray" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "#FF1B6B" },
                      },
                      input: { color: "white" },
                    }}
                  />

                  {/* Message Field */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={6}
                    placeholder="Write your email..."
                    value={newMail.message}
                    onChange={(e) =>
                      setNewMail((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "gray" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "#FF1B6B" },
                      },
                      textarea: { color: "white" },
                    }}
                  />

                  {/* Send Button */}
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#FF1B6B",
                      "&:hover": { bgcolor: "#FF4081" },
                    }}
                    onClick={handleSendMail}
                  >
                    Send
                  </Button>
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>

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
            },
          }}
        >
          {/* Title Row */}
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#000",
              py: 2,
              paddingLeft: 0,
            }}
          >
            {/* Back Icon */}
            <IconButton
              onClick={handleCloseChatBox}
              sx={{
                color: "white",
                marginRight: "auto",
              }}
            >
              <ArrowBack />
            </IconButton>
          </DialogTitle>

          {/* Mail Form */}
          <DialogContent dividers>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  sx: {
                    backgroundColor: "white",
                    borderBottom: "2px solid black",
                    "&:focus-within": { borderBottom: "2px solid #FF1B6B" },
                    px: 1,
                  },
                }}
              />
              <Button variant="contained" sx={{ backgroundColor: "#FF1B6B" }}>
                <Search />
              </Button>
            </Box>
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

                {!selectedUser &&
                  userProfiles.map((user: any) => (
                    <ListItem
                      key={user.Id}
                      onClick={() => router.push("/messaging/" + user?.Id)}
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
          </DialogContent>
        </Dialog>
      </Box>
      {isMobile ? <Footer /> : <></>}
    </>
  );
}
