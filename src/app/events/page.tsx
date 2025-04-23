"use client";

import { useEffect, useState, useRef } from "react";
import {
	Box,
	Grid,
	Card,
	CardContent,
	IconButton,
	Typography,
	Paper,
	Button,
	Chip,
	Stack,
	Container,
	alpha,
	useTheme,
	useMediaQuery,
	TextField,
	InputAdornment,
	Select,
	MenuItem,
	SelectChangeEvent,
} from "@mui/material";
import {
	ChevronLeft,
	ChevronRight,
	CalendarToday,
	ViewList,
	CalendarMonth,
	Add,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { LocationOn, MyLocation } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SidebarList from "@/components/SidebarList";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Sort as SortIcon } from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";

const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface LocationSearchProps {
	onLocationChange?: (location: string) => void;
	onRadiusChange?: (radius: number) => void;
	defaultRadius?: number;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
	onLocationChange,
	onRadiusChange,
	defaultRadius = 0,
}) => {
	const [location, setLocation] = useState("");
	const [radius, setRadius] = useState<number>(defaultRadius);

	const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setLocation(value);
		onLocationChange?.(value);
	};

	const handleRadiusChange = (event: any) => {
		const newRadius = event.target.value as number;
		setRadius(newRadius);
		onRadiusChange?.(newRadius);
	};

	return (
		<Stack spacing={2} direction="row" sx={{ width: "100%" }}>
			<Box sx={{ flexGrow: 1 }}>
				<TextField
					fullWidth
					value={location}
					onChange={handleLocationChange}
					placeholder="Enter location"
					variant="outlined"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<LocationOn />
							</InputAdornment>
						),
						sx: {
							bgcolor: "background.paper",
							"&:hover": {
								bgcolor: alpha("#fff", 0.09),
							},
						},
					}}
				/>
			</Box>

			<Select
				value={radius}
				onChange={handleRadiusChange}
				variant="outlined"
				sx={{
					minWidth: 120,
					bgcolor: "background.paper",
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: alpha("#fff", 0.23),
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: alpha("#fff", 0.4),
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#f50057",
					},
				}}
			>
				<MenuItem value={0}>Any distance</MenuItem>
				<MenuItem value={5}>5 miles</MenuItem>
				<MenuItem value={10}>10 miles</MenuItem>
				<MenuItem value={25}>25 miles</MenuItem>
				<MenuItem value={50}>50 miles</MenuItem>
				<MenuItem value={100}>100 miles</MenuItem>
			</Select>
		</Stack>
	);
};

export default function CalendarView() {
	const router = useRouter();
	const theme = useTheme();
	const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
	
	// Other state declarations
	const [currentDate, setCurrentDate] = useState(new Date());
	const [events, setEvents] = useState<any>([]);
	const [profileId, setProfileId] = useState<any>();
	const [viewType, setViewType] = useState("list");
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [processedEvents, setProcessedEvents] = useState<{[key: string]: any[]}>({});
	const [loading, setLoading] = useState(true);
	const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
	const [sortBy, setSortBy] = useState<"recent" | "location">("recent");
	const [sortedEvents, setSortedEvents] = useState<any[]>([]);
	const [cityInput, setCityInput] = useState("");
	const [openCity, setOpenCity] = useState(false);
	const [cityLoading, setCityLoading] = useState(false);
	const [cityOption, setCityOption] = useState<any[]>([]);
	const [searchStatus, setSearchStatus] = useState(false);
	const [membership, setMembership] = useState(0);

	// Add this ref
	const currentMonthRef = useRef<HTMLDivElement>(null);

	// Add these helper functions at the top level
	const findClosestEvent = (events: any[]) => {
		const today = new Date();
		return events.reduce((closest, event) => {
			const eventDate = new Date(event.StartTime);
			const currentClosestDate = new Date(closest.StartTime);
			
			const diffToToday = Math.abs(eventDate.getTime() - today.getTime());
			const closestDiffToToday = Math.abs(currentClosestDate.getTime() - today.getTime());
			
			return diffToToday < closestDiffToToday ? event : closest;
		}, events[0]);
	};

	const scrollToEvent = (eventElement: Element) => {
		const container = document.querySelector('.events-container');
		if (!container) return;

		const containerRect = container.getBoundingClientRect();
		const eventRect = eventElement.getBoundingClientRect();
		
		// Calculate the relative position within the container
		const containerTop = container.scrollTop;
		const elementRelativeTop = eventElement.getBoundingClientRect().top - containerRect.top;
		
		// Calculate optimal scroll position (35% from the top)
		const targetPosition = containerTop + elementRelativeTop - (containerRect.height * 0.35);

		container.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});
	};

	// Update the useEffect for scrolling
	useEffect(() => {
		if (!isMobile || loading || !sortedEvents.length) return;

		const timer = setTimeout(() => {
			const closestEvent = findClosestEvent(sortedEvents);
			const eventElement = document.querySelector(`[data-event-id="${closestEvent.Id}"]`);
			
			if (eventElement) {
				// Initial rough positioning
				eventElement.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});

				// Fine-tune positioning after a short delay
				setTimeout(() => {
					scrollToEvent(eventElement);
				}, 100);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [isMobile, loading, sortedEvents]);

	const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setSortAnchorEl(event.currentTarget);
	};

	const handleSortClose = () => {
		setSortAnchorEl(null);
	};

	const handleSortSelect = (type: "recent" | "location") => {
		setSortBy(type);
		setSortAnchorEl(null);

		const sorted = [...events];
		if (type === "recent") {
			sorted.sort(
				(a, b) =>
					new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime()
			);
		} else if (type === "location") {
			sorted.sort((a, b) => {
				const venueA = (a.Venue || "").toLowerCase();
				const venueB = (b.Venue || "").toLowerCase();
				return venueA.localeCompare(venueB);
			});
		}
		setSortedEvents(sorted);
	};

	const calculateDistance = (
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	) => {
		const R = 6371; // Radius of the earth in km
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
				Math.cos(deg2rad(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c; // Distance in km
	};

	const deg2rad = (deg: number) => {
		return deg * (Math.PI / 180);
	};

	// Add this useEffect to initialize sortedEvents
	useEffect(() => {
		setSortedEvents(events);
	}, [events]);

	// Add this useEffect to fetch city options when input changes
	useEffect(() => {
		if (!openCity) {
			setCityOption([]);
			return;
		}
		if (cityInput === "") return;

		const fetchData = async () => {
			setCityLoading(true);
			try {
				const response = await fetch(`/api/user/city?city=${cityInput}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const { cities } = await response.json();
				const uniqueCities = cities.filter(
					(city: any, index: any, self: any) =>
						index === self.findIndex((t: any) => t.City === city.City)
				);

				setCityOption(uniqueCities);
			} catch (error) {
				console.error("Error fetching cities:", error);
			} finally {
				setCityLoading(false);
			}
		};

		const delayDebounceFn = setTimeout(() => {
			fetchData();
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [cityInput, openCity]);

	///////////////////////////////////////////////////////////

	const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
    }
    100% {
      transform: translateX(100%) skewX(-15deg);
    }
  }
`;

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
  }
`;

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

	const getDateKey = (date: Date) => {
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	};

	const getProcessedDateKey = (date: Date) => {
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	};

	const isSameDay = (date1: Date, date2: Date) => {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	};

	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
		setCurrentDate(date); // Update current month when selecting a date from a different month
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("loginInfo");
			if (token) {
				const decodeToken = jwtDecode<any>(token);
				setProfileId(decodeToken?.profileId);
				setMembership(decodeToken?.membership);

			} else {
				router.push("/login");
			}
		}
	}, []);

	useEffect(() => {
		if (profileId) {
			handleGetEvents(profileId);
		} else {
			handleGetEvents("a0cf00e0-6245-4d03-9d07-48d6626f4f57");
		}
	}, []);

	useEffect(() => {
		const groupedEvents = events.reduce(
			(acc: { [key: string]: any[] }, event: any) => {
				const eventDate = new Date(event.StartTime);
				const key = getDateKey(eventDate);
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(event);
				return acc;
			},
			{}
		);
		setProcessedEvents(groupedEvents);
		console.log("Initial Processed events:", groupedEvents); // Debug log
	}, [events]);

	const handleGetEvents = async (userid: any) => {
		try {
			const response = await fetch("/api/user/events?id=" + userid, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const eventsData = await response.json();
			setEvents(eventsData?.events || []);
			setLoading(false);
			console.log(eventsData);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		const days = [];
		const firstDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7

		// Add previous month's days
		for (let i = firstDayOfWeek - 1; i > 0; i--) {
			const prevDate = new Date(year, month, 1 - i);
			days.push({
				date: prevDate,
				isCurrentMonth: false,
				isToday: false,
			});
		}

		// Add current month's days
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const currentDate = new Date(year, month, i);
			days.push({
				date: currentDate,
				isCurrentMonth: true,
				isToday: currentDate.toDateString() === new Date().toDateString(),
			});
		}

		console.log("getDaysInMonth", days)

		return days;
	};

	const handlePreviousMonth = () => {
		const newDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() - 1
		);
		setCurrentDate(newDate);
		setSelectedDate(null); // Clear selection when changing months
	};

	const handleNextMonth = () => {
		const newDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1
		);
		setCurrentDate(newDate);
		setSelectedDate(null); // Clear selection when changing months
	};

	const formatEventDate = (date: string) => {
		return new Intl.DateTimeFormat("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		}).format(new Date(date));
	};

	const eventsByDate = events.reduce((acc: any, event: any) => {
		const date = new Date(event.StartTime).getDate();
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(event);
		return acc;
	}, {});

	const isSameMonth = (date1: any, date2: any) => {
		return (
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	};

	console.log("sortedEvents", sortedEvents)

	const currentMonthEvents = searchStatus 
    ? sortedEvents
    : events.filter((event: any) =>
        event?.StartTime && isSameMonth(new Date(event.StartTime), currentDate)
    );

	console.log("Current month events:", currentMonthEvents);

	useEffect(() => {
		if (profileId) {
			getCurrentLocation();
		}
	}, [profileId]);

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
		<Box
			sx={{
				bgcolor: "#0A0A0A",
				minHeight: "100vh",
				color: "white",
				pb: 8,
				background: "linear-gradient(to bottom, #0A0A0A, #1A1A1A)",
			}}
		>
			<Header />

			<Container maxWidth="xl" sx={{ pt: 1, pb: 4 }}>
				{isMobile ? (
					<Grid container spacing={0} sx={{ marginTop: 10 }}>
						{/* Left Column (col-2) */}
						<Grid item xs={3} sm={3} md={2} lg={2}>
							<SidebarList />
						</Grid>

						{/* Right Column (col-10) */}
						<Grid
							item
							xs={9}
							sm={9}
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
									paddingLeft: "5px",
									mx: { xs: 0, sm: 0 },
								}}
							>
								<CardContent sx={{ padding: "5px" }}>
									{" "}
									{/* Set padding to 5px */}
									<Typography variant="h5" color="white" textAlign={"center"}>
										Events
									</Typography>
									{/* Create New Post Button */}
									<Box>
										<Stack direction="row" spacing={2} mt={1}>
											<Button
												onClick={() => {
													const token = localStorage.getItem("loginInfo");
													if (token) {
														const decodeToken = jwtDecode<any>(token);
														console.log("membership", decodeToken.membership);
														if (decodeToken?.membership === 0) {
															router.push("/membership");
														} else {
															router.push("/events/create");
														}
													} else {
														router.push("/login");
													}
												}}
												variant="contained"
												color="primary"
												startIcon={<Add />}
												sx={{
													width: "100%",
													textTransform: "none",
													backgroundColor: "#f50057",
													py: 1.5,
													fontSize: "16px",
													fontWeight: "bold",
													"&:hover": {
														backgroundColor: "#c51162",
													},
												}}
											>
												Create
											</Button>

											<Button
												onClick={() => router.push("/events/calendar")}
												variant="contained"
												color="primary"
												endIcon={<CalendarMonth />}
												sx={{
													width: "100%",
													textTransform: "none",
													backgroundColor: "#f50057",
													py: 1.5,
													fontSize: "16px",
													fontWeight: "bold",
													"&:hover": {
														backgroundColor: "#c51162",
													},
												}}
											>
												Calendar
											</Button>
										</Stack>
									</Box>
									<Box sx={{ marginTop: "10px", width: "100%" }}>
										{/* <Button
											startIcon={<SortIcon />}
											onClick={handleSortClick}
											sx={{
												color: "white",
												bgcolor: "rgba(255, 255, 255, 0.05)",
												"&:hover": {
													bgcolor: "rgba(255, 255, 255, 0.1)",
												},
												borderRadius: 2,
												px: 3,
												py: 1,
												transition: "all 0.3s ease",
												width: "100%",
											}}
										>
											Sort
										</Button>
										<Menu
											anchorEl={sortAnchorEl}
											open={Boolean(sortAnchorEl)}
											onClose={handleSortClose}
											PaperProps={{
												sx: {
													bgcolor: "#1A1A1A",
													color: "white",
													"& .MuiMenuItem-root": {
														"&:hover": {
															bgcolor: "rgba(245, 0, 87, 0.1)",
														},
													},
													width: "100%",
												},
											}}
										>
											<MenuItem
												sx={{ width: "100%" }}
												onClick={() => handleSortSelect("recent")}
												selected={sortBy === "recent"}
											>
												Most Recent
											</MenuItem>
											<MenuItem
												sx={{ width: "100%" }}
												onClick={() => handleSortSelect("location")}
												selected={sortBy === "location"}
											>
												By Location
											</MenuItem>
										</Menu> */}
										<Autocomplete
											id="location-autocomplete"
											open={openCity}
											onOpen={() => setOpenCity(true)}
											onClose={() => setOpenCity(false)}
											isOptionEqualToValue={(option, value) => option.City === value.City}
											getOptionLabel={(option) => option.City || ""}
											options={cityOption}
											loading={cityLoading}
											inputValue={cityInput}
											// sx={{ width: 200 }}
											sx={{marginTop: "10px"}}
											noOptionsText={
												<Typography sx={{ color: "white" }}>
													No options
												</Typography>
											}
											onInputChange={(event, newInputValue) => {
												if (event?.type === "change" || event?.type === "click")
													setCityInput(newInputValue);
											}}
											onChange={(event, newValue) => {
												console.log("newValue", newValue);
												if (newValue?.City) {
													// Filter events by city
													const filtered = events.filter((event: any) => 
														event.Venue?.toLowerCase().includes(newValue.City.toLowerCase())
													);
													
													const groupedEvents = filtered.reduce(
														(acc: { [key: string]: any[] }, event: any) => {
															const eventDate = new Date();
															const key = getProcessedDateKey(eventDate);
															if (!acc[key]) {
																acc[key] = [];
															}
															acc[key].push(event);
															return acc;
														},
														{}
													);

													setSortedEvents(filtered);
													setSearchStatus(true)

													setProcessedEvents(groupedEvents);
													// Force mobile view when searching
													setViewType("list");
													
													// Log the changed processedEvents
													console.log("Filtered processedEvents:", groupedEvents);
												} else {
													setSortedEvents(events);
													
													// Reset to original grouping by event dates
													const groupedAll = events.reduce((acc: { [key: string]: any[] }, event: any) => {
														const date = new Date(event.StartTime);
														const dateKey = getProcessedDateKey(date);
														
														if (!acc[dateKey]) {
															acc[dateKey] = [];
														}
														acc[dateKey].push(event);
														return acc;
													}, {});
													
													setProcessedEvents(groupedAll);
													
													// Log the reset processedEvents
													console.log("Reset processedEvents:", groupedAll);
												}
											}}
											ListboxProps={{
												sx: {
													backgroundColor: "#2a2a2a",
													color: "#fff",
													"& .MuiAutocomplete-option": {
														"&:hover": {
															backgroundColor: "rgba(245,0,87,0.08)",
														},
														'&[aria-selected="true"]': {
															backgroundColor: "rgba(245,0,87,0.16)",
														},
													},
												},
											}}
											renderInput={(params) => (
												<TextField
													{...params}
													placeholder="Filter by city"
													InputProps={{
														...params.InputProps,
														endAdornment: (
															<>
																{cityLoading ? (
																	<CircularProgress color="inherit" size={15} />
																) : null}
																{params.InputProps.endAdornment}
															</>
														),
														sx: {
															color: "white",
															"& .MuiOutlinedInput-notchedOutline": {
																borderColor: "rgba(255,255,255,0.23)",
															},
															"&:hover .MuiOutlinedInput-notchedOutline": {
																borderColor: "rgba(255,255,255,0.4)",
															},
															"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
																borderColor: "#f50057",
															},
														}
													}}
												/>
											)}
										/>
									</Box>
									<Box
										className="events-container"
										sx={{
											maxHeight: "700px",
											overflowY: "auto",
											marginTop: "10px",
											scrollBehavior: 'smooth',
											'&::-webkit-scrollbar': {
												width: '8px',
											},
											'&::-webkit-scrollbar-track': {
												background: 'rgba(0, 0, 0, 0.1)',
												borderRadius: '4px',
											},
											'&::-webkit-scrollbar-thumb': {
												background: 'rgba(194, 24, 91, 0.5)',
												borderRadius: '4px',
												'&:hover': {
													background: 'rgba(194, 24, 91, 0.7)',
												},
											},
										}}
									>
										{sortedEvents.length !== 0 ? (
											sortedEvents.map((post: any, index: number) => {
												const eventDate = new Date(post.StartTime);
												const eventMonthYear = `${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getFullYear()}`;
												const isCurrentMonth = eventMonthYear === new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();
												
												return (
													<Card
														key={post.Id}
														data-event-id={post.Id}
														ref={isCurrentMonth ? currentMonthRef : null}
														onClick={() => router.push("/events/detail/" + post?.Id)}
														sx={{
															borderRadius: "10px",
															marginBottom: "20px",
															marginTop: "20px",
															backgroundColor: "#f50057",
															border: isCurrentMonth ? `2px solid ${alpha('#f50057', 0.8)}` : 'none',
															transition: 'transform 0.2s ease-in-out',
															'&:hover': {
																transform: 'scale(1.02)',
															},
														}}
													>
														<Box
															sx={{
																padding: 1,
																marginTop: "55px",
																backgroundColor: "#2d2d2d",
															}}
														>
															<img
																onClick={() =>
																	router.push("/whatshot/post/detail/" + post?.Id)
																}
																src={post?.CoverImageUrl} // Placeholder image for the post
																alt="Post Image"
																style={{
																	width: "100%",
																	borderTopLeftRadius: "10px",
																}}
															/>
														</Box>

														<CardContent
															sx={{
																background: "#f50057",
																color: "white",
																textAlign: "center",
																padding: "5px", // Ensure padding is also 5px here
															}}
														>
															<Typography variant="h6" component="div">
																{post.Name}
															</Typography>

															<Typography
																variant="body2"
																color="text.secondary"
																mt={1}
																style={{ color: "white" }}
															>
																<strong style={{ color: "white" }}>
																	Start at:
																</strong>{" "}
																{new Intl.DateTimeFormat("en-US", {
																	month: "short",
																	day: "2-digit",
																	year: "2-digit",
																	hour: "2-digit",
																	// minute: '2-digit',
																	hour12: true,
																}).format(new Date(post.StartTime))}
															</Typography>
														</CardContent>
													</Card>
												);
											})
										) : (
											<Paper
													elevation={24}
													sx={{
														p: 6,
														bgcolor: "#121212",
														display: "flex",
														flexDirection: "column",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<Box
														sx={{
															bgcolor: alpha("#f50057", 0.1),
															p: 2,
															borderRadius: "50%",
															mb: 3,
														}}
													>
														<CalendarToday
															sx={{
																width: 48,
																height: 48,
																color: "#f50057",
															}}
														/>
													</Box>
													<Typography
														variant="h5"
														sx={{
															fontWeight: "bold",
															color: "white",
															mb: 1,
															textShadow: "0 2px 4px rgba(0,0,0,0.5)",
														}}
													>
														No Events
													</Typography>
													<Typography
														variant="body1"
														sx={{
															color: alpha("#fff", 0.7),
															textAlign: "center",
															maxWidth: "md",
															textShadow: "0 1px 2px rgba(0,0,0,0.5)",
														}}
													>
														There are no events scheduled for{" "}
														{currentDate.toLocaleString("default", {
															month: "long",
															year: "numeric",
														})}
														. Check back later or try a different month.
													</Typography>
												</Paper>
										)}
									
									</Box>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				) : (
					<>
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

						<Box sx={{ color: "white", mt: 2 }}>
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
								Events
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 6,
								mt: 4,
							}}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 3,
									background:
										"linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
									p: "2px",
									borderRadius: 2,
								}}
							>
								<Box
									sx={{
										bgcolor: "#0A0A0A",
										px: 1,
										borderRadius: 1.5,
										display: "flex",
										alignItems: "center",
										gap: 2,
									}}
								>
									<Typography
										variant="h6"
										component="h1"
										sx={{
											background:
												"linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
											backgroundClip: "text",
											WebkitBackgroundClip: "text",
											color: "transparent",
											fontWeight: "bold",
										}}
									>
										{currentDate.toLocaleString("default", {
											month: "long",
											year: "numeric",
										})}
									</Typography>
									<Box sx={{ display: "flex", gap: 1 }}>
										<IconButton
											onClick={handlePreviousMonth}
											sx={{
												color: "#f50057",
												"&:hover": {
													bgcolor: alpha("#f50057", 0.1),
												},
											}}
										>
											<ChevronLeft />
										</IconButton>
										<IconButton
											onClick={handleNextMonth}
											sx={{
												color: "#f50057",
												"&:hover": {
													bgcolor: alpha("#f50057", 0.1),
												},
											}}
										>
											<ChevronRight />
										</IconButton>
									</Box>
								</Box>
							</Box>

							<Stack direction="row" spacing={1} alignItems="center">
								<Autocomplete
									id="location-autocomplete"
									open={openCity}
									onOpen={() => setOpenCity(true)}
									onClose={() => setOpenCity(false)}
									isOptionEqualToValue={(option, value) => option.City === value.City}
									getOptionLabel={(option) => option.City || ""}
									options={cityOption}
									loading={cityLoading}
									inputValue={cityInput}
									sx={{ width: 200 }}
									noOptionsText={
										<Typography sx={{ color: "white" }}>
											No options
										</Typography>
									}
									onInputChange={(event, newInputValue) => {
										if (event?.type === "change" || event?.type === "click")
											setCityInput(newInputValue);
									}}
									onChange={(event, newValue) => {
										console.log("newValue", newValue);
										if (newValue?.City) {
											// Filter events by city
											const filtered = events.filter((event: any) => 
												event.Venue?.toLowerCase().includes(newValue.City.toLowerCase())
											);
											
											const groupedAll = filtered.reduce((acc: { [key: string]: any[] }, event: any) => {
												const date = new Date();
												const dateKey = getProcessedDateKey(date);
												
												if (!acc[dateKey]) {
													acc[dateKey] = [];
												}
												acc[dateKey].push(event);
												return acc;
											}, {});

											setSortedEvents(filtered);
											setSearchStatus(true)
											setProcessedEvents(groupedAll);
											// Force mobile view when searching
											setViewType("list");
											
											// Log the changed processedEvents
											console.log("Filtered processedEvents:", groupedAll);
										} else {
											setSortedEvents(events);
											
											// Reset to original grouping by event dates
											const groupedAll = events.reduce((acc: { [key: string]: any[] }, event: any) => {
												const date = new Date(event.StartTime);
												const dateKey = getProcessedDateKey(date);
												
												if (!acc[dateKey]) {
													acc[dateKey] = [];
												}
												acc[dateKey].push(event);
												return acc;
											}, {});
											
											setProcessedEvents(groupedAll);
											
											// Log the reset processedEvents
											console.log("Reset processedEvents:", groupedAll);
										}
									}}
									ListboxProps={{
										sx: {
											backgroundColor: "#2a2a2a",
											color: "#fff",
											"& .MuiAutocomplete-option": {
												"&:hover": {
													backgroundColor: "rgba(245,0,87,0.08)",
												},
												'&[aria-selected="true"]': {
													backgroundColor: "rgba(245,0,87,0.16)",
												},
											},
										},
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											placeholder="Filter by city"
											InputProps={{
												...params.InputProps,
												endAdornment: (
													<>
														{cityLoading ? (
															<CircularProgress color="inherit" size={15} />
														) : null}
														{params.InputProps.endAdornment}
													</>
												),
												sx: {
													color: "white",
													"& .MuiOutlinedInput-notchedOutline": {
														borderColor: "rgba(255,255,255,0.23)",
													},
													"&:hover .MuiOutlinedInput-notchedOutline": {
														borderColor: "rgba(255,255,255,0.4)",
													},
													"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
														borderColor: "#f50057",
													},
												}
											}}
										/>
									)}
								/>
								{/* <Button
									startIcon={<SortIcon />}
									onClick={handleSortClick}
									sx={{
										color: "white",
										bgcolor: "rgba(255, 255, 255, 0.05)",
										"&:hover": {
											bgcolor: "rgba(255, 255, 255, 0.1)",
										},
										borderRadius: 2,
										px: 3,
										py: 1,
										transition: "all 0.3s ease",
									}}
								>
									Sort
								</Button>
								<Menu
									anchorEl={sortAnchorEl}
									open={Boolean(sortAnchorEl)}
									onClose={handleSortClose}
									PaperProps={{
										sx: {
											bgcolor: "#1A1A1A",
											color: "white",
											"& .MuiMenuItem-root": {
												"&:hover": {
													bgcolor: "rgba(245, 0, 87, 0.1)",
												},
											},
										},
									}}
								>
									<MenuItem
										onClick={() => handleSortSelect("recent")}
										selected={sortBy === "recent"}
									>
										Most Recent
									</MenuItem>
									<MenuItem
										onClick={() => handleSortSelect("location")}
										selected={sortBy === "location"}
									>
										By Location
									</MenuItem>
								</Menu> */}
								<Button
									startIcon={<CalendarToday />}
									onClick={() => setViewType("calendar")}
									sx={{
										color: viewType === "calendar" ? "white" : "#f50057",
										bgcolor:
											viewType === "calendar"
												? "#f50057"
												: "rgba(255, 255, 255, 0.05)",
										"&:hover": {
											bgcolor:
												viewType === "calendar"
													? "#c51162"
													: "rgba(255, 255, 255, 0.1)",
										},
										borderRadius: 2,
										px: 3,
										py: 1,
										transition: "all 0.3s ease",
									}}
								>
									Calendar
								</Button>
								<Button
									startIcon={<ViewList />}
									onClick={() => setViewType("list")}
									sx={{
										color: viewType === "list" ? "white" : "#f50057",
										bgcolor:
											viewType === "list"
												? "#f50057"
												: "rgba(255, 255, 255, 0.05)",
										"&:hover": {
											bgcolor:
												viewType === "list"
													? "#c51162"
													: "rgba(255, 255, 255, 0.1)",
										},
										borderRadius: 2,
										px: 3,
										py: 1,
										transition: "all 0.3s ease",
									}}
								>
									List
								</Button>
								<Button
									startIcon={<AddIcon />}
									onClick={() => {
										const token = localStorage.getItem("loginInfo");
										if (token) {
											const decodeToken = jwtDecode<any>(token);
											console.log("membership", decodeToken.membership);
											if (decodeToken?.membership === 0) {
												router.push("/membership");
											} else {
												router.push("/events/create");
											}
										} else {
											router.push("/login");
										}
									}}
									sx={{
										color: viewType === "calendar" ? "white" : "#f50057",
										bgcolor:
											viewType === "calendar"
												? "#f50057"
												: "rgba(255, 255, 255, 0.05)",
										"&:hover": {
											bgcolor:
												viewType === "calendar"
													? "#c51162"
													: "rgba(255, 255, 255, 0.1)",
										},
										borderRadius: 2,
										px: 3,
										py: 1,
										transition: "all 0.3s ease",
									}}
								>
									Create
								</Button>
							</Stack>
						</Box>

						{viewType === "calendar" ? (
							<Grid item xs={12}>
								<Paper
									elevation={24}
									sx={{
										p: 3,
										bgcolor: "#1E1E1E",
										borderRadius: 2,
									}}
								>
									{selectedDate && (
										<Box
											sx={{
												mb: 4,
												position: "relative",
												"&::before": {
													content: '""',
													position: "absolute",
													left: -24,
													top: 0,
													bottom: 0,
													width: 4,
													backgroundColor: "#f50057",
													borderRadius: 8,
												},
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 3,
													gap: 2,
												}}
											>
												<Box
													sx={{
														p: "1px",
														borderRadius: 2,
													}}
												>
													<Box
														sx={{
															bgcolor: "#1E1E1E",
															px: 2,
															borderRadius: 2,
														}}
													>
														<Typography
															variant="h6"
															sx={{
																background:
																	"linear-gradient(135deg, #f50057 0%, #ff4081 100%)",
																backgroundClip: "text",
																WebkitBackgroundClip: "text",
																color: "transparent",
																fontWeight: "bold",
															}}
														>
															{selectedDate.toLocaleDateString("en-US", {
																weekday: "long",
																month: "long",
																day: "numeric",
															})}
														</Typography>
													</Box>
												</Box>
												<Chip
													label={`There are ${
														processedEvents[getDateKey(selectedDate)]?.length ||
														0
													} Events`}
													sx={{
														bgcolor: alpha("#f50057", 0.1),
														color: "#f50057",
														border: "1px solid",
														fontWeight: "bold",
														borderColor: alpha("#f50057", 0.3),
														backdropFilter: "blur(4px)",
													}}
												/>
											</Box>

											<Stack spacing={2}>
												{processedEvents[getDateKey(selectedDate)]?.map(
													(event: any) => (
														<Paper
															key={event.Id}
															elevation={8}
															onClick={() =>
																router.push("/events/detail/" + event?.Id)
															}
															sx={{
																bgcolor: alpha("#1A1A1A", 0.6),
																backdropFilter: "blur(20px)",
																overflow: "hidden",
																cursor: "pointer",
																transition: "all 0.3s ease",
																borderRadius: 2,
																"&:hover": {
																	transform: "translateX(8px)",
																	bgcolor: alpha("#1A1A1A", 0.8),
																},
															}}
														>
															<Box sx={{ p: 2 }}>
																<Box
																	sx={{
																		display: "flex",
																		alignItems: "flex-start",
																		justifyContent: "space-between",
																		mb: 1,
																	}}
																>
																	<Typography
																		variant="subtitle1"
																		sx={{
																			color: "#fff",
																			fontWeight: "bold",
																			flex: 1,
																			mr: 2,
																		}}
																	>
																		{event.Name}
																	</Typography>
																	<Chip
																		size="small"
																		label={event.Category}
																		sx={{
																			bgcolor: alpha("#000", 0.3),
																			color: "#f50057",
																			border: "1px solid",
																			borderColor: alpha("#f50057", 0.3),
																			backdropFilter: "blur(4px)",
																			flexShrink: 0,
																		}}
																	/>
																</Box>
																<Box
																	sx={{
																		display: "flex",
																		alignItems: "center",
																		gap: 1,
																	}}
																>
																	<CalendarToday
																		sx={{
																			color: alpha("#fff", 0.5),
																			fontSize: 16,
																		}}
																	/>
																	<Typography
																		variant="body2"
																		sx={{
																			color: alpha("#fff", 0.7),
																		}}
																	>
																		{formatEventDate(event.StartTime)}
																	</Typography>
																</Box>
															</Box>
														</Paper>
													)
												)}
												{(!processedEvents[getDateKey(selectedDate)] ||
													processedEvents[getDateKey(selectedDate)].length ===
														0) && (
													<Box
														sx={{
															textAlign: "center",
															py: 6,
															px: 3,
															bgcolor: alpha("#1A1A1A", 0.3),
															borderRadius: 2,
															border: "1px dashed",
															borderColor: alpha("#fff", 0.1),
														}}
													>
														<Typography
															sx={{
																color: alpha("#fff", 0.5),
																mb: 1,
																fontWeight: "medium",
															}}
														>
															No events scheduled for this date
														</Typography>
														<Typography
															variant="body2"
															sx={{
																color: alpha("#fff", 0.3),
															}}
														>
															Select another date to view events
														</Typography>
													</Box>
												)}
											</Stack>
										</Box>
									)}

									{/* Calendar grid */}
									<Grid container spacing={1}>
										{getDaysInMonth(currentDate).map((day, index) => (
											<Grid item xs={12 / 7} key={index}>
												<Box
													onClick={() => handleDateChange(day.date)}
													sx={{
														p: 1,
														height: "120px",
														border: "1px solid",
														borderColor: alpha("#fff", 0.1),
														borderRadius: 2,
														cursor: "pointer",
														position: "relative",
														transition: "all 0.2s ease",
														...(selectedDate &&
															isSameDay(day.date, selectedDate) && {
																bgcolor: alpha("#f50057", 0.15),
															}),
														"&:hover": {
															bgcolor: alpha("#f50057", 0.1),
														},
													}}
												>
													<Typography
														sx={{
															color: day.isCurrentMonth
																? day.isToday
																	? "#f50057"
																	: "white"
																: alpha("#fff", 0.3),
															fontWeight: day.isToday ? "bold" : "normal",
															fontSize: "0.9rem",
															mb: 1,
														}}
													>
														{day.date.getDate()}
													</Typography>

													<Stack spacing={0.5}>
														{processedEvents[getDateKey(day.date)]
															?.slice(0, 2)
															.map((event: any, idx: number) => (
																<Box
																	key={idx}
																	sx={{
																		bgcolor: alpha("#f50057", 0.2),
																		p: 0.5,
																		borderRadius: 1,
																		fontSize: "0.75rem",
																		color: "#fff",
																		whiteSpace: "nowrap",
																		overflow: "hidden",
																		textOverflow: "ellipsis",
																	}}
																>
																	{event.Name}
																</Box>
															))}
														{(processedEvents[getDateKey(day.date)]?.length ||
															0) > 2 && (
															<Typography
																sx={{
																	color: alpha("#fff", 0.7),
																	fontSize: "0.75rem",
																	textAlign: "center",
																}}
															>
																+
																{processedEvents[getDateKey(day.date)].length -
																	2}{" "}
																more
															</Typography>
														)}
													</Stack>
												</Box>
											</Grid>
										))}
									</Grid>
								</Paper>
							</Grid>
						) : (
							<>
								<Grid container spacing={4}>
									{/* Calendar Grid */}
									<Grid item xs={12} md={4}>
										<Paper
											elevation={24}
											sx={{
												p: 3,
												bgcolor: "#1E1E1E",
												borderRadius: 2,
												transition: "transform 0.3s ease, box-shadow 0.3s ease",
											}}
										>
											<Grid container>
												{daysOfWeek.map((day) => (
													<Grid item xs={12 / 7} key={day}>
														<Typography
															align="center"
															sx={{
																color: alpha("#fff", 0.6),
																fontSize: "0.875rem",
																fontWeight: 600,
																mb: 2,
															}}
														>
															{day}
														</Typography>
													</Grid>
												))}

												{getDaysInMonth(currentDate).map((day, index) => {
													const hasEvents =
														processedEvents[getDateKey(day.date)]?.length > 0;
													const isSelected =
														selectedDate && isSameDay(day.date, selectedDate);

													return (
														<Grid item xs={12 / 7} key={index}>
															<Box
																onClick={() => handleDateChange(day.date)}
																sx={{
																	p: 1,
																	textAlign: "center",
																	position: "relative",
																	cursor: "pointer",
																	borderRadius: 2,
																	transition: "all 0.2s ease",
																	...(isSelected && {
																		bgcolor: alpha("#f50057", 0.15),
																		transform: "scale(1.1)",
																	}),
																	"&:hover": {
																		bgcolor: alpha("#f50057", 0.1),
																		transform: "scale(1.1)",
																	},
																}}
															>
																<Typography
																	sx={{
																		color: day.isCurrentMonth
																			? day.isToday
																				? "#f50057"
																				: "white"
																			: alpha("#fff", 0.3),
																		fontWeight: day.isToday ? "bold" : "normal",
																		fontSize: "0.9rem",
																		mb: 1,
																	}}
																>
																	{day.date.getDate()}
																</Typography>
																{hasEvents && (
																	<Box
																		sx={{
																			width: 6,
																			height: 6,
																			bgcolor: "#f50057",
																			borderRadius: "50%",
																			position: "absolute",
																			bottom: 4,
																			left: "50%",
																			transform: "translateX(-50%)",
																			boxShadow: "0 0 8px #f50057",
																		}}
																	/>
																)}
															</Box>
														</Grid>
													);
												})}
											</Grid>
										</Paper>
									</Grid>

									{/* Events List */}
									<Grid item xs={12} md={8}>
										<Stack spacing={3}>
											{currentMonthEvents.length > 0 ? (
												currentMonthEvents.map((event: any) => (
													<Paper
														key={event.Id}
														elevation={24}
														onClick={() =>
															router.push("/events/detail/" + event?.Id)
														}
														sx={{
															p: 0,
															bgcolor: alpha("#1A1A1A", 0.6),
															backdropFilter: "blur(20px)",
															overflow: "hidden",
															border: "#121212",
															cursor: "pointer",
															transition: "all 0.3s ease",
															"&:hover": {
																transform: "translateY(-8px)",
															},
														}}
													>
														<Box sx={{ position: "relative" }}>
															<img
																src={event.CoverImageUrl}
																alt={event.Name}
																style={{
																	width: "100%",
																	height: "280px",
																	objectFit: "cover",
																}}
															/>
															<Box
																sx={{
																	position: "absolute",
																	top: 16,
																	left: 16,
																	display: "flex",
																	gap: 1,
																}}
															>
																<Chip
																	label={event.Category}
																	size="small"
																	sx={{
																		bgcolor: alpha("#000", 0.7),
																		color: "#f50057",
																		border: "1px solid",
																		borderColor: alpha("#f50057", 0.3),
																		backdropFilter: "blur(4px)",
																	}}
																/>
															</Box>
															<Box
																sx={{
																	position: "absolute",
																	bottom: 0,
																	left: 0,
																	right: 0,
																	p: 3,
																	background:
																		"linear-gradient(transparent, rgba(0,0,0,0.9))",
																	backdropFilter: "blur(8px)",
																}}
															>
																<Typography
																	variant="h5"
																	sx={{
																		mb: 1,
																		fontWeight: "bold",
																		textShadow: "0 2px 4px rgba(0,0,0,0.5)",
																		color: "white",
																	}}
																>
																	{event.Name}
																</Typography>
																<Typography
																	variant="body1"
																	sx={{
																		color: alpha("#fff", 0.9),
																		textShadow: "0 1px 2px rgba(0,0,0,0.5)",
																	}}
																>
																	{formatEventDate(event.StartTime)}
																</Typography>
															</Box>
														</Box>
													</Paper>
												))
											) : (
												<Paper
													elevation={24}
													sx={{
														p: 6,
														bgcolor: "#121212",
														display: "flex",
														flexDirection: "column",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<Box
														sx={{
															bgcolor: alpha("#f50057", 0.1),
															p: 2,
															borderRadius: "50%",
															mb: 3,
														}}
													>
														<CalendarToday
															sx={{
																width: 48,
																height: 48,
																color: "#f50057",
															}}
														/>
													</Box>
													<Typography
														variant="h5"
														sx={{
															fontWeight: "bold",
															color: "white",
															mb: 1,
															textShadow: "0 2px 4px rgba(0,0,0,0.5)",
														}}
													>
														No Events Found
													</Typography>
													<Typography
														variant="body1"
														sx={{
															color: alpha("#fff", 0.7),
															textAlign: "center",
															maxWidth: "md",
															textShadow: "0 1px 2px rgba(0,0,0,0.5)",
														}}
													>
														There are no events scheduled for{" "}
														{currentDate.toLocaleString("default", {
															month: "long",
															year: "numeric",
														})}
														. Check back later or try a different month.
													</Typography>
												</Paper>
											)}
										</Stack>
									</Grid>
								</Grid>
							</>
						)}
					</>
				)}
			</Container>
			<Footer />
		</Box>
	);
}
