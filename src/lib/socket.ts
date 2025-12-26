import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = "https://swing-social-socket-server.onrender.com/"

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
        });
    }
    return socket;
};
