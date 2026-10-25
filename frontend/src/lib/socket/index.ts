import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:4000");

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      upgrade: true,
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      path: "/socket.io/",
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket error:", err.message);
    });
  }

  return socket;
};

export const connectSocket = (user?: any) => {
  if (!user?.id) {
    console.log("❌ Invalid user for socket");
    return;
  }

  const s = getSocket();
  s.off("connect");

  s.on("connect", () => {
    console.log("✅ Socket connected:", s.id);
    console.log("🔌 Transport used:", s.io.engine.transport.name);

    s.emit("joinRooms", {
      id: user.id,
      fullName: user.fullName,
      role_id: user.role_id,
      region_ids: user.region_ids || [],
      zone_ids: user.zone_ids || [],
      city_ids: user.city_ids || [],
    });

    console.log("📡 joinRooms emitted");
  });

  if (!s.connected) {
    s.connect();
  }
};

export const disconnectSocket = () => {
  getSocket().disconnect();
};
