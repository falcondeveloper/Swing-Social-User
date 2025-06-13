"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Grid,
	IconButton,
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
	Avatar as MuiAvatar,
	Tabs,
	Tab,
	Fade,
	Collapse,
	Alert,
	Snackbar,
	Stack,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { 
	ArrowLeft, 
	MapPin, 
	Heart, 
	Eye, 
	Users, 
	Crown,
	Calendar,
	Info,
	Upload,
	X,
	Edit,
	Save,
	Camera,
	Plus,
	User,
	Settings,
	LogOut,
	Image as ImageIcon,
	Lock,
	Globe,
	Check,
	AlertCircle,
} from "lucide-react";

// Enhanced theme with your brand guidelines
const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: "#FF1B6B",
			dark: "#c2185b",
		},
		secondary: {
			main: "#03dac5",
		},
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
		text: {
			primary: "#ffffff",
			secondary: "#aaaaaa",
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
			color: "#FF1B6B",
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "12px",
					textTransform: "none",
					fontWeight: 600,
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				},
				contained: {
					background: 'linear-gradient(135deg, #FF1B6B 0%, #c2185b 100%)',
					boxShadow: '0 4px 15px rgba(255, 27, 107, 0.25)',
					'&:hover': {
						background: 'linear-gradient(135deg, #c2185b 0%, #d81160 100%)',
						transform: 'translateY(-2px)',
						boxShadow: '0 8px 25px rgba(255, 27, 107, 0.35)',
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					background: 'rgba(30, 30, 30, 0.8)',
					backdropFilter: 'blur(20px)',
					borderRadius: "16px",
					border: "1px solid rgba(255, 255, 255, 0.08)",
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						backgroundColor: 'rgba(30, 30, 30, 0.8)',
						borderRadius: '12px',
						transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						'& fieldset': {
							borderColor: 'rgba(255, 255, 255, 0.12)',
						},
						'&:hover fieldset': {
							borderColor: 'rgba(255, 27, 107, 0.5)',
						},
						'&.Mui-focused fieldset': {
							borderColor: '#FF1B6B',
							borderWidth: '2px',
						},
					},
					'& .MuiInputLabel-root': {
						color: '#aaaaaa',
						'&.Mui-focused': {
							color: '#FF1B6B',
						},
					},
					'& .MuiOutlinedInput-input': {
						color: '#ffffff',
					},
				},
			},
		},
		MuiTabs: {
			styleOverrides: {
				root: {
					'& .MuiTabs-indicator': {
						backgroundColor: '#FF1B6B',
						height: '3px',
						borderRadius: '3px',
					},
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					color: '#aaaaaa',
					fontWeight: 500,
					fontSize: '14px',
					textTransform: 'none',
					'&.Mui-selected': {
						color: '#FF1B6B',
						fontWeight: 600,
					},
				},
			},
		},
	},
});

// Styled components
const ProfileHeader = styled(Card)(({ theme }) => ({
	position: 'relative',
	overflow: 'hidden',
	borderRadius: '24px',
	background: 'rgba(30, 30, 30, 0.95)',
	border: '1px solid rgba(255, 27, 107, 0.1)',
	backdropFilter: 'blur(20px)',
}));

const CoverImageContainer = styled(Box)(({ theme }) => ({
	position: 'relative',
	height: '280px',
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	borderRadius: '24px 24px 0 0',
	cursor: 'pointer',
	overflow: 'hidden',
	'&::after': {
		content: '""',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: '60%',
		background: 'linear-gradient(to top, rgba(18,18,18,0.9) 0%, transparent 100%)',
		pointerEvents: 'none',
	},
}));

const ProfileAvatar = styled(Box)(({ theme }) => ({
	position: 'relative',
	width: '120px',
	height: '120px',
	borderRadius: '50%',
	border: '4px solid rgba(30, 30, 30, 0.9)',
	overflow: 'hidden',
	cursor: 'pointer',
	boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		transform: 'scale(1.05)',
		boxShadow: '0 12px 40px rgba(255, 27, 107, 0.3)',
	},
}));

const ImageGrid = styled(Box)({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
	gap: '16px',
	padding: '24px 0',
});

const ImageCard = styled(motion.div)(({ theme }) => ({
	position: 'relative',
	aspectRatio: '1',
	borderRadius: '16px',
	overflow: 'hidden',
	cursor: 'pointer',
	background: 'rgba(30, 30, 30, 0.8)',
	border: '1px solid rgba(255, 255, 255, 0.08)',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		transform: 'scale(1.02)',
		boxShadow: '0 8px 25px rgba(255, 27, 107, 0.15)',
	},
}));

const UploadCard = styled(Box)(({ theme }) => ({
	aspectRatio: '1',
	borderRadius: '16px',
	border: '2px dashed rgba(255, 27, 107, 0.3)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	background: 'rgba(255, 27, 107, 0.05)',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		borderColor: 'rgba(255, 27, 107, 0.6)',
		background: 'rgba(255, 27, 107, 0.1)',
		transform: 'scale(1.02)',
	},
}));

const ActionChip = styled(Chip)(({ theme }) => ({
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	color: 'white',
	backdropFilter: 'blur(10px)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	fontSize: '0.75rem',
	height: 'auto',
	padding: '4px 8px',
	minWidth: 'fit-content',
	'& .MuiChip-label': {
		padding: '2px 4px',
		fontSize: 'inherit',
	},
	'& .MuiChip-icon': {
		margin: '0 2px 0 0',
	},
	'&:hover': {
		backgroundColor: 'rgba(255, 27, 107, 0.2)',
		borderColor: 'rgba(255, 27, 107, 0.3)',
	},
	[theme.breakpoints.down('sm')]: {
		fontSize: '0.7rem',
		'& .MuiChip-label': {
			padding: '1px 2px',
		},
	},
}));

// Constants
const BODY_TYPES = ["Average", "Slim/Petite", "Ample", "Athletic", "BBW/BBM", "A little extra padding"];
const EYE_COLORS = ["Gray", "Brown", "Black", "Green", "Blue", "Hazel"];
const HAIR_COLORS = ["Platinum Blonde", "Other", "Silver", "Hair? What Hair?", "Red/Auburn", "Grey", "White", "Blonde", "Salt and pepper", "Brown", "Black"];
const ORIENTATIONS = ["Straight", "Bi", "Bi-curious", "Open minded"];

interface SwingStyles {
	exploring: boolean;
	fullSwap: boolean;
	softSwap: boolean;
	voyeur: boolean;
}

interface ValidationErrors {
	[key: string]: string;
}

interface ImagePreview {
	id: string;
	url: string;
	file: File;
	isUploading: boolean;
}

const ProfileDetail: React.FC = () => {
	const [mounted, setMounted] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState<any>({});
	const [loading, setLoading] = useState(true);
	const [advertiser, setAdvertiser] = useState<any>({});
	const [profileImages, setProfileImages] = useState<any>([]);
	const [privateImages, setPrivateImages] = useState<any>([]);
	const [profileId, setProfileId] = useState<string>("");
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentAge, setCurrentAge] = useState<string>("");
	const [pCurrentAge, setPCurrentAge] = useState<string>("");
	const [membership, setMembership] = useState<any>(0);
	const [membership1, setMembership1] = useState<any>(0);
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
	const [publicImagePreviews, setPublicImagePreviews] = useState<ImagePreview[]>([]);
	const [privateImagePreviews, setPrivateImagePreviews] = useState<ImagePreview[]>([]);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

	const router = useRouter();
	const isMobile = useMediaQuery('(max-width: 768px)');

	// Handle mounting to prevent hydration issues
	useEffect(() => {
		setMounted(true);
	}, []);

	const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
		setSnackbar({ open: true, message, severity });
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

	const uploadImage = async (file: File): Promise<string> => {
		try {
			const formData = new FormData();
			formData.append("image", file);

			const response = await fetch("/api/user/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const data = await response.json();
			return data?.blobUrl;
		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
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
			showSnackbar(error, 'error');
			return;
		}

		const tempId = `temp-${Date.now()}`;
		const preview: ImagePreview = {
			id: tempId,
			url: URL.createObjectURL(file),
			file: file,
			isUploading: true,
		};

		if (type === "public") {
			setPublicImagePreviews((prev) => [...prev, preview]);
		} else {
			setPrivateImagePreviews((prev) => [...prev, preview]);
		}

		try {
			const uploadURL = await uploadImage(file);

			if (type === "public") {
				const response = await fetch("api/user/profile/update/images/public/insert", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						profileId: profileId,
						imageURL: uploadURL,
					}),
				});

				const data = await response.json();
				if (data.status === 200) {
					setProfileImages((prev: any) => [...prev, { Id: data.imageId, Url: uploadURL }]);
					setPublicImagePreviews((prev) => prev.filter((preview) => preview.id !== tempId));
					showSnackbar('Image uploaded successfully!');
				}
			} else {
				const response = await fetch("api/user/profile/update/images/private/insert", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						profileId: profileId,
						imageURL: uploadURL,
					}),
				});

				const data = await response.json();
				if (data.status === 200) {
					setPrivateImages((prev: any) => [...prev, { Id: data.imageId, Url: uploadURL }]);
					setPrivateImagePreviews((prev) => prev.filter((preview) => preview.id !== tempId));
					showSnackbar('Private image uploaded successfully!');
				}
			}
		} catch (error) {
			console.error(error);
			showSnackbar('Failed to upload image', 'error');
			if (type === "public") {
				setPublicImagePreviews((prev) => prev.filter((preview) => preview.id !== tempId));
			} else {
				setPrivateImagePreviews((prev) => prev.filter((preview) => preview.id !== tempId));
			}
		}
	};

	const handleImageDelete = async (imageId: string, type: "public" | "private") => {
		try {
			const endpoint = type === "public" 
				? "api/user/profile/update/images/public/delete"
				: "api/user/profile/update/images/private/delete";

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					profileId: profileId,
					imageId: imageId,
				}),
			});

			const data = await response.json();
			if (data.status === 200) {
				if (type === "public") {
					setProfileImages((prev: any) => prev.filter((image: any) => image.Id !== imageId));
				} else {
					setPrivateImages((prev: any) => prev.filter((image: any) => image.Id !== imageId));
				}
				showSnackbar('Image deleted successfully!');
			}
		} catch (error) {
			console.error("Error deleting image:", error);
			showSnackbar('Failed to delete image', 'error');
		}
	};

	const handleInputChange = (field: string, value: any) => {
		setEditedData((prev: any) => ({
			...prev,
			[field]: value,
		}));

		// Clear errors
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const fetchData = async (userId: string) => {
		if (!userId) return;
		
		setLoading(true);
		try {
			const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const { user: advertiserData } = await response.json();

			if (advertiserData) {
				const userAge = (
					new Date().getFullYear() - new Date(advertiserData?.DateOfBirth).getFullYear()
				).toString();
				setCurrentAge(userAge);

				if (advertiserData.PartnerDateOfBirth) {
					const partnerAge = (
						new Date().getFullYear() - new Date(advertiserData.PartnerDateOfBirth).getFullYear()
					).toString();
					setPCurrentAge(partnerAge);
				}

				setAdvertiser(advertiserData);
				setEditedData(advertiserData);
			}
		} catch (error: any) {
			console.error("Error fetching data:", error.message);
			showSnackbar('Failed to load profile data', 'error');
		} finally {
			setLoading(false);
		}
	};

	const getProfileImages = async (userId: string) => {
		try {
			const response = await fetch(`/api/user/sweeping/images/profile?id=${userId}`);
			const data = await response.json();
			setProfileImages(data?.images || []);
		} catch (error) {
			console.error("Error fetching profile images:", error);
		}
	};

	const getPrivateImages = async (userId: string) => {
		try {
			const response = await fetch(`/api/user/sweeping/images?id=${userId}`);
			const data = await response.json();
			setPrivateImages(data?.images || []);
		} catch (error) {
			console.error("Error fetching private images:", error);
		}
	};

	const handleLogout = () => {
		localStorage.clear();
		router.push("/login");
	};

	const handleImageUpload = (
		event: React.ChangeEvent<HTMLInputElement>,
		type: "avatar" | "cover"
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImages((prev) => ({
					...prev,
					[type === "avatar" ? "avatar" : "banner"]: reader.result as string,
				}));
				setEditedData((prev: any) => ({
					...prev,
					[type === "avatar" ? "Avatar" : "ProfileBanner"]: file,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const renderImageSection = (type: "public" | "private") => {
		const images = type === "public" ? profileImages : privateImages;
		const previews = type === "public" ? publicImagePreviews : privateImagePreviews;
		const maxImages = 15;
		const currentCount = (images?.length || 0) + previews.length;

		return (
			<Box sx={{ p: { xs: 2, md: 3 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box sx={{ 
							p: 1.5, 
							borderRadius: '12px', 
							bgcolor: 'rgba(255, 27, 107, 0.1)',
							border: '1px solid rgba(255, 27, 107, 0.2)'
						}}>
							{type === "public" ? <Globe size={20} color="#FF1B6B" /> : <Lock size={20} color="#FF1B6B" />}
						</Box>
						<Box>
							<Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
								{type === "public" ? "Public Photos" : "Private Photos"}
							</Typography>
							<Typography variant="body2" sx={{ color: '#aaaaaa' }}>
								{type === "public" ? "Visible to everyone" : "Only for authorized members"}
							</Typography>
						</Box>
					</Box>
					<Chip 
						label={`${currentCount}/${maxImages}`} 
						size="small" 
						sx={{ 
							bgcolor: 'rgba(255, 27, 107, 0.1)', 
							color: '#FF1B6B',
							border: '1px solid rgba(255, 27, 107, 0.2)',
							fontWeight: 600
						}}
					/>
				</Box>

				<ImageGrid>
					{/* Existing images */}
					<AnimatePresence>
						{images?.map((image: any, index: number) => (
							<ImageCard
								key={image.Id}
								layoutId={`image-${image.Id}`}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.3 }}
								onClick={() => {
									setSelectedImage(image.Url);
									setIsModalOpen(true);
								}}
							>
								<img
									src={image.Url}
									alt={`${type} Photo ${index + 1}`}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
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
											backgroundColor: "rgba(244, 67, 54, 0.9)",
											color: 'white',
											width: 32,
											height: 32,
											'&:hover': {
												backgroundColor: "rgba(244, 67, 54, 1)",
												transform: 'scale(1.1)',
											},
										}}
									>
										<X size={16} />
									</IconButton>
								)}
							</ImageCard>
						))}
					</AnimatePresence>

					{/* Preview images */}
					{previews.map((preview) => (
						<ImageCard
							key={preview.id}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							style={{ opacity: preview.isUploading ? 0.7 : 1 }}
						>
							<img
								src={preview.url}
								alt="Preview"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
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
										backgroundColor: "rgba(0,0,0,0.7)",
									}}
								>
									<CircularProgress size={24} sx={{ color: '#FF1B6B' }} />
								</Box>
							)}
						</ImageCard>
					))}

					{/* Upload button */}
					{isEditing && currentCount < maxImages && (
						<UploadCard>
							<label htmlFor={`image-upload-${type}`} style={{ 
								cursor: 'pointer', 
								display: 'flex', 
								flexDirection: 'column', 
								alignItems: 'center', 
								justifyContent: 'center', 
								width: '100%', 
								height: '100%',
								gap: '8px'
							}}>
								<input
									type="file"
									id={`image-upload-${type}`}
									hidden
									accept="image/*"
									onChange={(e) => handleImageAdd(e, type)}
								/>
								<Upload size={32} color="#FF1B6B" />
								<Typography variant="body2" sx={{ color: '#FF1B6B', fontWeight: 600, textAlign: 'center' }}>
									Add Photo
								</Typography>
							</label>
						</UploadCard>
					)}
				</ImageGrid>
			</Box>
		);
	};

	const renderPersonalInfo = () => (
		<Card sx={{ mb: 3 }}>
			<CardContent sx={{ p: { xs: 2, md: 3 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
					<Box sx={{ 
						p: 1.5, 
						borderRadius: '12px', 
						bgcolor: 'rgba(255, 27, 107, 0.1)',
						border: '1px solid rgba(255, 27, 107, 0.2)'
					}}>
						<User size={20} color="#FF1B6B" />
					</Box>
					<Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
						Personal Information
					</Typography>
				</Box>
				
				<Grid container spacing={3}>
					{isEditing ? (
						<>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Username"
									value={editedData?.Username || ""}
									onChange={(e) => handleInputChange("Username", e.target.value)}
									error={!!errors.Username}
									helperText={errors.Username}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Age"
									type="number"
									value={currentAge}
									onChange={(e) => setCurrentAge(e.target.value)}
									error={!!errors.Age}
									helperText={errors.Age}
								/>
							</Grid>
							<Grid item xs={12}>
								<Autocomplete
									options={cityOption}
									getOptionLabel={(option) => option.City || ""}
									value={editedData?.Location ? { City: editedData.Location.replace(", USA", "") } : null}
									onChange={(event, newValue) => {
										if (newValue?.City) handleInputChange("Location", newValue.City);
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											fullWidth
											label="Location"
											error={!!errors.Location}
											helperText={errors.Location}
											InputProps={{
												...params.InputProps,
												startAdornment: <MapPin size={20} color="#aaaaaa" style={{ marginRight: 8 }} />,
												endAdornment: (
													<>
														{cityLoading ? <CircularProgress color="inherit" size={20} /> : null}
														{params.InputProps.endAdornment}
													</>
												),
											}}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="Tagline"
									multiline
									rows={2}
									value={editedData?.Tagline || ""}
									onChange={(e) => handleInputChange("Tagline", e.target.value)}
									error={!!errors.Tagline}
									helperText={errors.Tagline}
									placeholder="Tell everyone about yourself in one line..."
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="About Me"
									multiline
									rows={4}
									value={editedData?.About || ""}
									onChange={(e) => handleInputChange("About", e.target.value)}
									error={!!errors.About}
									helperText={errors.About}
									placeholder="Share more about yourself, your interests, and what you're looking for..."
								/>
							</Grid>
						</>
					) : (
						<Grid item xs={12}>
							<Stack spacing={3}>
								<Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
										<Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
											{advertiser.Username}
										</Typography>
										<Chip 
											label={`${currentAge}${advertiser.Gender === 'Male' ? 'M' : advertiser.Gender === 'Female' ? 'F' : ''}`}
											sx={{ 
												bgcolor: 'rgba(255, 27, 107, 0.1)', 
												color: '#FF1B6B',
												border: '1px solid rgba(255, 27, 107, 0.2)',
												fontWeight: 600
											}}
										/>
										<Chip 
											label={advertiser.AccountType}
											variant="outlined"
											sx={{ 
												borderColor: '#FF1B6B', 
												color: '#FF1B6B',
												fontWeight: 600
											}}
										/>
									</Box>
									<Typography variant="body1" sx={{ color: '#aaaaaa', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
										<MapPin size={16} />
										{advertiser.Location?.replace(", USA", "")}
									</Typography>
								</Box>
								
								{advertiser.Tagline && (
									<Box sx={{ 
										p: 3, 
										borderRadius: '12px', 
										bgcolor: 'rgba(255, 27, 107, 0.05)',
										border: '1px solid rgba(255, 27, 107, 0.1)'
									}}>
										<Typography variant="h6" sx={{ color: '#FF1B6B', mb: 1, fontWeight: 600 }}>
											Tagline
										</Typography>
										<Typography variant="body1" sx={{ color: 'white', fontStyle: 'italic' }}>
											"{advertiser.Tagline}"
										</Typography>
									</Box>
								)}
								
								{advertiser.About && (
									<Box>
										<Typography variant="h6" sx={{ color: '#FF1B6B', mb: 2, fontWeight: 600 }}>
											About Me
										</Typography>
										<Typography variant="body1" sx={{ color: '#aaaaaa', lineHeight: 1.6 }}>
											{advertiser.About}
										</Typography>
									</Box>
								)}
							</Stack>
						</Grid>
					)}
				</Grid>
			</CardContent>
		</Card>
	);

	const renderDetails = () => (
		<Card sx={{ mb: 3 }}>
			<CardContent sx={{ p: { xs: 2, md: 3 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
					<Box sx={{ 
						p: 1.5, 
						borderRadius: '12px', 
						bgcolor: 'rgba(255, 27, 107, 0.1)',
						border: '1px solid rgba(255, 27, 107, 0.2)'
					}}>
						<Info size={20} color="#FF1B6B" />
					</Box>
					<Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
						Physical Details
					</Typography>
				</Box>
				
				<Grid container spacing={3}>
					{['BodyType', 'HairColor', 'EyeColor', 'SexualOrientation'].map((field) => {
						const options = field === 'BodyType' ? BODY_TYPES : 
										field === 'HairColor' ? HAIR_COLORS :
										field === 'EyeColor' ? EYE_COLORS : ORIENTATIONS;
						const label = field === 'SexualOrientation' ? 'Orientation' : field.replace(/([A-Z])/g, ' $1').trim();
						
						return (
							<Grid item xs={6} sm={3} key={field}>
								{isEditing ? (
									<FormControl fullWidth>
										<InputLabel>{label}</InputLabel>
										<Select
											value={editedData?.[field] || ""}
											onChange={(e) => handleInputChange(field, e.target.value)}
											label={label}
										>
											{options.map((option) => (
												<MenuItem key={option} value={option}>{option}</MenuItem>
											))}
										</Select>
									</FormControl>
								) : (
									<Box>
										<Typography variant="caption" sx={{ color: '#FF1B6B', fontWeight: 'bold' }}>
											{label}
										</Typography>
										<Typography variant="body2" sx={{ color: 'white' }}>
											{advertiser?.[field] || "Not specified"}
										</Typography>
									</Box>
								)}
							</Grid>
						);
					})}

					<Grid item xs={12}>
						<Box>
							<Typography variant="caption" sx={{ color: '#FF1B6B', fontWeight: 'bold', mb: 2, display: 'block' }}>
								Swing Style
							</Typography>
							{isEditing ? (
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
														checked={editedData?.swingStyles?.[key as keyof SwingStyles] || false}
														onChange={(e) =>
															handleInputChange("swingStyles", {
																...editedData?.swingStyles,
																[key]: e.target.checked,
															})
														}
														sx={{
															color: "rgba(255, 255, 255, 0.5)",
															"&.Mui-checked": { color: "#FF1B6B" },
														}}
													/>
												}
												label={label}
												sx={{ color: "white" }}
											/>
										</Grid>
									))}
								</Grid>
							) : (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{advertiser?.SwingStyleTags?.length > 0 ? (
										advertiser.SwingStyleTags.map((tag: string, index: number) => (
											<Chip
												key={index}
												label={tag}
												size="small"
												sx={{
													bgcolor: 'rgba(255, 27, 107, 0.1)',
													color: '#FF1B6B',
													border: '1px solid rgba(255, 27, 107, 0.3)',
													fontWeight: 600,
												}}
											/>
										))
									) : (
										<Typography variant="body2" sx={{ color: '#aaaaaa' }}>
											No preferences selected
										</Typography>
									)}
								</Box>
							)}
						</Box>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);

	// Initialize data on mount
	useEffect(() => {
		if (!mounted) return;
		
		const userid = localStorage.getItem("logged_in_profile");
		if (userid) {
			setProfileId(userid);
			fetchData(userid);
			getProfileImages(userid);
			getPrivateImages(userid);
		}
		
		const token = localStorage.getItem("loginInfo");
		if (token) {
			try {
				const decodeToken = jwtDecode<any>(token);
				setMembership1(decodeToken?.membership || 0);
			} catch (error) {
				console.error("Invalid token:", error);
			}
		}
		
		setMembership(localStorage.getItem("memberShip") || "0");
	}, [mounted]);

	// Don't render until mounted
	if (!mounted) {
		return (
			<Box sx={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				height: '100vh',
				bgcolor: '#121212'
			}}>
				<CircularProgress sx={{ color: '#FF1B6B' }} />
			</Box>
		);
	}

	if (loading) {
		return (
			<Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
				<Header />
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
						<CircularProgress sx={{ color: '#FF1B6B' }} />
					</Box>
				</Container>
				<Footer />
			</Box>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
				<Header />
				
				<Container maxWidth="lg" sx={{ py: { xs: 1, sm: 2, md: 4 } }}>
					{/* Back Button */}
					<Button
						onClick={() => router.back()}
						startIcon={<ArrowLeft />}
						sx={{
							mb: { xs: 1, sm: 2, md: 3 },
							mt: { xs: 0.5, sm: 0 },
							color: "rgba(255, 255, 255, 0.7)",
							"&:hover": { color: "#fff", backgroundColor: "rgba(255, 255, 255, 0.05)" },
						}}
					>
						Back
					</Button>

					{/* Profile Header */}
					<ProfileHeader sx={{ mb: 4 }}>
						<CoverImageContainer
							sx={{
								backgroundImage: `url(${previewImages.banner || advertiser.ProfileBanner || '/default-cover.jpg'})`,
							}}
							onClick={() => {
								if (isEditing) {
									document.getElementById("cover-upload")?.click();
								}
							}}
						>
							<input
								type="file"
								id="cover-upload"
								hidden
								accept="image/*"
								onChange={(e) => handleImageUpload(e, "cover")}
							/>
							
							{/* Header Actions */}
							<Box sx={{ 
								position: 'absolute', 
								top: 16, 
								right: 16, 
								display: 'flex', 
								flexWrap: 'wrap',
								gap: 1, 
								zIndex: 3,
								maxWidth: { xs: '280px', sm: '400px', md: 'none' },
								justifyContent: 'flex-end'
							}}>
								{(membership === "1" || membership1 === 1) && (
									<ActionChip
										icon={<Crown size={14} />}
										label="Premium"
										sx={{
											bgcolor: 'rgba(255, 215, 0, 0.2)',
											color: '#FFD700',
											border: '1px solid rgba(255, 215, 0, 0.3)',
										}}
									/>
								)}
								
								<ActionChip 
									icon={<Settings size={14} />}
									label="Membership"
									onClick={() => router.push("/membership")}
								/>
								
								{isEditing ? (
									<>
										<ActionChip 
											icon={isSubmitting ? <CircularProgress size={14} /> : <Save size={14} />}
											label="Save"
											onClick={async () => {
												setIsSubmitting(true);
												// Add save logic here
												setIsEditing(false);
												setIsSubmitting(false);
												showSnackbar('Profile updated successfully!');
											}}
											disabled={isSubmitting}
										/>
										<ActionChip 
											icon={<X size={14} />}
											label="Cancel"
											onClick={() => {
												setIsEditing(false);
												setEditedData(advertiser);
												setPreviewImages({ banner: null, avatar: null });
											}}
										/>
									</>
								) : (
									<ActionChip 
										icon={<Edit size={14} />}
										label="Edit"
										onClick={() => setIsEditing(true)}
									/>
								)}
								
								<ActionChip 
									icon={<LogOut size={14} />}
									label="Logout"
									onClick={handleLogout}
								/>
							</Box>

							{/* Edit overlay for cover */}
							{isEditing && (
								<Box
									sx={{
										position: 'absolute',
										bottom: 16,
										right: 16,
										bgcolor: 'rgba(0,0,0,0.7)',
										borderRadius: '8px',
										p: 1,
										display: 'flex',
										alignItems: 'center',
										gap: 1,
									}}
								>
									<Camera size={16} color="white" />
									<Typography variant="body2" sx={{ color: 'white' }}>
										Click to change cover
									</Typography>
								</Box>
							)}
						</CoverImageContainer>

						{/* Profile Info */}
						<Box sx={{ p: 3, pt: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
								{/* Avatar */}
								<Box sx={{ position: 'relative', mt: -8 }}>
									<ProfileAvatar
										onClick={() => {
											if (isEditing) {
												document.getElementById("avatar-upload")?.click();
											}
										}}
									>
										<img
											src={previewImages.avatar || advertiser.Avatar || '/noavatar.png'}
											alt="Profile Avatar"
											style={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
										{isEditing && (
											<Box
												sx={{
													position: 'absolute',
													bottom: 8,
													right: 8,
													bgcolor: '#FF1B6B',
													borderRadius: '50%',
													width: 32,
													height: 32,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<Camera size={16} color="white" />
											</Box>
										)}
										<input
											type="file"
											id="avatar-upload"
											hidden
											accept="image/*"
											onChange={(e) => handleImageUpload(e, "avatar")}
										/>
									</ProfileAvatar>
								</Box>

								{/* Basic Info */}
								<Box sx={{ flex: 1, mt: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
										<Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
											{advertiser.Username}
										</Typography>
										<Check size={20} color="#03dac5" />
									</Box>
									<Typography variant="body1" sx={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 1 }}>
										<MapPin size={16} />
										{advertiser.Location?.replace(", USA", "")}
									</Typography>
								</Box>
							</Box>
						</Box>
					</ProfileHeader>

					{/* Content Tabs */}
					<Card sx={{ mb: 3 }}>
						<Tabs
							value={activeTab}
							onChange={(_, newValue) => setActiveTab(newValue)}
							variant={isMobile ? "scrollable" : "fullWidth"}
							scrollButtons="auto"
							sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
						>
							<Tab label="Profile" icon={<User size={16} />} iconPosition="start" />
							<Tab label="Public Photos" icon={<Globe size={16} />} iconPosition="start" />
							<Tab label="Private Photos" icon={<Lock size={16} />} iconPosition="start" />
						</Tabs>
					</Card>

					{/* Tab Content */}
					<Box>
						{activeTab === 0 && (
							<Fade in={activeTab === 0}>
								<Box>
									{renderPersonalInfo()}
									{renderDetails()}
								</Box>
							</Fade>
						)}
						
						{activeTab === 1 && (
							<Fade in={activeTab === 1}>
								<Card>
									{renderImageSection("public")}
								</Card>
							</Fade>
						)}
						
						{activeTab === 2 && (
							<Fade in={activeTab === 2}>
								<Card>
									{renderImageSection("private")}
								</Card>
							</Fade>
						)}
					</Box>
				</Container>

				{/* Image Modal */}
				<Dialog
					open={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					maxWidth="lg"
					fullWidth
					PaperProps={{
						sx: {
							bgcolor: 'transparent',
							boxShadow: 'none',
							maxHeight: '90vh',
						}
					}}
				>
					<DialogContent sx={{ p: 0, bgcolor: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
						<img
							src={selectedImage || ''}
							alt="Enlarged view"
							style={{
								maxWidth: '100%',
								maxHeight: '90vh',
								objectFit: 'contain'
							}}
						/>
						<IconButton
							sx={{
								position: 'absolute',
								top: 16,
								right: 16,
								color: 'white',
								bgcolor: 'rgba(0,0,0,0.7)',
								'&:hover': {
									bgcolor: 'rgba(0,0,0,0.9)',
								}
							}}
							onClick={() => setIsModalOpen(false)}
						>
							<X />
						</IconButton>
					</DialogContent>
				</Dialog>

				{/* Snackbar */}
				<Snackbar
					open={snackbar.open}
					autoHideDuration={6000}
					onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				>
					<Alert 
						onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
						severity={snackbar.severity}
						sx={{ 
							bgcolor: snackbar.severity === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
							color: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
							border: `1px solid ${snackbar.severity === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
						}}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>

				<Footer />
			</Box>
		</ThemeProvider>
	);
};

export default ProfileDetail;