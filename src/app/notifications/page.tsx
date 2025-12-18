"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Switch,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Stack,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageSquare,
  Users,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  notificationService,
  NotificationSettings,
} from "@/services/notificationService";
import { useFCMToken } from "@/hooks/useFCMToken";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fcmToken = useFCMToken();

  const [notifications, setNotifications] = useState<NotificationSettings>(
    notificationService.getDefaultPreferences()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<any>();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    loadUserAndPreferences();
  }, []);

  const loadUserAndPreferences = async () => {
    try {
      setLoading(true);

      const storedUserId = localStorage.getItem("logged_in_profile");

      if (!storedUserId) {
        console.error("User ID missing in localStorage");
        setUserId(null);
        return;
      }

      setUserId(storedUserId);
      notificationService.setUserId(storedUserId);

      await notificationService.loadPreferences();
      const prefs =
        notificationService.getPreferences() as NotificationSettings;
      setNotifications(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
      notificationService.showLocalNotification(
        "Error",
        "Failed to load notification preferences",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings) => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "User not found. Please log in again.",
        severity: "error",
      });
      return;
    }

    const newValue = !notifications[key];
    const updatedSettings = {
      ...notifications,
      [key]: newValue,
    };

    setNotifications(updatedSettings);

    // Save to backend
    await savePreferences(updatedSettings);
  };

  const savePreferences = async (preferences: NotificationSettings) => {
    if (!userId) return;

    try {
      setSaving(true);
      const success = await notificationService.savePreferences(preferences);

      if (success) {
        setSnackbar({
          open: true,
          message: "Preferences saved successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSnackbar({
        open: true,
        message: "Error saving preferences",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "User not found. Please log in again.",
        severity: "error",
      });
      return;
    }

    const defaultSettings = notificationService.getDefaultPreferences();
    setNotifications(defaultSettings);
    await savePreferences(defaultSettings);
  };

  const handleTestNotification = async () => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "User not found. Please log in again.",
        severity: "error",
      });
      return;
    }

    if (!notifications.pushNotifications) {
      setSnackbar({
        open: true,
        message: "Enable push notifications first",
        severity: "warning",
      });
      return;
    }

    try {
      const success = await notificationService.sendTestNotification();

      if (success) {
        setSnackbar({
          open: true,
          message: "Test notification sent successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Test notification may not have been sent",
          severity: "info",
        });
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      setSnackbar({
        open: true,
        message: "Failed to send test notification",
        severity: "error",
      });
    }
  };

  const notificationItems = [
    {
      key: "pushNotifications",
      label: "Push Notifications",
      description: "Receive push notifications on your device",
      icon: <Bell size={20} />,
      color: "#FF1B6B",
      subDescription: fcmToken
        ? "Device registered"
        : "Enable browser notifications",
    },
    {
      key: "newMatches",
      label: "New Matches",
      description: "When someone matches with you",
      icon: <Heart size={20} />,
      color: "#FF1B6B",
      disabled: !notifications.pushNotifications,
    },
    {
      key: "messages",
      label: "Messages",
      description: "When you receive new messages",
      icon: <MessageSquare size={20} />,
      color: "#FF1B6B",
      disabled: !notifications.pushNotifications,
    },
    {
      key: "likes",
      label: "Likes",
      description: "When someone likes your profile",
      icon: <Heart size={20} />,
      color: "#FF1B6B",
      disabled: !notifications.pushNotifications,
    },
    {
      key: "requests",
      label: "Requests",
      description: "Connection or private images requests",
      icon: <Users size={20} />,
      color: "#FF1B6B",
      disabled: !notifications.pushNotifications,
    },
    {
      key: "friendRequests",
      label: "Friend Request",
      description: "When someone sends a friend request",
      icon: <UserPlus size={20} />,
      color: "#FF1B6B",
      disabled: !notifications.pushNotifications,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#FF1B6B" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <Container
        maxWidth="sm"
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          pb: { xs: 12, sm: 12, md: 6 },
          flex: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton onClick={() => router.back()} sx={{ color: "white" }}>
              <ArrowLeft size={24} />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  textAlign: "center",
                }}
              >
                Notification Settings
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#aaaaaa",
                  mt: 0.5,
                  textAlign: "center",
                }}
              >
                Manage your notification preferences
              </Typography>
            </Box>
            <Box sx={{ width: 40 }} />
          </Box>
        </Box>

        {/* Status Alert */}
        {!fcmToken && (
          <Alert
            severity="warning"
            sx={{ mb: 3, bgcolor: "rgba(255, 193, 7, 0.1)" }}
          >
            Browser notifications are disabled. Enable them to receive push
            notifications.
          </Alert>
        )}

        {!userId && (
          <Alert
            severity="error"
            sx={{ mb: 3, bgcolor: "rgba(244, 67, 54, 0.1)" }}
          >
            User not found. Please log in again.
          </Alert>
        )}

        {/* Preferences Card */}
        <Card
          sx={{
            background: "rgba(30, 30, 30, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 27, 107, 0.1)",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              spacing={2}
              divider={
                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />
              }
            >
              {notificationItems.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 2,
                    opacity: item.disabled ? 0.5 : 1,
                    "&:first-of-type": { pt: 0 },
                    "&:last-of-type": { pb: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 27, 107, 0.1)",
                        border: "1px solid rgba(255, 27, 107, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ color: "white", fontWeight: 500 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#aaaaaa", fontSize: "0.875rem" }}
                      >
                        {item.description}
                        {item.subDescription && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              color: fcmToken ? "#4CAF50" : "#FFC107",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {item.subDescription}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={
                      notifications[item.key as keyof NotificationSettings]
                    }
                    onChange={() =>
                      handleToggle(item.key as keyof NotificationSettings)
                    }
                    disabled={item.disabled || saving || !userId}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: item.color,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: item.color,
                        },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={handleTestNotification}
            fullWidth={isMobile}
            disabled={saving || !notifications.pushNotifications || !userId}
            sx={{
              backgroundColor: notifications.pushNotifications
                ? "#03dac5"
                : "#666",
              borderRadius: "12px",
              py: 1.5,
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: 600,
              textTransform: "none",
              minWidth: isMobile ? "auto" : "200px",
              "&:hover": {
                backgroundColor: notifications.pushNotifications
                  ? "#00c9b2"
                  : "#666",
              },
              "&.Mui-disabled": { backgroundColor: "#444", color: "#888" },
            }}
          >
            {saving ? "Saving..." : "Send Test Notification"}
          </Button>

          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth={isMobile}
            disabled={saving || !userId}
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "12px",
              py: 1.5,
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: 600,
              textTransform: "none",
              minWidth: isMobile ? "auto" : "140px",
              "&:hover": {
                borderColor: "#FF1B6B",
                backgroundColor: "rgba(255, 27, 107, 0.1)",
              },
            }}
          >
            Reset to Defaults
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: "#888", fontSize: "0.75rem" }}
          >
            {userId
              ? "Changes are saved automatically"
              : "Please log in to save preferences"}
            {saving && " (saving...)"}
          </Typography>
        </Box>
      </Container>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
}
