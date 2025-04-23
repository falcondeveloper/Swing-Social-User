"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    AppBar,
    Toolbar,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom,
    Grow,
    alpha,
    styled,
} from "@mui/material";
import {
    Search as SearchIcon,
    Favorite,
    FavoriteBorder,
    ShoppingCart,
    FilterList,
    LocalOffer,
    AddCircleOutline,
} from "@mui/icons-material";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Slider from "react-slick"; // Import the react-slick slider
import "slick-carousel/slick/slick.css"; // Import the slick carousel CSS
import "slick-carousel/slick/slick-theme.css"; // Import the slick carousel theme CSS
import { useRouter } from "next/navigation";
const Marketplace: React.FC = () => {

    const ComingSoonText = styled(Typography)(({ theme }) => ({
        fontSize: "3rem",
        fontWeight: 700,
        letterSpacing: "2px",
        textTransform: "uppercase",
        textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        [theme.breakpoints.down("sm")]: {
            fontSize: "2rem",
        },
    }));

    const MaskOverlay = styled(Box)(({ theme }) => ({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black overlay
        zIndex: 9999, // Ensure it sits above all content
        display: "flex",
        alignItems: "center", // Center the content vertically
        justifyContent: "center", // Center the content horizontally
        color: "#fff",
        textAlign: "center",
    }));
 
//     return (
//         <>
//     <Box sx={{ color: "white", padding: "10px" }}>
//         <Header />

//         {/* Full-Width Heading with Background Image */}
//         <Box
//             sx={{
//                 width: "100%",
//                 height: { lg: 200, xs: 90 },
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundImage: 'url("/slider_/6.jpg")',
//                 backgroundSize: "cover",
//                 backgroundRepeat: "no-repeat",
//                 backgroundPosition: "center",
//                 marginTop: { lg: "98px", xs: "90px" },
//             }}
//         >
//             {/* Optional Heading or Content */}
//         </Box>

//         {/* Category Card List */}
//         <Box sx={{
//         padding: {
//             xs: "0px 10px", // For extra small screens (2 images per row)
//             sm: "0px 20px", // For small screens (3 images per row)
//             md: "0px 50px", // For medium screens (4 images per row)
//             lg: "0px 60px", // For large screens (6 images per row)
//             xl: "0px 100px", // For extra-large screens (6 images per row)
//         },
//         marginTop: "10px",
//     }}>
//             <Grid container spacing={1}>
//                 {products.map((category, index) => (
//                     <Grid
//                         item
//                         xs={6} // 2 images per row on extra small screens
//                         sm={5} // 3 images per row on small screens
//                         md={4} // 4 images per row on medium screens
//                         lg={3} // 6 images per row on large screens
//                         xl={3} // 6 images per row on extra-large screens
//                         key={index}
//                         sx={{ cursor: "pointer" }}
//                     >
//                         <Card
//                             onClick={() => handleNavigate(category)}
//                             sx={{
//                                 backgroundColor: "#0a0a0a",
//                                 color: "white",
//                                 position: "relative",
//                                 overflow: "hidden",
//                                 width: "100%",
//                                 height: "100%",
//                                 aspectRatio: "1", // Square shape
//                             }}
//                         >
//                             <CardContent
//                                 sx={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     height: "100%",
//                                     position: "relative",
//                                 }}
//                             >
//                                 <Box
//                                     sx={{
//                                         backgroundImage: `url(${category?.CoverImageURL})`,
//                                         backgroundSize: "cover",
//                                         backgroundPosition: "center",
//                                         filter: "brightness(0.6)",
//                                         width: "100%",
//                                         height: "100%",
//                                         position: "absolute",
//                                     }}
//                                 ></Box>
//                             </CardContent>
//                         </Card>
//                     </Grid>
//                 ))}
//             </Grid>
//         </Box>

//         <Footer />
//     </Box>
// </>
//     );
return (
    <>
        {/* Mask Overlay */}
        <Header />
        <MaskOverlay>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column", // Stack items vertically
                    alignItems: "center", // Center horizontally
                    justifyContent: "center", // Center vertically
                    gap: 2, // Add spacing between elements
                }}
            >
                {/* Logo */}
                <Box
                    component="img"
                    src="/icon.png"
                    alt="Logo"
                    sx={{
                        width: "50px",
                        height: "auto",
                    }}
                />

                {/* Coming Soon Text */}
                <ComingSoonText>Coming Soon!</ComingSoonText>

                {/* Go Home Button */}
                <Button
                    variant="contained"
                    sx={{
                        mt: 2, // Add margin-top to separate it from the text
                        background: "linear-gradient(45deg, #FF1493, #FF69B4)",
                        color: "white",
                        borderRadius: "24px",
                        px: 4,
                        py: 1,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        "&:hover": {
                            background: "linear-gradient(45deg, #FF69B4, #FF1493)",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        },
                    }}
                    onClick={() => (window.location.href = "/home")} // Redirect to the home page
                >
                    Go Home
                </Button>
            </Box>
        </MaskOverlay>
        <Footer />
    </>
);
};

export default Marketplace;