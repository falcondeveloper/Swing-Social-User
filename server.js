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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
    console.log("messaging event");
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const broadcastMessage = (message) => {
  io.emit("message", message);
};

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
