"use client";
import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	Box,
	Button,
	Card,
	CardMedia,
	Chip,
	Container,
	Grid,
	IconButton,
	Paper,
	Typography,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	styled,
	createTheme,
	ThemeProvider,
	useMediaQuery,
	Divider,
	Checkbox,
	FormControlLabel,
	CircularProgress,
	Autocomplete,
	Avatar as ProfileAvatar,
} from "@mui/material";
import {
	Edit as EditIcon,
	LocationOn,
	Add as AddIcon,
	Public,
	Lock,
	Delete as DeleteIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
	Logout,
	Close,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft } from "lucide-react";
import { RIGHT } from "react-swipeable";

interface SwingStyles {
	exploring: boolean;
	fullSwap: boolean;
	softSwap: boolean;
	voyeur: boolean;
}

interface ValidationErrors {
	[key: string]: string;
}

interface ValidatorRules {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	min?: number;
	max?: number;
}

interface ProfileData {
	coverImage: string;
	Avatar: string;
	username: string;
	gender: string;
	age: number;
	address: string;
	tagline: string;
	swingStyle: string;
	about: string;
	accountType: string;
	bodyType: string;
	hairColor: string;
	eyeColor: string;
	distance: string;
	publicImages: string[];
	privateImages: string[];
	swingStyles: SwingStyles;
	orientation: string;
}

interface ImagePreview {
	id: string;
	url: string;
	file: File;
	isUploading: boolean;
}

interface UpdateProfileData {
	ProfileId: string;
	Username: string;
	Age: number;
	PartnerAge: null;
	Gender: string;
	PartnerGender: string;
	Location: string;
	Tagline: string;
	About: string;
	BodyType: string;
	PartnerBodyType: string;
	HairColor: string;
	PartnerHairColor: string;
	EyeColor: string;
	PartnerEyeColor: string;
	AccountType: string;
	ProfileBanner?: string;
	SwingStyle: any;
	Avatar?: string;
	Orientation?: string;
	PartnerSexualOrientation?: string;
	ProfileImages?: (string | null)[];
	PrivateImages?: (string | null)[]; // Add this
}

const BODY_TYPES = [
	"Average",
	"Slim/Petite",
	"Ample",
	"Athletic",
	"BBW/BBM",
	"A little extra padding",
];

const EYE_COLORS = ["Gray", "Brown", "Black", "Green", "Blue", "Hazel"];

const HAIR_COLORS = [
	"Platinum Blonde",
	"Other",
	"Silver",
	"Hair? What Hair?",
	"Red/Auburn",
	"Grey",
	"White",
	"Blonde",
	"Salt and pepper",
	"Brown",
	"Black",
];

const ORIENTATIONS = ["Straight", "Bi", "Bi-curious", "Open minded"];

const StyledCard = styled(motion(Card))(({ theme }) => ({
	position: "relative",
	borderTopLeftRadius: theme.spacing(2),
	borderTopRightRadius: theme.spacing(2),
	overflow: "visible",
}));

const CoverImage = styled(CardMedia)(({ theme }) => ({
	height: 400,
	position: "relative",
	borderTopLeftRadius: "24px",
	borderTopRightRadius: "24px",
	"&::after": {
		content: '""',
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background:
			"linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
	},
}));

const Avatar = styled(motion.div)(({ theme }) => ({
	width: 140,
	height: 140,
	borderRadius: "50%",
	position: "absolute",
	bottom: -90,
	left: theme.spacing(4),
	border: `4px solid ${theme.palette.background.paper}`,
	overflow: "hidden",
	cursor: "pointer",
	boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
	"&:hover": {
		transform: "scale(1.05)",
		transition: "transform 0.3s ease",
	},
}));

const TopActions = styled(Box)(({ theme }) => ({
	position: "absolute",
	top: theme.spacing(2),
	right: theme.spacing(2),
	display: "flex",
	gap: theme.spacing(1),
}));

// Create a custom theme
const theme = createTheme({
	palette: {
		primary: {
			main: "#FF2D55",
			light: "#FF647F",
			dark: "#CC243F",
		},
		secondary: {
			main: "#2D55FF",
			light: "#647FFF",
			dark: "#243FCC",
		},
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 700,
			fontSize: "2rem",
			color: "white",
		},
		h6: {
			fontWeight: 600,
			color: "#C2185B",
		},
		subtitle1: {
			color: "white",
		},
		subtitle2: {
			color: "white",
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "12px",
					textTransform: "none",
					fontWeight: 600,
					boxShadow: "none",
					"&:hover": {
						boxShadow: "0 4px 12px rgba(255, 45, 85, 0.2)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: "16px",
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: "12px",
						"&:hover fieldset": {
							borderColor: "#FF2D55",
						},
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: "8px",
					height: "28px",
				},
			},
		},
	},
});

const StyledTopButton = styled(Button)(({ theme }) => ({
	backgroundColor: "rgba(255, 255, 255, 0.9)",
	color: theme.palette.primary.main,
	backdropFilter: "blur(10px)",
	"&:hover": {
		backgroundColor: "rgba(255, 255, 255, 1)",
	},
}));

const ProfileDetail: React.FC = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState<any>({});
	const [loading, setLoading] = useState(true);
	const [advertiser, setAdvertiser] = useState<any>({});
	const [profileImages, setProfileImages] = useState<any>([]);
	const [privateImages, setPrivateImages] = useState<any>([]);
	const [profileId, setProfileId] = useState<any>();
	const [enableNotifications, setEnableNotifications] = useState(false);
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [pCurrentAge, setPCurrentAge] = useState<string>("");
	const [currentAge, setCurrentAge] = useState<string>("");
	const [membership, setMembership] = useState<any>();
	const [membership1, setMembership1] = useState<any>();
	const [cityLoading, setCityLoading] = useState(false);
	const [openCity, setOpenCity] = useState(false);
	const [cityOption, setCityOption] = useState<any>([]);
	const [cityInput, setCityInput] = useState<string>("");
	const [previewImages, setPreviewImages] = useState<{
		banner: any | null;
		avatar: any | null;
	}>({
		banner: null,
		avatar: null,
	});
	const [imageErrors, setImageErrors] = useState<{
		public: string[];
		private: string[];
	}>({
		public: [],
		private: [],
	});
	const [publicImagePreviews, setPublicImagePreviews] = useState<
		ImagePreview[]
	>([]);
	const [privateImagePreviews, setPrivateImagePreviews] = useState<
		ImagePreview[]
	>([]);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;

	const router = useRouter();

	const validationRules = {
		Username: {
			required: true,
			minLength: 2,
			maxLength: 50,
		},
		Age: {
			required: true,
			min: 18,
			max: 100,
		},
		Gender: {
			required: true,
		},
		AccountType: {
			required: true,
		},
		Location: {
			required: true,
			minLength: 5,
		},
		Tagline: {
			required: true,
			maxLength: 150,
		},
		About: {
			required: true,
			minLength: 10,
			maxLength: 1000,
		},
		BodyType: {
			required: true,
		},
		HairColor: {
			required: true, // Add HairColor validation
		},
		EyeColor: {
			required: true, // Add EyeColor validation
		},
		SexualOrientation: {
			required: true, // Add Orientation validation
		},
		PartnerAge: {
			required: true,
			min: 18,
			max: 100,
		},
		PartnerGender: {
			required: true,
		},
	};

	const validateImage = (file: File) => {
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

		if (!allowedTypes.includes(file.type)) {
			return "Only JPG, JPEG, and PNG files are allowed";
		}

		if (file.size > maxSize) {
			return "Image size should be less than 5MB";
		}

		return "";
	};

	const handleImageDelete = async (
		imageId: string,
		type: "public" | "private"
	) => {
		try {
			console.log(imageId);

			if (type === "public") {
				const response = await fetch(
					"api/user/profile/update/images/public/delete",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							profileId: profileId,
							imageId: imageId,
						}),
					}
				);

				const data = await response.json();
				if (data.status === 200) {
					// Update the local state for public images and previews
					setProfileImages((prev: any) =>
						prev.filter((image: any) => image.Id !== imageId)
					);
					setPublicImagePreviews((prev: ImagePreview[]) =>
						prev.filter((preview) => preview.id !== imageId)
					);
				} else {
					console.log(data.status);
				}
			} else {
				const response = await fetch(
					"api/user/profile/update/images/private/delete",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							profileId: profileId,
							imageId: imageId,
						}),
					}
				);

				const data = await response.json();
				if (data.status === 200) {
					// Update the local state for private images and previews
					setPrivateImages((prev: any) =>
						prev.filter((image: any) => image.Id !== imageId)
					);
					setPrivateImagePreviews((prev: ImagePreview[]) =>
						prev.filter((preview) => preview.id !== imageId)
					);
				} else {
					console.log(data.status);
				}
			}
		} catch (error) {
			console.error("Error deleting image:", error);
			alert("Failed to delete image");
		}
	};

	const uploadImage = async (file: File): Promise<string> => {
		try {
			const formData = new FormData();
			formData.append("image", file);

			console.log(file);
			console.log("image is uploading...");

			const response = await fetch("/api/user/upload", {
				method: "POST",
				body: formData,
			});

			console.log(response);
			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const data = await response.json();
			console.log(data);
			return data?.blobUrl;
		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("logged_in_profile");
		localStorage.removeItem("loginInfo");
		localStorage.removeItem("memberalarm");
		router.push("/login");
	};

	const handleAvailable = async () => {
		const response = await fetch("/api/user/availabe", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				profileId: profileId,
			}),
		});

		const data = await response.json();

		if (data.status == 200) {
			console.log("success");
		} else {
			console.log("success");
		}
	};

	const uploadImagesSequentially = async (
		images: File[]
	): Promise<(string | null)[]> => {
		const results: (string | null)[] = [];

		for (const image of images) {
			const result = await uploadImage(image); // Wait for each upload to finish
			console.log(image);
			results.push(result);
		}
		return results;
	};

	const handleImageAdd = async (
		event: React.ChangeEvent<HTMLInputElement>,
		type: "public" | "private"
	) => {
		const files = event.target.files;
		if (!files?.length) return;

		const file = files[0];
		const error = validateImage(file);

		if (error) {
			setImageErrors((prev) => ({
				...prev,
				[type]: [...prev[type], error],
			}));
			return;
		}

		console.log(files);

		// Create temporary preview
		const tempId = `temp-${Date.now()}`;
		const preview: ImagePreview = {
			id: tempId,
			url: URL.createObjectURL(file),
			file: file,
			isUploading: false,
		};

		// Update preview state
		if (type === "public") {
			setPublicImagePreviews((prev) => [...prev, preview]);
		} else {
			setPrivateImagePreviews((prev) => [...prev, preview]);
		}

		try {
			const uploadURL = await uploadImage(file);

			if (type === "public") {
				const response = await fetch(
					"api/user/profile/update/images/public/insert",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							profileId: profileId,
							imageURL: uploadURL,
						}),
					}
				);

				const data = await response.json();
				if (data.status == 200) {
					setProfileImages((prev: any) => [
						...prev,
						{ Id: tempId, Url: uploadURL }, // Assuming your backend returns an image object with `Id` and `Url`
					]);
					setPublicImagePreviews((prev) =>
						prev.filter((preview) => preview.id !== tempId)
					);
				} else {
					console.log(data.status);
				}
			} else {
				const response = await fetch(
					"api/user/profile/update/images/private/insert",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							profileId: profileId,
							imageURL: uploadURL,
						}),
					}
				);

				const data = await response.json();
				if (data.status == 200) {
					setPrivateImages((prev: any) => [
						...prev,
						{ Id: tempId, Url: uploadURL }, // Assuming your backend returns an image object with `Id` and `Url`
					]);
					setPrivateImagePreviews((prev) =>
						prev.filter((preview) => preview.id !== tempId)
					);
				} else {
					console.log(data.status);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Validation function
	const validateField = (
		name: string,
		value: any,
		rules: ValidatorRules,
		context?: any
	): string => {
		if (!value && value !== 0) value = ""; // Handle null/undefined values

		// Partner fields validation should only happen if AccountType is "Couple"
		if (name.startsWith("Partner")) {
			if (context?.AccountType === "Couple") {
				// Validate partner fields for couples
				if (rules.required && (!value || value.toString().trim() === "")) {
					return `${name} is required for couples`;
				}
			} else {
				return ""; // Skip validation for partner fields if not a couple
			}
		} else {
			// Non-partner fields validation
			if (rules.required && (!value || value.toString().trim() === "")) {
				return `${name} is required`;
			}
		}

		if (rules.min && Number(value) < rules.min) {
			return `${name} must be at least ${rules.min}`;
		}

		if (rules.max && Number(value) > rules.max) {
			return `${name} cannot exceed ${rules.max}`;
		}

		return "";
	};

	const handleImageClick = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setIsModalOpen(true);
	};

	const renderImageSection = (type: "public" | "private") => {
		const images = type === "public" ? profileImages : privateImages;
		const previews =
			type === "public" ? publicImagePreviews : privateImagePreviews;
		const maxImages = 15;
		const currentCount = (images?.length || 0) + previews.length;

		return (
			<>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						padding: 2,
						color: "white",
						borderRadius: 2,
						gap: 2,
						width: "100%",
						overflowX: "auto",
					}}
				>
					<Typography
						sx={{
							marginTop: 2,
							color: "white",
							textAlign: "center",
							marginBottom: 2,
						}}
					>
						{type === "public"
							? "Public Images (Available to Everyone)"
							: "Private Images (Only for those you authorize)"}
					</Typography>

					{imageErrors[type].length > 0 && (
						<Typography color="error" sx={{ mb: 2 }}>
							{imageErrors[type].join(", ")}
						</Typography>
					)}

					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: {
								xs: 2,
							},
							width: "100%",
							flexWrap: "nowrap",
							overflowX: "auto",
						}}
					>
						{/* Render existing images */}
						{images?.map((image: any, index: any) => (
							<Box
								key={image.Id}
								sx={{
									position: "relative",
									flexShrink: 0,
									width: {
										xs: "40px",
										sm: "50px",
										md: "75px",
										lg: "200px",
									},
									height: {
										xs: "40px",
										sm: "50px",
										md: "75px",
										lg: "200px",
									},
									borderRadius: 2,
									overflow: "hidden",
									boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
									cursor: "pointer",
								}}
								onClick={() => handleImageClick(image.Url)}
							>
								<img
									src={image.Url}
									alt={`${type} Photo ${index + 1}`}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										display: "block",
									}}
								/>
								{isEditing && (
									<IconButton
										onClick={(e) => {
											e.stopPropagation();
											handleImageDelete(image.Id, type);
										}}
										sx={{
											position: "absolute",
											top: 8,
											right: 8,
											backgroundColor: "rgba(0,0,0,0.5)",
											"&:hover": {
												backgroundColor: "rgba(0,0,0,0.7)",
											},
										}}
									>
										<DeleteIcon sx={{ color: "white" }} />
									</IconButton>
								)}
							</Box>
						))}

						{/* Render preview images */}
						{previews.map((preview) => (
							<Box
								key={preview.id}
								sx={{
									position: "relative",
									flexShrink: 0,
									width: {
										xs: "40px",
										sm: "50px",
										md: "75px",
										lg: "200px",
									},
									height: {
										xs: "40px",
										sm: "50px",
										md: "75px",
										lg: "200px",
									},
									borderRadius: 2,
									overflow: "hidden",
									boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
									opacity: preview.isUploading ? 0.7 : 1,
									cursor: "pointer",
								}}
								onClick={() => handleImageClick(preview.url)}
							>
								<img
									src={preview.url}
									alt="Preview"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										display: "block",
									}}
								/>
								{preview.isUploading && (
									<Box
										sx={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											backgroundColor: "rgba(0,0,0,0.3)",
										}}
									>
										<CircularProgress size={24} />
									</Box>
								)}
							</Box>
						))}

						{/* Add button */}
						{isEditing && currentCount < maxImages && (
							<Box
								sx={{
									position: "relative",
									flexShrink: 0,
									width: {
										xs: "40px",
										sm: "50px",
										md: "75px",
										lg: "200px",
									},
									height: {
										xs: "40px",
										sm: "50px",
										md: "75px",
										lg: "200px",
									},
									borderRadius: 2,
									border: "2px dashed rgba(255,255,255,0.2)",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<label htmlFor={`image-upload-${type}`}>
									<input
										type="file"
										id={`image-upload-${type}`}
										hidden
										accept="image/*"
										onChange={(e) => handleImageAdd(e, type)}
									/>
									<IconButton
										component="span"
										sx={{
											backgroundColor: "rgba(255,255,255,0.1)",
											"&:hover": {
												backgroundColor: "rgba(255,255,255,0.2)",
											},
										}}
									>
										<AddIcon sx={{ color: "white" }} />
									</IconButton>
								</label>
							</Box>
						)}
					</Box>
				</Box>

				{/* Image Modal */}
				<Dialog
					open={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					maxWidth="lg"
					fullWidth
				>
					<DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<img
							src={selectedImage || ''}
							alt="Enlarged view"
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
						onClick={() => setIsModalOpen(false)}
					>
						<Close />
					</IconButton>
				</Dialog>
			</>
		);
	};

	const fetchData = async (userId: string) => {
		if (userId) {
			setLoading(true);
			try {
				const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
				if (!response.ok) {
					console.error(
						"Failed to fetch advertiser data:",
						response.statusText
					);
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const { user: advertiserData } = await response.json();

				console.log("here is the data: ", advertiserData);
				if (!advertiserData) {
					console.error("Advertiser not found");
				} else {
					console.log(advertiserData);

					// Convert the calculated age to string before setting state
					const userAge = (
						new Date().getFullYear() -
						new Date(advertiserData?.DateOfBirth).getFullYear()
					).toString();

					setCurrentAge(userAge);

					// Handle partner age if exists
					if (advertiserData.PartnerDateOfBirth) {
						const partnerAge = (
							new Date().getFullYear() -
							new Date(advertiserData.PartnerDateOfBirth).getFullYear()
						).toString();
						setPCurrentAge(partnerAge);
					}

					setAdvertiser(advertiserData);
					setEditedData(advertiserData);
				}
			} catch (error: any) {
				console.error("Error fetching data:", error.message);
			} finally {
				setLoading(false);
			}
		}
	};

	const getProfileImages = async (userId: string) => {
		try {
			const checkResponse = await fetch(
				"/api/user/sweeping/images/profile?id=" + userId,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const checkData = await checkResponse.json();
			setProfileImages(checkData?.images);
			console.log(checkData?.images);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const getPrivateImages = async (userId: string) => {
		try {
			const checkResponse = await fetch(
				"/api/user/sweeping/images?id=" + userId,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const checkData = await checkResponse.json();
			setPrivateImages(checkData?.images);
			console.log(checkData?.images);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleEditToggle = () => {
		if (isEditing) {
			setEditedData(null);
			setPreviewImages({
				banner: null,
				avatar: null,
			});
		} else {
			setEditedData({
				...advertiser, // Copy all existing data
				Location: advertiser?.Location || "",
				Tagline: advertiser?.Tagline || "", // Ensure Tagline is explicitly set
				swingStyles: {
					exploring: advertiser?.SwingStyleTags?.includes("exploring") || false,
					fullSwap: advertiser?.SwingStyleTags?.includes("fullSwap") || false,
					softSwap: advertiser?.SwingStyleTags?.includes("softSwap") || false,
					voyeur: advertiser?.SwingStyleTags?.includes("voyeur") || false,
				}, // Map SwingStyleTags to an object
			});
			// Set the city input for the Autocomplete
			setCityInput(advertiser?.Location?.replace(", USA", "") || "");
		}
		setIsEditing(!isEditing);
	};

	const handleSave = async () => {
		setIsSubmitting(true);
		const newErrors: ValidationErrors = {};

		// Validate fields based on account type
		Object.entries(validationRules).forEach(([fieldName, rules]) => {
			let fieldValue;

			if (fieldName === "Age") {
				fieldValue = currentAge;
			} else if (fieldName === "PartnerAge") {
				fieldValue = editedData.AccountType === "Couple" ? pCurrentAge : "";
			} else {
				fieldValue = editedData[fieldName as keyof ProfileData];
			}

			const error = validateField(fieldName, fieldValue, rules, {
				AccountType: editedData.AccountType,
			});

			if (error) {
				newErrors[fieldName] = error;
			}
		});

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			setIsSubmitting(false);
			console.log("Validation errors:", newErrors);
			return;
		}

		try {
			const baseProfileData = {
				ProfileId: profileId,
				Username: editedData.Username || advertiser.Username,
				Age: currentAge || advertiser.Age,
				Gender: editedData.Gender || advertiser.Gender,
				Location: editedData.Location || advertiser.Location,
				Tagline: editedData.Tagline || advertiser.Tagline,
				About: editedData.About || advertiser.About,
				BodyType: editedData.BodyType || advertiser.BodyType,
				HairColor: editedData.HairColor || advertiser.HairColor,
				EyeColor: editedData.EyeColor || advertiser.EyeColor,
				AccountType: editedData.AccountType || advertiser.AccountType,
				Orientation:
					editedData.SexualOrientation || advertiser.SexualOrientation,
				SwingStyle: editedData?.swingStyles || advertiser.swingStyle,
			};

			let updatedProfileData: UpdateProfileData;

			if (editedData.AccountType === "Couple") {
				updatedProfileData = {
					...baseProfileData,
					PartnerAge: pCurrentAge || advertiser.PartnerAge,
					PartnerGender: editedData?.PartnerGender || advertiser.PartnerGender,
					PartnerBodyType:
						editedData?.PartnerBodyType || advertiser.PartnerBodyType,
					PartnerHairColor:
						editedData?.PartnerHairColor || advertiser.PartnerHairColor,
					PartnerEyeColor:
						editedData?.PartnerEyeColor || advertiser.PartnerEyeColor,
					PartnerSexualOrientation:
						editedData?.PartnerSexualOrientation ||
						advertiser.PartnerSexualOrientation,
				};
			} else {
				updatedProfileData = {
					...baseProfileData,
					PartnerAge: null,
					PartnerGender: "",
					PartnerBodyType: "",
					PartnerHairColor: "",
					PartnerEyeColor: "",
					PartnerSexualOrientation: "",
				};
			}

			console.log(updatedProfileData);
			console.log(previewImages);

			// Handle image uploads if needed
			if (previewImages.banner) {
				const bannerFile = editedData.ProfileBanner;
				console.log(previewImages.banner);
				const bannerUrl = await uploadImage(bannerFile);
				updatedProfileData.ProfileBanner = bannerUrl;
			}

			if (previewImages.avatar) {
				const avatarFile = editedData.Avatar;
				console.log(previewImages.avatar);
				const avatarUrl = await uploadImage(avatarFile);
				updatedProfileData.Avatar = avatarUrl;
			}

			console.log(publicImagePreviews);
			// Handle public/private images
			if (publicImagePreviews.length > 0) {
				const publicFiles = publicImagePreviews.map((preview) => preview.file);
				console.log(publicFiles);
				const publicUrls = await uploadImagesSequentially(publicFiles);
				console.log(publicUrls);
				updatedProfileData.ProfileImages = publicUrls;
			}

			if (privateImagePreviews.length > 0) {
				const privateFiles = privateImagePreviews.map(
					(preview) => preview.file
				);
				console.log(privateFiles);
				const privateUrls = await uploadImagesSequentially(privateFiles);
				console.log(privateUrls);
				updatedProfileData.PrivateImages = privateUrls;
			}

			console.log("payloaddata", updatedProfileData);

			// Update profile with complete data
			const response = await fetch("/api/user/profile/update/details", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedProfileData),
			});

			if (!response.ok) {
				throw new Error("Failed to update profile");
			}

			const reuslt = await response.json();
			console.log(reuslt);

			// Update local state
			setAdvertiser(updatedProfileData);
			setPreviewImages({
				banner: null,
				avatar: null,
			});
			setPublicImagePreviews([]);
			setPrivateImagePreviews([]);
			setIsEditing(false);
			window.location.reload();
			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Error saving profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: string, value: any) => {
		if (field === "AccountType") {
			if (value !== "Couple") {
				// Clear partner-related fields when switching to non-couple
				setPCurrentAge("");
				setEditedData((prev: any) => ({
					...prev,
					AccountType: value,
					PartnerAge: "",
					PartnerGender: "",
					PartnerBodyType: "",
					PartnerHairColor: "",
					PartnerEyeColor: "",
					PartnerSexualOrientation: "",
				}));
			} else {
				setEditedData((prev: any) => ({
					...prev,
					AccountType: value,
				}));
			}
		} else if (field === "Age") {
			setCurrentAge(value);
			setEditedData((prev: any) => ({
				...prev,
				Age: value,
			}));
		} else if (field === "PartnerAge") {
			setPCurrentAge(value);
			setEditedData((prev: any) => ({
				...prev,
				PartnerAge: value,
			}));
		} else {
			setEditedData((prev: any) => ({
				...prev,
				[field]: value,
			}));
		}
	};

	const renderDetailsGrid = () => {
		return (
			<Box>
				<Grid container spacing={4}>
					<Grid item xs={6} sm={3}>
						{isEditing ? (
							<FormControl fullWidth error={!!errors.BodyType}>
								<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
									Body Type
								</InputLabel>
								<Select
									value={editedData?.BodyType || ""}
									onChange={(e) =>
										handleInputChange("BodyType", e.target.value)
									}
									label="Body Type"
									required
									disabled={isSubmitting}
									sx={{
										color: "white",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255,255,255,0.23)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "white",
										},
									}}
								>
									{BODY_TYPES.map((type) => (
										<MenuItem key={type} value={type} sx={{ color: "white" }}>
											{type}
										</MenuItem>
									))}
								</Select>
								<Typography
									sx={{
										color: "#d32f2f",
										mb: 1,
										fontSize: "0.75rem",
										marginLeft: "14px",
									}}
								>
									{errors.BodyType}
								</Typography>
							</FormControl>
						) : (
							<>
								<Typography
									sx={{
										color: "#e91e63",
										fontSize: "0.875rem",
										mb: 1,
										fontWeight: "bold",
									}}
								>
									Body Type
								</Typography>
								<Typography sx={{ color: "white", fontSize: "1rem" }}>
									{advertiser?.BodyType || "No display data"}
								</Typography>
							</>
						)}
					</Grid>

					<Grid item xs={6} sm={3}>
						{isEditing ? (
							<FormControl fullWidth error={!!errors.HairColor}>
								<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
									Hair Color
								</InputLabel>
								<Select
									value={editedData?.HairColor || ""}
									onChange={(e) =>
										handleInputChange("HairColor", e.target.value)
									}
									label="Hair Color"
									required
									disabled={isSubmitting}
									sx={{
										color: "white",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255,255,255,0.23)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "white",
										},
									}}
								>
									{HAIR_COLORS.map((color) => (
										<MenuItem key={color} value={color} sx={{ color: "white" }}>
											{color}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						) : (
							<>
								<Typography
									sx={{
										color: "#e91e63",
										fontSize: "0.875rem",
										mb: 1,
										fontWeight: "bold",
									}}
								>
									Hair Color
								</Typography>
								<Typography sx={{ color: "white", fontSize: "1rem" }}>
									{advertiser?.HairColor || "No display data"}
								</Typography>
							</>
						)}
						<Typography
							sx={{
								color: "#d32f2f",
								mb: 1,
								fontSize: "0.75rem",
								marginLeft: "14px",
							}}
						>
							{errors.HairColor}
						</Typography>
					</Grid>

					<Grid item xs={6} sm={3}>
						{isEditing ? (
							<FormControl fullWidth error={!!errors.EyeColor}>
								<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
									Eye Color
								</InputLabel>
								<Select
									value={editedData?.EyeColor || ""}
									onChange={(e) =>
										handleInputChange("EyeColor", e.target.value)
									}
									label="Eye Color"
									required
									disabled={isSubmitting}
									sx={{
										color: "white",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255,255,255,0.23)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "white",
										},
										".MuiMenuItem-root": {
											color: "white", // Optional: Change the font color for dropdown menu items
										},
									}}
								>
									{EYE_COLORS.map((color) => (
										<MenuItem key={color} value={color} sx={{ color: "white" }}>
											{color}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						) : (
							<>
								<Typography
									sx={{
										color: "#e91e63",
										fontSize: "0.875rem",
										mb: 1,
										fontWeight: "bold",
									}}
								>
									Eye Color
								</Typography>
								<Typography sx={{ color: "white", fontSize: "1rem" }}>
									{advertiser?.EyeColor || "No display data"}
								</Typography>
							</>
						)}
					</Grid>

					<Grid item xs={6} sm={3}>
						{isEditing ? (
							<FormControl fullWidth error={!!errors.SexualOrientation}>
								<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
									Orientation
								</InputLabel>
								<Select
									value={editedData?.SexualOrientation || ""}
									onChange={(e) =>
										handleInputChange("SexualOrientation", e.target.value)
									}
									required
									disabled={isSubmitting}
									label="SexualOrientation"
									sx={{
										color: "white",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255,255,255,0.23)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "white",
										},
									}}
								>
									{ORIENTATIONS.map((orientation) => (
										<MenuItem
											key={orientation}
											value={orientation}
											sx={{ color: "white" }}
										>
											{orientation}
										</MenuItem>
									))}
								</Select>
								<Typography
									sx={{
										color: "#d32f2f",
										mb: 1,
										fontSize: "0.75rem",
										marginLeft: "14px",
									}}
								>
									{errors.SexualOrientation}
								</Typography>
							</FormControl>
						) : (
							<>
								<Typography
									sx={{
										color: "#e91e63",
										fontSize: "0.875rem",
										mb: 1,
										fontWeight: "bold",
									}}
								>
									Orientaion
								</Typography>
								<Typography sx={{ color: "white", fontSize: "1rem" }}>
									{advertiser?.SexualOrientation || "No display data"}
								</Typography>
							</>
						)}
					</Grid>

					<Grid item xs={12}>
						{isEditing ? (
							<Box>
								<Typography
									sx={{
										color: "#e91e63",
										fontSize: "0.875rem",
										mb: 1,
										fontWeight: "bold",
									}}
								>
									Swing Style
								</Typography>
								<Grid container spacing={2}>
									{Object.entries({
										exploring: "Exploring/Unsure",
										fullSwap: "Full Swap",
										softSwap: "Soft Swap",
										voyeur: "Voyeur",
									}).map(([key, label]) => (
										<Grid item xs={6} sm={3} key={key}>
											<FormControlLabel
												control={
													<Checkbox
														checked={
															editedData?.swingStyles?.[
																key as keyof SwingStyles
															] || false
														}
														onChange={(e) =>
															handleInputChange("swingStyles", {
																...editedData?.swingStyles,
																[key]: e.target.checked,
															})
														}
														disabled={isSubmitting}
														sx={{
															color: "white",
															"&.Mui-checked": {
																color: "#e91e63",
															},
														}}
													/>
												}
												label={label}
												sx={{ color: "white" }}
											/>
										</Grid>
									))}
								</Grid>
								{/* Display the error message below the checkboxes */}
								{errors.swingStyles && (
									<Typography
										sx={{ color: "#d32f2f", mt: 1, fontSize: "0.75rem" }}
									>
										{errors.swingStyles}
									</Typography>
								)}
							</Box>
						) : (
							<Box>
								<Typography
									sx={{
										color: "#e91e63",
										fontSize: "0.875rem",
										mb: 1,
										fontWeight: "bold",
									}}
								>
									Swing Style
								</Typography>
								<Box
									sx={{
										display: "flex",
										flexWrap: "wrap",
										gap: 1,
									}}
								>
									{advertiser?.SwingStyleTags?.length > 0 ? (
										advertiser.SwingStyleTags.map(
											(tag: string, index: number) => (
												<Box
													key={index}
													sx={{
														padding: "5px 10px",
														backgroundColor: "#272727",
														color: "white",
														borderRadius: "4px",
														fontSize: "14px",
													}}
												>
													{tag}
												</Box>
											)
										)
									) : (
										<Typography sx={{ color: "white" }}>
											No data available
										</Typography>
									)}
								</Box>
							</Box>
						)}
					</Grid>

					<Grid item xs={6} sm={3}>
						<Typography
							sx={{
								color: "#e91e63",
								fontSize: "0.875rem",
								mb: 1,
								fontWeight: "bold",
							}}
						>
							Distance
						</Typography>
						<Grid container>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{advertiser?.miles
									? `${advertiser.miles.toFixed(2)} miles`
									: "No display data"}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</Box>
		);
	};

	const renderDetailsPartner = () => {
		return (
			<Grid container spacing={4}>
				<Grid item xs={6} sm={6}>
					{isEditing ? (
						<FormControl fullWidth>
							<TextField
								fullWidth
								label="PartnerAge"
								type="number"
								value={pCurrentAge}
								onChange={(e) =>
									handleInputChange("PartnerAge", e.target.value)
								}
								error={!!errors.PartnerAge}
								helperText={errors.PartnerAge}
								disabled={isSubmitting}
								sx={{
									"& .MuiOutlinedInput-root": {
										color: "white",
										"& fieldset": {
											borderColor: errors.PartnerAge
												? "red"
												: "rgba(255,255,255,0.23)",
										},
										"&:hover fieldset": {
											borderColor: errors.PartnerAge ? "red" : "white",
										},
									},
									"& .MuiInputLabel-root": {
										color: errors.PartnerAge ? "red" : "rgba(255,255,255,0.7)",
									},
								}}
							/>
						</FormControl>
					) : (
						<>
							<Typography
								sx={{
									color: "#e91e63",
									fontSize: "0.875rem",
									mb: 1,
									fontWeight: "bold",
								}}
							>
								Age
							</Typography>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{pCurrentAge || "No display data"}
							</Typography>
						</>
					)}
				</Grid>

				<Grid item xs={6} sm={6}>
					{isEditing ? (
						<FormControl fullWidth>
							<InputLabel id="gender-label">Gender</InputLabel>
							<Select
								labelId="gender-label"
								value={editedData?.PartnerGender || ""}
								onChange={(e) =>
									handleInputChange("PartnerGender", e.target.value)
								}
								label="Gender"
								disabled={isSubmitting}
								sx={{
									color: "white",
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: errors.PartnerGender
											? "red"
											: "rgba(255,255,255,0.23)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: errors.PartnerGender ? "red" : "white",
									},
								}}
							>
								<MenuItem value="Male" sx={{ color: "white" }}>
									Male
								</MenuItem>
								<MenuItem value="Female" sx={{ color: "white" }}>
									Female
								</MenuItem>
								<MenuItem value="Other" sx={{ color: "white" }}>
									Other
								</MenuItem>
							</Select>
						</FormControl>
					) : (
						<>
							<Typography
								sx={{
									color: "#e91e63",
									fontSize: "0.875rem",
									mb: 1,
									fontWeight: "bold",
								}}
							>
								Gender
							</Typography>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{advertiser?.PartnerGender || "No display data"}
							</Typography>
						</>
					)}
				</Grid>

				<Grid item xs={6} sm={3}>
					{isEditing ? (
						<FormControl fullWidth error={!!errors.PartnerBodyType}>
							<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
								Body Type
							</InputLabel>
							<Select
								value={editedData?.PartnerBodyType || ""}
								onChange={(e) =>
									handleInputChange("PartnerBodyType", e.target.value)
								}
								label="Body Type"
								required
								disabled={isSubmitting}
								sx={{
									color: "white",
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255,255,255,0.23)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "white",
									},
								}}
							>
								{BODY_TYPES.map((type) => (
									<MenuItem key={type} value={type} sx={{ color: "white" }}>
										{type}
									</MenuItem>
								))}
							</Select>
							<Typography
								sx={{
									color: "#d32f2f",
									mb: 1,
									fontSize: "0.75rem",
									marginLeft: "14px",
								}}
							>
								{errors.PartnerBodyType}
							</Typography>
						</FormControl>
					) : (
						<>
							<Typography
								sx={{
									color: "#e91e63",
									fontSize: "0.875rem",
									mb: 1,
									fontWeight: "bold",
								}}
							>
								Body Type
							</Typography>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{advertiser?.PartnerBodyType || "No display data"}
							</Typography>
						</>
					)}
				</Grid>

				<Grid item xs={6} sm={3}>
					{isEditing ? (
						<FormControl fullWidth error={!!errors.PartnerHairColor}>
							<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
								Hair Color
							</InputLabel>
							<Select
								value={editedData?.PartnerHairColor || ""}
								onChange={(e) =>
									handleInputChange("PartnerHairColor", e.target.value)
								}
								label="Hair Color"
								required
								disabled={isSubmitting}
								sx={{
									color: "white",
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255,255,255,0.23)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "white",
									},
								}}
							>
								{HAIR_COLORS.map((color) => (
									<MenuItem key={color} value={color} sx={{ color: "white" }}>
										{color}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					) : (
						<>
							<Typography
								sx={{
									color: "#e91e63",
									fontSize: "0.875rem",
									mb: 1,
									fontWeight: "bold",
								}}
							>
								Hair Color
							</Typography>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{advertiser?.PartnerHairColor || "No display data"}
							</Typography>
						</>
					)}
					<Typography
						sx={{
							color: "#d32f2f",
							mb: 1,
							fontSize: "0.75rem",
							marginLeft: "14px",
						}}
					>
						{errors.PartnerHairColor}
					</Typography>
				</Grid>

				<Grid item xs={6} sm={3}>
					{isEditing ? (
						<FormControl fullWidth error={!!errors.PartnerEyeColor}>
							<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
								Eye Color
							</InputLabel>
							<Select
								value={editedData?.PartnerEyeColor || ""}
								onChange={(e) =>
									handleInputChange("PartnerEyeColor", e.target.value)
								}
								label="Eye Color"
								required
								disabled={isSubmitting}
								sx={{
									color: "white",
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255,255,255,0.23)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "white",
									},
									".MuiMenuItem-root": {
										color: "white", // Optional: Change the font color for dropdown menu items
									},
								}}
							>
								{EYE_COLORS.map((color) => (
									<MenuItem key={color} value={color} sx={{ color: "white" }}>
										{color}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					) : (
						<>
							<Typography
								sx={{
									color: "#e91e63",
									fontSize: "0.875rem",
									mb: 1,
									fontWeight: "bold",
								}}
							>
								Eye Color
							</Typography>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{advertiser?.PartnerEyeColor || "No display data"}
							</Typography>
						</>
					)}
				</Grid>

				<Grid item xs={6} sm={3}>
					{isEditing ? (
						<FormControl fullWidth error={!!errors.PartnerSexualOrientation}>
							<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
								Orientation
							</InputLabel>
							<Select
								value={editedData?.PartnerSexualOrientation || ""}
								onChange={(e) =>
									handleInputChange("PartnerSexualOrientation", e.target.value)
								}
								required
								disabled={isSubmitting}
								label="SexualOrientation"
								sx={{
									color: "white",
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255,255,255,0.23)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "white",
									},
								}}
							>
								{ORIENTATIONS.map((orientation) => (
									<MenuItem
										key={orientation}
										value={orientation}
										sx={{ color: "white" }}
									>
										{orientation}
									</MenuItem>
								))}
							</Select>
							<Typography
								sx={{
									color: "#d32f2f",
									mb: 1,
									fontSize: "0.75rem",
									marginLeft: "14px",
								}}
							>
								{errors.PartnerSexualOrientation}
							</Typography>
						</FormControl>
					) : (
						<>
							<Typography
								sx={{
									color: "#e91e63",
									fontSize: "0.875rem",
									mb: 1,
									fontWeight: "bold",
								}}
							>
								Orientaion
							</Typography>
							<Typography sx={{ color: "white", fontSize: "1rem" }}>
								{advertiser?.PartnerSexualOrientation || "No display data"}
							</Typography>
						</>
					)}
				</Grid>
			</Grid>
		);
	};

	const handleImageUpload = (
		event: React.ChangeEvent<HTMLInputElement>,
		type: "avatar" | "cover"
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				// Update preview image
				setPreviewImages((prev) => ({
					...prev,
					[type === "avatar" ? "avatar" : "banner"]: reader.result as string,
				}));

				// Update edited data
				setEditedData((prev: any) => ({
					...prev,
					[type === "avatar" ? "Avatar" : "ProfileBanner"]: file,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		if (
			advertiser &&
			Object.keys(advertiser).length > 0 &&
			isEditing &&
			!editedData
		) {
			const birthYear = advertiser?.DateOfBirth
				? new Date(advertiser.DateOfBirth).getFullYear()
				: 0;
			const age = birthYear ? new Date().getFullYear() - birthYear : 0;

			const partnerBirthYear = advertiser?.PartnerDateOfBirth
				? new Date(advertiser.PartnerDateOfBirth).getFullYear()
				: 0;
			const partnerAge = partnerBirthYear
				? new Date().getFullYear() - partnerBirthYear
				: 0;

			setEditedData({
				Username: advertiser.Username || "",
				Age: age || "",
				Gender: advertiser.Gender || "",
				Location: advertiser.Location || "",
				Tagline: advertiser.Tagline || "",
				About: advertiser.About || "",
				BodyType: advertiser.BodyType || "",
				HairColor: advertiser.HairColor || "",
				EyeColor: advertiser.EyeColor || "",
				AccountType: advertiser.AccountType || "",
				ProfileBanner: advertiser.ProfileBanner || "",
				Avatar: advertiser.Avatar || "",
				PartnerAge: partnerAge || "",
				PartnerGender: advertiser.PartnerGender || "",
				PartnerBodyType: advertiser.PartnerBodyType || "",
				PartnerHairColor: advertiser.PartnerHairColor || "",
				PartnerEyeColor: advertiser.PartnerEyeColor || "",
				PartnerSexualOrientation: advertiser.PartnerSexualOrientation || "",
			});
		}
	}, [advertiser, isEditing]);

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

	useEffect(() => {
		if (typeof window !== "undefined") {
			setProfileId(localStorage.getItem("logged_in_profile"));
			setMembership(localStorage.getItem("memberShip"));
			const token = localStorage.getItem("loginInfo");
			if (token) {
				const decodeToken = jwtDecode<any>(token);
				console.log(decodeToken?.membership);
				setMembership1(decodeToken?.membership);
			}
		}
	}, []);

	useEffect(() => {
		if (profileId) {
			fetchData(profileId);
			getPrivateImages(profileId);
			getProfileImages(profileId);
		}
	}, [profileId]);

	return (
		<Box>
			<Header />
			<ThemeProvider theme={theme}>
				<Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
					<Container>
						<StyledCard>
							<CoverImage
								image={
									isEditing
										? previewImages.banner ||
										  editedData?.ProfileBanner ||
										  advertiser.ProfileBanner
										: advertiser.ProfileBanner
								}
								title="Profile Cover"
								onClick={() => {
									if (isEditing) {
										document.getElementById("cover-upload")?.click();
									}
								}}
								sx={{ cursor: isEditing ? "pointer" : "default", mt: 10 }}
							/>
							<input
								type="file"
								id="cover-upload"
								hidden
								accept="image/*"
								onChange={(e) => handleImageUpload(e, "cover")}
							/>

							<Avatar
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.3 }}
								onClick={() => {
									if (isEditing) {
										document.getElementById("avatar-upload")?.click();
									}
								}}
								sx={{ mb: 6, ml: -2, zIndex: 2 }}
							>
								<img
									src={
										isEditing
											? previewImages.avatar ||
											  editedData?.Avatar ||
											  advertiser.Avatar
											: advertiser.Avatar
									}
									alt="Profile Avatar"
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
								<input
									type="file"
									id="avatar-upload"
									hidden
									accept="image/*"
									onChange={(e) => handleImageUpload(e, "avatar")}
								/>
							</Avatar>

							{membership === 1 || membership1 === 1 ? (
								<div
									style={{
										backgroundColor: "green",
										position: "absolute",
										top: 70,
										right: 0,
										color: "white", // Optional for better contrast
										padding: "10px", // Optional for spacing
										cursor: "pointer", // Optional to show it's clickable
									}}
								>
									Premium
								</div>
							) : (
								<div
									style={{
										backgroundColor: "green",
										position: "absolute",
										top: 15,
										left: 0,
										color: "white", // Optional for better contrast
										padding: "10px", // Optional for spacing
										cursor: "pointer", // Optional to show it's clickable
									}}
								>
									Free
								</div>
							)}

							<TopActions>
								<StyledTopButton
									onClick={() => {
										handleAvailable;
									}}
								>
									Available
								</StyledTopButton>
								<StyledTopButton
									onClick={() => {
										router.push("/membership");
									}}
								>
									Billing
								</StyledTopButton>
								<StyledTopButton
									onClick={() => {
										router.push("/prefrences");
									}}
								>
									Preferences
								</StyledTopButton>
								{/* <StyledTopButton sx={{
                                    backgroundColor: '#C2185B',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#C2185B',
                                    },
                                }}>Available</StyledTopButton> */}
								{isEditing ? (
									<>
										<IconButton
											color="primary"
											onClick={handleSave}
											sx={{ bgcolor: "white" }}
										>
											<SaveIcon />
										</IconButton>
										<IconButton
											color="error"
											onClick={handleEditToggle}
											sx={{ bgcolor: "white" }}
										>
											<CancelIcon />
										</IconButton>
									</>
								) : (
									<IconButton
										color="primary"
										onClick={handleEditToggle}
										sx={{ bgcolor: "white" }}
									>
										<EditIcon />
									</IconButton>
								)}
							</TopActions>
						</StyledCard>

						<Grid spacing={4}>
							<Grid item xs={12} md={8}>
								<Paper
									component={motion.div}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.5 }}
									elevation={3}
									sx={{ p: 3, mb: 3, borderRadius: 2 }}
								>
									<Button
										onClick={() => {
											handleLogout();
										}}
										sx={{ float: "right", fontSize: "1.0rem" }}
									>
										Log Out
									</Button>
									<Box sx={{ mb: 2 }}>
										{isEditing ? (
											<Grid container spacing={2}>
												<Grid item xs={12} sm={6}>
													<TextField
														fullWidth
														label="Username"
														value={editedData?.Username || ""}
														onChange={(e) =>
															handleInputChange("Username", e.target.value)
														}
														error={!!errors.Username}
														helperText={errors.Username}
														disabled={isSubmitting}
														sx={{
															"& .MuiOutlinedInput-root": {
																color: "white",
																"& fieldset": {
																	borderColor: errors.Username
																		? "red"
																		: "rgba(255,255,255,0.23)",
																},
																"&:hover fieldset": {
																	borderColor: errors.Username
																		? "red"
																		: "white",
																},
															},
															"& .MuiInputLabel-root": {
																color: errors.Username
																	? "red"
																	: "rgba(255,255,255,0.7)",
															},
														}}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<TextField
														fullWidth
														label="Age"
														type="number"
														value={currentAge}
														onChange={(e) =>
															handleInputChange("Age", e.target.value)
														}
														error={!!errors.Age}
														helperText={errors.Age}
														disabled={isSubmitting}
														sx={{
															"& .MuiOutlinedInput-root": {
																color: "white",
																"& fieldset": {
																	borderColor: errors.Age
																		? "red"
																		: "rgba(255,255,255,0.23)",
																},
																"&:hover fieldset": {
																	borderColor: errors.Age ? "red" : "white",
																},
															},
															"& .MuiInputLabel-root": {
																color: errors.Age
																	? "red"
																	: "rgba(255,255,255,0.7)",
															},
														}}
													/>
												</Grid>
												<Grid item xs={12}>
													<Autocomplete
														id="location-autocomplete"
														open={openCity}
														onOpen={() => setOpenCity(true)}
														onClose={() => setOpenCity(false)}
														isOptionEqualToValue={(option, value) =>
															option.City === value.City
														}
														getOptionLabel={(option) => option.City || ""}
														options={cityOption}
														loading={cityLoading}
														inputValue={cityInput}
														noOptionsText={
															<Typography sx={{ color: "white" }}>
																No options
															</Typography>
														}
														value={
															editedData?.Location
																? {
																		City: editedData.Location.replace(
																			", USA",
																			""
																		),
																  }
																: null
														}
														onInputChange={(event, newInputValue) => {
															if (
																event?.type === "change" ||
																event?.type === "click"
															)
																setCityInput(newInputValue);
														}}
														onChange={(event, newValue) => {
															if (newValue?.City)
																handleInputChange("Location", newValue.City);
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
																fullWidth
																label="Address"
																error={!!errors.Location}
																helperText={errors.Location}
																disabled={isSubmitting}
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
																	"& .MuiOutlinedInput-root": {
																		color: "white",
																		"& fieldset": {
																			borderColor: errors.Location
																				? "red"
																				: "rgba(255,255,255,0.23)",
																		},
																		"&:hover fieldset": {
																			borderColor: errors.Location
																				? "red"
																				: "white",
																		},
																	},
																	"& .MuiInputLabel-root": {
																		color: errors.Location
																			? "red"
																			: "rgba(255,255,255,0.7)",
																	},
																}}
															/>
														)}
													/>
												</Grid>
												{/* <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="gender-label">Gender</InputLabel>
                                                        <Select
                                                            labelId="gender-label"
                                                            value={editedData?.Gender || ''}
                                                            onChange={(e) => handleInputChange('Gender', e.target.value)}
                                                            label="Gender"
                                                            disabled={isSubmitting}
                                                            sx={{
                                                                color: 'white',
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.Gender ? 'red' : 'rgba(255,255,255,0.23)',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.Gender ? 'red' : 'white',
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem value="Male" sx={{ color: 'white' }}>Male</MenuItem>
                                                            <MenuItem value="Female" sx={{ color: 'white' }}>Female</MenuItem>
                                                            <MenuItem value="Other" sx={{ color: 'white' }}>Other</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid> */}
												<Grid item xs={12} sm={6}>
													<FormControl fullWidth>
														<InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
															Account Type
														</InputLabel>
														<Select
															value={editedData?.AccountType || undefined} // Ensure no default value is set
															onChange={(e) =>
																handleInputChange("AccountType", e.target.value)
															}
															label="Account Type"
															required
															disabled={isSubmitting}
															sx={{
																color: "white",
																"& .MuiOutlinedInput-notchedOutline": {
																	borderColor: "rgba(255,255,255,0.23)",
																},
																"&:hover .MuiOutlinedInput-notchedOutline": {
																	borderColor: "white",
																},
															}}
														>
															{["Male", "Female", "Couple"].map((type) => (
																<MenuItem
																	key={type}
																	value={type}
																	sx={{ color: "white" }}
																>
																	{type}
																</MenuItem>
															))}
														</Select>
													</FormControl>
												</Grid>
											</Grid>
										) : (
											<>
												<Box
													sx={{
														mt: 3,
														display: "flex",
														flexDirection: { xs: "column", sm: "row" }, // Stack on small screens, row on larger screens
														gap: { xs: 1, sm: 3 }, // Smaller gap for small screens
														alignItems: { xs: "flex-start", sm: "center" }, // Adjust alignment for small screens
													}}
												>
													<Typography
														variant="h4"
														sx={{
															fontSize: { xs: "1.5rem", sm: "2rem" }, // Smaller font size for small screens
															textAlign: { xs: "center", sm: "left" }, // Center text on small screens
														}}
													>
														{advertiser.Username},{" "}
														{new Date().getFullYear() -
															new Date(editedData?.DateOfBirth).getFullYear()}
														{editedData?.Gender === "Male"
															? "M"
															: editedData?.Gender === "Female"
															? "F"
															: ""}
														{editedData?.AccountType === "Couple" ? " | " : ""}
														{!pCurrentAge || pCurrentAge === ""
															? ""
															: pCurrentAge}
														{editedData?.PartnerGender === "Male" ||
														editedData?.PartnerGender === "Man"
															? "M"
															: editedData?.PartnerGender === "Female" ||
															  editedData?.PartnerGender === "Woman"
															? "F"
															: ""}
													</Typography>

													<Typography
														variant="subtitle1"
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
															fontSize: { xs: "0.875rem", sm: "1rem" }, // Adjust font size for responsiveness
															textAlign: { xs: "center", sm: "left" }, // Center text on small screens
															mt: { xs: 1, sm: 0 }, // Add margin on top for small screens
														}}
													>
														<LocationOn color="primary" />
														{advertiser.Location?.replace(", USA", "")}
													</Typography>
												</Box>

												<Box
													sx={{
														display: "flex",
														flexDirection: { xs: "column", sm: "row" }, // Stack chips on small screens
														gap: { xs: 1, sm: 2 }, // Adjust chip spacing for responsiveness
														mt: 2,
													}}
												>
													{/* <Typography sx={{ color: '#e91e63', fontSize: '0.875rem', fontWeight: 'bold', mt: 1 }}>Gender</Typography>
                                                    <Chip
                                                        label={advertiser.Gender}
                                                        color="primary"
                                                        size="small"
                                                        sx={{
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' } // Adjust font size for small screens
                                                        }}
                                                    /> */}
													<Typography
														sx={{
															color: "#e91e63",
															fontSize: "0.875rem",
															fontWeight: "bold",
															mt: 1,
														}}
													>
														AccountType
													</Typography>
													<Chip
														label={advertiser.AccountType}
														color="secondary"
														size="small"
														sx={{
															fontSize: { xs: "0.75rem", sm: "0.875rem" }, // Adjust font size for small screens
														}}
													/>
												</Box>
											</>
										)}
									</Box>

									<Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
										Tagline
									</Typography>
									{isEditing ? (
										<TextField
											fullWidth
											multiline
											placeholder="Enter your tagline"
											value={editedData?.Tagline ?? advertiser?.Tagline ?? ""}
											onChange={(e) => {
												console.log("New Tagline value:", e.target.value); // Debug log
												handleInputChange("Tagline", e.target.value);
											}}
											error={!!errors.Tagline}
											helperText={errors.Tagline}
											disabled={isSubmitting}
											sx={{
												mb: 2,
												"& .MuiOutlinedInput-root": {
													color: "white",
													"& fieldset": {
														borderColor: errors.Tagline
															? "red"
															: "rgba(255,255,255,0.23)",
													},
													"&:hover fieldset": {
														borderColor: errors.Tagline ? "red" : "white",
													},
													"& textarea": {
														color: "white", // Make sure the input text is visible
													},
												},
												"& .MuiInputLabel-root": {
													color: errors.Tagline
														? "red"
														: "rgba(255,255,255,0.7)",
												},
												"& .MuiFormHelperText-root": {
													color: "red",
												},
											}}
										/>
									) : (
										<Typography
											paragraph
											sx={{ color: "white", textAlign: "center" }}
											dangerouslySetInnerHTML={{
												__html: advertiser?.Tagline,
											}}
										/>
									)}

									<Typography variant="h6" sx={{ mb: 1 }}>
										About Me
									</Typography>
									{isEditing ? (
										<TextField
											fullWidth
											multiline
											rows={4}
											placeholder="Tell us about yourself"
											value={editedData?.About ?? advertiser?.About ?? ""}
											onChange={(e) => {
												console.log("New About value:", e.target.value); // Debug log
												handleInputChange("About", e.target.value);
											}}
											error={!!errors.About}
											helperText={errors.About}
											disabled={isSubmitting}
											sx={{
												mb: 2,
												"& .MuiOutlinedInput-root": {
													color: "white",
													"& fieldset": {
														borderColor: errors.About
															? "red"
															: "rgba(255,255,255,0.23)",
													},
													"&:hover fieldset": {
														borderColor: errors.About ? "red" : "white",
													},
													"& textarea": {
														color: "white", // Make sure the input text is visible
													},
												},
												"& .MuiInputLabel-root": {
													color: errors.About ? "red" : "rgba(255,255,255,0.7)",
												},
												"& .MuiFormHelperText-root": {
													color: "red",
												},
											}}
										/>
									) : (
										<Typography
											paragraph
											sx={{ color: "white" }}
											dangerouslySetInnerHTML={{ __html: advertiser?.About }}
										></Typography>
									)}

									<Divider sx={{ mb: 2, borderColor: "#e91e63" }} />
									<Typography
										variant="h5"
										sx={{
											mb: 2,
											fontWeight: 800,
											letterSpacing: "0.05em",
											textTransform: "uppercase",
											background:
												"linear-gradient(45deg, #fff 30%, #f50057 90%)",
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
											"&:hover::after": {
												width: "100px",
											},
										}}
									>
										My Details
									</Typography>
									<Grid spacing={2}>
										<Box>{renderDetailsGrid()}</Box>
									</Grid>
									{(isEditing
										? editedData?.AccountType
										: advertiser?.AccountType) === "Couple" ? (
										<>
											<Divider sx={{ mt: 2, mb: 2, borderColor: "#e91e63" }} />
											<Typography
												variant="h5"
												sx={{
													mb: 2,
													fontWeight: 800,
													letterSpacing: "0.05em",
													textTransform: "uppercase",
													background:
														"linear-gradient(45deg, #fff 30%, #f50057 90%)",
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
													"&:hover::after": {
														width: "100px",
													},
												}}
											>
												Partner Details
											</Typography>
											<Grid spacing={2} sx={{ mb: 4 }}>
												<Box>{renderDetailsPartner()}</Box>
											</Grid>
										</>
									) : null}
								</Paper>

								{/* <Paper
                                            component={motion.div}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            elevation={3}
                                            sx={{ p: 3, borderRadius: 2 }}
                                        >
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                <Public sx={{ mr: 1 }} /> Public Photos
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {(isEditing ? editedData : profileData).publicImages.map((img, index) => (
                                                    <Grid item xs={4} key={index}>
                                                        <motion.div whileHover={{ scale: 1.05 }}>
                                                            <img
                                                                src={img}
                                                                alt={`Public ${index + 1}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: 200,
                                                                    objectFit: 'cover',
                                                                    borderRadius: 8,
                                                                }}
                                                            />
                                                        </motion.div>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                                                <Lock sx={{ mr: 1 }} /> Private Photos
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {(isEditing ? editedData : profileData).privateImages.map((img, index) => (
                                                    <Grid item xs={4} key={index}>
                                                        <motion.div whileHover={{ scale: 1.05 }}>
                                                            <Box
                                                                sx={{
                                                                    position: 'relative',
                                                                    height: 200,
                                                                    borderRadius: 2,
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Private ${index + 1}`}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                    }
                                                                    }
                                                                />
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        transform: 'translate(-50%, -50%)',
                                                                    }}
                                                                >
                                                                    <Lock sx={{ fontSize: 40, color: 'white' }} />
                                                                </Box>
                                                            </Box>
                                                        </motion.div>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Paper> */}
								{renderImageSection("public")}
								<hr />
								{renderImageSection("private")}
							</Grid>

							<Grid item xs={12}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										mt: 2,
										mb: 2,
									}}
								>
									{/* <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete your account?')) {
                                                // Handle delete account
                                            }
                                        }}
                                    >
                                        Delete Account
                                    </Button> */}
								</Box>
							</Grid>
						</Grid>
					</Container>
				</Box>
			</ThemeProvider>
			<Footer />
		</Box>
	);
};

export default ProfileDetail;
