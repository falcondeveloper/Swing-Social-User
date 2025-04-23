import React from "react";
import { Drawer, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import { Box } from "@mui/material"; // Fix for `Box` from Material-UI instead of `lucide-react`
import { useRouter } from "next/navigation";
import { List } from "lucide-react";

// Define the type for chat items
interface ChatItem {
  ChatId: string;
  ToProfileId: string;
  Avatar?: string;
  Username: string;
  LastUp?: string;
  Conversation?: string;
}

// Define the props for the component
interface ChatSidebarProps {
  chatList: ChatItem[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatList }) => {
  const router = useRouter();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 300,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 300,
          boxSizing: "border-box",
          bgcolor: "#1A1A1A",
          color: "white",
        },
      }}
    >
      <Typography variant="h6" sx={{ px: 2, py: 2, borderBottom: "1px solid #333" }}>
        Chats
      </Typography>
      <List>
        {chatList.length === 0 && (
          <Typography
            variant="body2"
            color="gray"
            textAlign="center"
            sx={{ py: 2 }}
          >
            No Chats Found
          </Typography>
        )}

        {chatList.map((chat) => (
          <ListItem
            onClick={() => router.push(`/messaging/${chat.ToProfileId}`)}
            key={chat.ChatId}
            sx={{
              px: 2,
              py: 1,
              bgcolor: "#333333",
              borderRadius: 2,
              cursor: "pointer",
              mt: 1,
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                transition: "left 0.5s ease",
              },
              "&:hover::before": {
                left: "100%",
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <ListItemAvatar>
              <Box
                sx={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "#FF1B6B",
                  overflow: "hidden",
                }}
              >
                <img
                  src={chat.Avatar || "/noavatar.png"}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </ListItemAvatar>
            <ListItemText
              primaryTypographyProps={{ color: "#FF1B6B", fontWeight: "bold" }}
              secondaryTypographyProps={{ color: "gray" }}
              primary={
                <span>
                  {chat.Username}
                  <span style={{ color: "#aaa", fontSize: "12px", marginLeft: "8px" }}>
                    (Last seen: {chat.LastUp || "N/A"})
                  </span>
                </span>
              }
              secondary={chat.Conversation || "No message yet"}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default ChatSidebar;
