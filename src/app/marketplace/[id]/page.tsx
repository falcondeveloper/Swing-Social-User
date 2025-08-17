"use client";

import React, { useEffect, useState } from "react";
import {
  useMediaQuery,
  Input,
  Button,
  CircularProgress,
  Box,
  Typography,
  Divider,
  Chip,
  Container,
  Grid,
} from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { toast } from "react-toastify";
import { Email } from "@mui/icons-material";

type Params = Promise<{ id: string }>;

const PageContainer = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
`;

const ProductContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  background-color: #1a1a1a;
`;

const ProductGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-top: 20px;
  background-color: #1a1a1a;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  max-height: 550px;
  object-fit: cover;
  border-radius: 12px;
`;

const PriceTag = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ff1b6b;
  margin: 1rem 0;
`;

const DescriptionText = styled(Typography)`
  white-space: pre-line;
  line-height: 1.6;
  color: #e0e0e0;
`;

const MessageForm = styled.div`
  margin-top: 2rem;
  padding: 1.1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
`;

const SendButton = styled(Button)`
  background: linear-gradient(45deg, #0070f3 30%, #0062cc 90%);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  &:hover {
    background: linear-gradient(45deg, #0062cc 30%, #0052b3 90%);
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  width: 100%;
  background-color: #1e1e1e;
`;

export default function ResponsivePage(props: { params: Params }) {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [data, setData] = useState<any>(null);
  const [content, setContent] = useState<any>("");
  const [loginUserEmail, setLoginUserEmail] = useState<any>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = await props.params;
        const pid: any = params.id;

        const [productData, userData] = await Promise.all([
          fetch(`/api/marketplace/oneproduct`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: pid }),
          }).then((res) => res.json()),

          (async () => {
            const loginUserId = localStorage.getItem("logged_in_profile");
            if (loginUserId) {
              const response = await fetch(
                `/api/user/sweeping/user?id=${loginUserId}`
              );
              if (!response.ok) throw new Error("Failed to fetch user data");
              return await response.json();
            }
            return null;
          })(),
        ]);

        setData(productData.products[0]);

        if (userData) {
          setLoginUserEmail(userData.user?.Email || "");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [props.params]);

  const onSendEmail = async () => {
    setSending(true);
    try {
      const result = await fetch("/api/marketplace/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: data.Email,
          loginuser: loginUserEmail,
          content: content,
          subject: `About ${data.Title} in Swing Social Marketplace`,
        }),
      });

      if (result.ok) {
        toast.success("Email is sent successfully");
        setContent("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const onEmailContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <LoaderContainer>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: "#FF1B6B" }}
            />
            <Typography variant="h6" mt={3} color="#e0e0e0">
              Loading product details...
            </Typography>
          </Box>
        </LoaderContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header />
        <LoaderContainer>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h5" color="error" mb={2}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        </LoaderContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <Header />
        <LoaderContainer>
          <Typography variant="h5" color="#e0e0e0">
            Product not found
          </Typography>
        </LoaderContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <>
      <Header />
      <Container
        fixed
        sx={{
          px: { xs: 2, md: 0 },
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} md={6}>
            <Box>
              <ProductImage
                src={data.CoverImageUrl}
                alt={data.Title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/placeholder-product.png";
                }}
              />

              {!isMobile && (
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom color="#e0e0e0">
                    About the seller
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      width={50}
                      height={50}
                      borderRadius="50%"
                      bgcolor="#333"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="#e0e0e0"
                    >
                      <Typography>
                        {data.Username?.charAt(0)?.toUpperCase() || "U"}
                      </Typography>
                    </Box>
                    <Typography color="#e0e0e0">
                      {data.Username || "Unknown seller"}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                component="h1"
                gutterBottom
                color="#ffffff"
                sx={{
                  fontSize: {
                    xs: "2rem",
                    sm: "2.5rem",
                    md: "2.5rem",
                    lg: "3rem",
                    xl: "3.5rem",
                  },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {data.Title}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip
                  label={data.Category}
                  color="primary"
                  size="small"
                  sx={{ backgroundColor: "#FF1B6B", color: "#ffffff" }}
                />
              </Box>

              <PriceTag>${data.Price}</PriceTag>

              <Divider sx={{ my: 3, backgroundColor: "#333" }} />

              <Typography variant="h6" gutterBottom color="#e0e0e0">
                Description
              </Typography>
              <DescriptionText variant="body1" paragraph>
                {data.Description || "No description provided."}
              </DescriptionText>

              {data.ExternalURL && (
                <Box mt={3}>
                  <Button
                    href={data.ExternalURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    size="large"
                    sx={{
                      background:
                        "linear-gradient(45deg, #FF1B6B 30%, #FF8E9E 90%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #E0165B 30%, #FF7E8E 90%)",
                      },
                    }}
                  >
                    Order Now
                  </Button>
                </Box>
              )}

              <MessageForm>
                <Typography variant="h6" gutterBottom color="#e0e0e0">
                  Contact seller ({data.Username})
                </Typography>

                <Box mt={2}>
                  <Input
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Write your message here..."
                    value={content}
                    onChange={onEmailContent}
                    sx={{
                      backgroundColor: "#2e2e2e",
                      borderRadius: "8px",
                      padding: "12px",
                      color: "#ffffff",
                      "&:before": { borderBottom: "none !important" },
                      "&:after": { borderBottom: "none !important" },
                      "& input": {
                        color: "#ffffff",
                      },
                      "& textarea": {
                        color: "#ffffff",
                      },
                    }}
                  />

                  <Box
                    mt={2}
                    display="flex"
                    justifyContent={isMobile ? "center" : "flex-start"}
                  >
                    <SendButton
                      onClick={onSendEmail}
                      disabled={!content.trim() || sending}
                      size={isMobile ? "medium" : "large"}
                      startIcon={!sending && <Email />}
                    >
                      {sending ? (
                        <CircularProgress
                          size={20}
                          thickness={5}
                          sx={{ color: "white" }}
                        />
                      ) : (
                        "Send Message"
                      )}
                    </SendButton>
                  </Box>
                </Box>
              </MessageForm>

              {isMobile && (
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom color="#e0e0e0">
                    About the seller
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      width={50}
                      height={50}
                      borderRadius="50%"
                      bgcolor="#333"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="#e0e0e0"
                    >
                      <Typography>
                        {data.Username?.charAt(0)?.toUpperCase() || "U"}
                      </Typography>
                    </Box>
                    <Typography color="#e0e0e0">
                      {data.Username || "Unknown seller"}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ height: { xs: "72px", sm: "80px" } }} />
      <Footer />
    </>
  );
}
