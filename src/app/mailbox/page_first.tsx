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
    MenuItem,
} from "@mui/material";
import axios from 'axios';

import Header from "@/components/Header";
import UserBottomNavigation from "@/components/BottomNavigation";
import Picker from "emoji-picker-react";
import { Send as SendIcon, EmojiEmotions as EmojiIcon, Image as ImageIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function ChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<any>([
        { sender: "user", text: "Hello! How are you?" },
        { sender: "other", text: "I'm good, thanks! How about you?" },
    ]);

    const [chatList, setChatList] = useState([
        { id: 1, name: "John Doe", lastMessage: "See you tomorrow!", avatar: "/path-to-avatar1.jpg" },
        { id: 2, name: "Jane Smith", lastMessage: "Got it, thanks!", avatar: "/path-to-avatar2.jpg" },
    ]);

    const [newMessage, setNewMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

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
                setMessages([...messages, { sender: "user", text: <img src={reader.result} alt="Uploaded" style={{ maxWidth: "100px", borderRadius: "8px" }} /> }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const [profileId, setProfileId] = useState<any>();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);
    useEffect(() => {
        if (profileId) {
            getCurrentLocation();
            fetchAllChats(profileId);
        }
    }, [profileId]);
    // Function to fetch all chats
    const fetchAllChats = async (profileId: any) => {
        try {
            const response = await axios.get(`/api/user/messaging?profileid=${profileId}`);
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
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const getLocationName = async (latitude: number, longitude: number) => {
        const apiKey = 'AIzaSyDv-b2OlvhI1HmMyfHoSEwHkKpPkKlX4vc'; // Replace with your actual API key

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
            if (data.status === 'OK' && data.results.length > 0) {
                return data.results[0].formatted_address; // Return the formatted address of the first result
            }

            console.error('No results found or status not OK:', data);
            return 'Unknown Location';
        } catch (error) {
            console.error('Error fetching location name:', error);
            return 'Unknown Location';
        }
    };

    const sendLocationToAPI = async (locationName: string, latitude: number, longitude: number) => {
        if (!profileId) {
            console.error('Profile ID is missing.');
            return;
        }

        try {
            const response = await fetch('/api/user/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                console.log('Location sent successfully:', data);
            } else {
                console.error('Error sending location:', data.message);
            }
        } catch (error) {
            console.error('Error sending location to API:', error);
        }
    };
    const debounce = (func: Function, delay: number) => {
        let timer: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };
    const [userProfiles, setUserProfiles] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(true);
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
                    `/api/user/sweeping?page=${page}&size=50&search=${encodeURIComponent(searchQuery)}`
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



    const [sentMails, setSentMails] = useState([
        { id: 1, to: "user1@example.com", subject: "Hello", message: "How are you?" },
        { id: 2, to: "user2@example.com", subject: "Meeting", message: "Let's meet at 4 PM" },
    ]);
    const [creatingNew, setCreatingNew] = useState(false);
    const [selectedUser, setSelectedUser] = useState("");
    const [newMail, setNewMail] = useState({
        subject: "",
        message: "",
    });

    const handleSendMail = () => {
        if (!selectedUser || !newMail.subject || !newMail.message) {
            alert("Please fill in all fields.");
            return;
        }
        setSentMails((prev) => [
            ...prev,
            { id: prev.length + 1, to: selectedUser, subject: newMail.subject, message: newMail.message },
        ]);
        setCreatingNew(false);
        setSelectedUser("");
        setNewMail({ subject: "", message: "" });
    };
    return (
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
                    <Typography
                        variant="h6"
                        sx={{ px: 2, py: 2, borderBottom: "1px solid #333" }}
                    >
                        Chats
                    </Typography>

                    {/* Buttons */}
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            gap: 2,
                            justifyContent: "center",
                            borderTop: "1px solid #333",
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#FF1B6B",
                                color: "white",
                                "&:hover": { bgcolor: "#E0145A" },
                                borderRadius: 2,
                            }}
                            onClick={() => router.push("/messaging")}
                        >
                            Chat
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#1E88E5",
                                color: "white",
                                "&:hover": { bgcolor: "#1565C0" },
                                borderRadius: 2,
                            }}
                            onClick={() => router.push("/mailbox")}
                        >
                            Mailbox
                        </Button>
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
                                    onClick={() => router.push(`/mailbox/${user.Id}`)}
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

                            {chatList.map((chat: any, index: number) => (
                                <ListItem
                                    onClick={() => router.push(`/messaging/${chat?.ToProfileId}`)}
                                    key={chat.ChatId}
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
                                    <ListItemText
                                        primaryTypographyProps={{ color: "#FF1B6B", fontWeight: "bold" }}
                                        secondaryTypographyProps={{ color: "gray" }}
                                        primary={
                                            <span>
                                                {chat.Username}
                                                <span
                                                    style={{
                                                        color: "#aaa",
                                                        fontSize: "12px",
                                                        marginLeft: "8px",
                                                    }}
                                                >
                                                    (Last seen: {chat.LastUp || "N/A"})
                                                </span>
                                            </span>
                                        }
                                        secondary={chat.Conversation || "No message yet"}
                                    />
                                </ListItem>
                            ))}
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
                        color: "white",
                        borderRadius: 2,
                        boxShadow: 3,
                        padding: 2,
                    }}
                >
                    <>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Sent Mails
                        </Typography>
                        <List sx={{ width: "100%", bgcolor: "#1A1A1A", borderRadius: 2 }}>
                            {sentMails.map((mail) => (
                                <React.Fragment key={mail.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`To: ${mail.to}`}
                                            secondary={
                                                <>
                                                    <strong>Subject:</strong> {mail.subject}
                                                    <br />
                                                    {mail.message}
                                                </>
                                            }
                                            primaryTypographyProps={{ color: "#FF1B6B" }}
                                            secondaryTypographyProps={{ color: "gray" }}
                                        />
                                    </ListItem>
                                    <Divider sx={{ borderColor: "#333" }} />
                                </React.Fragment>
                            ))}
                            {sentMails.length === 0 && (
                                <Typography textAlign="center" sx={{ py: 2, color: "gray" }}>
                                    No Sent Mails
                                </Typography>
                            )}
                        </List>
                        <Button
                            variant="contained"
                            sx={{ mt: 2, bgcolor: "#FF1B6B", "&:hover": { bgcolor: "#FF4081" } }}
                            onClick={() => router.push('/mailbox/new')}
                        >
                            Create New
                        </Button>
                    </>
                </Box>

            </Box>
        </Box>
    );
}