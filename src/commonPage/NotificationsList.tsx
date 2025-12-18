"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Button,
  Chip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Bell,
  Check,
  Trash2,
  MoreVertical,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  user_id: number;
  sender_id: number;
  type: string;
  title: string;
  body: string;
  url: string;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<
    number | null
  >(null);

  useEffect(() => {
    const storedId = localStorage.getItem("logged_in_profile");
    if (storedId) {
      setProfileId(storedId);
    }
  }, []);

  useEffect(() => {
    if (profileId) {
      fetchNotifications();
    }
  }, [profileId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/notification/notification-list?profileId=${profileId}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // PATCH - Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        "/api/user/notification/notifications-list",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationIds: [notificationId],
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // PATCH - Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "/api/user/notification/notifications-list",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: profileId,
            markAllAsRead: true,
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // DELETE - Delete single notification
  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(
        `/api/user/notification/notifications-list?id=${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const deletedNotif = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update unread count if it was unread
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // DELETE - Clear all notifications
  const clearAllNotifications = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/user/notification/notifications-list?id=${profileId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={20} color="#FF1B6B" />;
      case "message":
        return <MessageCircle size={20} color="#2196F3" />;
      case "new_match":
        return <Heart size={20} color="#FF1B6B" fill="#FF1B6B" />;
      case "friend_request":
        return <UserPlus size={20} color="#4CAF50" />;
      default:
        return <Bell size={20} color="#FF1B6B" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121212",
        pt: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: "800px",
          mx: "auto",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Bell size={32} color="#FF1B6B" />
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  sx={{
                    bgcolor: "#FF1B6B",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.6)", mt: 0.5 }}
            >
              Stay updated with your activity
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
              <Button
                startIcon={<CheckCheck size={18} />}
                onClick={markAllAsRead}
                sx={{
                  color: "#FF1B6B",
                  borderColor: "#FF1B6B",
                  "&:hover": {
                    bgcolor: "rgba(255, 27, 107, 0.1)",
                    borderColor: "#FF1B6B",
                  },
                }}
                variant="outlined"
              >
                Mark All Read
              </Button>
            )}

            {/* Clear All Button */}
            {notifications.length > 0 && (
              <Button
                startIcon={<Trash2 size={18} />}
                onClick={clearAllNotifications}
                sx={{
                  color: "#F44336",
                  borderColor: "#F44336",
                  "&:hover": {
                    bgcolor: "rgba(244, 67, 54, 0.1)",
                    borderColor: "#F44336",
                  },
                }}
                variant="outlined"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <Bell size={64} color="rgba(255, 255, 255, 0.2)" />
            <Typography
              variant="h6"
              sx={{ color: "rgba(255, 255, 255, 0.6)", mt: 2 }}
            >
              No notifications yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.4)", mt: 1 }}
            >
              When you get notifications, they'll show up here
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.is_read
                    ? "rgba(255, 255, 255, 0.02)"
                    : "rgba(255, 27, 107, 0.05)",
                  border: notification.is_read
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "1px solid rgba(255, 27, 107, 0.2)",
                  borderRadius: "16px",
                  mb: 2,
                  p: 2,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateX(4px)",
                    bgcolor: "rgba(255, 27, 107, 0.08)",
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", width: "100%", gap: 2 }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#FFFFFF",
                        fontWeight: notification.is_read ? 500 : 600,
                        mb: 0.5,
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        mb: 1,
                      }}
                    >
                      {notification.body}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      {formatTime(notification.created_at)}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          bgcolor: "#FF1B6B",
                          borderRadius: "50%",
                        }}
                      />
                    )}

                    {/* More options */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnchorEl(e.currentTarget);
                        setSelectedNotification(notification.id);
                      }}
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        "&:hover": {
                          color: "#FF1B6B",
                          bgcolor: "rgba(255, 27, 107, 0.1)",
                        },
                      }}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedNotification(null);
        }}
        PaperProps={{
          sx: {
            bgcolor: "rgba(30, 30, 30, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        {selectedNotification &&
          !notifications.find((n) => n.id === selectedNotification)
            ?.is_read && (
            <MenuItem
              onClick={() => {
                if (selectedNotification) {
                  markAsRead(selectedNotification);
                }
                setAnchorEl(null);
              }}
              sx={{
                color: "#FFFFFF",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
              }}
            >
              <Check size={18} style={{ marginRight: 8 }} />
              Mark as Read
            </MenuItem>
          )}
        <MenuItem
          onClick={() => {
            if (selectedNotification) {
              deleteNotification(selectedNotification);
            }
            setAnchorEl(null);
          }}
          sx={{
            color: "#F44336",
            "&:hover": { bgcolor: "rgba(244, 67, 54, 0.1)" },
          }}
        >
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotificationsPage;
