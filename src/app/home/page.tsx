"use client";

import React, { useState, useEffect } from "react";
import { notify, handleGeolocationError } from "@/lib/notifications";
import {
	Box,
	Card,
	CardContent,
	CardMedia,
	Container,
	Typography,
	BottomNavigation,
	BottomNavigationAction,
	Chip,
	useTheme,
	useMediaQuery,
	Grid,
	alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserBottomNavigation from "@/components/BottomNavigation";
import useFcmToken from "@/hooks/useFCMToken";
import FcmTokenComp from "@/hooks/firebaseForeground";
import { getMessaging, onMessage } from "firebase/messaging";
import app from "../../../firebase";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import Slider from "react-slick"; // Import the react-slick slider
import "slick-carousel/slick/slick.css"; // Import the slick carousel CSS
import "slick-carousel/slick/slick-theme.css"; // Import the slick carousel theme CSS

const categories = [
	{
		title: "Events",
		description: "Discover exciting community events",
		img: "/images/event.png",
		url: "/events",
	},
	{
		title: "Learning & Blogs",
		description: "Expand your knowledge",
		img: "/images/learning-blog.jpg",
		url: "https://swingsocial.co/blog/",
	},
	{
		title: "What's Hot",
		description: "Trending in the community",
		img: "/images/whatshot.jpg",
		url: "/whatshot",
	},
	{
		title: "Marketplace",
		description: "Buy and sell in the community",
		img: "/images/marketplace.jpg",
		url: "/marketplace",
		isComingSoon: false,
	},
	{
		title: "Search",
		description: "Find your interests",
		img: "/images/search.jpg",
		url: "/members",
		isComingSoon: false,
	},
	{
		title: "Travel",
		description: "Explore new destinations",
		img: "/images/travel.jpg",
		url: "https://swingsocial.co/travel/",
	},
];
const socket = io("https://api.nomolive.com/");
const Home = () => {
	const [profileId, setProfileId] = useState<any>(); // Animation direction
	const [profile, setProfile] = useState<any>();
	const [location, setLocation] = useState<{
		name: string;
		latitude: number;
		longitude: number;
	} | null>(null);

	const [value, setValue] = useState(0);
	const [currentName, setCurrentName] = useState<any>("");
	const theme = useTheme();
	//const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
	const { token, notificationPermissionStatus } = useFcmToken();

	useEffect(() => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("loginInfo");
			console.log(token);
			if (token) {
				const decodeToken = jwtDecode<any>(token);
				console.log(decodeToken);
				setCurrentName(decodeToken?.profileName);
				setProfileId(decodeToken?.profileId);
				setProfile(decodeToken);
			}
		}
	}, []);

	const [isNewMessage, setNewMessage] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("isNewMessage") === "true";
		}
		return false;
	});

	useEffect(() => {
		if (typeof window === "undefined") return; // Prevent errors during SSR

		socket.on("connect", () => {
			console.log("Connected to WebSocket server");
		});

		socket.on("disconnect", () => {
			console.log("Disconnected from WebSocket server");
		});

		socket.on("message", (message) => {
			console.log(message);
			const profileid = localStorage.getItem("logged_in_profile");

			if (message?.from === profileid || message?.to === profileid) {
				setNewMessage(true);
				localStorage.setItem("isNewMessage", "true"); // Store in localStorage
			}
		});

		socket.on("error", (error) => {
			console.error("WebSocket error:", error);
		});

		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("message");
			socket.off("error");
		};
	}, []);

	const resetNewMessage = () => {
		setNewMessage(false);
		if (typeof window !== "undefined") {
			localStorage.setItem("isNewMessage", "false"); // Reset value
		}
	};

	useEffect(() => {
		if (profileId) {
			getCurrentLocation();
		}
	}, [profileId]);

	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			notify.location.notSupported();
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords;

					// Reverse geocoding to get the location name
					const locationName = await getLocationName(latitude, longitude);

					// Update the location state
					setLocation({
						name: locationName,
						latitude,
						longitude,
					});

					// Send the location to your API
					await sendLocationToAPI(locationName, latitude, longitude);
				} catch (error) {
					console.error("Error processing location:", error);
					notify.error("Failed to process your location. Please try again.");
				}
			},
			(error) => {
				handleGeolocationError(error);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000
			}
		);
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
				console.log("Location sent successfully:", data);
			} else {
				console.error("Error sending location:", data.message);
			}
		} catch (error) {
			console.error("Error sending location to API:", error);
		}
	};

	const router = useRouter();

	const handleNavigate = (category: any) => {
		if (category?.isComingSoon) {
			Swal.fire({
				title: "Coming Soon",
				timer: 2000,
			});
		} else {
			router.push(category?.url);
		}
	};

	useEffect(() => {
		if (profileId && token) {
			console.log(token);
			// Prepare the API payload
			// const handleUpdateDeviceToken = async (token: any, profileId: any) => {
			//   const payload = {
			//     token: token,
			//     profileId: profileId, // Replace with recipient's profile ID
			//   };
			//   try {
			//     // Send the message to the API
			//     const response = await fetch("/api/user/devicetoken", {
			//       method: "POST",
			//       headers: {
			//         "Content-Type": "application/json",
			//       },
			//       body: JSON.stringify(payload),
			//     });

			//     // Handle the API response
			//     if (response.ok) {
			//       const result = await response.json();

			//       // // Optionally update the messages state with a server response
			//       // setMessages((prevMessages:any) => [
			//       //     ...prevMessages,
			//       //     { sender: "user", text: "Message delivered!" }, // Replace with actual server response if needed
			//       // ]);
			//     } else {
			//       const errorData = await response.json();
			//       console.error("Error sending message:", errorData);
			//     }
			//   } catch (error) {
			//     console.error("Network error while sending message:", error);
			//   }
			// }
			const handleUpdateDeviceToken = async (token: any, profileId: any) => {
				const payload = {
					token: token,
					profile: profile, // Replace with recipient's profile ID
				};
				try {
					// Send the message to the API
					const response = await fetch("/api/user/devicetoken", {
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
				}
			};
			handleUpdateDeviceToken(token, profileId);
		}
	}, [token, profileId]);
	// Use the token as needed
	// token && console.log('FCM token:', token);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			const messaging = getMessaging(app);
			const unsubscribe = onMessage(messaging, (payload: any) => {
				console.log("Foreground push notification received:", payload);
				// Handle the received push notification while the app is in the foreground
				// You can display a notification or update the UI based on the payload
			});
			return () => {
				unsubscribe(); // Unsubscribe from the onMessage event
			};
		}
	}, [notificationPermissionStatus]);

	// Service Worker registration moved to useEffect to prevent SSR issues
	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/firebase-messaging-sw.js")
				.then(registration => {
					console.log("Service Worker registered with scope:", registration.scope);
				})
				.catch(error => {
					console.error("Service Worker registration failed:", error);
				});
		}
	}, []);

	const sliderSettings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 3000,
	};

	return (
		<>
			<FcmTokenComp />
			{isMobile ? (
				// Render "helloworld" if `isMobile` is true
				<Box sx={{ color: "white", padding: "10px" }}>
					<Header />
					{/* Full-Width Heading with Background Image */}
					<Box
						sx={{
							width: "100%",
							height: { lg: 200, md: 200, sm: 90, xs: 90 },
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundImage: 'url("/images/home-hero-bg.png")',
							backgroundSize: {
								lg: "cover",
								md: "cover",
								sm: "cover",
								xs: "cover",
							},
							backgroundRepeat: { sm: "no-repeat", xs: "no-repeat" },
							backgroundPosition: "center",
							marginTop: { lg: "98px", md: "90px", sm: "70px", xs: "0px" },
						}}
					></Box>

					{/* Slide Section */}
					{/* <Box sx={{ marginTop: "10px" }}>
              <Slider {...sliderSettings}>
                {[
                  { img: "/slider/1.jpg", text: "Slide 1 Text" },
                  { img: "/slider/2.jpg", text: "Slide 2 Text" },
                  { img: "/slider/3.jpg", text: "Slide 3 Text" },
                  { img: "/slider/4.jpg", text: "Slide 4 Text" },
                  { img: "/slider/5.jpg", text: "Slide 5 Text" },
                  { img: "/slider/6.jpg", text: "Slide 6 Text" },
                ].map((slide, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <img src={slide.img} alt={`Slide ${index + 1}`} style={{ width: "100%", height: "100%" }} />
                    <Typography
                      variant="h4"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        background: "rgba(0, 0, 0, 0.5)",
                        padding: "10px",
                        borderRadius: "5px",
                      }}
                    >
                      {slide.text}
                    </Typography>
                  </Box>
                ))}
              </Slider>
            </Box> */}

					{/* Category Card List */}
					<Box
						sx={{
							padding: {
								xs: 0, // Small padding for mobile screens
								sm: 0, // Slightly larger padding for tablets
								md: 0, // Medium padding for laptops
								lg: 0,
							},
							marginTop: "10px",
						}}
					>
						<Grid container spacing={1} sx={{ padding: "0px" }}>
							{categories.map((category, index) => (
								<Grid
									item
									xs={6}
									sm={6}
									md={6}
									lg={6}
									key={index}
									style={{
										cursor: "pointer",
									}}
								>
									<Card
										onClick={() => handleNavigate(category)}
										sx={{
											backgroundColor: "#0a0a0a",
											color: "white",
											position: "relative",
											overflow: "hidden",
											width: "100%",
											height: { sm: 150, xs: 150, lg: 570, md: 570 },
											aspectRatio: "1", // Square shape
										}}
									>
										<CardContent
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												height: "100%",
												position: "relative",
											}}
										>
											<Box
												sx={{
													backgroundImage: `url(${category.img})`,
													backgroundSize: "cover",
													backgroundPosition: "center",
													filter: "brightness(0.6)",
													width: "100%",
													height: "100%",
													position: "absolute",
												}}
											></Box>
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>
					</Box>
					{/* Bottom Navigation Bar */}
				</Box>
			) : (
				// Render the website for non-mobile users
				<Box
					sx={{
						bgcolor: "#121212",
						minHeight: "100vh",
						color: "white",
					}}
				>
					{/* App Bar */}
					<Header />
					{/* Remove header spacing for home page desktop view */}
					<Box sx={{ marginTop: "-80px" }} />

					{/* Hero Section */}
					<Box
						sx={{
							pt: 15,
							pb: 10,
							position: "relative",
							background:
								'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/images/home-hero-bg.png")',
							backgroundSize: "cover",
							backgroundPosition: "center",
							"&::before": {
								content: '""',
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								background:
									"linear-gradient(180deg, rgba(18,18,18,0) 0%, #121212 100%)",
							},
						}}
					>
						<Container maxWidth="lg" sx={{ position: "relative" }}>
							<Typography
								variant="h1"
								align="center"
								sx={{
									fontSize: { xs: "2.5rem", md: "4rem" },
									fontWeight: 800,
									background: "linear-gradient(45deg, #FF1B6B, #FF758C)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									mb: 2,
								}}
							>
								Swing Social Community
							</Typography>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }} // Initial state
								animate={{ opacity: 1, scale: 1 }} // Animate to this state
								transition={{ duration: 1, ease: "easeInOut" }} // Animation settings
							>
								<Typography
									variant="h5"
									align="center"
									sx={{
										color: "rgba(255,255,255,0.7)",
										maxWidth: 800,
										mx: "auto",
										mb: 2,
									}}
								>
									Welcome back, {currentName}! 👋
								</Typography>
							</motion.div>
							{/* <Typography
                  variant="body1"
                  align="center"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    maxWidth: 600,
                    mx: 'auto',
                    mb: 4
                  }}
                >
                  You have 3 new event invitations and 5 unread messages
                </Typography> */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									gap: 3,
									flexWrap: "wrap",
								}}
							>
								<Box
									sx={{
										bgcolor: alpha("#FF1B6B", 0.1),
										padding: "17px 13px 9px 13px",
										borderRadius: "50%",
										textAlign: "center",
										width: 100,
										height: 100,
										cursor: "pointer",
										transition: "transform 0.2s ease-in-out", // Smooth transition
										"&:hover": {
											transform: "scale(1.1)", // Slightly increase size on hover
										},
										"&:active": {
											transform: "scale(0.95)", // Slightly shrink on click
										},
									}}
									onClick={() => router.push("/members")}
								>
									<img
										src="/icons/members.png"
										alt="Members"
										style={{ height: 60 }}
									/>
								</Box>

								<Box
									sx={{
										bgcolor: alpha("#FF1B6B", 0.1),
										padding: "17px 13px 9px 13px",
										borderRadius: "50%",
										textAlign: "center",
										width: 100,
										height: 100,
										cursor: "pointer",
										transition: "transform 0.2s ease-in-out", // Smooth transition
										"&:hover": {
											transform: "scale(1.1)", // Slightly increase size on hover
										},
										"&:active": {
											transform: "scale(0.95)", // Slightly shrink on click
										},
									}}
									onClick={() => router.push("/pineapple")}
								>
									<img
										src="/icons/pineapple.png"
										alt="Pineapple"
										style={{ height: 60 }}
									/>
									{/* <Typography variant="h4" sx={{ color: '#FF1B6B', fontWeight: 'bold', mb: 1 }}>12</Typography> */}
									{/* <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Members</Typography> */}
								</Box>
								<Box
									sx={{
										bgcolor: alpha("#FF1B6B", 0.1),
										padding: "17px 13px 9px 13px",
										borderRadius: "50%",
										textAlign: "center",
										width: 100,
										height: 100,
										cursor: "pointer",
										transition: "transform 0.2s ease-in-out", // Smooth transition
										"&:hover": {
											transform: "scale(1.1)", // Slightly increase size on hover
										},
										"&:active": {
											transform: "scale(0.95)", // Slightly shrink on click
										},
									}}
									onClick={() => router.push("/matches")}
								>
									<img
										src="/icons/matches.png"
										alt="Matches"
										style={{ height: 60 }}
									/>
									{/* <Typography variant="h4" sx={{ color: '#FF1B6B', fontWeight: 'bold', mb: 1 }}>12</Typography> */}
									{/* <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Members</Typography> */}
								</Box>
								<Box
									sx={{
										position: "relative", // Needed for absolute positioning of the indicator
										bgcolor: alpha("#FF1B6B", 0.1),
										padding: "17px 13px 9px 13px",
										borderRadius: "50%",
										textAlign: "center",
										width: 100,
										height: 100,
										cursor: "pointer",
										transition: "transform 0.2s ease-in-out", // Smooth transition
										"&:hover": {
											transform: "scale(1.1)", // Slightly increase size on hover
										},
										"&:active": {
											transform: "scale(0.95)", // Slightly shrink on click
										},
									}}
									onClick={() => {
										router.push("/messaging");
										resetNewMessage();
									}}
								>
									<img
										src="/icons/messaging.png"
										alt="Message"
										style={{ height: 60 }}
									/>

									{/* New Message Indicator */}
									{isNewMessage && (
										<Box
											sx={{
												position: "absolute",
												top: 12,
												right: 0,
												width: 20,
												height: 20,
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
							</Box>
						</Container>
					</Box>

					{/* Slide Section */}
					{/* <Box sx={{ py: 8 }}>
            <Slider {...sliderSettings}>
              {[
                { img: "/slider/1.jpg", text: "Slide 1 Text" },
                { img: "/slider/2.jpg", text: "Slide 2 Text" },
                { img: "/slider/3.jpg", text: "Slide 3 Text" },
                { img: "/slider/4.jpg", text: "Slide 4 Text" },
                { img: "/slider/5.jpg", text: "Slide 5 Text" },
                { img: "/slider/6.jpg", text: "Slide 6 Text" },
              ].map((slide, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <img
                    src={slide.img}
                    alt={`Slide ${index + 1}`}
                    style={{ width: "100%", height: "500px", objectFit: "cover" }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      background: "rgba(0, 0, 0, 0.5)", // Optional background overlay
                      color: "white",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <p style={{ fontSize: "1.5em", color: "white", margin: 0, textShadow: "3px 3px 5px rgba(0, 0, 0, 0.5)", fontWeight: "bold" }}>
                        The best social platform for swingers
                      </p>

                      <h5 style={{ color: "#df95bc", marginTop: "30px", textShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)" }}>
                        The fastest growing swinger and kink community
                      </h5>

                      <h5 style={{ color: "#df95bc", margin: 0, textShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)" }}>
                        Built by swingers for swingers
                      </h5>
                    </div>
                  </Typography>
                </Box>
              ))}
            </Slider>
            </Box> */}

					{/* Explain Sections */}
					{/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: "0px 200px 0px 200px"}}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                  <img width={400} height={400} src='/slider/1.jpg' style={{borderRadius: '50%',}} />
                </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="h5" sx={{ color: "white" }}>
                      <p style={{padding: "20px 0px", color: "#c3317d"}}><h2>Find local swingers</h2></p>
                      <p><li>Search couples and singles nearby using precise geographic location...</li></p>
                      <p><li>Filter by age, gender, kinks, and more...</li></p>
                      <p><li>View your matches, likes, and who likes you...</li></p>
                      <p><li>View recently online by location in our Pineapple...</li></p>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="h5" sx={{ color: "white" }}>
                      <p style={{padding: "20px 0px", color: "#c3317d"}}><h2>Connect with others near you</h2></p>
                      <p><li >Send real time message with IM chat</li></p>
                      <p><li>View and attend local events</li></p>
                      <p><li>Post media in Whats Hot</li></p>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <img width={400} height={400} src='/slider/2.jpg' style={{borderRadius: '50%', marginBottom: "20px"}} />
                  </Box>
                </Grid>
              </Grid>
            </div> */}

					{/* Category Grid */}
					<Container maxWidth="lg" sx={{ py: 8 }}>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(3, 1fr)",
								},
								gap: 3,
							}}
						>
							{categories.map((category, index) => (
								<Card
									key={index}
									onClick={() => handleNavigate(category)}
									sx={{
										position: "relative",
										cursor: "pointer",
										transition: "all 0.3s ease",
										bgcolor: "rgba(255,255,255,0.05)",
										borderRadius: 3,
										overflow: "hidden",
										"&:hover": {
											transform: "translateY(-8px)",
											boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
											"& .card-overlay": {
												bgcolor: "rgba(0,0,0,0.3)",
											},
										},
									}}
								>
									<Box
										className="card-overlay"
										sx={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											bgcolor: "rgba(0,0,0,0.5)",
											transition: "all 0.3s ease",
											zIndex: 1,
										}}
									/>
									<CardMedia
										component="img"
										height="240"
										image={category.img}
										alt={category.title}
									/>
									<CardContent
										sx={{
											position: "absolute",
											bottom: 0,
											width: "100%",
											zIndex: 2,
											background:
												"linear-gradient(transparent, rgba(0,0,0,0.9))",
											p: 3,
										}}
									>
										<Typography
											variant="h5"
											gutterBottom
											sx={{
												fontWeight: "bold",
												color: "white",
											}}
										>
											{category.title}
										</Typography>
										<Typography
											variant="body2"
											sx={{
												color: "rgba(255,255,255,0.7)",
												mb: 2,
											}}
										>
											{category.description}
										</Typography>
										{category.isComingSoon && (
											<Chip
												label="Coming Soon"
												size="small"
												sx={{
													bgcolor: "#FF1B6B",
													color: "white",
													fontWeight: "medium",
													borderRadius: 1,
												}}
											/>
										)}
									</CardContent>
								</Card>
							))}
						</Box>
						{isMobile && (
							<BottomNavigation
								value={value}
								onChange={(event, newValue) => {
									setValue(newValue);
								}}
								sx={{
									position: "fixed",
									bottom: 0,
									zIndex: 10,
									left: 0,
									right: 0,
									bgcolor: alpha("#121212", 0.9),
									backdropFilter: "blur(20px)",
									borderTop: "1px solid",
									borderColor: "rgba(255,255,255,0.1)",
									"& .MuiBottomNavigationAction-root": {
										color: "rgba(255,255,255,0.5)",
										"&.Mui-selected": {
											color: "#FF1B6B",
										},
									},
								}}
							>
								<BottomNavigationAction
									icon={
										<img
											src="/icons/home.png"
											alt="Home"
											style={{ width: 50, height: 40 }}
										/>
									}
								/>
								<BottomNavigationAction
									icon={
										<img
											src="/icons/members.png"
											alt="Members"
											style={{ width: 50, height: 40 }}
										/>
									}
								/>
								<BottomNavigationAction
									icon={
										<img
											src="/icons/pineapple.png"
											alt="Pineapples"
											style={{ width: 50, height: 40 }}
										/>
									}
								/>
								<BottomNavigationAction
									icon={
										<img
											src="/icons/messaging.png"
											alt="Messaging"
											style={{ width: 50, height: 40 }}
										/>
									}
								/>
								<BottomNavigationAction
									icon={
										<img
											src="/icons/matches.png"
											alt="Matches"
											style={{ width: 50, height: 40 }}
										/>
									}
								/>
							</BottomNavigation>
						)}
					</Container>
				</Box>
			)}
			<Footer />
		</>
	);
};

export default Home;
