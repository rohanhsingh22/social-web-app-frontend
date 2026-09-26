import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { baseApi } from "@/rtk/base-api";
import { ensureFreshAccessToken } from "@/lib/auth-token";
import { createNotificationsSocket } from "@/lib/realtime";
import type { AppDispatch } from "@/store/store";

// Global per-user push channel (mounted once in AppShell while logged in).
// The backend re-emits fanout events into `user:{id}` rooms; here they just
// invalidate caches — the queries themselves refetch. Polling on the lists
// stays as the fallback for dropped sockets.
export function useNotificationsSocket(enabled: boolean) {
  const dispatch = useDispatch<AppDispatch>();
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let disposed = false;
    let socket: Socket | null = null;

    createNotificationsSocket().then((createdSocket) => {
      if (disposed) {
        createdSocket.disconnect();
        return;
      }

      socket = createdSocket;

      socket.on("connection:changed", () => {
        dispatchRef.current(
          baseApi.util.invalidateTags([
            "Connections",
            "UserSearch",
            "DmConversations",
          ]),
        );
      });

      socket.on("notification:new", () => {
        dispatchRef.current(baseApi.util.invalidateTags(["Notifications"]));
      });

      socket.io.on("reconnect_attempt", () => {
        void ensureFreshAccessToken().then((freshToken) => {
          if (freshToken && socket) {
            socket.auth = { token: freshToken };
            socket.io.opts.extraHeaders = {
              Authorization: `Bearer ${freshToken}`,
            };
          }
        });
      });

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
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
    };
  }, [enabled]);
}
