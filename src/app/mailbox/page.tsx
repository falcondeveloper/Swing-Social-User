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
    DialogActions,
} from "@mui/material";
import axios from 'axios';
import imageCompression from 'browser-image-compression';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserProfileModal from "@/components/UserProfileModal";
import ReplyModal from './components/ReplyModal';
import UserBottomNavigation from "@/components/BottomNavigation";
import Picker from "emoji-picker-react";
import { Send as SendIcon, EmojiEmotions as EmojiIcon, Image as ImageIcon, Delete, ArrowBack, AddPhotoAlternate, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { DeleteIcon, Search, SearchIcon } from "lucide-react";
import io from 'socket.io-client';
import Swal from "sweetalert2";
import { jwtDecode } from 'jwt-decode';

interface Mail {
    Avatar: string;
    Subject: string;
    ProfileFromUsername: string;
    ProfileToUsername: string;
    ProfileIdFrom: string;
    ProfileTo: string;
    Body: string;
    Image?: string;
    Image_1?: string;
    Image_2?: string;
    Image_3?: string;
    Image_4?: string;
    CreatedAt: string;
}

const socket = io("https://api.nomolive.com/");

export default function ChatPage() {
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

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
        { id: 1, name: "John Doe", lastMessage: "See you tomorrow!", avatar: "/path-to-avatar1.jpg" },
        { id: 2, name: "Jane Smith", lastMessage: "Got it, thanks!", avatar: "/path-to-avatar2.jpg" },
    ]);

    const [sentMails, setSentMails] = useState([
        { id: 1, to: "user1@example.com", subject: "Hello", message: "How are you?" },
        { id: 2, to: "user2@example.com", subject: "Meeting", message: "Let's meet at 4 PM" },
    ]);
    const [newMail, setNewMail] = useState({
        subject: "",
        message: "",
    });

    const [openModal, setOpenModal] = useState(false);
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [selectedMailsWithReply, setSelectedMailsWithReply] = useState<Mail[]>([]);
    const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; preview: string; url?: string }>>([]);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [showDetail, setShowDetail] = useState<any>(false);
	const [selectedUserId, setSelectedUserId] = useState<any>(null);

    const handleMailClick = async (chat: any) => {
        console.log(chat)
        setSelectedMail({
            Avatar: chat.Avatar,
            ProfileFromId: chat.ProfileIdFrom,
            ProfileToId: chat.ProfileTo,
            id: chat.MessageId,
            from: chat.ProfileFromUsername,
            to: chat.ProfileToUsername,
            subject: chat.Subject,
            content: chat.Body,
            image: chat.Image || null,
            image1: chat.Image_1 || null,
            image2: chat.Image_2 || null,
            image3: chat.Image_3 || null,
            image4: chat.Image_4 || null,
        });
        setOpenModal(true);
        const result = await fetch(`/api/user/mailbox/reply?chatid=${chat.MessageId}`);
        const mails = await result.json();
        console.log("mailswithreply", mails.data)
        setSelectedMailsWithReply(mails.data)
    };

    const handleMailDesktopClick = async (chat: any) => {
        console.log(chat)
        setSelectedMail({
            Avatar: chat.Avatar,
            ProfileFromId: chat.ProfileIdFrom,
            ProfileToId: chat.ProfileTo,
            id: chat.MessageId,
            from: chat.ProfileFromUsername,
            to: chat.ProfileToUsername,
            subject: chat.Subject,
            content: chat.Body,
            image: chat.Image || null,
            image1: chat.Image_1 || null,
            image2: chat.Image_2 || null,
            image3: chat.Image_3 || null,
            image4: chat.Image_4 || null,
        });
        const result = await fetch(`/api/user/mailbox/reply?chatid=${chat.MessageId}`);
        const mails = await result.json();
        console.log("mailswithreply", mails.data)
        setSelectedMailsWithReply(mails.data)
    }

    useEffect(() => {
        const token = localStorage.getItem('loginInfo');
        console.log(token);
        if (token) {
            const decodeToken = jwtDecode<any>(token);
            setMembership(decodeToken?.membership);
            console.log(decodeToken);

            if (decodeToken?.membership == 0) {
                Swal.fire({
                    title: `Upgrade your membership.`,
                    text: `Sorry, to access this page, you need to upgrade your membership`,
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Upgrade the membership',
                    cancelButtonText: 'Continue as the free member'
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.push('/membership');
                    }
                    else if (result.dismiss === Swal.DismissReason.cancel) {
                        router.back();
                    } else {
                        router.back();
                    }
                })
            } else {
                router.push("/mailbox");
            }
        }
        else {
            router.push("/login");
        }
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
        socket.on('message', (message) => {

            // Handle incoming message
            fetchAllChats();
        });
        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            // Handle error, e.g., display an error message to the user
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('message');
        };
    }, []);

    const getMyProfile = async (userId: string) => {
        if (userId) {

            try {
                const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
                if (!response.ok) {
                    console.error("Failed to fetch advertiser data:", response.statusText);
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
    }

    const handleCloseChatBox = () => {
        setChat(!chatOpen);
        setSearchQuery('');
    }

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            setMessages([...messages, { sender: "user", text: newMessage }]);
            setNewMessage("");
        }
    };

    const handleEmojiClick = (emoji: any) => {
        setNewMessage((prev) => prev + emoji.emoji);
    };


    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages = Array.from(files).slice(0, 5 - uploadedImages.length);
        
        const processedImages = await Promise.all(newImages.map(async (file) => {
            // Compression options
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: file.type // Preserve the original file type
            };

            try {
                // Always compress the image to ensure consistent handling
                const compressedFile = await imageCompression(file, options);
                
                // Create a new File instance from the compressed blob
                const processedFile = new File([compressedFile], file.name, {
                    type: file.type,
                    lastModified: new Date().getTime()
                });

                return {
                    file: processedFile,
                    preview: URL.createObjectURL(processedFile)
                };
            } catch (error) {
                console.error('Error processing image:', error);
                throw error;
            }
        }));

        setUploadedImages(prev => [...prev, ...processedImages]);
    };

    const handleRemoveImage = (index: number) => {
        setUploadedImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
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
            let profileid = await localStorage.getItem('logged_in_profile');
            const response = await axios.get(`/api/user/mailbox?profileid=${profileid}&type=received`);
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
        const apiKey = 'AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0'; // Replace with your actual API key

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
                // console.log('Location sent successfully:', data);
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

        try {
            const uploadedUrls = [];
            
            for (const image of uploadedImages) {
                try {
                    console.log("image", image)
                    const formData = new FormData();
                    // Create a new blob from the file to ensure a fresh ArrayBuffer
                    const blob = new Blob([image.file], { type: image.file.type });
                    formData.append("image", blob, image.file.name);

                    const response = await fetch("/api/user/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Failed to upload image");
                    }

                    const data = await response.json();
                    uploadedUrls.push(data.blobUrl);
                    
                    // Add a small delay between uploads
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error("Error uploading image:", error);
                    // Continue with other images even if one fails
                    uploadedUrls.push("");
                }
            }

            console.log("uploadurls", uploadedUrls)

            // 2. Send the email with the original mailbox functionality
            const response = await fetch('/api/user/mailbox', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fromId: profileId,
                    toId: selectedUser?.Id,
                    htmlBody: newMail.message,
                    subject: newMail.subject,
                    image1: uploadedUrls[0] || "", // Add image URLs to the message
                    image2: uploadedUrls[1] || "", // Add image URLs to the message
                    image3: uploadedUrls[2] || "", // Add image URLs to the message
                    image4: uploadedUrls[3] || "", // Add image URLs to the message
                    image5: uploadedUrls[4] || "", // Add image URLs to the message
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send email. Status: ${response.status}`);
            }

            // 4. Clean up and reset
            uploadedImages.forEach(image => URL.revokeObjectURL(image.preview));
            setUploadedImages([]);
            sendNotification("Mail From Swing Social");
            setCreatingNew(false);
            setSelectedUser("");
            setNewMail({ subject: "", message: "" });
            router.push('/mailbox');

        } catch (error) {
            console.error("Error sending mail with images:", error);
            alert("Failed to send mail. Please try again.");
        }
    };

    const sendNotification = async (message: string) => {
        const response = await fetch("/api/user/notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: selectedUser.Id,
                body: "Mail From Swing Social",
                image: "https://example.com/path/to/image.jpg",
                url: `https://swing-social-user.vercel.app/mailbox/${selectedUser.Id}`,
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
                const response = await fetch("/api/user/mailbox/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chatId }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete chat. Status: ${response.status}`);
                }
                // Show success alert
                Swal.fire("Deleted!", "The chat has been deleted.", "success")
                .then(() => {
                    window.location.reload();
                });
            } catch (error) {
                console.error(error);
                Swal.fire("Error!", "Failed to delete the chat.", "error");
            }
        }
    };

    const handleCloseUserProfileModal = () => {
		setShowDetail(false);
		setSelectedUserId(null);
	};

    const handleGrantAccess = async () => {
		try {
			// const checkResponse = await fetch('/api/user/sweeping/grant', {
			//     method: 'POST',
			//     headers: {
			//         'Content-Type': 'application/json',
			//     },
			//     body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }),
			// });

			// const checkData = await checkResponse.json();
			const checkData = "121212";
		} catch (error) {
			console.error("Error:", error);
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
                {isMobile ?
                    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 150px)", width: "100%", backgroundColor: "#2d2d2d", mt: 10 }}>
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
                                    // borderRight: "1px solid #333" // Add a divider between buttons
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
                                    borderBottom: "3px solid #FF1B6B"
                                }}
                            >
                                Mailbox
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={handleCloseMailBox}
                                variant="contained"
                                sx={{
                                    bgcolor: "#FF1B6B",
                                    color: "white",
                                    "&:hover": { bgcolor: "#E0145A" },
                                    borderRadius: 2,
                                    marginTop: "10px",
                                    marginRight: "10px"
                                }}
                             >
                                Create Mail
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: "#FF1B6B",
                                    color: "white",
                                    "&:hover": { bgcolor: "#E0145A" },
                                    borderRadius: 2,
                                    marginTop: "10px",
                                    marginRight: "10px"
                                }}
                                onClick={() => router.push("/mailbox/sent")}
                            >
                                To Sent Emails
                            </Button>
                        </Box>
                        <Box sx={{ 
                            flex: 1,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "#1A1A1A",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "#333",
                                borderRadius: "4px",
                            },
                        }}>
                            <List>
                                {chatList.length === 0 && (
                                    <Typography variant="body2" color="gray" textAlign="center" sx={{ py: 2 }}>
                                        No Chats Found
                                    </Typography>
                                )}

                                {chatList.map((chat: any, index: number) => {
                                    // Check if Conversation contains an <img> tag
                                    const hasImage = /<img.*?src=["'](.*?)["']/.test(chat.Conversation);

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
                                            onClick={() => handleMailClick(chat)} // Replace the existing onClick handler
                                        >
                                            {/* Avatar */}
                                            <ListItemAvatar>
                                                <Badge
                                                    badgeContent={chat?.NewMessages > 0 ? chat.NewMessages : 0}
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
                                                primaryTypographyProps={{ color: "#FF1B6B", fontWeight: "bold" }}
                                                secondaryTypographyProps={{ color: "gray" }}
                                                primary={<span>{chat.ProfileFromUsername}</span>}
                                                secondary={hasImage ? "Sent an Image" : chat.Subject || "No message yet"} // Show "Sent an Image" if image is detected
                                                sx={{ flex: 1, ml: 1 }}
                                            />

                                            {/* Last Updated & Delete */}
                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem" }}>
                                                {chat.CreatedAt
                                                    ? new Date(chat.CreatedAt).toLocaleString("en-US", {
                                                        month: "short",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                    })
                                                    : "N/A"}
                                            </Typography>

                                                <IconButton
                                                    sx={{
                                                        backgroundColor: "rgba(255, 0, 0, 0.2)",
                                                        color: "red",
                                                        "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.4)" },
                                                    }}
                                                    onClick={(event) => {
                                                        event.stopPropagation(); // Prevent the redirection
                                                        deleteChat(chat?.MessageId); // Call the delete function
                                                    }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </ListItem>

                                    );
                                })}

                            </List>
                        </Box>       
                    </Box>
                    :
                    <Box sx={{ display: "flex", flex: 1, height: "100vh", overflow: "hidden" }}>
                        {/* Left Sidebar for Chat List */}
                        <Drawer
                            variant="permanent"
                            sx={{
                                width: 300,
                                flexShrink: 0,
                                height: "100vh",
                                [`& .MuiDrawer-paper`]: {
                                    width: 300,
                                    boxSizing: "border-box",
                                    bgcolor: "#1A1A1A",
                                    color: "white",
                                    position: "relative",
                                    height: "100%",
                                    overflow: "hidden",
                                },
                            }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                {/* Static Header Content */}
                                <Box sx={{ flexShrink: 0 }}>
                                    {/* Chat/Mailbox Navigation */}
                                    <Box sx={{ display: "flex", borderBottom: "1px solid #333" }}>
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
                                                borderBottom: "3px solid #FF1B6B"
                                            }}
                                        >
                                            Mailbox
                                        </Typography>
                                    </Box>
                                    {/* To Sent Emails Button */}
                                    <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                bgcolor: "#FF1B6B",
                                                color: "white",
                                                "&:hover": { bgcolor: "#E0145A" },
                                                borderRadius: 2,
                                            }}
                                            onClick={() => router.push("/mailbox/sent")}
                                            fullWidth
                                        >
                                            To Sent Emails
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Scrollable List Container */}
                                <Box sx={{ 
                                    flex: 1,
                                    overflowY: "auto",
                                    "&::-webkit-scrollbar": {
                                        width: "8px",
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        background: "#1A1A1A",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        background: "#333",
                                        borderRadius: "4px",
                                    },
                                }}>
                                    <List>
                                        {chatList.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                color="gray"
                                                textAlign="center"
                                                sx={{ py: 2 }}
                                            >
                                                No Mails Found
                                            </Typography>
                                        )}

                                        {chatList.map((chat: any, index: number) => {
                                            // Check if Conversation contains an <img> tag
                                            const hasImage = /<img.*?src=["'](.*?)["']/.test(chat.Body);

                                            return (
                                                <ListItem
                                                    key={chat.MessageId}
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
                                                    onClick={() => handleMailDesktopClick(chat)} // Redirect when clicking anywhere except the delete button
                                                >
                                                    {/* Avatar */}
                                                    <ListItemAvatar>
                                                        <Badge
                                                            badgeContent={chat?.NewMessages > 0 ? chat.NewMessages : 0}
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
                                                        primaryTypographyProps={{ color: "#FF1B6B", fontWeight: "bold" }}
                                                        secondaryTypographyProps={{ color: "gray" }}
                                                        primary={<span>{chat.ProfileFromUsername}</span>}
                                                        secondary={hasImage ? "Sent an Image" : chat.Subject || "No message yet"} // Show "Sent an Image" if image is detected
                                                        sx={{ flex: 1, ml: 1 }}
                                                    />

                                                    {/* Last Updated & Delete */}
                                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                                                        <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem" }}>
                                                            {chat.CreatedAt
                                                                ? new Date(chat.CreatedAt).toLocaleString("en-US", {
                                                                    month: "short",
                                                                    day: "2-digit",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: false,
                                                                })
                                                                : "N/A"}
                                                        </Typography>

                                                        <IconButton
                                                            sx={{
                                                                backgroundColor: "rgba(255, 0, 0, 0.2)",
                                                                color: "red",
                                                                "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.4)" },
                                                            }}
                                                            onClick={(event) => {
                                                                event.stopPropagation(); // Prevent the redirection
                                                                deleteChat(chat?.MessageId); // Call the delete function
                                                            }}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Box>
                                                </ListItem>

                                            );
                                        })}

                                    </List>
                                </Box>

                                {/* Static Footer Content */}
                                <Box sx={{ 
                                    p: 2, 
                                    borderTop: "1px solid #333",
                                    backgroundColor: "#1A1A1A",
                                    flexShrink: 0,
                                }}>
                                    <Button
                                        onClick={handleCloseMailBox}
                                        variant="contained"
                                        sx={{ 
                                            backgroundColor: "#FF1B6B", 
                                            "&:hover": { backgroundColor: "#E0145A" }
                                        }}
                                        fullWidth
                                    >
                                        Create Mail
                                    </Button>
                                </Box>
                            </Box>
                        </Drawer>


                        <Box
                            sx={{
                                width: "100%",
                                height: "calc(100vh - 100px)", // Adjust for the top margin
                                bgcolor: "#121212",
                                color: "white",
                                overflow: "auto",
                                px: "20px",
                                mt: "100px",
                                display: "flex",           // Add flex display
                                flexDirection: "column",   // Stack children vertically
                                scrollBehavior: 'smooth', // Add smooth scrolling
                                "&::-webkit-scrollbar": {
                                    width: "8px",
                                },
                                "&::-webkit-scrollbar-track": {
                                    background: "#121212",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    background: "#333",
                                    borderRadius: "4px",
                                },
                            }}
                            ref={(el: HTMLDivElement | null) => {
                                if (el) {
                                    el.scrollTop = el.scrollHeight;
                                }
                            }}
                        >
                            {selectedMail ? (
                                <>
                                <Box sx={{ width: "100%", p: 3, borderColor: "white", border: 1 }}>
                                    {selectedMail?.subject === "Friend Request" ? (
                                        <Box 
                                            sx={{ 
                                                width: "100%",
                                                mb: 3 
                                            }}
                                        >
                                            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                                <Typography variant="h5" sx={{ color: "#FF1B6B", mb: 2 }}>
                                                    {selectedMail.subject}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                            <Avatar
                                                sx={{
                                                    border: "2px solid",
                                                    borderColor: "#FF1B6B",
                                                }}
                                                alt={selectedMail?.from || "User"}
                                                src={selectedMail?.Avatar || "/noavatar.png"}
                                                onClick={() => {
                                                    setShowDetail(true);
                                                    setSelectedUserId(selectedMail?.ProfileFromId);
                                                }}
                                            />   
                                            <Typography variant="h6" color="white">
                                                {selectedMail?.from || "User"}
                                            </Typography>														
                                            </Box>
                                            <Box sx={{ 
                                                bgcolor: "#1A1A1A", 
                                                p: 3, 
                                                borderRadius: 2,
                                                py: "10px"
                                            }}>
                                                <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
                                                    <h2 style={{ color: "#fff" }}>Friend Request</h2>
                                                    <p style={{ color: "#ccc", margin: "15px 0" }}>You have received a friend request</p>
                                                    <div style={{ margin: "20px 0", display: "flex", justifyContent: "center", gap: "20px" }}>
                                                        <button 
                                                            onClick={() => {
                                                                fetch('/api/user/profile/friend/accept', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ 
                                                                        fromId: selectedMail.ProfileFromId, 
                                                                        toId: selectedMail.ProfileToId,
                                                                        Id: selectedMail.id
                                                                    })
                                                                })
                                                                .then(() => {
                                                                    window.location.reload();
                                                                });
                                                            }}
                                                            style={{
                                                                display: "inline-block",
                                                                padding: "10px 20px",
                                                                backgroundColor: "#4CAF50",
                                                                color: "white",
                                                                textDecoration: "none",
                                                                borderRadius: "5px",
                                                                border: "none",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                fetch('/api/user/profile/friend/decline', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ 
                                                                        fromId: selectedMail.ProfileFromId, 
                                                                        toId: selectedMail.ProfileToId,
                                                                        Id: selectedMail.id
                                                                    })
                                                                })
                                                                .then(() => {
                                                                    window.location.reload();
                                                                });
                                                            }}
                                                            style={{
                                                                display: "inline-block",
                                                                padding: "10px 20px",
                                                                backgroundColor: "#f44336",
                                                                color: "white",
                                                                textDecoration: "none",
                                                                borderRadius: "5px",
                                                                border: "none",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            </Box>
                                        </Box>
                                    ) : (
                                        selectedMailsWithReply.map((mail, index) => (
                                            <Box 
                                                key={index} 
                                                sx={{ 
                                                    width: index === 0 ? "100%" : "95%", 
                                                    ml: index === 0 ? 0 : "auto",
                                                    mb: 3 
                                                }}
                                            >
                                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                                <Typography variant="h5" sx={{ color: "#FF1B6B", mb: 2 }}>
                                                    {index === 0 ? mail.Subject : `RE: ${mail.Subject}`}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem"}}>
                                                                {mail.CreatedAt
                                                                    ? new Date(mail.CreatedAt).toLocaleString("en-US", {
                                                                        month: "short",
                                                                        day: "2-digit",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: false,
                                                                    })
                                                                    : "N/A"}
                                                </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                                <Avatar
                                                    sx={{
                                                        border: "2px solid",
                                                        borderColor: "#FF1B6B",
                                                    }}
                                                    alt={mail?.ProfileFromUsername || "User"}
                                                    src={mail?.Avatar || "/noavatar.png"}
                                                    onClick={() => {
                                                        setShowDetail(true);
                                                        setSelectedUserId(mail?.ProfileIdFrom);
                                                    }}
                                                />   
                                                <Typography variant="h6" color="white">
                                                    {mail.ProfileFromUsername || "User"}
                                                </Typography>														
                                                </Box>
                                                <Box sx={{ 
                                                    bgcolor: "#1A1A1A", 
                                                    p: 3, 
                                                    borderRadius: 2,
                                                    py: "10px"
                                                }}>
                                                    <Typography variant="body1">
                                                        {mail.Body}
                                                    </Typography>
                                                    {/* Images Grid */}
                                                    <Box sx={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                        gap: 2,
                                                        mt: 2 
                                                    }}>
                                                        {[mail.Image, mail.Image_1, mail.Image_2, mail.Image_3, mail.Image_4]
                                                            .filter(img => img)
                                                            .map((img, imgIndex) => (
                                                                <img
                                                                    onClick={() => {
                                                                        if (img) {
                                                                            setExpandedImage(img);
                                                                            setImageModalOpen(true);
                                                                        }
                                                                    }}
                                                                    key={imgIndex}
                                                                    src={img}
                                                                    alt={`Attachment ${imgIndex + 1}`}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '150px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px'
                                                                    }}
                                                                />
                                                            ))}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                        onClick={() => setReplyModalOpen(true)}
                                        sx={{px: 3, mt: 1, backgroundColor: "#FF1B6B", color: "#444"}}
                                    >
                                        Reply
                                    </Button>
                                </Box>
                                </Box>
                                
                                
                                <ReplyModal 
                                    open={replyModalOpen}
                                    onClose={() => setReplyModalOpen(false)}
                                    selectedMail={selectedMail}
                                    profileId={profileId}
                                    onReplySuccess={() => {
                                        // Optionally refresh the mail list here
                                    }}
                                />
                                </>
                            ) : (
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
                                        Please select a Mail
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: "#aaa",
                                        }}
                                    >
                                        Select a mail from the list to view its content.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                    </Box>
                }


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
                            margin: 1
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
                        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
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
                                        key={chat.MessageId}
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
                                            primary={<Typography sx={{ color: "#FF1B6B", fontWeight: "bold" }}>{chat.ProfileFromUsername}</Typography>}
                                            secondary={chat.Subject || "No message yet"}
                                            sx={{ flex: 1, ml: 1 }}
                                        />

                                        {/* Last Updated & Delete */}
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem" }}>
                                                {chat.CreatedAt || "N/A"}
                                            </Typography>

                                            <IconButton
                                                sx={{
                                                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                                                    color: "red",
                                                    "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.4)" },
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
                        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
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

                                {!selectedUser && userProfiles.map((user: any) => (
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
                                        <strong>From:</strong> {selectedUser.Id}
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
                                            setNewMail((prev) => ({ ...prev, subject: e.target.value }))
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
                                            setNewMail((prev) => ({ ...prev, message: e.target.value }))
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

                                    {/* Image Upload Section */}
                                    <Box sx={{ mb: 2 }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="image-upload"
                                            type="file"
                                            onChange={handleImageUpload}
                                            multiple
                                        />
                                        <label htmlFor="image-upload">
                                            <Button
                                                component="span"
                                                variant="outlined"
                                                startIcon={<AddPhotoAlternate />}
                                                sx={{
                                                    color: 'white',
                                                    borderColor: 'gray',
                                                    '&:hover': {
                                                        borderColor: '#FF1B6B',
                                                    },
                                                }}
                                                disabled={uploadedImages.length >= 5}
                                            >
                                                Add Images ({uploadedImages.length}/5)
                                            </Button>
                                        </label>

                                        {/* Image Preview Grid */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: 1, 
                                            mt: 2 
                                        }}>
                                            {uploadedImages.map((image, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        position: 'relative',
                                                        width: 100,
                                                        height: 100,
                                                    }}
                                                >
                                                    <img
                                                        src={image.preview}
                                                        alt={`Upload ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveImage(index)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                            color: 'white',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255, 27, 107, 0.7)',
                                                            },
                                                        }}
                                                    >
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>

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

                                {!selectedUser && userProfiles.map((user: any) => (
                                    <ListItem
                                        key={user.Id}
                                        onClick={() => router.push('/messaging/' + user?.Id)}
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
                <Dialog 
                    open={openModal} 
                    onClose={() => setOpenModal(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        style: {
                            backgroundColor: '#1A1A1A',
                            color: 'white',
                        },
                    }}
                >
                    <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Mail Details</DialogTitle>
                    <DialogContent 
                        sx={{ 
                            mt: 2,
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            scrollBehavior: 'smooth',
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "#1A1A1A",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "#333",
                                borderRadius: "4px",
                            },
                        }}
                        ref={(el: HTMLDivElement | null) => {
                            if (el) {
                                el.scrollTop = el.scrollHeight;
                            }
                        }}
                    >
                        {selectedMail?.subject === "Friend Request" ? (
                            <Box 
                                sx={{ 
                                    width: "100%",
                                    mb: 3 
                                }}
                            >
                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                    <Typography variant="h5" sx={{ color: "#FF1B6B", mb: 2 }}>
                                        {selectedMail.subject}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                <Avatar
                                    sx={{
                                        border: "2px solid",
                                        borderColor: "#FF1B6B",
                                    }}
                                    alt={selectedMail?.from || "User"}
                                    src={selectedMail?.Avatar || "/noavatar.png"}
                                    onClick={() => {
                                        setShowDetail(true);
                                        setSelectedUserId(selectedMail?.ProfileFromId);
                                    }}
                                />   
                                <Typography variant="h6" color="white">
									{selectedMail?.from || "User"}
								</Typography>														
                                </Box>
                                <Box sx={{ 
                                    bgcolor: "#1A1A1A", 
                                    p: 3, 
                                    borderRadius: 2,
                                    py: "10px"
                                }}>
                                    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
                                        <h2 style={{ color: "#fff" }}>Friend Request</h2>
                                        <p style={{ color: "#ccc", margin: "15px 0" }}>You have received a friend request</p>
                                        <div style={{ margin: "20px 0", display: "flex", justifyContent: "center", gap: "20px" }}>
                                            <button 
                                                onClick={() => {
                                                    fetch('/api/user/profile/friend/accept', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ 
                                                            fromId: selectedMail.ProfileFromId, 
                                                            toId: selectedMail.ProfileToId,
                                                            Id: selectedMail.id
                                                        })
                                                    })
                                                    .then(() => {
                                                        window.location.reload();
                                                    });
                                                }}
                                                style={{
                                                    display: "inline-block",
                                                    padding: "10px 20px",
                                                    backgroundColor: "#4CAF50",
                                                    color: "white",
                                                    textDecoration: "none",
                                                    borderRadius: "5px",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    fetch('/api/user/profile/friend/decline', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ 
                                                            fromId: selectedMail.ProfileFromId, 
                                                            toId: selectedMail.ProfileToId,
                                                            Id: selectedMail.id
                                                        })
                                                    })
                                                    .then(() => {
                                                        window.location.reload();
                                                    });
                                                }}
                                                style={{
                                                    display: "inline-block",
                                                    padding: "10px 20px",
                                                    backgroundColor: "#f44336",
                                                    color: "white",
                                                    textDecoration: "none",
                                                    borderRadius: "5px",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </Box>
                            </Box>
                        ) : (
                            selectedMailsWithReply.map((mail, index) => (
                                <Box 
                                    key={index} 
                                    sx={{ 
                                        width: index === 0 ? "100%" : "95%", 
                                        ml: index === 0 ? 0 : "auto",
                                        mb: 3 
                                    }}
                                >
                                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                    <Typography variant="h5" sx={{ color: "#FF1B6B", mb: 2 }}>
                                        {index === 0 ? mail.Subject : `RE: ${mail.Subject}`}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem"}}>
                                                    {mail.CreatedAt
                                                        ? new Date(mail.CreatedAt).toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })
                                                        : "N/A"}
                                    </Typography>
                                    </Box>
                                    {/* <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                        <Typography variant="body2" sx={{ color: "gray" }}>
                                            From: {mail.ProfileFromUsername}
                                        </Typography>
                                        {index === 0 && (
                                            <Typography variant="body2" sx={{ color: "gray" }}>
                                                To: {mail.ProfileToUsername}
                                            </Typography>
                                        )}
                                    </Box> */}
                                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            border: "2px solid",
                                            borderColor: "#FF1B6B",
                                        }}
                                        alt={mail?.ProfileFromUsername || "User"}
                                        src={mail?.Avatar || "/noavatar.png"}
                                        onClick={() => {
                                            setShowDetail(true);
                                            setSelectedUserId(mail?.ProfileIdFrom);
                                        }}
                                    />   
                                    <Typography variant="h6" color="white">
                                        {mail.ProfileFromUsername || "User"}
                                    </Typography>														
                                    </Box>
                                    <Box sx={{ 
                                        bgcolor: "#1A1A1A", 
                                        p: 3, 
                                        borderRadius: 2,
                                        py: "10px"
                                    }}>
                                        <Typography variant="body1">
                                            {mail.Body}
                                        </Typography>
                                        {/* Images Grid */}
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                            gap: 2,
                                            mt: 2 
                                        }}>
                                            {[mail.Image, mail.Image_1, mail.Image_2, mail.Image_3, mail.Image_4]
                                                .filter(img => img)
                                                .map((img, imgIndex) => (
                                                    <img
                                                        onClick={() => {
                                                            if (img) {
                                                                setExpandedImage(img);
                                                                setImageModalOpen(true);
                                                            }
                                                        }}
                                                        key={imgIndex}
                                                        src={img}
                                                        alt={`Attachment ${imgIndex + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '150px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                ))}
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
                        <Button 
                            onClick={() => setReplyModalOpen(true)}
                            variant="contained"
                            sx={{
                                bgcolor: '#FF1B6B',
                                '&:hover': { bgcolor: '#E0145A' },
                            }}
                        >
                            Reply
                        </Button>
                        <Button 
                            onClick={() => setOpenModal(false)}
                            variant="contained"
                            sx={{
                                bgcolor: '#FF1B6B',
                                '&:hover': { bgcolor: '#E0145A' },
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                    <ReplyModal 
                        open={replyModalOpen}
                        onClose={() => setReplyModalOpen(false)}
                        selectedMail={selectedMail}
                        profileId={profileId}
                        onReplySuccess={() => {
                            // Optionally refresh the mail list here
                        }}
                    />            
                </Dialog>
                {/* Image Modal */}
                <Dialog
                    open={imageModalOpen}
                    onClose={() => setImageModalOpen(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src={expandedImage || ''}
                            alt="Expanded view"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain'
                            }}
                        />
                    </DialogContent>
                    <IconButton
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                        onClick={() => setImageModalOpen(false)}
                    >
                        <Close />
                    </IconButton>
                </Dialog>
            </Box>
            {isMobile ? <Footer /> : <></>}
            <UserProfileModal
				handleGrantAccess={handleGrantAccess}
				handleClose={handleCloseUserProfileModal}
				open={showDetail}
				userid={selectedUserId}
			/>
        </>
    );
}
