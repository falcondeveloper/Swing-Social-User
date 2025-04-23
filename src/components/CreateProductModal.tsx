import React, { useState } from "react";
import {
	Modal,
	Box,
	TextField,
	Button,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import Swal from "sweetalert2";

export default function CreateProductModal({
	open,
	onClose,
	categories,
}: {
	open: boolean;
	onClose: () => void;
	categories: any;
}) {
	const isMobile = useMediaQuery("(max-width: 480px)");
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");
	const [link, setLink] = useState("");
	const [price, setPrice] = useState("");
	const [images, setImages] = useState<File[]>([]);
	const [previewImages, setPreviewImages] = useState<string[]>([]); // For previewing uploaded images
	const [active, setActive] = useState<any>(false);

	// Function to handle image uploads
	const handleImageUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) => {
		const file = e.target.files?.[0];
		if (file) {
			// Update the images array
			const updatedImages = [...images];
			updatedImages[index] = file;
			setImages(updatedImages);

			// Update the preview images array
			const updatedPreviews = [...previewImages];
			updatedPreviews[index] = URL.createObjectURL(file);
			setPreviewImages(updatedPreviews);
		}
	};

	// Function to upload a single image
	const uploadImage = async (image: File): Promise<string | null> => {
		try {
			const formData = new FormData();
			formData.append("image", image);

			const response = await fetch("/api/user/upload", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to upload image");
			}

			return data?.blobUrl || null;
		} catch (error) {
			console.error("Error during image upload:", error);
			return null;
		}
	};

	// Handle form submission
	const handleSubmit = async () => {
		try {
			console.log(images);
			// Upload images to the server
			const uploadedImageUrls: string[] = [];
			for (const image of images) {
				if (image) {
					const imageUrl = await uploadImage(image);
					if (imageUrl) {
						uploadedImageUrls.push(imageUrl);
					}
				}
			}

			// Log the product data (including uploaded image URLs)
			console.log({
				title,
				category,
				description,
				link,
				price,
				images: uploadedImageUrls, // Uploaded image URLs
				acitve: active,
			});

			const OrganizerId = localStorage.getItem("logged_in_profile");

			const result = await fetch("/api/marketplace/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title,
					category,
					description,
					link,
					price,
					images: uploadedImageUrls,
					OrganizerId: OrganizerId,
					acitve: active,
				}),
			});

			if (result.ok) {
				Swal.fire({
					title: `Creating Product Success!`,
					text: "You created the new product",
					icon: "success",
					confirmButtonText: "OK",
				}).then(() => {
					// Redirect after the user clicks "OK"
					onClose();
					window.location.reload();
				});
				console.log("Success");
			} else {
				console.log("Falied");
			}
			// Close the modal after submission
			onClose();
		} catch (error) {
			console.error("Error submitting product:", error);
		}
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: isMobile ? "90%" : "50%",
					bgcolor: "#222",
					border: "2px solid #666",
					borderRadius: "8px",
					boxShadow: 24,
					p: 4,
					display: "flex",
					flexDirection: "column",
					gap: 2,
					color: "white",
				}}
			>
				<h2 style={{ margin: 0, textAlign: "center" }}>Create Product</h2>

				{/* Title and Category */}
				<Box
					sx={{
						display: "flex",
						flexDirection: isMobile ? "column" : "row",
						gap: isMobile ? 1 : 2,
					}}
				>
					<TextField
						label="Title"
						variant="outlined"
						size="small"
						fullWidth
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						sx={{
							backgroundColor: "#333",
							input: { color: "white" },
							label: { color: "#aaa" },
						}}
					/>
					<FormControl fullWidth size="small" sx={{ backgroundColor: "#333" }}>
						<InputLabel sx={{ color: "#aaa" }}>Category</InputLabel>
						<Select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							label="Category"
							variant="outlined"
							sx={{
								color: "white",
								".MuiOutlinedInput-notchedOutline": {
									borderColor: "#aaa",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: "white",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "white",
								},
								".MuiSvgIcon-root": {
									color: "white",
								},
							}}
						>
							{categories.map((cat: any, index: any) => (
								<MenuItem key={index} value={cat.Category}>
									{cat.Category}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

				{/* Description */}
				<TextField
					label="Description"
					variant="outlined"
					size="small"
					fullWidth
					multiline
					rows={3}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					sx={{
						backgroundColor: "#333",
						textarea: { color: "white" },
						label: { color: "#aaa" },
					}}
				/>

				{/* Link and Price */}
				<Box
					sx={{
						display: "flex",
						flexDirection: isMobile ? "column" : "row",
						gap: isMobile ? 1 : 2,
					}}
				>
					<p style={{ fontSize: "10px" }}>
						Add a link ONLY if you want the buyer to click into another website
						to purchase. Otherwise the buyer will contact you directly to
						arrange payment
					</p>
					<TextField
						label="Affiliate Product Link"
						variant="outlined"
						size="small"
						fullWidth
						value={link}
						onChange={(e) => setLink(e.target.value)}
						sx={{
							backgroundColor: "#333",
							input: { color: "white" },
							label: { color: "#aaa" },
						}}
					/>
					<TextField
						label="Price ($)"
						variant="outlined"
						size="small"
						fullWidth
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						sx={{
							backgroundColor: "#333",
							input: { color: "white" },
							label: { color: "#aaa" },
						}}
					/>
				</Box>

				{/* Image Upload */}
				<Box
					sx={{
						display: "flex",
						gap: 2,
						flexWrap: "wrap",
						alignItems: "center",
						textAlign: "center",
					}}
				>
					{[...Array(5)].map((_, index) => (
						<Box
							key={index}
							sx={{
								flexShrink: 0,
								width: { xs: "40px", sm: "55px", md: "75px", lg: "120px" },
								height: { xs: "40px", sm: "55px", md: "75px", lg: "120px" },
								borderRadius: 2,
								overflow: "hidden",
								boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
								position: "relative",
								backgroundColor: "black",
							}}
						>
							{previewImages[index] ? (
								<img
									src={previewImages[index]}
									alt={`Preview ${index + 1}`}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										display: "block",
									}}
								/>
							) : (
								<label
									htmlFor={`file-input-${index}`}
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%, -50%)",
										cursor: "pointer",
										width: "100%",
										height: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<img
										src="/photocamera.png"
										alt="Camera Icon"
										style={{
											width: "50%",
											height: "50%",
											objectFit: "contain",
										}}
									/>
									<input
										id={`file-input-${index}`}
										type="file"
										accept="image/*"
										onChange={(event) => handleImageUpload(event, index)}
										style={{ display: "none" }}
									/>
								</label>
							)}
						</Box>
					))}
				</Box>
				<Button onClick={() => setActive(!active)}>
					{active ? "Unactive" : "Active"}
				</Button>

				<Button
					variant="contained"
					onClick={handleSubmit}
					sx={{
						backgroundColor: "#007BFF",
						"&:hover": { backgroundColor: "#0056b3" },
					}}
				>
					Submit
				</Button>
			</Box>
		</Modal>
	);
}
