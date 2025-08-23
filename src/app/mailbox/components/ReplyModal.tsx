import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface ReplyModalProps {
  open: boolean;
  onClose: () => void;
  selectedMail: any;
  profileId: string;
  onReplySuccess?: () => void;
}

const ReplyModal = ({
  open,
  onClose,
  selectedMail,
  profileId,
  onReplySuccess,
}: ReplyModalProps) => {
  const [replyMessage, setReplyMessage] = useState("");

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      const response = await fetch("/api/user/mailbox/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromId: profileId,
          toId: selectedMail.ProfileFromId,
          htmlBody: replyMessage,
          subject: selectedMail.subject,
          image1: "",
          image2: "",
          image3: "",
          image4: "",
          image5: "",
          parentId: selectedMail.id,
        }),
      });

      if (response.ok) {
        setReplyMessage("");
        onClose();
        if (onReplySuccess) {
          onReplySuccess();
        }
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#121212",
          color: "white",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#000",
          py: 2,
          paddingLeft: 0,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            marginRight: "auto",
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
          Reply to Mail
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <h4 style={{ marginBottom: "10px" }}>RE: {selectedMail.subject}</h4>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Type your reply..."
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          sx={{
            backgroundColor: "#1A1A1A",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": {
                borderColor: "#333",
              },
            },
          }}
        />
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSendReply}
            sx={{
              backgroundColor: "#FF1B6B",
              "&:hover": {
                backgroundColor: "#E0145A",
              },
            }}
          >
            Send Reply
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;
