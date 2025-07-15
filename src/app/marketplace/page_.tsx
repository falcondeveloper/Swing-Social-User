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

// Enhanced styled components with animations
// const StyledCard = styled(Card)(({ theme }) => ({
//     position: "relative",
//     borderRadius: 16,
//     transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
//     background: "rgba(255, 255, 255, 0.95)",
//     backdropFilter: "blur(10px)",
//     "&:hover": {
//         transform: "translateY(-12px) scale(1.02)",
//         boxShadow: "0 16px 32px rgba(0, 0, 0, 0.12)",
//         "& .card-media": {
//             transform: "scale(1.05)",
//         },
//         "& .card-overlay": {
//             opacity: 1,
//         },
//     },
// }));

// const AnimatedChip = styled(Chip)(({ theme }) => ({
//     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//     "&:hover": {
//         transform: "scale(1.08) translateY(-2px)",
//         boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//     },
// }));

// const CategoryBadge = styled(Typography)(({ theme }) => ({
//     position: "absolute",
//     top: 16,
//     left: 16,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     color: "#fff",
//     padding: "6px 16px",
//     borderRadius: 20,
//     fontSize: "0.875rem",
//     backdropFilter: "blur(8px)",
//     zIndex: 1,
//     transform: "translateY(0)",
//     transition: "all 0.3s ease",
//     "&:hover": {
//         transform: "translateY(-2px)",
//         backgroundColor: "rgba(0, 0, 0, 0.8)",
//     },
// }));

// Mask overlay styles
// const MaskOverlay = styled(Box)(({ theme }) => ({
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//     backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black overlay
//     zIndex: 9999, // Ensure it sits above all content
//     display: "flex",
//     alignItems: "center", // Center the content vertically
//     justifyContent: "center", // Center the content horizontally
//     color: "#fff",
//     textAlign: "center",
// }));

// // Text for "Coming Soon"
// const ComingSoonText = styled(Typography)(({ theme }) => ({
//     fontSize: "3rem",
//     fontWeight: 700,
//     letterSpacing: "2px",
//     textTransform: "uppercase",
//     textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
//     [theme.breakpoints.down("sm")]: {
//         fontSize: "2rem",
//     },
// }));

// Types
interface Product {
  Id: string;
  Active: boolean;
  Category: string;
  CoverImageUrl: string;
  Description: string;
  ExternalURL: string;
  Rating: number;
  Title: string;
  Username: string;
  Price: Number;
}

// const categories = [
//     { name: "All", icon: <LocalOffer /> },
//     { name: "Electronics", icon: <LocalOffer /> },
//     { name: "Furniture", icon: <LocalOffer /> },
//     { name: "Fashion", icon: <LocalOffer /> },
//     { name: "Sports", icon: <LocalOffer /> },
//     { name: "Vehicles", icon: <LocalOffer /> },
//     { name: "Others", icon: <LocalOffer /> },
// ];

const Marketplace: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [profileId, setProfileId] = useState("");
  const router = useRouter();

  const getAllProducts = async () => {
    try {
      const response = await fetch("/api/marketplace", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setProducts(data.products);
      setShowAnimation(true);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    getAllProducts();
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("logged_in_profile");
    const urlParams = new URLSearchParams(window.location.search);
    const aff = urlParams.get("aff");
    const refer = urlParams.get("refer");

    const getOS = () => {
      const userAgent = window.navigator.userAgent;

      if (userAgent.indexOf("Win") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "MacOS";
      if (userAgent.indexOf("Android") !== -1) return "Android";
      if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";

      return "Unknown";
    };

    const currentUrl = window.location.href;
    const currentPage = "Marketplace";

    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((ipData) => {
        console.log("ipData", ipData);
        const ipv4 = ipData.ip;

        const payload = {
          affiliate: aff,
          referral: refer,
          OS: getOS(),
          page: currentPage,
          url: currentUrl,
          userid: id || null,
          ip: ipData?.ip,
          city: ipData?.city,
          region: ipData?.region,
          country_name: ipData?.country_name,
        };

        if (id) {
          setProfileId(id);
        }

        fetch("/api/user/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Tracking saved:", data);
          })
          .catch((err) => {
            console.error("Failed to save tracking:", err);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch IP:", err);
      });
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const searchProducts = async () => {
        try {
          const response = await fetch(
            `/api/marketplace/search?query=${searchQuery}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          setProducts(data.products.rows);
        } catch (error) {
          console.error("Error searching marketplace data:", error);
        }
      };
      searchProducts();
    } else {
      getAllProducts();
    }
  }, [searchQuery]);

  const handleNavigate = (category: any) => {
    router.push(`/marketplace/${category.Id}`);
  };

  // const toggleFavorite = (productId: string) => {
  //     setFavorites((prev) =>
  //         prev.includes(productId)
  //             ? prev.filter((id) => id !== productId)
  //             : [...prev, productId]
  //     );
  // };

  // const filteredProducts = products?.filter((product) => {
  //     const matchesCategory =
  //         selectedCategory === "All" || product.Category === selectedCategory;
  //     const matchesSearch = product.Title.toLowerCase().includes(
  //         searchQuery.toLowerCase()
  //     );
  //     return matchesCategory && matchesSearch;
  // });

  if (!isClient) {
    return null; // Prevent SSR issues
  }

  // const renderContent = () => (
  //     <Box
  //         sx={{
  //             minHeight: "100vh",
  //             background: isMobile
  //                 ? `url(https://swingsocialphotos.blob.core.windows.net/images/1738171077933_marketplace.jpeg) no-repeat center center fixed`
  //                 : "linear-gradient(145deg, #f8f9ff 0%, #f1f4f9 100%)",
  //             backgroundSize: "cover",
  //             pt: 8,
  //         }}
  //     >
  //         {/* Existing Content */}
  //         <Container maxWidth="lg" sx={{ mt: 4 }}>
  //             {/* Your current marketplace content */}
  //         </Container>
  //     </Box>
  // );

  // const sliderSettings = {
  //     dots: true,
  //     infinite: true,
  //     speed: 500,
  //     slidesToShow: 1,
  //     slidesToScroll: 1,
  //     autoplay: true,
  //     autoplaySpeed: 3000,
  // };

  return (
    <>
      <Box sx={{ color: "white", padding: "10px" }}>
        <Header />

        {/* Title */}
        <Typography
          variant="h6"
          component="h6"
          align="center"
          gutterBottom
          sx={{ marginTop: { xs: "100px", lg: "70px" } }}
        >
          Marketplace
        </Typography>

        <Box sx={{ marginTop: 2, marginBottom: 2 }}>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  fontSize: isMobile
                    ? "0.7rem"
                    : isTablet
                    ? "0.875rem"
                    : "1rem",
                  padding: isMobile
                    ? "3px 6px"
                    : isTablet
                    ? "8px 16px"
                    : "10px 20px",
                  backgroundColor: "#d219c4",
                }}
              >
                Saved Items
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  fontSize: isMobile
                    ? "0.7rem"
                    : isTablet
                    ? "0.875rem"
                    : "1rem",
                  padding: isMobile
                    ? "3px 16px"
                    : isTablet
                    ? "8px 16px"
                    : "10px 20px",
                  backgroundColor: "#d219c4",
                }}
                onClick={() => router.push(`/marketplace/create/${profileId}`)}
              >
                Sell
              </Button>
            </Grid>
            <Grid item>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  fontSize: isMobile
                    ? "0.6rem"
                    : isTablet
                    ? "0.875rem"
                    : "1rem",
                  width: isMobile ? "100%" : isTablet ? "300px" : "500px",
                  backgroundColor: "lightgray",
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Category Card List */}
        <Box
          sx={{
            padding: {
              xs: "0px 10px", // For extra small screens (2 images per row)
              sm: "0px 20px", // For small screens (3 images per row)
              md: "0px 50px", // For medium screens (4 images per row)
              lg: "0px 60px", // For large screens (6 images per row)
              xl: "0px 100px", // For extra-large screens (6 images per row)
            },
            // marginTop: { xs: "100px", lg: "70px" },
            marginBottom: { xs: "60px", lg: "10px" },
          }}
        >
          <Grid container spacing={1}>
            {products.map((category, index) => (
              <Grid
                item
                xs={6} // 2 images per row on extra small screens
                sm={5} // 3 images per row on small screens
                md={4} // 4 images per row on medium screens
                lg={3} // 6 images per row on large screens
                xl={3} // 6 images per row on extra-large screens
                key={index}
                sx={{ cursor: "pointer" }}
              >
                <div>
                  <Card
                    onClick={() => handleNavigate(category)}
                    sx={{
                      backgroundColor: "#0a0a0a",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                      width: "100%",
                      height: "100%",
                      aspectRatio: "1", // Square shape
                      borderRadius: "15px",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          height: "90%",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={category?.CoverImageUrl}
                          alt="Product"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          height: "5%",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "white", fontSize: "12px" }}
                        >
                          ${category?.Price.toString()}, {category?.Title}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                  {/* Add Material-UI Button Below */}
                  {/* <div style={{ width: "100%", textAlign: "center", marginTop: "10px", zIndex: "10" }}>
                                        <Button
                                            variant="contained" // Uncommented this line
                                            color="primary"
                                            sx={{
                                                backgroundColor: "#444", // Temporary debug color
                                                border: "1px solid #444", // Add a border for visibility
                                            }}
                                        >
                                            {category?.Category || "Test Button"}
                                        </Button>
                                    </div> */}
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Footer />
      </Box>
    </>
  );
};

export default Marketplace;
