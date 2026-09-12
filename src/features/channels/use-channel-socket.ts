"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { ensureFreshAccessToken } from "@/lib/auth-token";
import { normalizeChannelMessage } from "@/lib/normalizers";
import {
  createChannelSocket,
  type ChannelErrorPayload,
  type ChannelMessagePayload,
  type ChannelPresencePayload,
  type ChannelSocketStatus,
  type SendAck,
} from "@/lib/realtime";
import type { ChannelMessage } from "@/types/domain";

type SendResult =
  | { ok: true; message: ChannelMessage }
  | { ok: false; code: string; retryAfterMs?: number };

type ChannelSocketApi = {
  status: ChannelSocketStatus;
  online: number | null;
  error: ChannelErrorPayload | null;
  banned: boolean;
  muted: boolean;
  sendMessage: (body: string) => Promise<SendResult>;
};

export function useChannelSocket(
  channelId: string | undefined,
  handlers: {
    onMessage?: (message: ChannelMessage) => void;
    onPresence?: (payload: ChannelPresencePayload) => void;
    onError?: (error: ChannelErrorPayload) => void;
  },
): ChannelSocketApi {
  const socketRef = useRef<Socket | null>(null);
  const channelIdRef = useRef(channelId);
  const handlersRef = useRef(handlers);
  const joinedChannelRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const [status, setStatus] = useState<ChannelSocketStatus>("idle");
  const [banned, setBanned] = useState(false);
  const [muted, setMuted] = useState(false);
  const [channelMeta, setChannelMeta] = useState<{
    channelId?: string;
    online: number | null;
    error: ChannelErrorPayload | null;
  }>({ online: null, error: null });

  if (channelMeta.channelId !== channelId) {
    setChannelMeta({ channelId, online: null, error: null });
  }

  useEffect(() => {
    let disposed = false;
    let socket: Socket | null = null;

    createChannelSocket().then((createdSocket) => {
      if (disposed) {
        createdSocket.disconnect();
        return;
      }

      socket = createdSocket;
      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("connected");
        setChannelMeta((current) => ({ ...current, error: null }));
      });

      socket.on("disconnect", () => {
        setStatus("disconnected");
        setChannelMeta((current) => ({ ...current, online: null }));
      });

      socket.io.on("reconnect_attempt", () => {
        setStatus("reconnecting");
      });

      socket.io.on("reconnect", () => {
        setStatus("connected");
        joinedChannelRef.current = undefined;
        const current = channelIdRef.current;
        if (current) {
          socket!.emit("channel:join", { channelId: current });
          joinedChannelRef.current = current;
        }
      });

      socket.on("connect_error", () => {
        setStatus("disconnected");
      });

      socket.on(
        "channel:message:new",
        (payload: ChannelMessagePayload) => {
          handlersRef.current.onMessage?.(normalizeChannelMessage(payload));
        },
      );

      socket.on(
        "channel:presence:update",
        (payload: ChannelPresencePayload) => {
          const online =
            payload && typeof payload.online === "number" ? payload.online : null;
          setChannelMeta((current) => ({ ...current, online }));
          handlersRef.current.onPresence?.(payload);
        },
      );

      socket.on("channel:error", (payload: ChannelErrorPayload) => {
        setChannelMeta((current) => ({ ...current, error: payload }));
        handlersRef.current.onError?.(payload);
      });

      socket.on("auth:error", async (payload: { code: string; message?: string }) => {
        setChannelMeta((current) => ({
          ...current,
          error: payload as ChannelErrorPayload,
        }));
        socket!.disconnect();

        const freshToken = await ensureFreshAccessToken();
        if (freshToken && socket) {
          socket.auth = { token: freshToken };
          socket.io.opts.extraHeaders = { Authorization: `Bearer ${freshToken}` };
          socket.connect();
        }
      });

      socket.on("user:banned", () => {
        setBanned(true);
      });

      socket.on("user:muted", () => {
        setMuted(true);
      });
    });

    return () => {
      disposed = true;
      if (socket) {
        const current = joinedChannelRef.current;
        if (current) {
          socket.emit("channel:leave", { channelId: current });
          joinedChannelRef.current = undefined;
        }
        socket.disconnect();
        socket.removeAllListeners();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !channelId) {
      return;
    }

    if (status !== "connected") {
      return;
    }

    const previous = joinedChannelRef.current;
    if (previous && previous !== channelId) {
      socket.emit("channel:leave", { channelId: previous });
    }

    socket.emit("channel:join", { channelId });
    joinedChannelRef.current = channelId;
  }, [channelId, status]);

  return useMemo(
    () => ({
      status,
      online: channelMeta.online,
      error: channelMeta.error,
      banned,
      muted,
      sendMessage: (body: string) =>
        sendChannelMessage(socketRef.current, channelIdRef.current, body),
    }),
    [status, channelMeta.online, channelMeta.error, banned, muted],
  );
}

function sendChannelMessage(
  socket: Socket | null,
  channelId: string | undefined,
  body: string,
): Promise<SendResult> {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({ ok: false, code: "OFFLINE" });
      return;
    }

    if (!channelId) {
      resolve({ ok: false, code: "CHANNEL_REQUIRED" });
      return;
    }

    socket.emit(
      "channel:message:send",
      { channelId, body },
      (ack: SendAck | undefined) => {
        if (!ack) {
          resolve({ ok: false, code: "NO_ACK" });
          return;
        }

        if (ack.ok) {
          resolve({ ok: true, message: normalizeChannelMessage(ack.message) });
          return;
        }

        resolve({ ok: false, code: ack.code, retryAfterMs: ack.retryAfterMs });
      },
    );
  });
}
