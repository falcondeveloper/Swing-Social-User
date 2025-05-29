"use client";

import { useEffect, useRef, useState } from "react";
import {
	Box,
	Button,
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
	useMediaQuery,
	Badge,
} from "@mui/material";
import axios from "axios";
import Header from "@/components/Header";
import UserBottomNavigation from "@/components/BottomNavigation";
import Picker from "emoji-picker-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import {
	Send as SendIcon,
	EmojiEmotions as EmojiIcon,
	Image as ImageIcon,
} from "@mui/icons-material";
import io from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserProfileModal from "@/components/UserProfileModal";
import { url } from "inspector";

dayjs.extend(relativeTime);

const socket = io("https://api.nomolive.com/");

type Params = Promise<{ id: string }>;
type ActiveUsers = { [userId: string]: boolean };
export default function ChatPage(props: { params: Params }) {
	const router = useRouter();
	const [userProfile, setUserProfile] = useState<any>({});
	const [myProfile, setMyProfile] = useState<any>({});
	const [userId, setUserId] = useState<any>(null); // State for error messages
	const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const [membership, setMembership] = useState(0);
	const [showDetail, setShowDetail] = useState<any>(false);
	const [selectedUserId, setSelectedUserId] = useState<any>(null);
	const [activeUsers, setActiveUsers] = useState<any>({});
	const [messages, setMessages] = useState<any>([]);

	useEffect(() => {
		const token = localStorage.getItem("loginInfo");
		console.log(token);
		if (token) {
			const decodeToken = jwtDecode<any>(token);
			setMembership(decodeToken?.membership);
			console.log(decodeToken);

		// 	if (decodeToken?.membership == 0) {
		// 		Swal.fire({
		// 			title: `Upgrade your membership.`,
		// 			text: `Sorry, to access this page, you need to upgrade your membership`,
		// 			icon: "error",
		// 			showCancelButton: true,
		// 			confirmButtonText: "Upgrade the membership",
		// 			cancelButtonText: "Continue as the free member",
		// 		}).then((result: any) => {
		// 			if (result.isConfirmed) {
		// 				router.push("/membership");
		// 			} else if (result.dismiss === Swal.DismissReason.cancel) {
		// 				router.back();
		// 			} else {
		// 				router.back();
		// 			}
		// 		});
		// 	} else {
		// 		// router.push("/messaging");
		// 	}
		// } else {
		// 	router.push("/login");
		}
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const [chatList, setChatList] = useState<any>([]);

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Connected to WebSocket server");
			setActiveUsers((prevActiveUsers: any) => ({
				...prevActiveUsers,
				[userId]: true,
			}));
		});

		socket.on("disconnect", () => {
			console.log("Disconnected from WebSocket server");
			setActiveUsers((prevActiveUsers: any) => ({
				...prevActiveUsers,
				[userId]: false,
			}));
		});

		socket.on("message", (message) => {
			// Handle incoming message
			console.log("Received message:", message);
			const newUserMessage = {
				AvatarFrom: myProfile?.Avatar || "/noavatar.png", // User's avatar
				AvatarTo: userProfile?.Avatar, // This can be set to the recipient's avatar if needed
				ChatId: "temporary-chat-id", // Temporary ID or handle as needed
				Conversation: message?.message, // The text of the message
				ConversationId: "temporary-conversation-id", // Temporary ID for this message
				CreatedAt: new Date().toISOString(), // Current timestamp
				FromUsername: userProfile?.Username || "You", // Sender's username
				MemberIdFrom: message?.from, // Current user's ID
				MemberIdTo: message?.to, // Recipient's ID (you can dynamically pass this)
				ToUsername: userProfile?.Username || "Recipient", // Recipient's username
				lastcommentinserted: 1, // You can adjust this if needed
			};

			// Update the messages state
			setRealTimeMessage(newUserMessage);
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

	const [newMessage, setNewMessage] = useState("");
	const [realtimeMessage, setRealTimeMessage] = useState<any>();

	useEffect(() => {
		console.log(realtimeMessage, "================realtimeMessage");
		if (
			realtimeMessage?.MemberIdTo === myProfile?.Id &&
			realtimeMessage?.MemberIdFrom === userProfile?.Id
		) {
			// Update the messages state
			setMessages([...messages, realtimeMessage]);
		}
	}, [realtimeMessage]);

	const sendMessage = () => {
		// console.log("onMessage function call");
		// if (newMessage.trim()) {
		const messageData = {
			message: newMessage,
			from: profileId,
			to: userProfile?.Id,
		};
		socket.emit("message", messageData);
		setNewMessage("");
		// }
	};

	const handleClose = () => {
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

	useEffect(() => {
		const getIdFromParam = async () => {
			const params = await props.params;
			const pid: any = params.id;
			setUserId(pid);
		};
		getIdFromParam();
		// toast.success('For testing use code 122.');
	}, [props]);

	useEffect(() => {
		if (userProfile) {
			setUserDeviceToken(userProfile?.Device_Token);
		}
	}, [userProfile]);

	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
	const [userDeviceToken, setUserDeviceToken] = useState(null);

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
					console.log(userData);
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

	// Helper function to check if userProfile.Username exists in the chat list
	const findExistingChatIndex = (username: string) => {
		return chatList.findIndex((chat: any) => chat.Username === username);
	};

	const existingChatIndex = userProfile
		? findExistingChatIndex(userProfile.Username)
		: -1;

	const sendNotification = async (message: any) => {
		const params = await props.params;
		console.log("UserDeviceToken", userProfile.Id);
		const response = await fetch("/api/user/notification/requestfriend", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: userProfile.Id,
				body: message,
				image: "https://example.com/path/to/image.jpg",
				url: `https://swing-social-website.vercel.app/messaging/${userProfile.Id}`,
			}),
		});

		const result = await response.json();
		console.log(result);
	};
	const handleSendMessage = async () => {
		if (newMessage.trim()) {
			sendMessage();
			// Add the message to the local messages state
			const newUserMessage = {
				AvatarFrom: myProfile?.Avatar || "/noavatar.png", // User's avatar
				AvatarTo: userProfile?.Avatar, // This can be set to the recipient's avatar if needed
				ChatId: "temporary-chat-id", // Temporary ID or handle as needed
				Conversation: newMessage, // The text of the message
				ConversationId: "temporary-conversation-id", // Temporary ID for this message
				CreatedAt: new Date().toISOString(), // Current timestamp
				FromUsername: myProfile?.Username || "You", // Sender's username
				MemberIdFrom: profileId, // Current user's ID
				MemberIdTo: userProfile?.Id, // Recipient's ID (you can dynamically pass this)
				ToUsername: userProfile?.Username || "Recipient", // Recipient's username
				lastcommentinserted: 1, // You can adjust this if needed
			};

			// Update the messages state
			setMessages([...messages, newUserMessage]);

			if (userDeviceToken) {
				sendNotification(newUserMessage?.Conversation);
			}
			// Prepare the API payload
			const payload = {
				chatid:
					existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId, // Replace with actual chat ID if available
				ProfileIdfrom: myProfile?.Id, // Replace with sender's profile ID
				ProfileIDto: userProfile?.Id, // Replace with recipient's profile ID
				Conversation: newMessage,
			};

			// Clear the input
			setNewMessage("");

			try {
				// Send the message to the API
				const response = await fetch("/api/user/messaging", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				// Handle the API response
				if (response.ok) {
					const result = await response.json();

					// // Optionally update the messages state with a server response
					// setMessages((prevMessages:any) => [
					//     ...prevMessages,
					//     { sender: "user", text: "Message delivered!" }, // Replace with actual server response if needed
					// ]);
				} else {
					const errorData = await response.json();
					console.error("Error sending message:", errorData);
				}
			} catch (error) {
				console.error("Network error while sending message:", error);

				// Optionally add an error message to the UI
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

	const handleEmojiClick = (emoji: any) => {
		setNewMessage((prev) => prev + emoji.emoji);
	};

	const uploadImage = async (imageData: string): Promise<string | null> => {
		try {
			// Convert Base64 imageData to a Blob
			const formData = new FormData();

			// Append the image Blob with a unique name
			formData.append("image", imageData);

			// Send the FormData via fetch
			const response = await fetch("/api/user/upload", {
				method: "POST",
				body: formData,
			});

			// Parse the JSON response
			const data = await response.json();

			// Handle response errors
			if (!response.ok) {
				throw new Error(data.message || "Failed to upload image");
			}

			// console.log("Upload response:", data);
			return data?.blobUrl || null; // Return the uploaded image's URL
		} catch (error) {
			console.error("Error during image upload:", error);
			return null; // Return null in case of an error
		}
	};

	const handleImageUpload = async (event: any) => {
		const file = event.target.files[0];
		if (file) {
			const reader: any = new FileReader();
			reader.onload = () => {
				// Add the message to the local messages state
				const newUserMessage = {
					AvatarFrom: myProfile?.Avatar || "/noavatar.png", // User's avatar
					AvatarTo: userProfile?.Avatar, // This can be set to the recipient's avatar if needed
					ChatId: "temporary-chat-id", // Temporary ID or handle as needed
					Conversation: `<img src="${reader.result && typeof reader.result === 'string' && reader.result.trim() !== '' ? reader.result : '/noavatar.png'}" alt="Uploaded" style="max-width:"100px";border-radius:"8px"/>`, // The text of the message
					ConversationId: "temporary-conversation-id", // Temporary ID for this message
					CreatedAt: new Date().toISOString(), // Current timestamp
					FromUsername: userProfile?.Username || "You", // Sender's username
					MemberIdFrom: profileId, // Current user's ID
					MemberIdTo: userProfile?.Id, // Recipient's ID (you can dynamically pass this)
					ToUsername: userProfile?.Username || "Recipient", // Recipient's username
					lastcommentinserted: 1, // You can adjust this if needed
				};

				// Update the messages state
				setMessages([...messages, newUserMessage]);

				if (userDeviceToken) {
					sendNotification(newUserMessage?.Conversation);
				}
			};
			reader.readAsDataURL(file);
			let imageUrl: any = await uploadImage(file);

			// console.log("onMessage function call");
			// if (newMessage.trim()) {
			const messageData = {
				message: `<img src="${imageUrl}" alt="Uploaded" style="max-width:"100px";border-radius:"8px"/>`,
				from: profileId,
				to: userProfile?.Id,
			};
			socket.emit("message", messageData);
			setNewMessage("");
			// }

			// Prepare the API payload
			const payload = {
				chatid:
					existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId, // Replace with actual chat ID if available
				ProfileIdfrom: myProfile?.Id, // Replace with sender's profile ID
				ProfileIDto: userProfile?.Id, // Replace with recipient's profile ID
				Conversation: `<img src="${imageUrl}" alt="Uploaded" style="max-width:"100px";border-radius:"8px"/>`,
			};

			// Clear the input
			setNewMessage("");

			try {
				// Send the message to the API
				const response: any = await fetch("/api/user/messaging", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				// Handle the API response
				if (response.ok) {
					const result = response.json();

					// // Optionally update the messages state with a server response
					// setMessages((prevMessages:any) => [
					//     ...prevMessages,
					//     { sender: "user", text: "Message delivered!" }, // Replace with actual server response if needed
					// ]);
				} else {
					const errorData = response.json();
					console.error("Error sending message:", errorData);
				}
			} catch (error) {
				console.error("Network error while sending message:", error);

				// Optionally add an error message to the UI
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

	const [profileId, setProfileId] = useState<any>();
	useEffect(() => {
		if (typeof window !== "undefined") {
			setProfileId(localStorage.getItem("logged_in_profile"));
		}
	}, []);
	useEffect(() => {
		if (profileId) {
			getCurrentLocation();
			getMyProfile(profileId);
			fetchAllChats();
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

	useEffect(() => {
		if (profileId && userId) {
			fetchChatConversation(profileId, userId);
		}
	}, [profileId, userId]);
	const fetchChatConversation = async (profileId: any, userId: any) => {
		try {
			// Prepare the API payload
			const payload = {
				ProfileIdfrom: profileId, // Replace with sender's profile ID
				ProfileIDto: userId, // Replace with recipient's profile ID
			};
			// Send the message to the API
			const response = await fetch("/api/user/messaging/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
			// Handle the API response
			if (response.ok) {
				const result = await response.json();

				// // Optionally update the messages state with a server response
				setMessages((prevMessages: any) => [
					...prevMessages,
					...result?.data, // Spread the data inside the array
				]);
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

					// Reverse geocoding to get the location name (you may need a third-party service here)
					const locationName = await getLocationName(latitude, longitude);

					// Send the location to your API
					await sendLocationToAPI(locationName, latitude, longitude);
				},
				(error: any) => {
					// console.error('Geolocation error:', error);
				}
			);
		} else {
			// console.error('Geolocation is not supported by this browser.');
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
			} else {
				console.error("Error sending location:", data.message);
			}
		} catch (error) {
			console.error("Error sending location to API:", error);
		}
	};

	return (
		<Box
			sx={{
				bgcolor: "#0A0A0A",
				minHeight: "100vh",
				color: "white",
				pb: 8,
				display: "flex",
				background: "linear-gradient(to bottom, #0A0A0A, #1A1A1A)",
			}}
		>
			<Header />
			{isMobile ? (
				<Box sx={{ display: "flex", flex: 1, mt: 5, marginTop: "80px" }}>
					<Box
						sx={{
							width: "100%",
							display: "flex",
							flexDirection: "column",
							height: "calc(100vh - 150px)",
							// marginTop: "100px",
							bgcolor: "#121212",
							borderRadius: 2,
							overflow: "hidden",
							boxShadow: 3,
						}}
					>
						{/* Chat Header */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								bgcolor: "#1A1A1A",
								px: 3,
								pb: 2,
								pt: "30px",
								boxShadow: 2,
								borderBottom: "1px solid #333",
							}}
							onClick={() => {
								setShowDetail(true);
								setSelectedUserId(userProfile?.Id);
							}}
						>
							<Avatar
								sx={{
									width: 50,
									height: 50,
									border: "2px solid",
									borderColor: userProfile?.isOnline ? "#4CAF50" : "#FF1B6B", // Green for online, pink for offline
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
									color={userProfile?.LastOnline ? "#FF1B6B" : "#FF1B6B"}
								>
									{userProfile?.LastOnline
										? dayjs(userProfile.LastOnline).fromNow()
										: "N/A"}
								</Typography>
							</Box>
						</Box>

						{/* Messages List */}
						<List
							sx={{
								flex: 1,
								overflowY: "auto",
								p: 2,
								"&::-webkit-scrollbar": {
									width: "8px",
								},
								"&::-webkit-scrollbar-thumb": {
									backgroundColor: "#555",
									borderRadius: "4px",
								},
							}}
						>
							{messages.map(
								(message: any, index: number) =>
									message?.ChatId && (
										<ListItem
											key={index}
											sx={{
												justifyContent:
													message?.MemberIdFrom === profileId
														? "flex-end"
														: "flex-start",
												alignItems: "flex-start",
												gap: 1,
												transition: "all 0.3s ease",
											}}
										>
											{/* Display Avatar only if the message is from another user */}
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

											{/* Message Content */}
											<Box
												sx={{
													bgcolor:
														message?.MemberIdFrom === profileId
															? "#1976D2"
															: "#333",
													color: "white",
													px: 2,
													py: 1,
													borderRadius: 2,
													maxWidth: "70%",
													wordWrap: "break-word",
													boxShadow: 3,
													animation: "fadeIn 0.5s ease",
													"@keyframes fadeIn": {
														from: { opacity: 0 },
														to: { opacity: 1 },
													},
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
									)
							)}

							{/* Display No Messages Found */}
							{messages.length === 0 && (
								<Typography
									variant="body2"
									color="gray"
									textAlign="center"
									sx={{ py: 2 }}
								>
									No Messages Found
								</Typography>
							)}

							{/* Scroll to bottom anchor */}
							<div ref={messagesEndRef} />
						</List>

						{/* Emoji Picker Modal */}
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
						{/* Input Box */}
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
								bgcolor: "#1A1A1A",
								borderRadius: 2,
								boxShadow: 2,
								px: 2,
								py: 1,
								marginBottom: { xs: "5px", sm: "0px" }, // Add bottom margin for mobile
								position: "sticky",
								bottom: 0,
								zIndex: 1,
							}}
						>
							<IconButton
								sx={{ color: "#FF1B6B" }}
								onClick={() => setEmojiPickerOpen(true)}
							>
								<EmojiIcon sx={{ color: "#FF1B6B" }} />
							</IconButton>
							<TextField
								fullWidth
								variant="standard"
								placeholder="Type a message..."
								InputProps={{
									disableUnderline: true,
									style: { color: "white" },
								}}
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								sx={{
									input: { color: "white" },
								}}
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
							<IconButton color="primary" onClick={handleSendMessage}>
								<SendIcon />
							</IconButton>
						</Box>
					</Box>
				</Box>
			) : (
				<Box sx={{ display: "flex", flex: 1, mb: -8 }}>
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
											borderBottom: "3px solid #FF1B6B"
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
						<List>
							{chatList.map((chat: any, index: number) => {
								// Check if Conversation contains an <img> tag
								const hasImage = /<img.*?src=["'](.*?)["']/.test(
									chat.Conversation
								);

								return (
									<ListItem
										onClick={() =>
											router.push(`/messaging/${chat?.ToProfileId}`)
										}
										key={chat.ChatId}
										sx={{
											px: 2,
											py: 1,
											bgcolor:
												existingChatIndex === index
													? "rgba(255, 27, 107, 0.1)"
													: "transparent",
											borderRadius: 1,
											cursor: "pointer",
										}}
									>
										<ListItemAvatar>
											<Badge
												badgeContent={
													chat?.NewMessages > 0 ? chat.NewMessages : 0
												}
												color="error"
												invisible={existingChatIndex === index} // Hide badge if no new messages
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
										<ListItemText
											primaryTypographyProps={{
												color: "#FF1B6B",
												fontWeight: "bold",
											}}
											secondaryTypographyProps={{ color: "gray" }}
											primary={chat.Username}
											secondary={hasImage ? "Sent an Image" : chat.Conversation} // Show "Sent an Image" if <img> tag is detected
										/>
									</ListItem>
								);
							})}

							{/* Add a new ListItem for userProfile if it doesn't already exist */}
							{userProfile && existingChatIndex === -1 && (
								<ListItem
									sx={{
										px: 2,
										py: 1,
										bgcolor: "rgba(255, 27, 107, 0.1)",
										borderRadius: 1,
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
												src={userProfile.Avatar || "/noavatar.png"}
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
										primaryTypographyProps={{
											color: "#FF1B6B",
											fontWeight: "bold",
										}}
										secondaryTypographyProps={{ color: "gray" }}
										primary={userProfile.Username}
										// secondary="This is your profile"
									/>
								</ListItem>
							)}
						</List>
					</Drawer>

					<Box
						sx={{
							width: "100%",
							display: "flex",
							flexDirection: "column",
							height: "calc(100vh - 64px)",
							marginTop: "50px",
							bgcolor: "#121212",
							borderRadius: 2,
							overflow: "hidden",
							boxShadow: 3,
						}}
					>
						{/* Chat Header */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								bgcolor: "#1A1A1A",
								px: 3,
								pb: 2,
								pt: "32px",
								boxShadow: 2,
								borderBottom: "1px solid #333",
							}}
							onClick={() => {
								setShowDetail(true);
								setSelectedUserId(userProfile?.Id);
							}}
						>
							<Avatar
								sx={{
									width: 50,
									height: 50,
									border: "2px solid",
									borderColor: userProfile?.isOnline ? "#4CAF50" : "#FF1B6B", // Green for online, pink for offline
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
									color={userProfile?.LastOnline ? "#FF1B6B" : "#FF1B6B"}
								>
									{userProfile?.LastOnline
										? dayjs(userProfile.LastOnline).fromNow()
										: "N/A"}
								</Typography>
							</Box>
						</Box>

						{/* Messages List */}
						<List
							sx={{
								flex: 1,
								overflowY: "auto",
								p: 2,
								"&::-webkit-scrollbar": {
									width: "8px",
								},
								"&::-webkit-scrollbar-thumb": {
									backgroundColor: "#555",
									borderRadius: "4px",
								},
							}}
						>
							{messages.map(
								(message: any, index: number) =>
									message?.ChatId && (
										<ListItem
											key={index}
											sx={{
												justifyContent:
													message?.MemberIdFrom === profileId
														? "flex-end"
														: "flex-start",
												alignItems: "flex-start",
												gap: 1,
												transition: "all 0.3s ease",
											}}
										>
											{/* Display Avatar only if the message is from another user */}
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

											{/* Message Content */}
											<Box
												sx={{
													bgcolor:
														message?.MemberIdFrom === profileId
															? "#1976D2"
															: "#333",
													color: "white",
													px: 2,
													py: 1,
													borderRadius: 2,
													maxWidth: "70%",
													wordWrap: "break-word",
													boxShadow: 3,
													animation: "fadeIn 0.5s ease",
													"@keyframes fadeIn": {
														from: { opacity: 0 },
														to: { opacity: 1 },
													},
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
									)
							)}

							{/* Display No Messages Found */}
							{messages.length === 0 && (
								<Typography
									variant="body2"
									color="gray"
									textAlign="center"
									sx={{ py: 2 }}
								>
									No Messages Found
								</Typography>
							)}

							{/* Scroll to bottom anchor */}
							<div ref={messagesEndRef} />
						</List>

						{/* Emoji Picker Modal */}
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

						{/* Input Box */}
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
								bgcolor: "#1A1A1A",
								borderRadius: 2,
								boxShadow: 2,
								px: 2,
								py: 1,
								marginBottom: { xs: "5px", sm: "0px" }, // Add bottom margin for mobile
								position: "sticky",
								bottom: 0,
								zIndex: 1,
							}}
						>
							<IconButton
								sx={{ color: "#FF1B6B" }}
								onClick={() => setEmojiPickerOpen(true)}
							>
								<EmojiIcon sx={{ color: "#FF1B6B" }} />
							</IconButton>
							<TextField
								fullWidth
								variant="standard"
								placeholder="Type a message..."
								InputProps={{
									disableUnderline: true,
									style: { color: "white" },
								}}
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								sx={{
									input: { color: "white" },
								}}
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
							<IconButton color="primary" onClick={handleSendMessage}>
								<SendIcon />
							</IconButton>
						</Box>
					</Box>
				</Box>
			)}
			{isMobile === true ? <UserBottomNavigation /> : <></>}
			<UserProfileModal
				handleGrantAccess={handleGrantAccess}
				handleClose={handleClose}
				open={showDetail}
				userid={selectedUserId}
			/>
		</Box>
	);
}
