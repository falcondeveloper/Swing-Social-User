const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  const message = "It works!\n";
  const version = `NodeJS ${process.versions.node}\n`;
  res.end(`${message}${version}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://swing-social-user.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const users = new Map();
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log(`✅ A user connected: ${socket.id}`);

  socket.on("register", (userId) => {
    console.log(`📝 User registered: ${userId} (Socket: ${socket.id})`);

    users.set(userId, {
      socketId: socket.id,
      userId: userId,
      online: true,
      lastSeen: new Date().toISOString(),
    });

    userSockets.set(socket.id, userId);

    socket.broadcast.emit("user_online", {
      userId,
      timestamp: new Date().toISOString(),
    });

    socket.emit("registered", {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    console.log(`👥 Total connected users: ${users.size}`);
  });

  socket.on("message", (data) => {
    console.log(`📨 Message from ${data.from} to ${data.to}`);
    console.log(`💬 Content: ${data.message?.substring(0, 50)}...`);

    const recipientData = users.get(data.to);

    if (recipientData && recipientData.online) {
      io.to(recipientData.socketId).emit("message", {
        message: data.message,
        from: data.from,
        to: data.to,
        senderAvatar: data.senderAvatar || "/noavatar.png",
        senderUsername: data.senderUsername || "User",
        timestamp: data.timestamp || new Date().toISOString(),
        messageId: `msg-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        chatId: data.chatId,
      });

      socket.emit("message_delivered", {
        to: data.to,
        messageId: data.messageId,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `✅ Message delivered to ${data.to} (Socket: ${recipientData.socketId})`
      );
    } else {
      console.log(`⚠️ Recipient ${data.to} is offline`);

      socket.emit("message_pending", {
        to: data.to,
        message:
          "Recipient is offline. Message will be delivered when they come online.",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    console.log(`⌨️ ${data.from} is typing to ${data.to}`);

    const recipientData = users.get(data.to);

    if (recipientData && recipientData.online) {
      io.to(recipientData.socketId).emit("typing", {
        from: data.from,
        to: data.to,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle stop typing indicator
  socket.on("stop_typing", (data) => {
    const recipientData = users.get(data.to);

    if (recipientData && recipientData.online) {
      io.to(recipientData.socketId).emit("stop_typing", {
        from: data.from,
        to: data.to,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle message read receipts
  socket.on("message_read", (data) => {
    console.log(`👁️ Message ${data.messageId} read by ${data.readBy}`);

    const senderData = users.get(data.senderId);

    if (senderData && senderData.online) {
      io.to(senderData.socketId).emit("message_read", {
        messageId: data.messageId,
        readBy: data.readBy,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle user requesting online status
  socket.on("check_user_status", (data) => {
    const userData = users.get(data.userId);

    socket.emit("user_status_response", {
      userId: data.userId,
      online: userData ? userData.online : false,
      lastSeen: userData ? userData.lastSeen : null,
    });
  });

  // Get all online users
  socket.on("get_online_users", () => {
    const onlineUsers = Array.from(users.values())
      .filter((user) => user.online)
      .map((user) => ({
        userId: user.userId,
        online: user.online,
        lastSeen: user.lastSeen,
      }));

    socket.emit("online_users", onlineUsers);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const userId = userSockets.get(socket.id);

    if (userId) {
      console.log(`❌ User disconnected: ${userId} (Socket: ${socket.id})`);

      // Update user status
      const userData = users.get(userId);
      if (userData) {
        userData.online = false;
        userData.lastSeen = new Date().toISOString();

        // Notify others that user went offline
        socket.broadcast.emit("user_offline", {
          userId,
          lastSeen: userData.lastSeen,
        });
      }

      // Clean up socket mapping
      userSockets.delete(socket.id);

      // Optional: Remove user completely after 5 minutes of inactivity
      setTimeout(() => {
        const currentUserData = users.get(userId);
        if (currentUserData && !currentUserData.online) {
          users.delete(userId);
          console.log(`🗑️ Removed inactive user: ${userId}`);
        }
      }, 5 * 60 * 1000); // 5 minutes

      console.log(
        `👥 Remaining connected users: ${
          Array.from(users.values()).filter((u) => u.online).length
        }`
      );
    } else {
      console.log(`❌ A user disconnected: ${socket.id}`);
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("❗ Socket error:", error);
  });
});

// Broadcast message to all users (keeping your original function)
const broadcastMessage = (message) => {
  console.log("📢 Broadcasting message to all users");
  io.emit("message", message);
};

// Get connected users count
const getConnectedUsersCount = () => {
  return Array.from(users.values()).filter((user) => user.online).length;
};

// Get all connected users
const getConnectedUsers = () => {
  return Array.from(users.values())
    .filter((user) => user.online)
    .map((user) => ({
      userId: user.userId,
      socketId: user.socketId,
      lastSeen: user.lastSeen,
    }));
};

// Log statistics every 30 seconds
setInterval(() => {
  const onlineCount = getConnectedUsersCount();
  const totalCount = users.size;
  console.log(
    `📊 Stats - Online: ${onlineCount} | Total registered: ${totalCount}`
  );
}, 30000);

server.listen(3001, () => {
  console.log("🚀 Server is running on port 3001");
  console.log("📡 WebSocket endpoint: ws://localhost:3001");
  console.log("✨ Real-time messaging is ready!");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received. Closing server gracefully...");

  // Notify all connected users
  io.emit("server_shutdown", {
    message: "Server is shutting down. Please reconnect in a moment.",
  });

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("⚠️ SIGINT received. Closing server gracefully...");

  io.emit("server_shutdown", {
    message: "Server is shutting down. Please reconnect in a moment.",
  });

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

// Export for external use if needed
module.exports = {
  io,
  server,
  broadcastMessage,
  getConnectedUsersCount,
  getConnectedUsers,
};
