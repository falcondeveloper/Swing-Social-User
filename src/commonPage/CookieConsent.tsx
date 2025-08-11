import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  Slide,
} from "@mui/material";
import { useEffect, useState } from "react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "false");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          position: "fixed",
          bottom: 16,
          left: { xs: 8, sm: 24 },
          right: { xs: 8, sm: 24 },
          p: 2,
          borderRadius: 2,
          backgroundColor: "#1A0B2E",
          color: "#fff",
          zIndex: 2000,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          boxShadow: "0px 8px 24px rgba(0,0,0,0.3)",
        }}
        elevation={6}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            lineHeight: 1.5,
            fontSize: "0.95rem",
          }}
        >
          We use cookies to improve your experience. By using our site, you
          accept our{" "}
          <a
            href="/cookie-policy"
            style={{ color: "#ff80ab", textDecoration: "underline" }}
          >
            cookie policy
          </a>
          .
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Button
            size="small"
            variant="contained"
            sx={{
              backgroundColor: "#c2185b",
              "&:hover": { backgroundColor: "#ad1457" },
              textTransform: "none",
            }}
            onClick={handleAccept}
          >
            Accept
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#fff",
              textTransform: "none",
              "&:hover": { borderColor: "#ff80ab", color: "#ff80ab" },
            }}
            onClick={handleDecline}
          >
            Decline
          </Button>
        </Box>

        <IconButton
          size="small"
          sx={{
            color: "#fff",
            position: { xs: "absolute", sm: "static" },
            top: { xs: 8 },
            right: { xs: 8 },
          }}
          onClick={handleDecline}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Slide>
  );
};

export default CookieConsent;
