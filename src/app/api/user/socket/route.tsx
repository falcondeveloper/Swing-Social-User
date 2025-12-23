import { Server } from "socket.io";
export const dynamic = "force-dynamic";

let io: Server | null = null;

export async function GET() {
  if (!io) {
    // @ts-ignore
    const server = global._socketServer;

    io = new Server(server, {
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Connected:", socket.id);

      socket.on("join-room", (roomId) => {
        socket.join(roomId);
      });

      socket.on("send-message", (payload) => {
        socket.to(payload.roomId).emit("receive-message", payload);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Disconnected:", socket.id);
      });
    });

    // @ts-ignore
    global._socketServer = io;
  }

  return new Response("Socket running");
}
