import {
	Box,
	AppBar,
	Toolbar,
	useTheme,
	useMediaQuery,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode properly
import NotificationModalPrompt from '@/components/NotificationModalPrompt';

const socket = io("https://api.nomolive.com/");

const Header = () => {
	const [avatar, setAvatar] = useState<string>("");
	const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
	const [isNewMessage, setNewMessage] = useState<boolean>(() => {
		// Initialize state with localStorage value if available
		if (typeof window !== "undefined") {
			return localStorage.getItem("isNewMessage") === "true";
		}
		return false;
	});

	const router = useRouter();
	const theme = useTheme();
	const isMobile = useMediaQuery("(max-width: 480px)");

	useEffect(() => {
		const token = localStorage.getItem("loginInfo");
		if (token) {
			try {
				const decodeToken = jwtDecode<any>(token);
				setAvatar(decodeToken?.avatar || "");
			} catch (error) {
				console.error("Invalid token:", error);
				router.push("/login"); // Redirect to login if token is invalid
			}
		} else {
			router.push("/login");
		}

		// Check notification permissions on component mount
		checkNotificationPermission();
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		// WebSocket event listeners
		socket.on("connect", () => {
			console.log("Connected to WebSocket server");
		});

		socket.on("disconnect", () => {
			console.log("Disconnected from WebSocket server");
		});

		socket.on("message", (message) => {
			const profileid = localStorage.getItem("logged_in_profile");

			// Show notification indicator if the message is relevant to the current user
			if (message?.from === profileid || message?.to === profileid) {
				setNewMessage(true);
				localStorage.setItem("isNewMessage", "true");
			}
		});

		socket.on("error", (error) => {
			console.error("WebSocket error:", error);
		});

		// Cleanup WebSocket listeners on component unmount
		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("message");
			socket.off("error");
		};
	}, []);

	// Reset the "new message" indicator
	const resetNewMessage = () => {
		setNewMessage(false);
		if (typeof window !== "undefined") {
			localStorage.setItem("isNewMessage", "false");
		}
	};

	const checkNotificationPermission = () => {
		if (!("Notification" in window)) {
			console.log("This browser does not support notifications.");
			return;
		}

		// Check the current notification permission state
		switch (Notification.permission) {
			case "granted":
				console.log("Notifications are enabled.");
				break;

			case "denied":
				console.log("Notifications are denied by the user.");
				setNotificationModalOpen(true); // Show modal if denied
				break;

			case "default": // User has not made a decision
				Notification.requestPermission()
					.then((permission) => {
						if (permission === "granted") {
							console.log("Notifications are now enabled!");
						} else if (permission === "denied") {
							console.log("Notifications were denied.");
							setNotificationModalOpen(true); // Show modal if denied
						}
					})
					.catch((error) => {
						console.error("Error requesting notification permission:", error);
					});
				break;

			default:
				console.error(
					"Unknown notification permission state:",
					Notification.permission
				);
		}
	};

	// Close notification settings modal
	const handleCloseNotificationModal = () => {
		setNotificationModalOpen(false);
	};

	return (
		<Box>
			{/* <NotificationModalPrompt /> */}
			{/* Header for Mobile */}
			{isMobile ? (
				<Box
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						zIndex: 10,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "20px 20px",
						background: "#0a0a0a",
					}}
				>
					<Box
						component="img"
						src="/logo.png"
						alt="Logo"
						sx={{
							width: { lg: "210px", md: "210px", sm: "180px", xs: "180px" },
							height: "auto",
							margin: "0 40px 0 80px",
						}}
					/>

					<Button
						onClick={() => router.push("/profile/")}
						sx={{
							backgroundColor: "transparent",
							padding: 0,
							minWidth: 0,
							"&:hover": {
								backgroundColor: "transparent",
							},
						}}
					>
						<Box
							component="img"
							src="/ProfileEdit.png"
							alt="Edit Profile"
							sx={{
								width: "50px",
								height: "auto",
							}}
						/>
					</Button>
				</Box>
			) : (
				// Header for Desktop
				<AppBar
					position="fixed"
					elevation={0}
					sx={{
						bgcolor: "rgba(18, 18, 18, 0.7)",
						backdropFilter: "blur(20px)",
						borderBottom: "1px solid",
						borderColor: "rgba(255,255,255,0.1)",
					}}
				>
					{/* <Dialog
						open={isNotificationModalOpen}
						onClose={handleCloseNotificationModal}
					>
						<DialogTitle>Enable Browser Notifications</DialogTitle>
						<img
							src="/notification.png"
							alt="Notification"
							style={{
								width: "600px",
								height: "100px",
								margin: "auto",
								display: "block",
							}}
						/>
						<DialogContent>
							<p>
								Please tap on the green checkbox in the upper left and allow
								notifications!
							</p>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleCloseNotificationModal} color="primary">
								Close
							</Button>
						</DialogActions>
					</Dialog> */}
					<Toolbar>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<img src="/logo.png" alt="Logo" style={{ height: 32 }} />
						</Box>
						<Box sx={{ flexGrow: 1 }} />
						<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
							<Button
								variant="text"
								sx={{ color: "#FF1B6B", fontWeight: "bold" }}
								onClick={() => router.push("/home")}
							>
								Home
							</Button>
							<Button
								variant="text"
								sx={{ color: "#FF1B6B", fontWeight: "bold" }}
								onClick={() => router.push("/members")}
							>
								Members
							</Button>
							<Button
								variant="text"
								sx={{ color: "#FF1B6B", fontWeight: "bold" }}
								onClick={() => router.push("/pineapple")}
							>
								PineApple
							</Button>
							<Box sx={{ position: "relative", display: "inline-block" }}>
								<Button
									variant="text"
									sx={{ color: "#FF1B6B", fontWeight: "bold" }}
									onClick={() => {
										router.push("/messaging");
										resetNewMessage();
									}}
								>
									Messaging
								</Button>

								{/* New Message Indicator */}
								{isNewMessage && (
									<Box
										sx={{
											position: "absolute",
											top: 0,
											right: 0,
											width: 10,
											height: 10,
											bgcolor: "#a445ea",
											borderRadius: "50%",
											animation: "blink 1.5s infinite",
											"@keyframes blink": {
												"0%": { opacity: 1 },
												"50%": { opacity: 0.3 },
												"100%": { opacity: 1 },
											},
										}}
									/>
								)}
							</Box>
							<Button
								variant="text"
								sx={{ color: "#FF1B6B", fontWeight: "bold" }}
								onClick={() => router.push("/matches")}
							>
								Matches
							</Button>
							<Box
								sx={{
									width: 35,
									height: 35,
									borderRadius: "50%",
									border: "2px solid",
									borderColor: "#FF1B6B",
									overflow: "hidden",
									cursor: "pointer",
								}}
								onClick={() => router.push("/profile/")}
							>
								<img
									src={avatar}
									alt="Profile"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
							</Box>
						</Box>
					</Toolbar>
				</AppBar>
			)}
		</Box>
	);
};

export default Header;
