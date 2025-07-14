"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  CircularProgress,
  Chip,
  Container,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  FavoriteBorder,
  Favorite,
  Sell,
  Category,
} from "@mui/icons-material";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Select from "react-select";

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
  Price: number;
}

const Marketplace: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  const getAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/marketplace", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setProducts(data.products);

      const uniqueCategories = Array.from(
        new Set(data.products.map((p: Product) => p.Category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    getAllProducts();

    const saved = localStorage.getItem("savedItems");
    if (saved) {
      setSavedItems(JSON.parse(saved));
    }
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
    const currentPage = "MarketPlace";

    fetch("/api/user/tracking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        affiliate: aff,
        referral: refer,
        OS: getOS(),
        page: currentPage,
        url: currentUrl,
        userid: id ?? null,
      }),
    });

    if (id) setProfileId(id);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
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
          setIsLoading(false);
        } catch (error) {
          console.error("Error searching marketplace data:", error);
        }
      };
      searchProducts();
    } else {
      getAllProducts();
    }
  }, [searchQuery]);

  const handleNavigate = (product: Product) => {
    router.push(`/marketplace/${product.Id}`);
  };

  const toggleSavedItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedSavedItems;
    if (savedItems.includes(id)) {
      updatedSavedItems = savedItems.filter((item) => item !== id);
    } else {
      updatedSavedItems = [...savedItems, id];
    }
    setSavedItems(updatedSavedItems);
    localStorage.setItem("savedItems", JSON.stringify(updatedSavedItems));
  };

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      categoryFilter === "all" || product.Category === categoryFilter;

    let priceMatch = true;
    if (priceRange === "under50") {
      priceMatch = product.Price < 50;
    } else if (priceRange === "50to100") {
      priceMatch = product.Price >= 50 && product.Price <= 100;
    } else if (priceRange === "over100") {
      priceMatch = product.Price > 100;
    }

    return categoryMatch && priceMatch;
  });

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#1e1e1e",
      borderColor: state.isFocused ? "#d219c4" : "#333",
      fontSize: "14px",
      borderRadius: "12px",
      minHeight: "47px",
      cursor: "pointer",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(210, 25, 196, 0.2)" : "none",
      "&:hover": {
        borderColor: "#555",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#d219c4"
        : state.isFocused
        ? "#2a2a2a"
        : "#1e1e1e",
      color: state.isSelected ? "#fff" : "#f0f0f0",
      padding: "8px 12px",
      fontSize: "14px",
      cursor: "pointer",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#1e1e1e",
      border: "1px solid #333",
      borderRadius: "8px",
      zIndex: 9999,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#f0f0f0",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "#f0f0f0",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#aaa",
    }),
  };

  if (!isClient) return null;

  return (
    <Box
      sx={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mt: { xs: 2, md: 3 },
            mb: 3,
            fontWeight: 700,
            background: "linear-gradient(45deg, #e91e63, #9c27b0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Marketplace
        </Typography>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#ccc" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-input": {
                    color: "#f0f0f0",
                    py: 1.5,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#333" },
                    "&:hover fieldset": { borderColor: "#555" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d219c4",
                      boxShadow: "0 0 0 2px rgba(210, 25, 196, 0.2)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} sm={6} md={2}>
              <Select
                options={[
                  { value: "all", label: "All Categories" },
                  ...categories.map((category) => ({
                    value: category,
                    label: category,
                  })),
                ]}
                value={{
                  value: categoryFilter,
                  label:
                    categoryFilter === "all"
                      ? "All Categories"
                      : categoryFilter,
                }}
                onChange={(selectedOption: any) =>
                  setCategoryFilter(selectedOption.value)
                }
                placeholder="Category"
                styles={customStyles}
                isSearchable={false}
              />
            </Grid>

            <Grid item xs={6} sm={6} md={2}>
              <Select
                options={[
                  { value: "all", label: "All Prices" },
                  { value: "under50", label: "Under $50" },
                  { value: "50to100", label: "$50 - $100" },
                  { value: "over100", label: "Over $100" },
                ]}
                value={{
                  value: priceRange,
                  label:
                    priceRange === "all"
                      ? "All Prices"
                      : priceRange === "under50"
                      ? "Under $50"
                      : priceRange === "50to100"
                      ? "$50 - $100"
                      : "Over $100",
                }}
                onChange={(selectedOption: any) =>
                  setPriceRange(selectedOption.value)
                }
                placeholder="Price"
                styles={customStyles}
                isSearchable={false}
              />
            </Grid>

            <Grid item xs={6} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FavoriteBorder />}
                // onClick={() => router.push("/marketplace/saved")}
                sx={{
                  backgroundColor: "#1e1e1e",
                  color: "#f0f0f0",
                  borderRadius: "12px",
                  px: 2,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#2a2a2a",
                  },
                }}
              >
                Saved Items
              </Button>
            </Grid>

            <Grid item xs={6} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Sell />}
                onClick={() => router.push(`/marketplace/create/${profileId}`)}
                sx={{
                  background: "linear-gradient(45deg, #d219c4, #6c1dd6)",
                  color: "#fff",
                  borderRadius: "12px",
                  px: 2,
                  py: 1.5,
                  "&:hover": {
                    background: "linear-gradient(45deg, #b815aa, #5c19b8)",
                  },
                }}
              >
                Sell
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Products Grid */}
        <Box
          sx={{
            minHeight: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <CircularProgress sx={{ color: "#d219c4" }} size={60} />
          ) : filteredProducts.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                width: "100%",
              }}
            >
              <Typography variant="h6" sx={{ color: "#aaa", mb: 2 }}>
                {searchQuery
                  ? "No products match your search."
                  : "No products available."}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setPriceRange("all");
                }}
                sx={{
                  color: "#d219c4",
                  borderColor: "#d219c4",
                  "&:hover": {
                    backgroundColor: "rgba(210, 25, 196, 0.08)",
                    borderColor: "#d219c4",
                  },
                }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={index}
                  sx={{
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Card
                    onClick={() => handleNavigate(product)}
                    sx={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      backgroundColor: "#1e1e1e",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      transition: "all 0.3s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid #333",
                      "&:hover": {
                        boxShadow: "0 12px 28px rgba(210, 25, 196, 0.2)",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        height: { xs: 300, sm: 300, md: 400 },
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={
                          product.CoverImageUrl || "/placeholder-product.jpg"
                        }
                        alt={product.Title}
                        fill
                        style={{
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.jpg";
                        }}
                        unoptimized
                      />

                      <IconButton
                        aria-label="save"
                        onClick={(e) => toggleSavedItem(product?.Id, e)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: savedItems.includes(product?.Id)
                            ? "#ff4081"
                            : "#fff",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        {savedItems.includes(product?.Id) ? (
                          <Favorite fontSize="small" />
                        ) : (
                          <FavoriteBorder fontSize="small" />
                        )}
                      </IconButton>
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: "#fff",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.Title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#bbb",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 2,
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {product.Description}
                      </Typography>
                    </CardContent>
                    <Box
                      sx={{
                        px: 2,
                        pb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#ff1b6b",
                          fontWeight: 700,
                        }}
                      >
                        ${product.Price.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Chip
                          icon={<Category sx={{ color: "white" }} />}
                          label={product.Category}
                          size="medium"
                          sx={{
                            backgroundColor: "#FF1B6B",
                            color: "#fff",
                            fontWeight: 500,
                            "& .MuiChip-icon": {
                              color: "#fff",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Marketplace;
