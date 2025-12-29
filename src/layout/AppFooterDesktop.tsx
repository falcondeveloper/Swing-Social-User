"use client";

import { Box, Container, IconButton, Typography, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import {
  FacebookOutlined as FacebookIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";

const AppFooterDesktop = () => {
  const router = useRouter();
  return (
    <>
      <Box
        sx={{
          bgcolor: "#121212",
          color: "white",
        }}
      >
        <Box
          sx={{
            bgcolor: "#1A1A1A",
            borderTop: "1px solid",
            borderColor: "rgba(255,255,255,0.1)",
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
                mb: 6,
              }}
            >
              {/* Company Info */}
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #FF1B6B, #FF758C)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    SwingSocial
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}
                >
                  Connect, Learn, and Explore with Like-minded People in our
                  vibrant community.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    href="https://facebook.com/swingsocial"
                    target="_blank"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "#FF1B6B",
                        transform: "translateY(-3px)",
                        transition: "all 0.3s ease",
                      },
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton
                    href="https://instagram.com/swingsocial"
                    target="_blank"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "#FF1B6B",
                        transform: "translateY(-3px)",
                        transition: "all 0.3s ease",
                      },
                    }}
                  >
                    <InstagramIcon />
                  </IconButton>
                </Stack>
              </Box>

              {/* Quick Links */}
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Quick Links
                </Typography>
                {[
                  { name: "Members", url: "/members", internal: true },
                  { name: "Events", url: "/events", internal: true },
                  {
                    name: "Blog",
                    url: "https://swingsocial.co/blog/",
                    internal: false,
                  },
                  {
                    name: "Travel",
                    url: "https://swingsocial.co/travel/",
                    internal: false,
                  },
                  {
                    name: "Contact",
                    url: "https://swingsocial.co/contact-us/",
                    internal: false,
                  },
                  {
                    name: "Affiliate",
                    url: "/earn-money-referrals",
                    internal: true,
                  },
                ].map((item) => (
                  <Typography
                    key={item.name}
                    variant="body2"
                    component="span"
                    onClick={() =>
                      item.internal
                        ? router.push(item.url)
                        : window.open(item.url, "_blank")
                    }
                    sx={{
                      display: "block",
                      color: "rgba(255,255,255,0.7)",
                      mb: 1.5,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#FF1B6B",
                        transform: "translateX(5px)",
                      },
                    }}
                  >
                    {item.name}
                  </Typography>
                ))}
              </Box>

              {/* Contact Info */}
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Contact Us
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="mailto:info@swingsocial.co"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mb: 1.5,
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#FF1B6B",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Email: info@swingsocial.co
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mb: 1.5,
                  }}
                >
                  Location: ARLINGTON, VA
                </Typography>
              </Box>
            </Box>

            {/* Copyright */}
            <Box
              sx={{
                pt: 3,
                borderTop: "1px solid",
                borderColor: "rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  © 2025 SwingSocial. All rights reserved.
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="https://swingsocial.co/privacy/"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    "&:hover": {
                      color: "#FF1B6B",
                    },
                  }}
                >
                  Privacy Policy
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="https://swingsocial.co/terms-of-use/"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    "&:hover": {
                      color: "#FF1B6B",
                    },
                  }}
                >
                  Terms of Use
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="https://swingsocial.co/refund/"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    "&:hover": {
                      color: "#FF1B6B",
                    },
                  }}
                >
                  Refund Policy
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="https://swingsocial.co/optout/"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    "&:hover": {
                      color: "#FF1B6B",
                    },
                  }}
                >
                  Opt-Out
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    href="https://facebook.com/swingsocial"
                    target="_blank"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "#FF1B6B",
                      },
                    }}
                  >
                    <FacebookIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    href="https://instagram.com/swingsocial"
                    target="_blank"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "#FF1B6B",
                      },
                    }}
                  >
                    <InstagramIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default AppFooterDesktop;
