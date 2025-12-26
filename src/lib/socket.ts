import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = "http://localhost:4000"

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
