"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import { notify, handleGeolocationError } from "@/lib/notifications";
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	IconButton,
	Modal,
	FormControlLabel,
	Checkbox,
	Container,
	CardMedia,
	CardActions,
	Chip,
	Fade,
	Paper,
	useMediaQuery,
	useTheme,
	TextField,
	List,
	ListItem,
	ListItemText,
	Stack,
	InputLabel,
	FormControl,
	CircularProgress,
	Autocomplete,
	Select,
	MenuItem,
	Avatar,
} from "@mui/material";
import {
	ThumbUp,
	Comment,
	Flag,
	Add,
	ArrowCircleLeft,
} from "@mui/icons-material"; // Import icons for like, comment, and flag
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarList from "@/components/SidebarList";
import {
	Search as SearchIcon,
	LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import AboutSection from "@/components/AboutSection";
import { Verified } from "@mui/icons-material";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import UserProfileModal from "@/components/UserProfileModal";

export default function MatchesPage() {
	const router = useRouter();

	const [profiles, setProfiles] = useState<any>([]);
	const [filteredData, setFilteredData] = useState<any>([]);
	const [searchResults, setSearchResults] = useState<any>([]);
	const [loading, setLoading] = useState(true); // Tracks loading state
	const [profileId, setProfileId] = useState<any>(); // Animation direction
	const [currentMatch, setCurrentMatch] = useState<any>("Liked");
	const [targetId, setTargetId] = useState<any>(null); // Animation direction
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [search, setSearch] = useState<any>(null);
	const [errors, setErrors] = useState<any>({ search: null });
	const [onlyPhotos, setOnlyPhotos] = useState(0);
	const [herAgeRange, setHerAgeRange] = useState({ min: "", max: "" });
	const [hisAgeRange, setHisAgeRange] = useState({ min: "", max: "" });
	const [hisOrientation, setHisOrientation] = useState("");
	const [herOrientation, setHerOrientation] = useState("");
	const [cityLoading, setCityLoading] = useState(false);
	const [openCity, setOpenCity] = useState(false);
	const [cityOption, setCityOption] = useState<any>([]);
	const [cityInput, setCityInput] = useState<string | "">("");
	const [coupleType, setCoupleType] = useState("");
	const [showDetail, setShowDetail] = useState<any>(false);
	const [selectedUserId, setSelectedUserId] = useState<any>(null);

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

	const handleClose = () => {
		setShowDetail(false);
		setSelectedUserId(null);
	};

	const [reportOptions, setReportOptions] = useState({
		reportUser: false,
		blockUser: false,
	});

	const [formData, setFormData] = useState({
		city: "",
	});

	const theme = useTheme();
	//const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;

	const shimmerKeyframes = `
            @keyframes shimmer {
                0% {
                transform: translateX(-100%) skewX(-15deg);
                }
                100% {
                transform: translateX(100%) skewX(-15deg);
                }
            }`;

	const loadingBarKeyframes = `
            @keyframes loadingBar {
                0% {
                left: -30%;
                width: 30%;
                }
                50% {
                width: 40%;
                }
                100% {
                left: 100%;
                width: 30%;
                }
            }`;

	interface LoadingScreenProps {
		logoSrc?: string;
	}

	interface LoadingScreenProps {
		logoSrc?: string;
	}

	const LoadingScreen: React.FC<LoadingScreenProps> = ({
		logoSrc = "/loading.png",
	}) => {
		return (
			<>
				<style>
					{shimmerKeyframes}
					{loadingBarKeyframes}
				</style>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						height: "100vh",
						backgroundColor: "#121212",
						position: "relative",
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							marginBottom: 1,
							gap: "12px",
						}}
					>
						<Box
							component="img"
							src={logoSrc}
							alt="Logo"
							sx={{
								width: "50px",
								height: "auto",
							}}
						/>
						<Typography
							variant="h2"
							sx={{
								fontSize: "32px",
								letterSpacing: "-0.02em", // Reduced letter spacing
								fontWeight: "bold",
								color: "#C2185B",
								position: "relative",
								overflow: "hidden",
								"&::after": {
									content: '""',
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
								},
							}}
						>
							SWINGSOCIAL
						</Typography>
					</Box>

					{/* Loading Bar */}
					<Box
						sx={{
							position: "relative",
							width: "120px",
							height: "2px",
							backgroundColor: "rgba(194,24,91,0.2)",
							borderRadius: "4px",
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								height: "100%",
								backgroundColor: "#C2185B",
								borderRadius: "4px",
								animation: "loadingBar 1.5s infinite",
							}}
						/>
					</Box>

					{/* Subtitle */}
					<Box sx={{ textAlign: "center", marginTop: 2 }}>
						<Typography
							variant="subtitle1"
							sx={{
								fontSize: "14px",
								letterSpacing: "0.02em",
								opacity: 0.9,
								color: "#C2185B",
								position: "relative",
								overflow: "hidden",
								fontWeight: "bold",
								"&::after": {
									content: '""',
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
								},
							}}
						>
							The best dating and events platform for Swingers
						</Typography>
					</Box>
				</Box>
			</>
		);
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("loginInfo");
			if (token) {
				const decodeToken = jwtDecode<any>(token);
				setProfileId(decodeToken?.profileId);
			} else {
				router.push("/login");
			}
		}
	}, []);

	useEffect(() => {
		if (profileId && currentMatch) {
			handleGetMatch(profileId, currentMatch);
		}
	}, [profileId, currentMatch]);

	const handleGetMatch = async (userid: any, match: any) => {
		try {
			const checkResponse = await fetch(
				"/api/user/matches?id=" + userid + "&match=" + match,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const data = await checkResponse.json();
			setProfiles(data?.profiles);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleReportModalToggle = (pid: string) => {
		setTargetId(pid);
		setIsReportModalOpen((prev) => !prev);
	};

	const handleCheckboxChange = (event: any) => {
		const { name, checked } = event.target;
		setReportOptions((prev) => ({
			...prev,
			[name]: checked,
		}));
	};

	const handleReportUser = async () => {
		try {
			const checkResponse = await fetch("/api/user/sweeping/report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ profileid: profileId, targetid: targetId }), // Pass the username to check
			});
			setIsReportModalOpen((prev) => !prev);
			const checkData = await checkResponse.json();
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleReportSubmit = () => {
		console.log("Report Options:", reportOptions);
		setIsReportModalOpen(false);
		handleReportUser();
	};

	const sidebarItems = [
		{ label: "Matches", match: "Matches" },
		{ label: "Liked", match: "Liked" },
		{ label: "Maybe", match: "Maybe" },
		{ label: "Blocked", match: "Blocked" },
		{ label: "Likes Me", match: "LikesMe" },
		{ label: "Friends", match: "Friends" },
		{ label: "Denied", match: "Denied" },
		// { label: "Online", match: "Online" },
		{ label: "Search", match: "Search" },
		// { label: "Blocked", match: "Blocked" },
	];

	const handlePhotosChange = (event: any) => {
		if (event.target.checked) {
			setOnlyPhotos(1);
		} else {
			setOnlyPhotos(0);
		}
	};

	const handleHerAgeChange = (event: any) => {
		const { name, value } = event.target;
		setHerAgeRange((prev) => ({ ...prev, [name]: value }));
	};

	const handleHisAgeChange = (event: any) => {
		const { name, value } = event.target;
		setHisAgeRange((prev) => ({ ...prev, [name]: value }));
	};

	const handleHisOrientationChange = (event: any) => {
		setHisOrientation(event.target.value);
	};

	const handleHerOrientationChange = (event: any) => {
		setHerOrientation(event.target.value);
	};
	const handleSearch = () => {
		if (search) {
			// Assuming `profiles` contains the data to filter
			const filteredProfiles = profiles.filter(
				(profile: any) =>
					profile.Username.toLowerCase().includes(search.toLowerCase()) // Adjust 'name' to the appropriate key in your data
			);

			console.log(filteredProfiles);
			// Update the filtered profiles in the state
			setFilteredData(filteredProfiles);
			setLoading(false);
		} else {
			// Update the filtered profiles in the state
			setFilteredData(profiles);
			console.log(filteredData);
			setLoading(false);
		}

		// Clear any existing errors
		setErrors({});
	};
	useEffect(() => {
		setFilteredData(profiles);
		setLoading(false);
		console.log(profiles);
	}, [profiles]);

	console.log(cityInput, "=============cityInput");
	useEffect(() => {
		if (!openCity) {
			setCityOption([]);
		}
	}, [openCity]);

	useEffect(() => {
		if (!openCity) return;
		if (cityInput === "") return;

		const fetchData = async () => {
			setCityLoading(true);

			try {
				//API
				console.log(cityInput);
				const response = await fetch(`/api/user/city?city=${cityInput}`);
				if (!response.ok) {
					console.error("Failed to fetch event data:", response.statusText);
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const { cities }: { cities: any } = await response.json();

				const uniqueCities = cities.filter(
					(city: any, index: any, self: any) =>
						index === self.findIndex((t: any) => t.City === city.City)
				);

				setCityOption(uniqueCities);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setCityLoading(false);
			}
		};

		const delayDebounceFn = setTimeout(() => {
			fetchData();
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [cityInput, openCity]);

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const queryParams: string = new URLSearchParams({
			loginprofileid: String(profileId), // Convert to string
			q_username: String(search),
			q_coupletype: String(coupleType),
			q_citystate: String(cityInput),
			q_onlywithphotos: String(onlyPhotos), // Convert boolean to string
			q_hisagemin: String(hisAgeRange?.min), // Convert to string
			q_hisagemax: String(hisAgeRange?.max),
			q_heragemin: String(herAgeRange?.min),
			q_heragemax: String(herAgeRange?.max),
			q_herorientation: String(herOrientation),
			q_hisorientation: String(hisOrientation),
		}).toString();

		try {
			const response = await fetch(`/api/user/matches/search?${queryParams}`, {
				method: "GET",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch profiles");
			}

			const data = await response.json();
			console.log("Profiles fetched:", data.profiles);
			if (isMobile) {
				setSearchResults(data?.profiles);
				console.log(data.profiles);
			} else {
				setProfiles(data?.profiles);
			}
			setCurrentMatch(null);
		} catch (error) {
			console.error("Error fetching profiles:", error);
		}
	};
	const handleBackClick = () => {
		// Logic to handle back navigation
		console.log("Back button clicked");
		setSearchResults([]);
		setCurrentMatch("Search");
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

					// Send the location to your API
					await sendLocationToAPI(locationName, latitude, longitude);
					
					// Optional: Show success notification
					// notify.location.success(locationName);
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
				timeout: 10000, // 10 seconds timeout
				maximumAge: 300000 // Accept cached position up to 5 minutes old
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

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center" // Centers horizontally
				alignItems="center" // Centers vertically
				height="100vh" // Full viewport height
				bgcolor="#121212" // Background color
			>
				<LoadingScreen logoSrc="/loading.png"></LoadingScreen>
			</Box>
		);
	}

	return (
		<Box sx={{ bgcolor: "#121212", minHeight: "100vh" }}>
			<Header />

			{isMobile === true ? (
				<Grid container sx={{ marginTop: 10 }}>
					{searchResults?.length > 0 && (
						<Box sx={{ marginTop: 5, marginBottom: 5 }}>
							<Button
								variant="outlined"
								startIcon={<ArrowCircleLeft />}
								onClick={handleBackClick}
								sx={{
									color: "#1976d2",
									borderColor: "#1976d2",
									"&:hover": {
										borderColor: "#115293",
										backgroundColor: "#e3f2fd",
									},
								}}
							>
								Back
							</Button>
						</Box>
					)}
					<UserProfileModal
						handleGrantAccess={handleGrantAccess}
						handleClose={handleClose}
						open={showDetail}
						userid={selectedUserId}
					/>
					{searchResults?.length > 0 ? (
						searchResults &&
						searchResults.map((profile: any, index: number) => (
							<Card
								key={index}
								elevation={0}
								sx={{
									border: "none",
									marginLeft: "5px",
									marginRight: "5px",
									width: 420,
									height: { md: 450, lg: 450, sm: 580, xs: 580 },
									marginTop: { sm: "30px" },
									boxShadow: "none",
									backgroundColor: "#0a0a0a",
									color: "white",
								}}
								// onClick={() => router.push('/members/' + profile?.ProfileId)}
								onClick={() => {
									setShowDetail(true);
									setSelectedUserId(profile?.Id ? profile?.Id : profile?.Id);
								}}
							>
								<Box
									position="relative"
									width="100%"
									sx={{ height: { lg: 270, md: 270, sm: 380, xs: 380 } }}
								>
									<Avatar
										alt={profile?.Username}
										src={profile?.Avatar}
										sx={{
											width: "100%",
											height: "100%",
											borderRadius: 0,
										}}
									/>
								</Box>
								<CardContent>
									<Typography variant="h6" component="div" gutterBottom>
										{profile?.Username || "Unknown"} ,{" "}
										{profile?.DateOfBirth
											? new Date().getFullYear() -
											  new Date(profile.DateOfBirth).getFullYear()
											: ""}
										{profile?.Gender === "Male"
											? "M"
											: profile?.Gender === "Female"
											? "F"
											: ""}
										{profile?.PartnerDateOfBirth && (
											<>
												{" | "}
												{new Date().getFullYear() -
													new Date(
														profile.PartnerDateOfBirth
													).getFullYear()}{" "}
												{profile?.PartnerGender === "Male"
													? "M"
													: profile?.PartnerGender === "Female"
													? "F"
													: ""}
											</>
										)}
									</Typography>
									<Typography variant="body2" color="secondary">
										{profile?.Location?.replace(", USA", "") || ""}
									</Typography>
									<AboutSection aboutText={profile?.About} />
								</CardContent>
							</Card>
						))
					) : (
						<>
							{/* Left Column (col-2) */}
							<Grid item xs={2} sm={2} md={2} lg={2}>
								<List sx={{ paddingTop: "20px", paddingBottom: "12px" }}>
									{sidebarItems.map((item, index) => (
										<ListItem
											key={index}
											onClick={() => setCurrentMatch(item.label)}
											sx={{
												paddingTop: "0px",
												paddingBottom: "0px",
												paddingLeft: "0px",
												paddingRight: "0px",
												backgroundColor: "#2d2d2d",
												borderRadius: "4px",
												textAlign: "center",
												marginBottom: "10px",
												cursor: "pointer",
												"&:hover": {
													backgroundColor: "#3a3a3a",
												},
											}}
										>
											<ListItemText
												primary={item.label}
												primaryTypographyProps={{
													sx: {
														fontSize: "10px",
														textAlign: "center",
														color: "white",
													},
												}}
											/>
										</ListItem>
									))}
								</List>
							</Grid>

							{/* Right Column (col-10) */}
							<Grid
								item
								xs={10}
								sm={10}
								lg={10}
								md={10}
								sx={{
									px: { xs: 0, sm: 0 }, // Remove horizontal padding for xs and sm breakpoints
								}}
							>
								<Card
									sx={{
										borderRadius: "10px",
										backgroundColor: "#0a0a0a",
										padding: "0px",
										mx: { xs: 0, sm: 0 }, // Remove horizontal margin for xs and sm breakpoints
									}}
								>
									<CardContent>
										<Typography variant="h5" color="white" textAlign={"center"}>
											{currentMatch}
										</Typography>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column", // Stack input+button and error vertically
												background: "#2d2d2d",
												padding: "5px",
												width: "100%", // Ensure consistent layout
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<TextField
													placeholder="Username"
													fullWidth
													value={search}
													onChange={(e) => {
														setSearch(e.target.value);
														setErrors((prev: any) => ({ ...prev, search: "" })); // Clear error
													}}
													sx={{
														backgroundColor: "#1a1a1a", // Dark background for search box
														input: {
															color: "#fff", // White text color for input
															textAlign: "center",
														},
														"& .MuiOutlinedInput-root": {
															"& fieldset": {
																borderColor: errors?.search
																	? "red"
																	: "rgba(255, 255, 255, 0.23)", // Conditional border color
															},
															"&:hover fieldset": {
																borderColor: errors?.search
																	? "red"
																	: "rgba(255, 255, 255, 0.5)", // Hover effect
															},
															"&.Mui-focused fieldset": {
																borderColor: errors?.search ? "red" : "#fff", // Focused state
															},
														},
													}}
													variant="outlined"
													inputProps={{
														style: {
															textAlign: "center",
														},
													}}
													error={Boolean(errors?.search)} // Show red border for validation error
												/>
												{currentMatch !== "Search" && (
													<Button
														onClick={handleSearch}
														variant="contained"
														color="primary"
														sx={{
															textTransform: "none",
															backgroundColor: "#f50057",
															py: 1.5,
															fontSize: "16px",
															fontWeight: "bold",
															marginLeft: "10px", // Space between input and button
															"&:hover": {
																backgroundColor: "#c51162",
															},
														}}
													>
														Search
													</Button>
												)}
											</Box>

											{currentMatch === "Search" && (
												<Box
													component="form"
													noValidate
													autoComplete="off"
													sx={{
														padding: { xs: "10px", sm: "20px" }, // Smaller padding for mobile
														maxWidth: { xs: "90%", sm: "400px" }, // Adjust width for smaller screens
														margin: "0 auto",
														borderRadius: "8px",
														backgroundColor: "#121212", // Dark background color
														color: "#fff", // White text for dark theme
														boxShadow: 3,
													}}
												>
													{/* Textarea */}
													<TextField
														multiline
														rows={4}
														variant="outlined"
														fullWidth
														margin="normal"
														InputLabelProps={{
															style: { color: "#aaa" }, // Lighter label color
														}}
														InputProps={{
															style: {
																color: "#fff", // White text
																backgroundColor: "#1e1e1e", // Darker input background
																borderColor: "#333", // Subtle border for dark theme
															},
														}}
													/>

													{/* City and State Inputs */}
													<Typography
														sx={{
															color: "white",
															marginTop: "20px",
															fontSize: { xs: "14px", sm: "16px" },
														}}
													>
														City, State
													</Typography>
													<Autocomplete
														value={formData?.city}
														id="autocomplete-filled"
														open={openCity}
														clearOnBlur
														onOpen={() => setOpenCity(true)}
														onClose={() => setOpenCity(false)}
														isOptionEqualToValue={(option: any, value: any) =>
															option.id === value.id
														}
														getOptionLabel={(option: any) => option.City}
														options={cityOption.map((city: any) => ({
															...city,
															key: city.id,
														}))}
														loading={cityLoading}
														inputValue={cityInput}
														onInputChange={(event: any, newInputValue: any) => {
															if (
																event?.type === "change" ||
																event?.type === "click"
															)
																setCityInput(newInputValue);
														}}
														onChange={(event: any, newValue: any) => {
															if (newValue?.City)
																setFormData({
																	...formData,
																	city: newValue?.City,
																});
														}}
														renderInput={(params: any) => (
															<TextField
																{...params}
																variant="filled"
																error={!!errors.city}
																helperText={errors.city}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{cityLoading ? (
																				<CircularProgress
																					color="inherit"
																					size={15}
																				/>
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
																sx={{
																	backgroundColor: "#2a2a2a",
																	input: { color: "#fff" },
																	mb: 3,
																	borderRadius: "4px",
																}}
															/>
														)}
													/>

													{/* Checkbox */}
													<FormControlLabel
														control={
															<Checkbox
																checked={onlyPhotos == 1 ? true : false}
																onChange={handlePhotosChange}
																sx={{ color: "#aaa" }}
															/>
														}
														label="Only profiles with Photos"
														sx={{ color: "#fff" }}
													/>

													{/* Age Range Inputs */}
													<Box
														display="flex"
														flexDirection="column"
														gap="10px"
														mt={2}
														sx={{
															border: "1px solid #333",
															borderRadius: "8px",
															padding: "10px",
															backgroundColor: "#1e1e1e",
														}}
													>
														<Box
															display="flex"
															alignItems="center"
															gap="10px"
															justifyContent="center"
															flexWrap="wrap" // Allow wrapping on small screens
														>
															<Typography
																sx={{
																	color: "#fff",
																	fontSize: { xs: "14px", sm: "16px" },
																}}
															>
																Her age between
															</Typography>
															<TextField
																size="small"
																type="number"
																name="min"
																value={herAgeRange.min}
																onChange={handleHerAgeChange}
																variant="outlined"
																sx={{
																	width: "60px",
																	backgroundColor: "#1e1e1e",
																	color: "#fff",
																	"& .MuiOutlinedInput-input": {
																		color: "#fff",
																		border: "1px solid white",
																		borderRadius: "10px",
																	},
																}}
															/>
															<Typography
																sx={{
																	color: "#fff",
																	fontSize: { xs: "14px", sm: "16px" },
																}}
															>
																and
															</Typography>
															<TextField
																size="small"
																type="number"
																name="max"
																value={herAgeRange.max}
																onChange={handleHerAgeChange}
																variant="outlined"
																sx={{
																	width: "60px",
																	backgroundColor: "#1e1e1e",
																	color: "#fff",
																	"& .MuiOutlinedInput-input": {
																		color: "#fff",
																		border: "1px solid white",
																		borderRadius: "10px",
																	},
																}}
															/>
														</Box>
														<Box
															display="flex"
															alignItems="center"
															gap="10px"
															justifyContent="center"
															flexWrap="wrap" // Allow wrapping on small screens
														>
															<Typography
																sx={{
																	color: "#fff",
																	fontSize: { xs: "14px", sm: "16px" },
																}}
															>
																His age between
															</Typography>
															<TextField
																size="small"
																type="number"
																name="min"
																value={hisAgeRange.min}
																onChange={handleHisAgeChange}
																variant="outlined"
																sx={{
																	width: "60px",
																	backgroundColor: "#1e1e1e",
																	color: "#fff",
																	"& .MuiOutlinedInput-input": {
																		color: "#fff",
																		border: "1px solid white",
																		borderRadius: "10px",
																	},
																}}
															/>
															<Typography
																sx={{
																	color: "#fff",
																	fontSize: { xs: "14px", sm: "16px" },
																}}
															>
																and
															</Typography>
															<TextField
																size="small"
																type="number"
																name="max"
																value={hisAgeRange.max}
																onChange={handleHisAgeChange}
																variant="outlined"
																sx={{
																	width: "60px",
																	backgroundColor: "#1e1e1e",
																	color: "#fff",
																	"& .MuiOutlinedInput-input": {
																		color: "#fff",
																		border: "1px solid white",
																		borderRadius: "10px",
																	},
																}}
															/>
														</Box>
													</Box>

													{/* Orientation Select */}
													<Box
														sx={{
															display: "flex",
															flexDirection: "column",
															gap: 2,
															width: "100%",
															marginTop: 5,
														}}
													>
														{/* His Orientation */}
														<FormControl fullWidth>
															<InputLabel
																id="his-orientation-label"
																sx={{
																	color: "white",
																	fontSize: { xs: "14px", sm: "16px" },
																}} // Adjust font size
															>
																His Orientation
															</InputLabel>
															<Select
																labelId="his-orientation-label"
																id="his-orientation"
																value={hisOrientation}
																onChange={handleHisOrientationChange}
																sx={{
																	color: "white", // White text
																	".MuiOutlinedInput-notchedOutline": {
																		borderColor: "white", // White border
																	},
																	"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																		{
																			borderColor: "white", // White border when focused
																		},
																	"&:hover .MuiOutlinedInput-notchedOutline": {
																		borderColor: "white", // White border on hover
																	},
																	".MuiSvgIcon-root": {
																		color: "white", // White dropdown arrow
																	},
																}}
															>
																<MenuItem value="Straight">Straight</MenuItem>
																<MenuItem value="Bi">Bi</MenuItem>
																<MenuItem value="Bi-curious">
																	Bi-curious
																</MenuItem>
																<MenuItem value="Open minded">
																	Open minded
																</MenuItem>
															</Select>
														</FormControl>

														{/* Her Orientation */}
														<FormControl fullWidth>
															<InputLabel
																id="her-orientation-label"
																sx={{
																	color: "white",
																	fontSize: { xs: "14px", sm: "16px" },
																}} // Adjust font size
															>
																Her Orientation
															</InputLabel>
															<Select
																labelId="her-orientation-label"
																id="her-orientation"
																value={herOrientation}
																onChange={handleHerOrientationChange}
																sx={{
																	color: "white", // White text
																	".MuiOutlinedInput-notchedOutline": {
																		borderColor: "white", // White border
																	},
																	"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																		{
																			borderColor: "white", // White border when focused
																		},
																	"&:hover .MuiOutlinedInput-notchedOutline": {
																		borderColor: "white", // White border on hover
																	},
																	".MuiSvgIcon-root": {
																		color: "white", // White dropdown arrow
																	},
																}}
															>
																<MenuItem value="Straight">Straight</MenuItem>
																<MenuItem value="Bi">Bi</MenuItem>
																<MenuItem value="Bi-curious">
																	Bi-curious
																</MenuItem>
																<MenuItem value="Open minded">
																	Open minded
																</MenuItem>
															</Select>
														</FormControl>
													</Box>
													<Box
														sx={{
															display: "flex",
															flexDirection: "column",
															gap: 2,
															width: "100%",
															marginTop: 5,
														}}
													>
														<Button
															onClick={handleSubmit}
															variant="contained"
															color="primary"
															sx={{
																textTransform: "none",
																backgroundColor: "#f50057",
																py: 1.5,
																pt: 2,
																mb: 4,
																fontSize: { xs: "14px", sm: "16px" }, // Adjust font size
																fontWeight: "bold",
																"&:hover": {
																	backgroundColor: "#c51162",
																},
															}}
														>
															Search
														</Button>
													</Box>
												</Box>
											)}
											{errors?.search && (
												<Typography
													variant="body2"
													color="error"
													sx={{ mt: 1, textAlign: "left", width: "100%" }}
												>
													{errors?.search}
												</Typography>
											)}
										</Box>

										{currentMatch !== "Search" && (
											<Box
												sx={{
													maxHeight: "700px", // Set max height for scroll
													overflowY: "auto", // Enable vertical scroll
													marginTop: "10px",
												}}
											>
												{/* Post Card */}
												{filteredData.length > 0 ? (
													filteredData.map((profile: any, index: number) => {
														return (
															<Card
																key={index}
																sx={{
																	borderRadius: "10px",
																	marginBottom: "20px",
																	marginTop: "20px",
																	backgroundColor: "#2d2d2d",
																	mx: { xs: 0, sm: 0 }, // Remove horizontal margin for xs and sm breakpoints
																}}
															>
																<Box sx={{ padding: "10px" }}>
																	<img
																		// onClick={() => {
																		//     console.log(profile?.Id);
																		//     router.push(`/members/${profile?.Id}`);
																		// }}
																		onClick={() => {
																			setShowDetail(true);
																			setSelectedUserId(profile?.Id);
																		}}
																		src={profile?.Avatar}
																		alt="Post Image"
																		style={{
																			width: "100%",
																			borderTopLeftRadius: "10px",
																			borderTopRightRadius: "10px",
																		}}
																	/>
																</Box>
																<CardContent
																	sx={{
																		padding: 0,
																		paddingBottom: { xs: 0, sm: 0, md: 0 },
																		"&:last-child": {
																			paddingBottom: 0,
																		},
																	}}
																>
																	<Grid
																		container
																		justifyContent="space-between"
																	>
																		<Grid item lg={8} md={8} sm={8} xs={8}>
																			<Box sx={{ pl: { xs: 1, sm: 2 } }}>
																				<Typography
																					variant="h6"
																					sx={{
																						color: "#e91e63",
																						fontWeight: 600,
																						mb: 0.5,
																						fontSize: {
																							xs: "1rem",
																							sm: "1.25rem",
																						},
																					}}
																				>
																					{profile.Username}
																				</Typography>

																				<Typography
																					variant="body2"
																					sx={{
																						color: "rgba(255, 255, 255, 0.8)",
																						display: "flex",
																						alignItems: "center",
																						gap: 0.5,
																						mb: 0.5,
																						fontSize: {
																							xs: "0.8rem",
																							sm: "0.875rem",
																						},
																					}}
																				>
																					{profile?.DateOfBirth && (
																						<>
																							{new Date().getFullYear() -
																								new Date(
																									profile.DateOfBirth
																								).getFullYear()}
																							{profile?.Gender === "Male"
																								? "M"
																								: profile?.Gender === "Female"
																								? "F"
																								: ""}
																						</>
																					)}
																					{profile?.PartnerDateOfBirth && (
																						<>
																							{" | "}
																							{new Date().getFullYear() -
																								new Date(
																									profile.PartnerDateOfBirth
																								).getFullYear()}
																							{profile?.PartnerGender === "Male"
																								? "M"
																								: profile?.PartnerGender ===
																								  "Female"
																								? "F"
																								: ""}
																						</>
																					)}
																				</Typography>

																				<Box
																					sx={{
																						display: "flex",
																						alignItems: "center",
																						flexWrap: "wrap",
																						gap: { xs: 0.5, sm: 1 },
																					}}
																				>
																					<Typography
																						variant="body2"
																						sx={{
																							color: "rgba(255, 255, 255, 0.7)",
																							display: "flex",
																							alignItems: "center",
																							gap: 0.5,
																							fontSize: {
																								xs: "0.75rem",
																								sm: "0.875rem",
																							},
																						}}
																					>
																						{profile?.Location?.replace(
																							", USA",
																							""
																						)}
																					</Typography>
																					<Typography
																						component="span"
																						sx={{
																							color: "rgba(255, 255, 255, 0.5)",
																							fontSize: {
																								xs: "0.75rem",
																								sm: "0.875rem",
																							},
																						}}
																					>
																						• {profile.Distance}
																					</Typography>
																				</Box>
																			</Box>
																		</Grid>

																		<Grid
																			item
																			lg={4}
																			md={4}
																			sm={4}
																			xs={4}
																			sx={{ textAlign: "right" }}
																		>
																			<Box sx={{ display: "inline-grid" }}>
																				<IconButton
																					sx={{ color: "white" }}
																					onClick={() =>
																						handleReportModalToggle(
																							profile?.UserId
																						)
																					}
																				>
																					{currentMatch}
																				</IconButton>
																				<IconButton
																					sx={{ color: "#f50057" }}
																					onClick={() =>
																						handleReportModalToggle(
																							profile?.UserId
																						)
																					}
																				>
																					<Flag />
																				</IconButton>
																			</Box>
																		</Grid>
																	</Grid>
																</CardContent>
															</Card>
														);
													})
												) : (
													<div>no data</div>
												)}
											</Box>
										)}
									</CardContent>
								</Card>
							</Grid>
						</>
					)}
				</Grid>
			) : (
				<Container maxWidth="xl" sx={{ mt: 12, mb: 8 }}>
					<Button
						onClick={() => router.back()}
						startIcon={<ArrowLeft />}
						sx={{
							textTransform: "none",
							color: "rgba(255, 255, 255, 0.7)",
							textAlign: "center",
							minWidth: "auto",
							fontSize: "16px",
							fontWeight: "medium",
							"&:hover": {
								color: "#fff",
								backgroundColor: "rgba(255, 255, 255, 0.08)",
							},
						}}
					>
						Back
					</Button>
					<Box sx={{ color: "white", mt: 2, mb: 4 }}>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 800,
								letterSpacing: "0.05em",
								textTransform: "uppercase",
								background: "linear-gradient(45deg, #fff 30%, #f50057 90%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								position: "relative",
								animation: "glow 2s ease-in-out infinite",
								"@keyframes glow": {
									"0%": {
										textShadow: "0 0 10px rgba(245, 0, 87, 0.5)",
									},
									"50%": {
										textShadow:
											"0 0 20px rgba(245, 0, 87, 0.8), 0 0 30px rgba(245, 0, 87, 0.4)",
									},
									"100%": {
										textShadow: "0 0 10px rgba(245, 0, 87, 0.5)",
									},
								},
								"&::after": {
									content: '""',
									position: "absolute",
									bottom: -8,
									left: 0,
									width: "50px",
									height: "3px",
									background: "#f50057",
									transition: "width 0.3s ease",
								},
								"&:hover::after": {
									width: "100px",
								},
							}}
						>
							Matches
						</Typography>
					</Box>
					<UserProfileModal
						handleGrantAccess={handleGrantAccess}
						handleClose={handleClose}
						open={showDetail}
						userid={selectedUserId}
					/>
					<Grid container spacing={3}>
						<Grid item xs={12} md={2}>
							<Paper
								elevation={3}
								sx={{
									bgcolor: "#1E1E1E",
									borderRadius: 2,
									position: { md: "sticky" },
									top: 80,
									border: "0.0625rem solid rgb(55, 58, 64)",
								}}
							>
								<List sx={{ p: 1 }}>
									{sidebarItems.map((item, index) => (
										<ListItem
											key={index}
											onClick={() => setCurrentMatch(item.label)}
											sx={{
												borderTopRightRadius: 25,
												borderTopLeftRadius: 5,
												borderBottomLeftRadius: 5,
												borderBottomRightRadius: 5,
												cursor: "pointer",
												mb: 0.5,
												p: 1,
												transition: "all 0.3s ease",
												position: "relative",
												overflow: "hidden",
												bgcolor:
													currentMatch === item.label
														? "#f50057"
														: "transparent",
												"&::before": {
													content: '""',
													position: "absolute",
													top: 0,
													left: "-100%",
													width: "100%",
													height: "100%",
													background:
														"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
													transition: "left 0.5s ease",
												},
												"&:hover::before": {
													left: "100%",
												},
												"&:hover": {
													bgcolor:
														currentMatch === item.label
															? "#f50057"
															: "rgba(255, 255, 255, 0.05)",
												},
											}}
										>
											<ListItemText
												primary={item.label}
												sx={{
													m: 0,
													"& .MuiTypography-root": {
														color:
															currentMatch === item.label
																? "white"
																: "rgba(255,255,255,0.7)",
														fontSize: "1.1rem",
														fontWeight:
															currentMatch === item.label ? "500" : "400",
														transition: "all 0.3s ease",
													},
												}}
											/>
										</ListItem>
									))}
								</List>
							</Paper>
						</Grid>

						{/* Main Content */}
						<Grid item xs={12} md={10}>
							<Paper
								elevation={3}
								sx={{
									bgcolor: "#1E1E1E",
									borderRadius: 2,
									p: 3,
									border: "0.0625rem solid rgb(55, 58, 64)",
								}}
							>
								<Typography
									variant="h4"
									color="white"
									sx={{ mb: 3, fontWeight: "bold" }}
								>
									{currentMatch}
								</Typography>

								{/* Search Section */}
								<Box sx={{ mb: 4 }}>
									<Grid container spacing={2}>
										<Grid item xs={12} sm={currentMatch === "Search" ? 12 : 9}>
											<TextField
												fullWidth
												placeholder="Search members..."
												value={search}
												onChange={(e) => {
													setSearch(e.target.value);
													setErrors((prev: any) => ({ ...prev, search: "" }));
												}}
												error={Boolean(errors?.search)}
												helperText={errors?.search}
												InputProps={{
													startAdornment: (
														<SearchIcon
															sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 1 }}
														/>
													),
												}}
												sx={{
													"& .MuiOutlinedInput-root": {
														color: "white",
														bgcolor: "#2D2D2D",
														"& fieldset": {
															borderColor: "rgba(255, 255, 255, 0.23)",
														},
														"&:hover fieldset": {
															borderColor: "rgba(255, 255, 255, 0.5)",
														},
														"&.Mui-focused fieldset": {
															borderColor: "#f50057",
														},
													},
													"& .MuiFormHelperText-root": {
														color: "#f44336",
													},
												}}
											/>
										</Grid>
										{currentMatch === "Search" ? (
											<></>
										) : (
											<Grid item xs={12} sm={3}>
												<Button
													fullWidth
													variant="contained"
													onClick={handleSearch}
													sx={{
														height: "100%",
														bgcolor: "#f50057",
														"&:hover": { bgcolor: "#c51162" },
													}}
												>
													Search
												</Button>
											</Grid>
										)}
									</Grid>
								</Box>

								{currentMatch === "Search" ? (
									<Grid container spacing={3}>
										<Grid item xs={12} sm={12} lg={12} md={12}>
											{/* Checkbox */}
											<FormControlLabel
												control={
													<Checkbox
														checked={onlyPhotos === 1}
														onChange={handlePhotosChange}
														sx={{
															color: "#aaa", // Default color
															"&.Mui-checked": {
																color: "#f50057", // Color when checked
															},
														}}
													/>
												}
												label="Only profiles with Photos"
												sx={{ color: "#fff" }}
											/>
										</Grid>

										<Grid item xs={12} sm={12} lg={12} md={12}>
											<Typography
												sx={{
													color: "white",
													marginTop: "15px",
													fontSize: "1.2rem",
													fontWeight: "bold",
												}}
											>
												City, State
											</Typography>
											<Autocomplete
												value={formData?.city}
												id="autocomplete-filled"
												open={openCity}
												clearOnBlur
												onOpen={() => setOpenCity(true)}
												onClose={() => setOpenCity(false)}
												isOptionEqualToValue={(option: any, value: any) =>
													option.id === value.id
												}
												getOptionLabel={(option: any) => option.City}
												options={cityOption.map((city: any) => ({
													...city,
													key: city.id,
												}))}
												loading={cityLoading}
												inputValue={cityInput}
												onInputChange={(event: any, newInputValue: any) => {
													if (
														event?.type === "change" ||
														event?.type === "click"
													)
														setCityInput(newInputValue);
												}}
												onChange={(event: any, newValue: any) => {
													if (newValue?.City)
														setFormData({
															...formData,
															city: newValue?.City,
														});
												}}
												renderInput={(params: any) => (
													<TextField
														{...params}
														error={!!errors.city}
														helperText={errors.city}
														InputProps={{
															...params.InputProps,
															endAdornment: (
																<>
																	{cityLoading ? (
																		<CircularProgress
																			sx={{ color: "#f50057" }}
																			size={15}
																		/>
																	) : null}
																	{params.InputProps.endAdornment}
																</>
															),
														}}
														sx={{
															"& .MuiOutlinedInput-root": {
																color: "white",
																bgcolor: "#2D2D2D",
																"& fieldset": {
																	borderColor: "rgba(255, 255, 255, 0.23)",
																},
																"&:hover fieldset": {
																	borderColor: "rgba(255, 255, 255, 0.5)",
																},
																"&.Mui-focused fieldset": {
																	borderColor: "#f50057",
																},
															},
															"& .MuiFormHelperText-root": {
																color: "#f44336",
															},
															mb: 2,
														}}
													/>
												)}
												sx={{
													"& .MuiAutocomplete-popupIndicator": {
														color: "#f50057",
														"&:hover": {
															color: "#ff4081",
														},
													},
													"& .MuiAutocomplete-option": {
														color: "white",
														backgroundColor: "#2D2D2D",
														transition: "background-color 0.2s ease",
														"&:hover": {
															backgroundColor: "#424242",
														},
													},
												}}
											/>
										</Grid>

										<Grid item xs={12} sm={12} lg={12} md={12}>
											{/* Parent container for the two sections */}
											<Box
												display="flex"
												justifyContent="center"
												gap="20px"
												sx={{
													backgroundColor: "#121212",
													padding: "20px",
													borderRadius: "10px",
													boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
												}}
											>
												{/* Age Range Section */}
												<Box
													flex="1"
													display="flex"
													flexDirection="column"
													gap="20px"
													sx={{
														backgroundColor: "#1e1e1e",
														padding: "20px",
														textAlign: "center",
														borderRadius: "10px",
														border: "1px solid #333",
														transition: "transform 0.3s, box-shadow 0.3s",
														"&:hover": {
															transform: "scale(1.02)",
															boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.8)",
														},
													}}
												>
													<Typography
														variant="h6"
														sx={{ color: "#fff", marginBottom: "10px" }}
													>
														Age Range
													</Typography>
													<Box
														display="flex"
														justifyContent="center"
														alignItems="center"
														gap="10px"
													>
														<Typography sx={{ color: "#fff" }}>
															Her age between
														</Typography>
														<TextField
															size="small"
															type="number"
															name="min"
															value={herAgeRange.min}
															onChange={handleHerAgeChange}
															variant="outlined"
															sx={{
																width: "80px",
																backgroundColor: "#2a2a2a",
																input: { color: "#fff" },
																"& .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#555",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#888",
																},
																"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																	{
																		borderColor: "#f50057",
																	},
															}}
														/>
														<Typography sx={{ color: "#fff" }}>and</Typography>
														<TextField
															size="small"
															type="number"
															name="max"
															value={herAgeRange.max}
															onChange={handleHerAgeChange}
															variant="outlined"
															sx={{
																width: "80px",
																backgroundColor: "#2a2a2a",
																input: { color: "#fff" },
																"& .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#555",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#888",
																},
																"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																	{
																		borderColor: "#f50057",
																	},
															}}
														/>
													</Box>
													<Box
														display="flex"
														justifyContent="center"
														alignItems="center"
														gap="10px"
													>
														<Typography sx={{ color: "#fff" }}>
															His age between
														</Typography>
														<TextField
															size="small"
															type="number"
															name="min"
															value={hisAgeRange.min}
															onChange={handleHisAgeChange}
															variant="outlined"
															sx={{
																width: "80px",
																backgroundColor: "#2a2a2a",
																input: { color: "#fff" },
																"& .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#555",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#888",
																},
																"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																	{
																		borderColor: "#f50057",
																	},
															}}
														/>
														<Typography sx={{ color: "#fff" }}>and</Typography>
														<TextField
															size="small"
															type="number"
															name="max"
															value={hisAgeRange.max}
															onChange={handleHisAgeChange}
															variant="outlined"
															sx={{
																width: "80px",
																backgroundColor: "#2a2a2a",
																input: { color: "#fff" },
																"& .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#555",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#888",
																},
																"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																	{
																		borderColor: "#f50057",
																	},
															}}
														/>
													</Box>
												</Box>

												{/* Orientation Section */}
												<Box
													flex="1"
													display="flex"
													flexDirection="column"
													textAlign="center"
													gap="20px"
													sx={{
														backgroundColor: "#1e1e1e",
														padding: "20px",
														borderRadius: "10px",
														border: "1px solid #333",
														transition: "transform 0.3s, box-shadow 0.3s",
														"&:hover": {
															transform: "scale(1.02)",
															boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.8)",
														},
													}}
												>
													<Typography
														variant="h6"
														sx={{ color: "#fff", marginBottom: "10px" }}
													>
														Orientation
													</Typography>
													<FormControl fullWidth>
														<InputLabel
															id="his-orientation-label"
															sx={{ color: "#aaa" }}
														>
															His Orientation
														</InputLabel>
														<Select
															labelId="his-orientation-label"
															id="his-orientation"
															value={hisOrientation}
															onChange={handleHisOrientationChange}
															sx={{
																color: "#fff",
																backgroundColor: "#2a2a2a",
																".MuiOutlinedInput-notchedOutline": {
																	borderColor: "#555",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#888",
																},
																"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																	{
																		borderColor: "#f50057",
																	},
															}}
														>
															<MenuItem value="Straight">Straight</MenuItem>
															<MenuItem value="Bi">Bi</MenuItem>
															<MenuItem value="Bi-curious">Bi-curious</MenuItem>
															<MenuItem value="Open minded">
																Open minded
															</MenuItem>
														</Select>
													</FormControl>
													<FormControl fullWidth>
														<InputLabel
															id="her-orientation-label"
															sx={{ color: "#aaa" }}
														>
															Her Orientation
														</InputLabel>
														<Select
															labelId="her-orientation-label"
															id="her-orientation"
															value={herOrientation}
															onChange={handleHerOrientationChange}
															sx={{
																color: "#fff",
																backgroundColor: "#2a2a2a",
																".MuiOutlinedInput-notchedOutline": {
																	borderColor: "#555",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#888",
																},
																"&.Mui-focused .MuiOutlinedInput-notchedOutline":
																	{
																		borderColor: "#f50057",
																	},
															}}
														>
															<MenuItem value="Straight">Straight</MenuItem>
															<MenuItem value="Bi">Bi</MenuItem>
															<MenuItem value="Bi-curious">Bi-curious</MenuItem>
															<MenuItem value="Open minded">
																Open minded
															</MenuItem>
														</Select>
													</FormControl>
												</Box>
											</Box>
										</Grid>

										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												width: "100%",
												paddingTop: "30px",
											}}
										>
											<Button
												onClick={handleSubmit}
												variant="contained"
												color="primary"
												sx={{
													textTransform: "none",
													backgroundColor: "#f50057",
													fontSize: "16px",
													py: 1.5,
													fontWeight: "bold",
													marginLeft: "10px", // Space between input and button
													"&:hover": {
														backgroundColor: "#c51162",
													},
												}}
											>
												Search
											</Button>
										</Box>
									</Grid>
								) : (
									<Grid container spacing={3}>
										{filteredData.map((profile: any, index: number) => (
											<Grid item xs={12} sm={6} md={4} key={index}>
												<Fade in={true} timeout={500 + index * 100}>
													<Card
														sx={{
															bgcolor: "rgba(45, 45, 45, 0.8)",
															backdropFilter: "blur(10px)",
															borderRadius: 3,
															height: "100%",
															display: "flex",
															flexDirection: "column",
															overflow: "hidden",
															transition: "all 0.3s ease",
															position: "relative",
															border: "1px solid rgba(255, 255, 255, 0.1)",
															cursor: "pointer",
															"&:hover": {
																transform: "translateY(-4px)",
																boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
																"& .media-overlay": {
																	opacity: 1,
																},
															},
														}}
													>
														<CardMedia
															component="img"
															height="300"
															image={profile?.Avatar}
															alt={profile?.Username}
															sx={{
																cursor: "pointer",
																objectFit: "cover",
															}}
															// onClick={() => {
															//     console.log(currentMatch);
															//     router.push(`/members/${currentMatch === null ? profile.ProfileId : profile.Id}`)
															// }
															// }
															onClick={() => {
																setShowDetail(true);
																setSelectedUserId(profile?.Id);
															}}
														/>
														<CardContent sx={{ p: 2 }}>
															<Box
																sx={{
																	display: "flex",
																	justifyContent: "space-between",
																	mb: 1,
																}}
															>
																<Stack
																	direction="row"
																	spacing={1}
																	alignItems="center"
																>
																	<Typography
																		variant="h6"
																		sx={{
																			color: "#f50057",
																			fontWeight: "bold",
																			fontSize: { xs: "1rem", sm: "1.25rem" },
																		}}
																	>
																		{profile?.Username + " "}
																		<Verified
																			sx={{ color: "#f50057", fontSize: 16 }}
																		/>
																	</Typography>
																</Stack>
																<IconButton
																	onClick={() =>
																		handleReportModalToggle(profile?.UserId)
																	}
																	sx={{ color: "red" }}
																>
																	<Flag />
																</IconButton>
															</Box>

															<Box sx={{ mb: 2 }}>
																{profile?.DateOfBirth && (
																	<Chip
																		size="small"
																		label={`${
																			new Date().getFullYear() -
																			new Date(
																				profile.DateOfBirth
																			).getFullYear()
																		}${profile?.Gender === "Male" ? "M" : "F"}`}
																		sx={{
																			bgcolor: "#f50057",
																			color: "white",
																			mr: 1,
																			fontSize: "0.75rem",
																		}}
																	/>
																)}
																{profile?.PartnerDateOfBirth && (
																	<Chip
																		size="small"
																		label={`${
																			new Date().getFullYear() -
																			new Date(
																				profile.PartnerDateOfBirth
																			).getFullYear()
																		}${
																			profile?.PartnerGender === "Male"
																				? "M"
																				: "F"
																		}`}
																		sx={{
																			bgcolor: "#f50057",
																			color: "white",
																			fontSize: "0.75rem",
																		}}
																	/>
																)}
															</Box>

															<Box
																sx={{
																	display: "flex",
																	alignItems: "center",
																	gap: 1,
																}}
															>
																<LocationOnIcon
																	fontSize="small"
																	sx={{ color: "#f50057" }}
																/>
																<Typography
																	variant="body2"
																	sx={{
																		color: "rgba(255, 255, 255, 0.7)",
																		fontSize: { xs: "0.75rem", sm: "0.875rem" },
																	}}
																>
																	{profile?.Location?.replace(", USA", "")} •{" "}
																	{profile?.Distance}
																</Typography>
															</Box>
														</CardContent>
													</Card>
												</Fade>
											</Grid>
										))}
									</Grid>
								)}
							</Paper>
						</Grid>
					</Grid>
				</Container>
			)}
			{/* Report Modal */}
			<Modal
				open={isReportModalOpen}
				onClose={() => handleReportModalToggle("null")}
				closeAfterTransition
			>
				<Fade in={isReportModalOpen}>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: 300,
							bgcolor: "#1E1E1E",
							borderRadius: 2,
							boxShadow: 24,
							p: 4,
						}}
					>
						<Typography variant="h6" color="white" gutterBottom>
							Report or Block User
						</Typography>
						<FormControlLabel
							control={
								<Checkbox
									checked={reportOptions.reportUser}
									onChange={handleCheckboxChange}
									name="reportUser"
									sx={{
										color: "#f50057",
										"&.Mui-checked": { color: "#f50057" },
									}}
								/>
							}
							label="Report User"
							sx={{ color: "white", display: "block", mb: 1 }}
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={reportOptions.blockUser}
									onChange={handleCheckboxChange}
									name="blockUser"
									sx={{
										color: "#f50057",
										"&.Mui-checked": { color: "#f50057" },
									}}
								/>
							}
							label="Block User"
							sx={{ color: "white", display: "block", mb: 2 }}
						/>
						<Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
							<Button
								onClick={() => handleReportModalToggle("null")}
								sx={{
									bgcolor: "#333",
									color: "white",
									"&:hover": { bgcolor: "#444" },
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleReportSubmit}
								sx={{
									bgcolor: "#f50057",
									color: "white",
									"&:hover": { bgcolor: "#c51162" },
								}}
							>
								Submit
							</Button>
						</Box>
					</Box>
				</Fade>
			</Modal>

			<Footer />
		</Box>
	);
}
