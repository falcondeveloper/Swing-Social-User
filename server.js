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
});

// Store active users and their socket IDs
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins with their profile ID
  socket.on("user:join", (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);

    // Notify others that this user is online
    socket.broadcast.emit("user:online", { userId, socketId: socket.id });
  });

  // Join a specific chat room
  socket.on("chat:join", ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Send message to specific room
  socket.on("message:send", (data) => {
    const { to, from, message, roomId, timestamp } = data;

    // Create room ID (consistent regardless of who sends first)
    const chatRoomId = roomId || [from, to].sort().join("-");

    // Send to recipient if they're online
    const recipientSocketId = activeUsers.get(to);

    if (recipientSocketId) {
      // Send to specific user
      io.to(recipientSocketId).emit("message:receive", {
        from,
        to,
        message,
        roomId: chatRoomId,
        timestamp: timestamp || new Date().toISOString(),
        delivered: true,
      });

      // Send delivery confirmation to sender
      socket.emit("message:delivered", {
        to,
        timestamp: timestamp || new Date().toISOString(),
      });
    } else {
      // User is offline, just confirm sent
      socket.emit("message:sent", {
        to,
        timestamp: timestamp || new Date().toISOString(),
        delivered: false,
      });
    }

    console.log(`Message from ${from} to ${to}: ${message}`);
  });

  // Typing indicator
  socket.on("typing:start", ({ to, from }) => {
    const recipientSocketId = activeUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing:start", { from });
    }
  });

  socket.on("typing:stop", ({ to, from }) => {
    const recipientSocketId = activeUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing:stop", { from });
    }
  });

  // Message read receipt
  socket.on("message:read", ({ to, from, messageId }) => {
    const recipientSocketId = activeUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message:read", { from, messageId });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      // Notify others that this user is offline
      socket.broadcast.emit("user:offline", { userId: socket.userId });
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server is running on port 3001");
  console.log("Active connections will be logged here");
});
