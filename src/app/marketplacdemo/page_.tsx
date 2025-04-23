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

// Enhanced styled components with animations
const StyledCard = styled(Card)(({ theme }) => ({
    position: "relative",
    borderRadius: 16,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    "&:hover": {
        transform: "translateY(-12px) scale(1.02)",
        boxShadow: "0 16px 32px rgba(0, 0, 0, 0.12)",
        "& .card-media": {
            transform: "scale(1.05)",
        },
        "& .card-overlay": {
            opacity: 1,
        },
    },
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        transform: "scale(1.08) translateY(-2px)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
}));

const CategoryBadge = styled(Typography)(({ theme }) => ({
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: "0.875rem",
    backdropFilter: "blur(8px)",
    zIndex: 1,
    transform: "translateY(0)",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "translateY(-2px)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
}));

// Mask overlay styles
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

// Text for "Coming Soon"
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

// Types
interface Product {
    Id: string;
    Active: boolean;
    Category: string;
    CoverImageURL: string;
    Description: string;
    ExternalURL: string;
    Rating: number;
    Title: string;
    Username: string;
}

const categories = [
    { name: "All", icon: <LocalOffer /> },
    { name: "Electronics", icon: <LocalOffer /> },
    { name: "Furniture", icon: <LocalOffer /> },
    { name: "Fashion", icon: <LocalOffer /> },
    { name: "Sports", icon: <LocalOffer /> },
    { name: "Vehicles", icon: <LocalOffer /> },
    { name: "Others", icon: <LocalOffer /> },
];

const Marketplace: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showAnimation, setShowAnimation] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchData = async () => {
            try {
                const id = localStorage.getItem("logged_in_profile");
                const response = await fetch("/api/marketplace", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ loginId: id }),
                });
                const data = await response.json();
                setProducts(data.products);
                setShowAnimation(true);
            } catch (error) {
                console.error("Error fetching marketplace data:", error);
            }
        };

        fetchData();
    }, []);

    const toggleFavorite = (productId: string) => {
        setFavorites((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const filteredProducts = products?.filter((product) => {
        const matchesCategory =
            selectedCategory === "All" || product.Category === selectedCategory;
        const matchesSearch = product.Title.toLowerCase().includes(
            searchQuery.toLowerCase()
        );
        return matchesCategory && matchesSearch;
    });

    if (!isClient) {
        return null; // Prevent SSR issues
    }

    const renderContent = () => (
        <Box
            sx={{
                minHeight: "100vh",
                background: isMobile
                    ? `url(https://swingsocialphotos.blob.core.windows.net/images/1738171077933_marketplace.jpeg) no-repeat center center fixed`
                    : "linear-gradient(145deg, #f8f9ff 0%, #f1f4f9 100%)",
                backgroundSize: "cover",
                pt: 8,
            }}
        >
            {/* Existing Content */}
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Your current marketplace content */}
            </Container>
        </Box>
    );

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

            {/* Render the existing content */}
            {renderContent()}
            <Footer />
        </>
    );
};

export default Marketplace;