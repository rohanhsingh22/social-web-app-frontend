import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { baseApi } from "@/rtk/base-api";
import { ensureFreshAccessToken } from "@/lib/auth-token";
import {
  normalizeHomeInvitation,
  normalizeHomeJoinRequest,
} from "@/lib/normalizers";
import {
  createHomeSocket,
  type HomeInvitationPayload,
  type HomeJoinRequestPayload,
  type HomeSocketStatus,
} from "@/lib/realtime";
import type { AppDispatch } from "@/store/store";
import type { HomeInvitation, HomeJoinRequest } from "@/types/domain";

// Home realtime channel (Phase 9). Mounted while logged in; the backend
// re-emits Home fanout into `user:{id}` rooms. `home:state` only invalidates
// caches (queries refetch the authoritative state); incoming invitations and
// join requests are also held locally so global overlays (Phase 13/14) can
// render them with their 20s countdowns.
export function useHomeSocket(
  enabled: boolean,
  handlers?: {
    onInvitation?: (invitation: HomeInvitation) => void;
    onJoinRequest?: (request: HomeJoinRequest) => void;
    onHomeChanged?: () => void;
  },
) {
  const dispatch = useDispatch<AppDispatch>();
  const dispatchRef = useRef(dispatch);
  const handlersRef = useRef(handlers);
  const [status, setStatus] = useState<HomeSocketStatus>("idle");
  const [invitation, setInvitation] = useState<HomeInvitation | null>(null);
  const [joinRequest, setJoinRequest] = useState<HomeJoinRequest | null>(null);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setStatus("connecting");
    let disposed = false;
    let socket: Socket | null = null;
    let heartbeat = 0;

    createHomeSocket().then((createdSocket) => {
      if (disposed) {
        createdSocket.disconnect();
        return;
      }

      socket = createdSocket;

      // Keeps the 60s server presence TTL alive for idle Home sockets.
      heartbeat = window.setInterval(() => {
        if (socket?.connected) {
          socket.emit("home:heartbeat");
        }
      }, 30_000);

      socket.on("connect", () => {
        setStatus("connected");
      });

      socket.on("disconnect", () => {
        setStatus("disconnected");
      });

      socket.io.on("reconnect_attempt", () => {
        setStatus("reconnecting");
        void ensureFreshAccessToken().then((freshToken) => {
          if (freshToken && socket) {
            socket.auth = { token: freshToken };
            socket.io.opts.extraHeaders = {
              Authorization: `Bearer ${freshToken}`,
            };
          }
        });
      });

      socket.io.on("reconnect", () => {
        setStatus("connected");
        // Membership survives reconnects server-side; just refetch.
        dispatchRef.current(baseApi.util.invalidateTags(["Home", "HomeConnections"]));
      });

      socket.on("connect_error", () => {
        setStatus("disconnected");
      });

      socket.on("home:state", () => {
        dispatchRef.current(
          baseApi.util.invalidateTags(["Home", "HomeConnections"]),
        );
        handlersRef.current?.onHomeChanged?.();
      });

      socket.on(
        "home:invitation:new",
        (payload: { invitation?: HomeInvitationPayload }) => {
          if (!payload?.invitation) {
            return;
          }

          const normalized = normalizeHomeInvitation(payload.invitation);
          setInvitation(normalized);
          handlersRef.current?.onInvitation?.(normalized);
        },
      );

      socket.on(
        "home:join-request:new",
        (payload: { joinRequest?: HomeJoinRequestPayload }) => {
          if (!payload?.joinRequest) {
            return;
          }

          const normalized = normalizeHomeJoinRequest(payload.joinRequest);
          setJoinRequest(normalized);
          handlersRef.current?.onJoinRequest?.(normalized);
        },
      );

      socket.on("auth:error", async () => {
        socket?.disconnect();

        const freshToken = await ensureFreshAccessToken();
        if (freshToken && socket) {
          socket.auth = { token: freshToken };
          socket.io.opts.extraHeaders = {
            Authorization: `Bearer ${freshToken}`,
          };
          socket.connect();
        }
      });
    });

    return () => {
      disposed = true;
      window.clearInterval(heartbeat);
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
    };
  }, [enabled]);

  return {
    status,
    invitation,
    joinRequest,
    dismissInvitation: () => setInvitation(null),
    dismissJoinRequest: () => setJoinRequest(null),
  };
}
