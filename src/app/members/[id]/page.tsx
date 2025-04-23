"use client";
import React from "react";
import {
	forwardRef,
	JSX,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";

import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	Paper,
	Radio,
	RadioGroup,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useMediaQuery,
} from "@mui/material";
import {
	Bedtime,
	Block,
	Close,
	FavoriteBorderOutlined,
	LocalBar,
	Minimize,
	MinimizeOutlined,
	MinimizeRounded,
} from "@mui/icons-material";
import DialogActions from "@mui/material/DialogActions";

export interface DetailViewHandle {
	open: (id: string) => void;
}

interface CompanyType {
	company_name: string;
	company_address: string;
	company_phone: string;
	company_url: string;
}

interface AdvertiserType {
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	status: string;
	companies: CompanyType;
	CreatedAt: string;
	Price: string;
	AccountType: string;
	Username: string;
	Avatar: string;
	Title: string;
}

interface OfferType {
	name: string;
}

interface ContractType {
	contract_id: number;
	contract_name: string;
	contract_term: string;
	budget_limit: number;
	created_date: string;
	start_date: string;
	end_date: string;
	payment_term: string;
	status: string;
	retainers: number;
	return_rate: number;
	advertisers: AdvertiserType;
	offer: OfferType[];
}
type Params = Promise<{ id: string }>;

const MemberProfile = (props: { params: Params }) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [advertiser, setAdvertiser] = useState<any>({});
	const [events, setEvents] = useState<any>([]);
	const [rsvp, setRsvp] = useState<any>([]);
	const [contract, setContract] = useState<ContractType[] | undefined>(
		undefined
	);
	const [selectedTab, setSelectedTab] = useState("All Events");
	const [grantOpen, setGrantOpen] = useState(false);
	const [privateOpen, setPrivateOpen] = useState(false);
	const [profileId, setProfileId] = useState<any>(); // Animation direction
	const [id, setId] = useState<string>(""); // State for error messages
	useEffect(() => {
		const getIdFromParam = async () => {
			const params = await props.params;
			const pid: any = params.id;
			console.log(pid);
			setId(pid);
		};
		getIdFromParam();
	}, [props]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setProfileId(localStorage.getItem("logged_in_profile"));
		}
	}, []);
	// Filtered events based on the tab
	const filteredEvents = selectedTab === "RSVP" ? [] : events;
	useEffect(() => {
		console.log(id, "=====in modal");
		if (id) {
			fetchData(id);
			handleGetProfileImages();
			const handleGetEvents = async () => {
				try {
					// Check if t
					// he username exists
					const checkResponse = await fetch("/api/user/sweeping/events", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					});

					const checkData = await checkResponse.json();
					setEvents(checkData?.events);
				} catch (error) {
					console.error("Error:", error);
				}
			};
			handleGetEvents();
			const handleGetRSVP = async () => {
				try {
					// Check if t
					// he username exists
					const checkResponse = await fetch(
						"/api/user/sweeping/rsvp?id=" + id,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
						}
					);

					const checkData = await checkResponse.json();
					setRsvp(checkData?.rsvp);
				} catch (error) {
					console.error("Error:", error);
				}
			};
			handleGetRSVP();
		}
	}, [id]);

	const [privateImages, setPrivateImages] = useState<any>([]);
	const [profileImages, setProfileImages] = useState<any>([]);
	const handleGetPrivateImages = async () => {
		try {
			// Check if t
			// he username exists
			const checkResponse = await fetch("/api/user/sweeping/images?id=" + id, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const checkData = await checkResponse.json();
			setPrivateImages(checkData?.images);
		} catch (error) {
			console.error("Error:", error);
		}
	};
	const handleAddFriend = async () => {
		try {
			// Check if the username exists
			const checkResponse = await fetch("/api/user/profile/friend", {
				method: "POST", // Change to POST method
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: profileId,
					targetId: id,
				}), // Send data in the body as JSON
			});

			const checkData = await checkResponse.json();
			setProfileImages(checkData?.images);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleBlockFriend = async () => {
		try {
			// Check if the username exists
			const checkResponse = await fetch("/api/user/profile/block", {
				method: "POST", // Change to POST method
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: profileId,
					targetId: id,
				}), // Send data in the body as JSON
			});

			const checkData = await checkResponse.json();
			setProfileImages(checkData?.images);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleGetProfileImages = async () => {
		try {
			// Check if t
			// he username exists
			const checkResponse = await fetch(
				"/api/user/sweeping/images/profile?id=" + id,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const checkData = await checkResponse.json();
			setProfileImages(checkData?.images);
		} catch (error) {
			console.error("Error:", error);
		}
	};
	const fetchData = async (userId: string) => {
		if (userId) {
			console.log(userId, "======userId in view");
			setLoading(true);
			try {
				// Fetch advertiser data using the custom API
				const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
				if (!response.ok) {
					console.error(
						"Failed to fetch advertiser data:",
						response.statusText
					);
					setAdvertiser(undefined);
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const { user: advertiserData } = await response.json();
				if (!advertiserData) {
					console.error("Advertiser not found");
					setAdvertiser(undefined);
				} else {
					console.log(advertiserData, "=========advertiser data");
					setAdvertiser(advertiserData);
					console.log(advertiserData.PartnerGender);
				}
			} catch (error: any) {
				console.error("Error fetching data:", error.message);
			} finally {
				setLoading(false);
			}
		}
	};

	const DateDifference = (createDate: string) => {
		const currentDate = new Date();
		const createdDate = new Date(createDate);

		const calculateDifference = (startDate: Date, endDate: Date) => {
			let years = endDate.getFullYear() - startDate.getFullYear();
			let months = endDate.getMonth() - startDate.getMonth();
			let days = endDate.getDate() - startDate.getDate();

			// Adjust the months and days if necessary
			if (days < 0) {
				months -= 1;
				days += new Date(
					endDate.getFullYear(),
					endDate.getMonth(),
					0
				).getDate(); // Get days in the previous month
			}

			if (months < 0) {
				years -= 1;
				months += 12; // Adjust to the previous year
			}

			return { years, months, days };
		};

		const { years, months, days } = calculateDifference(
			createdDate,
			currentDate
		);

		const output = [];

		if (years > 0) output.push(`${years} year${years > 1 ? "s" : ""}`);
		if (months > 0) output.push(`${months} month${months > 1 ? "s" : ""}`);
		if (days > 0) output.push(`${days} day${days > 1 ? "s" : ""}`);

		return output.length > 0 ? output.join(", ") + " ago" : "Today";
	};
	// const [selectedTab, setSelectedTab] = useState<any>("RSVP");

	// const handleTabChange = (event: any) => {
	//     setSelectedTab(event.target.value);
	// };

	// const handleGrantModal = () => {
	//     props.handleGrantAccess();
	//     setGrantOpen(false);
	// }
	const handleGrantAccess = async () => {
		try {
			const checkResponse = await fetch("/api/user/sweeping/grant", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ profileid: profileId, targetid: id }),
			});

			const checkData = await checkResponse.json();
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handlePrivateModal = () => {
		handleGetPrivateImages();
		setPrivateOpen(false);
	};

	return (
		<Box sx={{ position: "relative", background: "#121212" }}>
			{/* Banner Section */}
			<Box
				sx={{
					height: { lg: 450, sm: 200, xs: 200 },
					backgroundImage: `url(${advertiser?.ProfileBanner})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			></Box>

			{/* Avatar and Basic Info */}
			<Box sx={{ position: "relative", mt: -8, px: 3 }}>
				<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
					<Avatar
						src={advertiser?.Avatar}
						alt="user-avatar"
						sx={{
							width: 128,
							height: 128,
							border: "4px solid white",
							boxShadow: 2,
						}}
					/>
					<Box>
						<Chip
							label={advertiser?.AccountType}
							color="primary"
							size="small"
						/>
					</Box>
				</Box>
			</Box>

			{/* Content Section */}
			<CardContent>
				<Typography
					color="white"
					variant="h5"
					sx={{ fontWeight: "bold", marginLeft: "15px", marginBottom: "10px" }}
				>
					{advertiser.Username + " "}

					{advertiser?.DateOfBirth
						? new Date().getFullYear() -
						  new Date(advertiser.DateOfBirth).getFullYear()
						: ""}
					{advertiser?.Gender === "Male"
						? "M"
						: advertiser?.Gender === "Female"
						? "F"
						: ""}

					{advertiser?.PartnerDateOfBirth && (
						<>
							{" | "}
							{new Date().getFullYear() -
								new Date(advertiser.PartnerDateOfBirth).getFullYear()}
							{advertiser?.PartnerGender === "Male"
								? "M"
								: advertiser?.PartnerGender === "Female"
								? "F"
								: ""}
						</>
					)}
				</Typography>
				{/* <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
                    {advertiser.Username + " "}
                    
                    {advertiser?.DateOfBirth
                        ? new Date().getFullYear() - new Date(advertiser.DateOfBirth).getFullYear()
                        : ""}
                    {advertiser?.Gender === "Male"
                        ? "M"
                        : advertiser?.Gender === "Female"
                            ? "F"
                            : ""}

                    {advertiser?.PartnerDateOfBirth && (
                        <>
                            {" | "}
                            {new Date().getFullYear() - new Date(advertiser.PartnerDateOfBirth).getFullYear()}
                            {advertiser?.PartnerGender === "Male"
                                ? "M"
                                : advertiser?.PartnerGender === "Female"
                                    ? "F"
                                    : ""}
                        </>
                    )}
                </Typography>                          */}
				<Typography
					variant="subtitle1"
					color="white"
					sx={{ background: "#272525", padding: "15px", borderRadius: "10px" }}
				>
					{advertiser?.Tagline}
				</Typography>
				<Typography
					variant="subtitle1"
					sx={{ color: "#9c27b0", marginLeft: "15px", marginTop: "5px" }}
				>
					{advertiser?.Location?.replace(", USA", "")}
				</Typography>
				<Typography
					variant="subtitle1"
					sx={{ color: "white", marginTop: "30px" }}
				>
					{advertiser?.BodyType}
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexDirection: "row", // Keep in row for all screen sizes
						gap: 0.5, // Further reduce the gap between the boxes
						borderRadius: 2,
						marginBottom: 1,
					}}
				>
					{/* Box 1 */}
					<Button
						sx={{
							flex: 1, // Make the box flexible
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 0.5, // Reduce padding inside
							minWidth: "50px", // Further reduce box size
						}}
					>
						<FavoriteBorderOutlined fontSize="small" />
					</Button>

					{/* Box 2 */}
					<Button
						sx={{
							flex: 1, // Make the box flexible
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 0.5, // Reduce padding inside
							minWidth: "50px", // Further reduce box size
						}}
					>
						<LocalBar fontSize="small" />
					</Button>

					{/* Box 3 */}
					<Button
						sx={{
							flex: 1, // Make the box flexible
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 0.5, // Reduce padding inside
							minWidth: "50px", // Further reduce box size
						}}
					>
						<Bedtime fontSize="small" />
					</Button>

					{/* Box 4 */}
					<Button
						variant="contained"
						sx={{
							flex: 2, // Make the last box wider
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 0.5, // Reduce padding inside
							minWidth: "80px", // Further reduce box size for the button container
						}}
					>
						<span style={{ fontWeight: "bold", fontSize: "16px" }}>Chat</span>
					</Button>
				</Box>

				<Box
					sx={{
						display: "flex",
						gap: 1, // Reduce gap between boxes
						borderRadius: 2,
					}}
				>
					{/* Box 2 */}
					<Button
						onClick={handleBlockFriend}
						sx={{
							flex: 1, // Make box flexible
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 1, // Reduce padding inside the box
							minWidth: "50px", // Minimize box size
						}}
					>
						<Block fontSize="small" /> {/* Make icon smaller */}
					</Button>

					{/* Box 3 */}
					<Button
						onClick={handleAddFriend}
						variant="contained"
						sx={{
							flex: 2, // Keep this box wider
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 1, // Reduce padding inside the box
							minWidth: "80px", // Minimize box size for button container
						}}
					>
						<span style={{ fontWeight: "bold", fontSize: "16px" }}>Friend</span>
					</Button>

					{/* Box 4 */}
					<Button
						variant="contained"
						sx={{
							flex: 2, // Keep this box wider
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#555",
							color: "white",
							borderRadius: 1,
							padding: 1, // Reduce padding inside the box
							minWidth: "80px", // Minimize box size for button container
						}}
					>
						<span style={{ fontWeight: "bold", fontSize: "16px" }}>Mail</span>
					</Button>
				</Box>

				<Typography
					variant="subtitle1"
					sx={{ marginTop: "15px" }}
					color="white"
				>
					<strong>About:</strong>{" "}
					<span
						dangerouslySetInnerHTML={{
							__html: advertiser.About,
						}}
					/>
				</Typography>

				<Grid container spacing={3} mt={2}>
					{/* Right Column */}
					<Grid item xs={12} md={12}>
						<Box>
							<Typography variant="h6" fontWeight="bold" color="white">
								Details
							</Typography>
							<Divider sx={{ mb: 2 }} />
							<Table sx={{ borderRadius: 4, width: "30%" }}>
								<TableBody>
									<TableRow>
										<TableCell
											sx={{
												backgroundColor: "lightgray",
												width: "40%", // First cell takes 30% of the row
												whiteSpace: "nowrap", // Prevents text wrapping
											}}
										>
											<Typography variant="body2" color="white">
												Body Type:
											</Typography>
										</TableCell>
										<TableCell
											sx={{ backgroundColor: "darkgray", width: "60%" }}
										>
											<Typography color="white">
												{advertiser?.BodyType || "N/A"}
											</Typography>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell
											sx={{
												backgroundColor: "lightgray",
												width: "40%",
												whiteSpace: "nowrap",
											}}
										>
											<Typography variant="body2" color="white">
												Hair Color:
											</Typography>
										</TableCell>
										<TableCell
											sx={{ backgroundColor: "darkgray", width: "60%" }}
										>
											<Typography color="white">
												{advertiser?.HairColor || "N/A"}
											</Typography>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell
											sx={{
												backgroundColor: "lightgray",
												width: "40%",
												whiteSpace: "nowrap",
											}}
										>
											<Typography variant="body2" color="white">
												Eye Color:
											</Typography>
										</TableCell>
										<TableCell
											sx={{ backgroundColor: "darkgray", width: "60%" }}
										>
											<Typography color="white">
												{advertiser?.EyeColor || "N/A"}
											</Typography>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell
											sx={{
												backgroundColor: "lightgray",
												width: "40%",
												whiteSpace: "nowrap",
											}}
										>
											<Typography variant="body2" color="white">
												Miles:
											</Typography>
										</TableCell>
										<TableCell
											sx={{ backgroundColor: "darkgray", width: "60%" }}
										>
											<Typography color="white">
												{advertiser?.miles?.toFixed(2) || "N/A"}
											</Typography>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Box>
						{/* Partner Details Section */}
						{!advertiser?.PartnerGender ? (
							<Box mt={3}>
								<Typography variant="h6" fontWeight="bold" color="white">
									Partner Details
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Table sx={{ borderRadius: 4, width: "30%" }}>
									<TableBody>
										<TableRow>
											<TableCell
												sx={{
													backgroundColor: "lightgray",
													width: "40%", // First cell (label) width
													whiteSpace: "nowrap", // Prevents text wrapping
												}}
											>
												<Typography variant="body2" color="white">
													Age:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerAge || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												sx={{ backgroundColor: "lightgray", width: "40%" }}
											>
												<Typography variant="body2" color="white">
													Gender:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerGender || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												sx={{ backgroundColor: "lightgray", width: "40%" }}
											>
												<Typography variant="body2" color="white">
													Height:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerHeight || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												sx={{ backgroundColor: "lightgray", width: "40%" }}
											>
												<Typography variant="body2" color="white">
													Sexual Orientation:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerSexualOrientation || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												sx={{ backgroundColor: "lightgray", width: "40%" }}
											>
												<Typography variant="body2" color="white">
													Body Type:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerBodyType || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												sx={{ backgroundColor: "lightgray", width: "40%" }}
											>
												<Typography variant="body2" color="white">
													Eye Color:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerEyeColor || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												sx={{ backgroundColor: "lightgray", width: "40%" }}
											>
												<Typography variant="body2" color="white">
													Hair Color:
												</Typography>
											</TableCell>
											<TableCell
												sx={{ backgroundColor: "darkgray", width: "60%" }}
											>
												<Typography color="white">
													{advertiser?.PartnerHairColor || "N/A"}
												</Typography>
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</Box>
						) : null}
					</Grid>
				</Grid>
				<Box
					sx={{
						display: "flex",
						gap: 1, // Reduce the gap between buttons
						padding: 1, // Reduce padding inside the container
						borderRadius: 2,
						mt: 3,
					}}
				>
					{/* Button 1: Public Images */}
					<Button
						variant="contained"
						sx={{
							backgroundColor: "#c2185b", // Reddish color
							color: "white",
							fontSize: "0.75rem", // Smaller font size
							padding: "12px 12px", // Smaller padding
							flex: 1, // Equal width for all buttons
						}}
					>
						Public Images
					</Button>

					{/* Button 2: Grant Permission */}
					<Button
						onClick={() => setGrantOpen(true)}
						variant="contained"
						sx={{
							backgroundColor: "#c2185b", // Reddish color
							color: "white",
							fontSize: "0.75rem", // Smaller font size
							padding: "12px 12px", // Smaller padding
							flex: 1, // Equal width for all buttons
						}}
					>
						Grant Permission
					</Button>

					{/* Button 3: Private Images */}
					<Button
						onClick={() => {
							setPrivateOpen(true);
						}}
						variant="contained"
						sx={{
							backgroundColor: "#c2185b", // Reddish color
							color: "white",
							fontSize: "0.75rem", // Smaller font size
							padding: "12px 12px", // Smaller padding
							flex: 1, // Equal width for all buttons
						}}
					>
						Private Images
					</Button>
				</Box>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						padding: 2,
						bgcolor: "#1e1e1e",
						color: "white",
						borderRadius: 2,
						gap: 2,
					}}
				>
					{/* Title */}
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							color: "white",
							textAlign: "center",
							marginBottom: 2,
						}}
					>
						Profile Photos
					</Typography>

					{/* Photos Grid */}
					<Box
						sx={{
							display: "flex",
							gap: 1,
							flexWrap: "wrap", // Ensures photos wrap to the next row
							justifyContent: "center", // Centers the photos
						}}
					>
						{profileImages?.length > 0 ? (
							profileImages?.map((image: any, index: number) => (
								<Box
									key={index}
									sx={{
										width: 215,
										height: 280,
										borderRadius: 2,
										overflow: "hidden",
										boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
									}}
								>
									<img
										src={image?.Url}
										alt={`Profile Photo ${index + 1}`}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								</Box>
							))
						) : (
							<Typography
								variant="body2"
								sx={{
									color: "gray",
									textAlign: "center",
								}}
							>
								No photos available
							</Typography>
						)}
					</Box>
				</Box>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						padding: 2,
						borderRadius: 2,
						mt: 3,
						mb: 3,
						background: "white",
					}}
				>
					{/* Radio Tabs */}
					<RadioGroup
						row
						value={selectedTab}
						onChange={(e) => setSelectedTab(e.target.value)}
						sx={{
							display: "flex",
							justifyContent: "center", // Center the radio buttons horizontally
							gap: 3,
							alignItems: "center",
						}}
					>
						<FormControlLabel
							value="RSVP"
							control={<Radio />}
							label="RSVP"
							sx={{
								color: "black", // Label color explicitly set to black
								"& .MuiTypography-root": {
									// Ensures the text label color is black
									color: "black",
								},
								"& .MuiRadio-root": {
									color: "#c2185b", // Radio button color set to reddish
								},
							}}
						/>
						<FormControlLabel
							value="All Events"
							control={<Radio />}
							label="All Events"
							sx={{
								color: "black", // Label color explicitly set to black
								"& .MuiTypography-root": {
									// Ensures the text label color is black
									color: "black",
								},
								"& .MuiRadio-root": {
									color: "#c2185b", // Radio button color set to reddish
								},
							}}
						/>
					</RadioGroup>
				</Box>

				{/* Event Cards */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center", // Centers the content horizontally
						alignItems: "center", // Centers the content vertically
						flexWrap: "wrap", // Allows wrapping of cards if there are multiple
						gap: 2, // Spacing between the cards
					}}
				>
					{filteredEvents.length > 0 ? (
						filteredEvents.map((event: any) => (
							<Card
								key={event.Id}
								sx={{
									width: "320px", // Smaller card width
									borderRadius: 2,
									boxShadow: 3,
								}}
							>
								<CardMedia
									component="img"
									height="140"
									image={event.CoverImageUrl}
									alt={event.Name}
								/>
								<CardContent>
									<Typography variant="h6" component="div">
										{event.Name}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ marginTop: 2 }}
										dangerouslySetInnerHTML={{
											__html:
												event.Description.length > 300
													? `${event.Description.slice(0, 300)}...`
													: event.Description,
										}}
									/>
									<Typography variant="body2" color="text.secondary" mt={1}>
										<strong>Venue:</strong> {event.Venue}
									</Typography>
								</CardContent>
							</Card>
						))
					) : (
						<Grid container spacing={2} sx={{ marginTop: 2 }}>
							{rsvp?.length > 0 &&
								rsvp.map((item: any) => (
									<Grid item xs={12} sm={12} md={12} key={item.Id}>
										<Card>
											{/* Cover Image */}
											<CardMedia
												component="img"
												height="200"
												image={item.CoverImageUrl}
												alt={item.Name}
											/>

											{/* Card Content */}
											<CardContent>
												{/* Name */}
												<Typography variant="h6" component="div" gutterBottom>
													{item.Name}
												</Typography>

												{/* Tagline */}
												<Typography
													variant="body2"
													color="text.secondary"
													gutterBottom
												>
													{item.Tagline}
												</Typography>

												{/* Avatar and Username */}
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														marginTop: 1,
													}}
												>
													<Avatar
														src={item.Avatar}
														alt={item.Username}
														sx={{ marginRight: 1, width: 40, height: 40 }}
													/>
													<Typography variant="body1">
														{item.Username}
													</Typography>
												</Box>

												{/* Start and End Times */}
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ marginTop: 1 }}
												>
													<strong>Start:</strong>{" "}
													{new Date(item.StartTime).toLocaleString()}
													<br />
													<strong>End:</strong>{" "}
													{new Date(item.EndTime).toLocaleString()}
												</Typography>
											</CardContent>
										</Card>
									</Grid>
								))}
						</Grid>
					)}
				</Box>
			</CardContent>
		</Box>
	);
};

export default MemberProfile;
