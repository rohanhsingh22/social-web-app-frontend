import { io, type Socket } from "socket.io-client";
import { config } from "@/lib/config";
import { ensureFreshAccessToken } from "@/lib/auth-token";

export const REALTIME_NAMESPACE = "/channels";
export const REALTIME_DM_NAMESPACE = "/dm";
export const REALTIME_NOTIFICATIONS_NAMESPACE = "/notifications";
export const REALTIME_HOME_NAMESPACE = "/home";

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

export async function createChannelSocket(): Promise<Socket> {
  const token = await ensureFreshAccessToken();

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

export type DmSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export type DmMessagePayload = {
  id: string;
  conversationId: string;
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

export type DmErrorPayload = {
  code: string;
  message?: string;
  retryAfterMs?: number;
};

export type DmSendAck =
  | { ok: true; message: DmMessagePayload }
  | { ok: false; code: string; retryAfterMs?: number };

export async function createDmSocket(): Promise<Socket> {
  const token = await ensureFreshAccessToken();

  return io(`${config.realtimeUrl}${REALTIME_DM_NAMESPACE}`, {
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

export type NotificationsSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export async function createNotificationsSocket(): Promise<Socket> {
  const token = await ensureFreshAccessToken();

  return io(`${config.realtimeUrl}${REALTIME_NOTIFICATIONS_NAMESPACE}`, {
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

export type HomeSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export type HomeInvitationPayload = {
  id: string;
  homeId: string;
  inviterId: string;
  inviteeId: string;
  status?: string;
  expiresAt: string;
};

export type HomeJoinRequestPayload = {
  id: string;
  homeId: string;
  requesterId: string;
  targetMemberId: string;
  status?: string;
  expiresAt: string;
};

export type HomeStatePayload = {
  userIds?: string[];
};

export async function createHomeSocket(): Promise<Socket> {
  const token = await ensureFreshAccessToken();

  return io(`${config.realtimeUrl}${REALTIME_HOME_NAMESPACE}`, {
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
