import { useSocketContext } from "@/context/SocketProvider";

export const useSocket = () => {
    const { socket, isConnected } = useSocketContext();

    if (!socket) {
        throw new Error("useSocket must be used inside SocketProvider");
    }

    return { socket, isConnected };
};
