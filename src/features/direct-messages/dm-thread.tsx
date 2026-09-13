import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizonal, AlertCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShowcaseAvatar } from "@/components/profile/showcase-avatar";
import { useAuthSession } from "@/features/auth/api";
import {
  useDmMessages,
  useLazyDmMessagesQuery,
} from "@/features/direct-messages/api";
import { useDmSocket } from "@/features/direct-messages/use-dm-socket";
import { type DmErrorPayload } from "@/lib/realtime";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { DirectMessage } from "@/types/domain";

const DM_MAX_LENGTH = 1000;

export function DmThread({ conversationId }: { conversationId: string }) {
  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const userId = authQuery.data?.user?.id ?? null;
  const isLoggedIn = Boolean(authQuery.data);

  const messagesQuery = useDmMessages(conversationId, userId);
  const [loadOlder] = useLazyDmMessagesQuery();
  const initialMessages = messagesQuery.data?.messages ?? [];
  const initialPageInfo = messagesQuery.data?.pageInfo ?? {
    hasMore: false,
    nextCursor: null,
  };

  const [message, setMessage] = useState("");
  const [messageState, setMessageState] = useState<{
    conversationId?: string;
    older: DirectMessage[];
    live: DirectMessage[];
    cursor: string | null;
    hasPaged: boolean;
  }>({ older: [], live: [], cursor: null, hasPaged: false });
  const [sendState, setSendState] = useState<{
    status: "idle" | "sending" | "error";
    code?: string;
    retryAfterMs?: number;
  }>({ status: "idle" });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isPinnedToBottomRef = useRef(true);
  const hasAutoScrolledRef = useRef(false);

  const { status, error: socketError, banned, muted, sendMessage } = useDmSocket(
    conversationId,
    {
      onMessage: useCallback((incoming: DirectMessage) => {
        setMessageState((current) =>
          current.live.some((item) => item.id === incoming.id)
            ? current
            : { ...current, live: [...current.live, incoming] },
        );
      }, []),
      onError: useCallback((error: DmErrorPayload) => {
        setSendState({
          status: "error",
          code: error.code,
          retryAfterMs: error.retryAfterMs,
        });
      }, []),
    },
  );

  const conversation = messagesQuery.data?.conversation;
  const otherUserName =
    conversation?.members.find((m) => !m.isSelf)?.profile.displayName ||
    conversation?.members.find((m) => !m.isSelf)?.profile.username ||
    "Unknown user";

  const sendErrorCode = socketError?.code ?? sendState.code;

  if (messageState.conversationId !== conversationId) {
    setMessageState({
      conversationId,
      older: [],
      live: [],
      cursor: initialPageInfo.nextCursor,
      hasPaged: false,
    });
  } else if (
    !messageState.hasPaged &&
    messageState.cursor !== initialPageInfo.nextCursor
  ) {
    setMessageState((current) => ({
      ...current,
      cursor: initialPageInfo.nextCursor,
    }));
  }

  const visibleMessages = [
    ...messageState.older,
    ...initialMessages,
    ...messageState.live,
  ];
  const nextCursor = messageState.cursor;

  const isValidMessage =
    message.trim().length > 0 && message.trim().length <= DM_MAX_LENGTH;

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
    isPinnedToBottomRef.current = true;
  }

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      isPinnedToBottomRef.current = distanceFromBottom < 40;
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    hasAutoScrolledRef.current = false;
    isPinnedToBottomRef.current = true;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || messagesQuery.isLoading) {
      return;
    }

    if (!hasAutoScrolledRef.current) {
      hasAutoScrolledRef.current = true;
      scrollToBottom();
    }
  }, [conversationId, messagesQuery.isLoading]);

  useEffect(() => {
    if (messageState.live.length > 0 && isPinnedToBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messageState.live]);

  useEffect(() => {
    if (sendState.retryAfterMs && sendState.retryAfterMs > 0) {
      const timer = window.setTimeout(() => {
        setSendState({ status: "idle" });
      }, sendState.retryAfterMs);
      return () => window.clearTimeout(timer);
    }
  }, [sendState.retryAfterMs]);

  async function handleSend() {
    if (!isLoggedIn || !isValidMessage) {
      return;
    }

    const body = message.trim();
    setMessage("");
    setSendState({ status: "sending" });

    const result = await sendMessage(body);

    if (result.ok) {
      setSendState({ status: "idle" });
      return;
    }

    setSendState({
      status: "error",
      code: result.code,
      retryAfterMs: result.retryAfterMs,
    });
    setMessage(body);
  }

  async function handleLoadOlder() {
    if (!nextCursor) {
      return;
    }

    const result = await loadOlder({
      conversationId,
      cursor: nextCursor,
      userId: userId ?? "",
    }).unwrap();

    if (result.messages.length > 0) {
      setMessageState((current) => {
        const known = new Set([
          ...current.older.map((item) => item.id),
          ...initialMessages.map((item) => item.id),
        ]);
        const fresh = result.messages.filter((item) => !known.has(item.id));
        return {
          ...current,
          older: [...fresh, ...current.older],
          cursor: result.pageInfo.nextCursor,
          hasPaged: true,
        };
      });
    } else {
      setMessageState((current) => ({
        ...current,
        cursor: result.pageInfo.nextCursor,
        hasPaged: true,
      }));
    }
  }

  if (messagesQuery.isError) {
    const code = (messagesQuery.error as { data?: { code?: string } })?.data
      ?.code;

    let title = "Conversation unavailable";
    let description = "This conversation could not be loaded.";

    if (code === "CONNECTION_REQUIRED") {
      title = "Connection required";
      description =
        "You can only message accepted connections. This conversation is no longer available because the connection was removed.";
    }

    if (code === "BLOCKED") {
      title = "Blocked";
      description = "You can no longer message this user.";
    }

    if (code === "CONVERSATION_ACCESS_DENIED") {
      title = "Access denied";
      description = "You are not a member of this conversation.";
    }

    return (
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/messages")}
            className="rounded-lg p-1 text-ink-muted hover:bg-surface-hover hover:text-ink"
            aria-label="Back to conversations"
          >
            ←
          </button>
          <span className="font-semibold text-ink">{title}</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-md text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-warning" />
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate("/messages")}
            >
              Back to conversations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button
          type="button"
          onClick={() => navigate("/messages")}
          className="rounded-lg p-1 text-ink-muted hover:bg-surface-hover hover:text-ink lg:hidden"
          aria-label="Back to conversations"
        >
          ←
        </button>
        <ShowcaseAvatar
          src={
            conversation?.members.find((m) => !m.isSelf)?.profile.avatarUrl ??
            undefined
          }
          alt={otherUserName}
          width={40}
          height={40}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-ink">
            {otherUserName}
          </h2>
          <p className="text-xs text-ink-subtle">
            {status === "connected" ? "Online" : status}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="chat-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
        {nextCursor ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLoadOlder}
              disabled={messagesQuery.isLoading || messageState.hasPaged}
            >
              {messageState.hasPaged ? "Loaded" : "Load older messages"}
            </Button>
          </div>
        ) : null}

        {messagesQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!messagesQuery.isLoading && visibleMessages.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-ink-muted">No messages yet.</p>
            <p className="mt-1 text-xs text-ink-subtle">
              Be the first to say hello.
            </p>
          </div>
        ) : null}

        {visibleMessages.map((item) => (
          <DmMessageRow
            key={item.id}
            message={item}
            isOwn={item.senderId === userId}
          />
        ))}
      </div>

      {/* Composer */}
      <footer className="border-t border-line bg-surface p-3">
        {!isLoggedIn ? (
          <div className="mb-3 rounded-xl border border-brand-soft bg-brand-soft p-4">
            <p className="text-sm font-bold text-ink">Login to chat</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Private chat requires a logged-in account.
            </p>
            <div className="mt-3">
              <Button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </div>
          </div>
        ) : (
          <>
            {sendErrorCode ? (
              <div className="mb-3 rounded-xl border border-danger bg-danger-soft p-3 text-sm text-ink">
                {errorMessage(sendErrorCode)}
              </div>
            ) : null}
            {banned ? (
              <div className="mb-3 rounded-xl border border-danger bg-danger-soft p-3">
                <p className="text-sm font-bold text-ink">Your account is banned</p>
                <p className="mt-1 text-xs text-ink-muted">
                  You cannot send messages.
                </p>
              </div>
            ) : null}
            {muted ? (
              <div className="mb-3 rounded-xl border border-warning bg-warning-soft p-3">
                <p className="text-sm font-bold text-ink">You are muted</p>
                <p className="mt-1 text-xs text-ink-muted">
                  You cannot send messages right now.
                </p>
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={DM_MAX_LENGTH}
                disabled={
                  !isLoggedIn ||
                  banned ||
                  muted ||
                  status !== "connected" ||
                  sendState.status === "sending"
                }
                rows={1}
                placeholder={
                  banned
                    ? "Your account is banned"
                    : muted
                      ? "Your account is muted"
                      : status !== "connected"
                        ? "Connecting..."
                        : "Type a message (max 1000)"
                }
                className="min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface-muted px-3 py-3 text-sm text-ink placeholder:text-ink-subtle"
              />
              <Button
                type="button"
                size="icon"
                disabled={
                  !isLoggedIn ||
                  banned ||
                  muted ||
                  status !== "connected" ||
                  sendState.status === "sending" ||
                  !isValidMessage
                }
                onClick={handleSend}
                aria-label="Send message"
              >
                <SendHorizonal className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            <p className="mt-1 text-xs text-ink-subtle">
              {message.trim().length}/{DM_MAX_LENGTH}
            </p>
          </>
        )}
      </footer>
    </div>
  );
}

function DmMessageRow({
  message,
  isOwn,
}: {
  message: DirectMessage;
  isOwn: boolean;
}) {
  const senderProfile = isOwn
    ? null
    : message.sender?.profile;

  return (
    <article
      className={[
        "mb-4 flex gap-3",
        isOwn ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      {!isOwn && senderProfile ? (
        <ShowcaseAvatar
          src={senderProfile.avatarUrl ?? undefined}
          alt={senderProfile.displayName || senderProfile.username || "User"}
          width={32}
          height={32}
        />
      ) : !isOwn ? (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted">
          ?
        </div>
      ) : null}

      <div
        className={[
          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
          isOwn
            ? "bg-brand text-primary-foreground"
            : "bg-surface-muted text-ink",
        ].join(" ")}
      >
        {!isOwn && senderProfile ? (
          <p className="mb-1 text-xs font-semibold text-ink-muted">
            {senderProfile.displayName || senderProfile.username}
          </p>
        ) : null}
        <p className="break-words whitespace-pre-wrap">{message.body}</p>
        <time className="block text-xs opacity-60">
          {new Intl.DateTimeFormat("en", {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(message.createdAt))}
        </time>
      </div>
    </article>
  );
}

function errorMessage(code: string): string {
  switch (code) {
    case "OFFLINE":
      return "You are offline. Reconnect to send messages.";
    case "AUTH_REQUIRED":
      return "Your session expired. Please log in again.";
    case "CONVERSATION_REQUIRED":
      return "No conversation selected.";
    case "CONVERSATION_ACCESS_DENIED":
      return "You are not a member of this conversation.";
    case "CONNECTION_REQUIRED":
      return "You can only message accepted connections.";
    case "BLOCKED":
      return "You have blocked this user or they have blocked you.";
    case "USER_BANNED":
      return "Your account is banned.";
    case "USER_MUTED":
      return "Your account is muted.";
    case "MESSAGE_REQUIRED":
      return "Message cannot be empty.";
    case "MESSAGE_TOO_LONG":
      return "Message must be 1000 characters or fewer.";
    case "RATE_LIMITED":
      return "You are sending messages too quickly.";
    case "NO_ACK":
      return "The server did not confirm your message.";
    default:
      return "Something went wrong. Please try again.";
  }
}
