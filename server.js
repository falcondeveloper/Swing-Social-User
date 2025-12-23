const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket server running\n");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`📥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send-message", (payload) => {
    const { roomId } = payload;

    if (!roomId) return;

    socket.to(roomId).emit("receive-message", payload);

    console.log("💬 Message sent to room:", roomId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const broadcastMessage = (message) => {
  io.emit("receive-message", message);
};

server.listen(3001, () => {
  console.log("🚀 Socket server running on port 3001");
});
