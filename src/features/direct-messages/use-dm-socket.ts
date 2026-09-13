import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { ensureFreshAccessToken } from "@/lib/auth-token";
import { normalizeDmMessageForSocket } from "@/features/direct-messages/api";
import {
  createDmSocket,
  type DmErrorPayload,
  type DmMessagePayload,
  type DmSendAck,
  type DmSocketStatus,
} from "@/lib/realtime";
import type { DirectMessage } from "@/types/domain";

type SendResult =
  | { ok: true; message: DirectMessage }
  | { ok: false; code: string; retryAfterMs?: number };

type DmSocketApi = {
  status: DmSocketStatus;
  error: DmErrorPayload | null;
  banned: boolean;
  muted: boolean;
  sendMessage: (body: string) => Promise<SendResult>;
};

export function useDmSocket(
  conversationId: string | undefined,
  handlers: {
    onMessage?: (message: DirectMessage) => void;
    onError?: (error: DmErrorPayload) => void;
  },
): DmSocketApi {
  const socketRef = useRef<Socket | null>(null);
  const conversationIdRef = useRef(conversationId);
  const handlersRef = useRef(handlers);
  const joinedConversationRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const [status, setStatus] = useState<DmSocketStatus>("idle");
  const [banned, setBanned] = useState(false);
  const [muted, setMuted] = useState(false);
  const [socketMeta, setSocketMeta] = useState<{
    conversationId?: string;
    error: DmErrorPayload | null;
  }>({ error: null });

  if (socketMeta.conversationId !== conversationId) {
    setSocketMeta({ conversationId, error: null });
  }

  useEffect(() => {
    let disposed = false;
    let socket: Socket | null = null;

    createDmSocket().then((createdSocket) => {
      if (disposed) {
        createdSocket.disconnect();
        return;
      }

      socket = createdSocket;
      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("connected");
        setSocketMeta((current) => ({ ...current, error: null }));
      });

      socket.on("disconnect", () => {
        setStatus("disconnected");
      });

      socket.io.on("reconnect_attempt", () => {
        setStatus("reconnecting");
      });

      socket.io.on("reconnect", () => {
        setStatus("connected");
        joinedConversationRef.current = undefined;
        const current = conversationIdRef.current;
        if (current) {
          socket!.emit("dm:join", { conversationId: current });
          joinedConversationRef.current = current;
        }
      });

      socket.on("connect_error", () => {
        setStatus("disconnected");
      });

      socket.on("dm:message:new", (payload: DmMessagePayload) => {
        handlersRef.current.onMessage?.(normalizeDmMessageForSocket(payload));
      });

      socket.on("dm:error", (payload: DmErrorPayload) => {
        setSocketMeta((current) => ({ ...current, error: payload }));
        handlersRef.current.onError?.(payload);
      });

      socket.on("auth:error", async (payload: { code: string; message?: string }) => {
        setSocketMeta((current) => ({
          ...current,
          error: payload as DmErrorPayload,
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
        const current = joinedConversationRef.current;
        if (current) {
          socket.emit("dm:leave", { conversationId: current });
          joinedConversationRef.current = undefined;
        }
        socket.disconnect();
        socket.removeAllListeners();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) {
      return;
    }

    if (status !== "connected") {
      return;
    }

    const previous = joinedConversationRef.current;
    if (previous && previous !== conversationId) {
      socket.emit("dm:leave", { conversationId: previous });
    }

    socket.emit("dm:join", { conversationId });
    joinedConversationRef.current = conversationId;
  }, [conversationId, status]);

  return useMemo(
    () => ({
      status,
      error: socketMeta.error,
      banned,
      muted,
      sendMessage: (body: string) =>
        sendDmMessage(socketRef.current, conversationIdRef.current, body),
    }),
    [status, socketMeta.error, banned, muted],
  );
}

function sendDmMessage(
  socket: Socket | null,
  conversationId: string | undefined,
  body: string,
): Promise<SendResult> {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({ ok: false, code: "OFFLINE" });
      return;
    }

    if (!conversationId) {
      resolve({ ok: false, code: "CONVERSATION_REQUIRED" });
      return;
    }

    socket.emit(
      "dm:message:send",
      { conversationId, body },
      (ack: DmSendAck | undefined) => {
        if (!ack) {
          resolve({ ok: false, code: "NO_ACK" });
          return;
        }

        if (ack.ok) {
          resolve({ ok: true, message: normalizeDmMessageForSocket(ack.message) });
          return;
        }

        resolve({ ok: false, code: ack.code, retryAfterMs: ack.retryAfterMs });
      },
    );
  });
}
