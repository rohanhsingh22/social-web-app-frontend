import { io, type Socket } from "socket.io-client";
import { config } from "@/lib/config";
import { getAccessToken } from "@/lib/auth-token";

export const REALTIME_NAMESPACE = "/channels";

export type ChannelSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export type ChannelMessagePayload = {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  status?: string;
  createdAt: string;
  sender: {
    id?: string;
    profile?: {
      username?: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
};

export type ChannelPresencePayload = {
  channelId: string;
  online: number;
};

export type ChannelErrorPayload = {
  code: string;
  message?: string;
  retryAfterMs?: number;
};

export type SendAck =
  | { ok: true; message: ChannelMessagePayload }
  | { ok: false; code: string; retryAfterMs?: number };

export function createChannelSocket(): Socket {
  const token = getAccessToken();

  return io(`${config.realtimeUrl}${REALTIME_NAMESPACE}`, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}
