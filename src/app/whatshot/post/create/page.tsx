"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Snackbar,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Hidden,
} from "@mui/material";
import Button from '@mui/material/Button';
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import Alert from '@mui/material/Alert';

export default function CreatePost() {

    const router = useRouter();

    const [postImage, setPostImage] = useState<string | null>(null);
    const [postImageCropped, setPostImageCropped] = useState<any>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [openCropper, setOpenCropper] = useState(false);
    const [currentCropType, setCurrentCropType] = useState<string>("postImage");
    const [croppedArea, setCroppedArea] = useState(null);
    const [caption, setCaption] = useState("");
    const [openSuccess, setOpenSuccess] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [profileId, setProfileId] = useState<any>();
    const [errors, setErrors] = useState<any>({
        caption: null,
        postImageCropped: null,
    });

    const IMAGE_DIMENSIONS = {
        width: 800,  // Increased for better quality
        height: 800
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, cropType: "postImage" | "banner") => {
        const file = e.target.files?.[0];
        console.log(e);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPostImage(reader.result as string);
                setCurrentCropType(cropType);
                setOpenCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedArea(croppedAreaPixels);
    };

    const handleCropConfirm = () => {
        if (!croppedArea) return;

        const canvas = document.createElement("canvas");
        const image = new Image();

        canvas.width = IMAGE_DIMENSIONS.width;
        canvas.height = IMAGE_DIMENSIONS.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        image.src = postImage!;
        image.onload = () => {
            const { x, y, width: cropWidth, height: cropHeight } = croppedArea!;
            ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);

            const croppedDataURL = canvas.toDataURL("image/jpeg", 0.95); // Added quality parameter
            setPostImageCropped(croppedDataURL);
            setOpenCropper(false);
        };
    };

    const handleSubmitPost = async () => {

        try {
            const uploadImage = async (imageData: string): Promise<string | null> => {
                try {
                    const blob = await (await fetch(imageData)).blob();
                    const formData = new FormData();
                    formData.append("image", blob, `${Date.now()}.jpg`);
                    console.log(formData)

                    const response = await fetch('/api/user/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to upload image');
                    }

                    return data?.blobUrl || null;

                } catch (error) {
                    console.error("Error during image upload:", error);
                    return null;
                }
            };

            let hasError = false;
            const newErrors = { caption: "", postImageCropped: "" };

            if (!postImageCropped) {
                newErrors.postImageCropped = "Please upload an image.";
                hasError = true;
            }

            if (!caption || caption.trim() === "") {
                newErrors.caption = "Caption is required.";
                hasError = true;
            } else if (caption.length > 300) {
                newErrors.caption = "Caption must not exceed 300 characters.";
                hasError = true;
            }

            setErrors(newErrors);

            if (!hasError) {
                console.log("Uploading image...");
                console.log(hasError)
                setLoading(true);
                const imageUrl = await uploadImage(postImageCropped);

                const response = await fetch('/api/user/whatshot/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrl: imageUrl,
                        caption: caption.trim(),
                        profileId: profileId,
                    }),
                });

                const data = await response.json();
                setLoading(false);

                if (response.ok) {
                    console.log('Post submitted successfully:', data.message);
                    router.push("/whatshot");
                    setOpenSuccess(true);
                } else {
                    throw new Error(data.message || 'Failed to upload image');
                }
            }
        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };

    return (
        // <Box sx={{ color: "white", padding: "10px" }}>
        //     <Header />
        //     <Box
        //         sx={{
        //             backgroundColor: "#000",
        //             minHeight: "100vh",
        //             display: "flex",
        //             justifyContent: "center",
        //             alignItems: "center",
        //             padding: 2,
        //         }}
        //     >
        //         <Grid
        //             container
        //             justifyContent="center"
        //             alignItems="center"
        //             sx={{
        //                 backgroundColor: "#000000",
        //                 borderRadius: "16px",
        //                 maxWidth: "600px",
        //                 padding: "32px",
        //                 boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        //             }}
        //         >
        //             <Button
        //                 onClick={() => router.back()}
        //                 startIcon={<ArrowLeft />}
        //                 sx={{
        //                     textTransform: "none",
        //                     color: "rgba(255, 255, 255, 0.7)",
        //                     float: "left",
        //                     minWidth: 'auto',
        //                     fontSize: "16px",
        //                     fontWeight: "medium",
        //                     "&:hover": {
        //                         color: "#fff",
        //                         backgroundColor: "rgba(255, 255, 255, 0.08)",
        //                     },
        //                 }}
        //             >
        //                 Back
        //             </Button>
        //             <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
        //                 <Typography
        //                     variant="h6"
        //                     sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
        //                 >
        //                     POST Photo
        //                 </Typography>

        //                 {/* Image Upload Box */}
        //                 <Box
        //                     sx={{
        //                         width: 400,
        //                         height: 400,
        //                         border: `2px dashed ${errors.postImageCropped ? "red" : "#fff"
        //                             }`,
        //                         borderRadius: "16px",
        //                         backgroundColor: "#000000",
        //                         margin: "0 auto",
        //                         display: "flex",
        //                         justifyContent: "center",
        //                         alignItems: "center",
        //                         position: "relative",
        //                         overflow: "hidden"
        //                     }}
        //                 >
        //                     {postImageCropped ? (
        //                         <img
        //                             src={postImageCropped}
        //                             alt="Cropped Avatar"
        //                             style={{
        //                                 maxWidth: "100%",
        //                                 maxHeight: "100%",
        //                                 width: "auto",
        //                                 height: "auto",
        //                                 objectFit: "contain",
        //                                 objectPosition: "center",
        //                             }}
        //                         />
        //                     ) : (
        //                         <>
        //                             <input
        //                                 type="file"
        //                                 accept="image/*"
        //                                 onChange={(e) => onFileChange(e, "postImage")}
        //                                 style={{ display: "none" }}
        //                                 id="upload-post-image"
        //                             />
        //                             <label htmlFor="upload-post-image">
        //                                 <Box
        //                                     sx={{
        //                                         display: "flex",
        //                                         flexDirection: "column",
        //                                         alignItems: "center",
        //                                     }}
        //                                 >
        //                                     <img
        //                                         src="/photocamera.png"
        //                                         alt="Upload"
        //                                         style={{ width: "40px", height: "40px" }}
        //                                     />
        //                                     <Typography sx={{ color: "#fff", mt: 1 }}>
        //                                         Click to select an Image
        //                                     </Typography>
        //                                 </Box>
        //                             </label>
        //                         </>
        //                     )}
        //                 </Box>
        //                 {errors.postImageCropped && (
        //                     <Typography variant="body2" color="error" sx={{ mt: 1 }}>
        //                         {errors.postImageCropped}
        //                     </Typography>
        //                 )}
        //             </Grid>

        //             {/* Caption Input */}
        //             <Grid item xs={12} sx={{ mt: 2 }}>
        //                 <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
        //                     Caption
        //                 </Typography>
        //                 <Box
        //                     sx={{
        //                         width: "100%",
        //                         mt: 1,
        //                     }}
        //                 >
        //                     <TextField
        //                         placeholder="Write Media Caption..."
        //                         fullWidth
        //                         value={caption}
        //                         onChange={(e) => {
        //                             setCaption(e.target.value);
        //                             setErrors((prev: any) => ({ ...prev, caption: "" })); // Clear error
        //                         }}
        //                         sx={{
        //                             backgroundColor: "#fff",
        //                             borderRadius: "16px",
        //                             "& .MuiOutlinedInput-root": {
        //                                 "& fieldset": {
        //                                     borderColor: "white", // Default border color
        //                                     borderRadius: "16px",
        //                                 },
        //                                 "&:hover fieldset": {
        //                                     borderColor: "white", // Border color on hover
        //                                 },
        //                                 "&.Mui-focused fieldset": {
        //                                     borderColor: "white",
        //                                 },
        //                                 "&.Mui-focused": {
        //                                     borderColor: "white",
        //                                 },
        //                             },
        //                             "& .MuiInputBase-input": {
        //                                 textAlign: "center", // Center text alignment
        //                             },
        //                         }}
        //                         variant="outlined"
        //                         inputProps={{
        //                             style: {
        //                                 textAlign: "center",
        //                             },
        //                         }}
        //                     />
        //                     {errors.caption && (
        //                         <Typography variant="body2" color="error" sx={{ mt: 1 }}>
        //                             {errors.caption}
        //                         </Typography>
        //                     )}
        //                 </Box>
        //             </Grid>

        //             {/* Continue Button */}
        //             <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
        //                 <Button
        //                     onClick={() => handleSubmitPost()}
        //                     loading={loading} // 'loading' is likely not a valid prop
        //                     sx={{
        //                         bgcolor: '#f50057',
        //                         '&:hover': { bgcolor: '#c51162' },
        //                         borderRadius: 2,
        //                         textTransform: 'none',
        //                         px: 3,
        //                         color: 'white'
        //                     }}
        //                 >
        //                     Create Post
        //                 </Button>
        //             </Grid>
        //         </Grid>

        //         {/* Cropper Dialog */}
        //         <Dialog open={openCropper} onClose={() => setOpenCropper(false)}>
        //             <DialogContent
        //                 sx={{
        //                     backgroundColor: "#000",
        //                     color: "#fff",
        //                     width: 400,
        //                     height: 400,
        //                     position: "relative",
        //                     padding: 0, // Remove padding to maximize crop area
        //                 }}
        //             >
        //                 {currentCropType && (
        //                     <Cropper
        //                         image={postImage || undefined}
        //                         crop={crop}
        //                         zoom={zoom}
        //                         aspect={currentCropType === "postImage" ? 1 : 16 / 9}
        //                         onCropChange={setCrop}
        //                         onZoomChange={setZoom}
        //                         onCropComplete={onCropComplete}
        //                         objectFit="contain"
        //                     />
        //                 )}
        //             </DialogContent>
        //             <DialogActions
        //                 sx={{
        //                     backgroundColor: "#121212",
        //                     padding: 2,
        //                     justifyContent: "center",
        //                 }}
        //             >
        //                 <Button
        //                     variant="contained"
        //                     onClick={handleCropConfirm}
        //                     sx={{
        //                         backgroundColor: "#c2185b",
        //                         "&:hover": { backgroundColor: "#ad1457" },
        //                     }}
        //                 >
        //                     Crop
        //                 </Button>
        //             </DialogActions>
        //         </Dialog>
        //     </Box>
        //     <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}>
        //         <Alert
        //             onClose={() => setOpenSuccess(false)}
        //             severity="success"
        //             variant="filled"
        //             sx={{ width: '100%' }}
        //         >
        //             Your post is created successfully!
        //         </Alert>
        //     </Snackbar>
        // </Box>
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />
            <Box
                sx={{
                    backgroundColor: "#000",
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: { xs: 2, sm: 3 }, // Adjust padding for smaller screens
                }}
            >
                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        backgroundColor: "#000000",
                        borderRadius: "16px",
                        maxWidth: "600px",
                        padding: { xs: "16px", sm: "32px" }, // Adjust padding for smaller screens
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                        width: "100%", // Full width on mobile
                    }}
                >
                    <Button
                        onClick={() => router.back()}
                        startIcon={<ArrowLeft />}
                        sx={{
                            textTransform: "none",
                            color: "rgba(255, 255, 255, 0.7)",
                            float: "left",
                            minWidth: 'auto',
                            fontSize: { xs: "14px", sm: "16px" }, // Smaller font for mobile
                            fontWeight: "medium",
                            "&:hover": {
                                color: "#fff",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                            },
                        }}
                    >
                        Back
                    </Button>

                    <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#fff",
                                fontWeight: "bold",
                                mb: 2,
                                fontSize: { xs: "1rem", sm: "1.25rem" }, // Adjust font size for mobile
                            }}
                        >
                            POST Photo
                        </Typography>

                        {/* Image Upload Box */}
                        <Box
                            sx={{
                                width: { xs: 300, sm: 400 }, // Smaller box on mobile
                                height: { xs: 300, sm: 400 },
                                border: `2px dashed ${errors.postImageCropped ? "red" : "#fff"}`,
                                borderRadius: "16px",
                                backgroundColor: "#000000",
                                margin: "0 auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {postImageCropped ? (
                                <img
                                    src={postImageCropped}
                                    alt="Cropped Avatar"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "100%",
                                        width: "auto",
                                        height: "auto",
                                        objectFit: "contain",
                                        objectPosition: "center",
                                    }}
                                />
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, "postImage")}
                                        style={{ display: "none" }}
                                        id="upload-post-image"
                                    />
                                    <label htmlFor="upload-post-image">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <img
                                                src="/photocamera.png"
                                                alt="Upload"
                                                style={{ width: "40px", height: "40px" }}
                                            />
                                            <Typography
                                                sx={{
                                                    color: "#fff",
                                                    mt: 1,
                                                    fontSize: { xs: "0.875rem", sm: "1rem" }, // Adjust text size
                                                }}
                                            >
                                                Click to select an Image
                                            </Typography>
                                        </Box>
                                    </label>
                                </>
                            )}
                        </Box>
                        {errors.postImageCropped && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {errors.postImageCropped}
                            </Typography>
                        )}
                    </Grid>

                    {/* Caption Input */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography
                            sx={{
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: { xs: "1rem", sm: "1.25rem" }, // Adjust font size for mobile
                            }}
                        >
                            Caption
                        </Typography>
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                            }}
                        >
                            <TextField
                                placeholder="Write Media Caption..."
                                fullWidth
                                value={caption}
                                onChange={(e) => {
                                    setCaption(e.target.value);
                                    setErrors((prev: any) => ({ ...prev, caption: "" })); // Clear error
                                }}
                                sx={{
                                    backgroundColor: "#fff",
                                    borderRadius: "16px",
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                            borderRadius: "16px",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "white", // Border color on hover
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "white",
                                        },
                                        "&.Mui-focused": {
                                            borderColor: "white",
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        textAlign: "center", // Center text alignment
                                        fontSize: { xs: "0.875rem", sm: "1rem" }, // Adjust font size for mobile
                                    },
                                }}
                                variant="outlined"
                                inputProps={{
                                    style: {
                                        textAlign: "center",
                                    },
                                }}
                            />
                            {errors.caption && (
                                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                    {errors.caption}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Continue Button */}
                    <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                        <Button
                            onClick={() => handleSubmitPost()}
                            loading={loading} // 'loading' is likely not a valid prop
                            sx={{
                                bgcolor: '#f50057',
                                '&:hover': { bgcolor: '#c51162' },
                                borderRadius: 2,
                                textTransform: 'none',
                                px: { xs: 2, sm: 3 }, // Adjust padding for mobile
                                py: { xs: 1, sm: 1.5 }, // Adjust padding for mobile
                                fontSize: { xs: "0.875rem", sm: "1rem" }, // Adjust font size for mobile
                                color: 'white',
                            }}
                        >
                            Create Post
                        </Button>
                    </Grid>
                </Grid>

                {/* Cropper Dialog */}
                <Dialog open={openCropper} onClose={() => setOpenCropper(false)}>
                    <DialogContent
                        sx={{
                            backgroundColor: "#000",
                            color: "#fff",
                            width: { xs: "300px", sm: "400px" }, // Adjust width for smaller screens
                            height: { xs: "300px", sm: "400px" },
                            position: "relative",
                            padding: 0, // Remove padding to maximize crop area
                        }}
                    >
                        {currentCropType && (
                            <Cropper
                                image={postImage || undefined}
                                crop={crop}
                                zoom={zoom}
                                aspect={currentCropType === "postImage" ? 1 : 16 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                objectFit="contain"
                            />
                        )}
                    </DialogContent>
                    <DialogActions
                        sx={{
                            backgroundColor: "#121212",
                            padding: 2,
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleCropConfirm}
                            sx={{
                                backgroundColor: "#c2185b",
                                "&:hover": { backgroundColor: "#ad1457" },
                            }}
                        >
                            Crop
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}>
                <Alert
                    onClose={() => setOpenSuccess(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Your post is created successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
}
