const { Server } = require("socket.io");
const http = require("http");

// Create the HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    const message = "It works!\n";
    const version = `NodeJS ${process.versions.node}\n`;
    res.end(`${message}${version}`);
});

// Configure Socket.IO with CORS options
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow requests from this origin
        methods: ["GET", "POST"], // Allowed HTTP methods
    },
});

// Handle new connections
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("message", (msg) => {
        socket.broadcast.emit("message", msg); // Send message to all except sender
        console.log("messaging event")
    });
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Function to broadcast messages
const broadcastMessage = (message) => {
    io.emit("message", message);
};

// Start the server
server.listen(3001, () => {
    console.log("Server is running on port 3001");
});
