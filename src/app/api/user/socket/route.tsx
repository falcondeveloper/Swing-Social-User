import { Server } from "socket.io";

const SocketHandler = (req: any, res: any) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      path: "/api/user/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    // Store online users
    const onlineUsers = new Map(); // userId -> socketId

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // User joins their room
      socket.on("join", (userId) => {
        socket.join(`user_${userId}`);
        socket.data.userId = userId; // ✅ Use socket.data to store custom properties
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} joined room`);

        // Broadcast online status
        socket.broadcast.emit("user_online", userId);

        // Send list of currently online users to the newly connected user
        socket.emit("online_users", Array.from(onlineUsers.keys()));
      });

      // Handle new messages
      socket.on("send_message", (data) => {
        const { recipientId, message } = data;

        console.log(`Message from ${message.MemberIdFrom} to ${recipientId}`);

        // Send to recipient
        io.to(`user_${recipientId}`).emit("receive_message", message);

        // Send delivery confirmation to sender
        socket.emit("message_delivered", {
          messageId: message.ConversationId,
          status: "delivered",
        });
      });

      // Typing indicator
      socket.on("typing", (data) => {
        const { recipientId, isTyping, userId } = data;
        io.to(`user_${recipientId}`).emit("user_typing", {
          userId,
          isTyping,
        });
      });

      // Message read receipt
      socket.on("message_read", (data) => {
        const { senderId, messageId } = data;
        io.to(`user_${senderId}`).emit("message_read_receipt", {
          messageId,
          status: "read",
        });
      });

      // Store userId on socket for disconnect event
      socket.on("set_user_id", (userId) => {
        socket.data.userId = userId; // ✅ Use socket.data instead of socket.userId
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        const userId = socket.data.userId; // ✅ Get from socket.data
        console.log("Client disconnected:", socket.id, "userId:", userId);

        if (userId) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user_offline", userId);
        }
      });
    });
  }
  res.end();
};

export default SocketHandler;
