import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Hash,
  Info,
  Menu,
  SendHorizonal,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogIn } from "lucide-react";
import { ShowcaseAvatar } from "@/components/profile/showcase-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import {
  useChannel,
  useChannelMessages,
  useChannels,
  useLazyChannelMessagesQuery,
} from "@/features/channels/api";
import { useChannelSocket } from "@/features/channels/use-channel-socket";
import { ChannelList } from "@/features/channels/channel-list";
import { channelColor } from "@/lib/channel-colors";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChannelMessage } from "@/types/domain";

export function ChatShell({ initialSlug }: { initialSlug?: string }) {
  const [message, setMessage] = useState("");
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [messageState, setMessageState] = useState<{
    channelId?: string;
    older: ChannelMessage[];
    live: ChannelMessage[];
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

  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const channelsQuery = useChannels();
  const channelQuery = useChannel(initialSlug);

  const channels = channelsQuery.data ?? [];
  const activeChannel =
    initialSlug
      ? channelQuery.data ?? channels.find((channel) => channel.slug === initialSlug)
      : channels.find((channel) => channel.isDefault) ?? channels[0];

  const messagesQuery = useChannelMessages(activeChannel?.slug);
  const initialMessages = messagesQuery.data?.messages ?? [];
  const initialPageInfo = messagesQuery.data?.pageInfo ?? { hasMore: false, nextCursor: null };

  if (messageState.channelId !== activeChannel?.id) {
    setMessageState({
      channelId: activeChannel?.id,
      older: [],
      live: [],
      cursor: initialPageInfo.nextCursor,
      hasPaged: false,
    });
  } else if (
    !messageState.hasPaged &&
    messageState.cursor !== initialPageInfo.nextCursor
  ) {
    setMessageState({
      ...messageState,
      cursor: initialPageInfo.nextCursor,
    });
  }

  const visibleMessages = [
    ...messageState.older,
    ...initialMessages,
    ...messageState.live,
  ];
  const nextCursor = messageState.cursor;

  const [loadOlder, loadOlderResult] = useLazyChannelMessagesQuery();

  const isLoggedIn = Boolean(authQuery.data);
  const isValidMessage = message.trim().length > 0 && message.trim().length <= 500;
  const hasApiError =
    channelsQuery.isError ||
    channelQuery.isError ||
    messagesQuery.isError;
  const isChannelLoading =
    channelsQuery.isLoading ||
    (Boolean(initialSlug) && channelQuery.isLoading);
  const hasLoadedChannels = channelsQuery.isSuccess && !isChannelLoading;
  const channelNotFound =
    Boolean(initialSlug) &&
    !isChannelLoading &&
    !channelQuery.isError &&
    !activeChannel;

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
  }, [activeChannel?.id]);

  useEffect(() => {
    if (!activeChannel?.id || messagesQuery.isLoading) {
      return;
    }

    if (!hasAutoScrolledRef.current) {
      hasAutoScrolledRef.current = true;
      scrollToBottom();
    }
  }, [activeChannel?.id, messagesQuery.isLoading]);

  useEffect(() => {
    if (messageState.live.length > 0 && isPinnedToBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messageState.live]);

  const { status, online, error: socketError, banned, muted, sendMessage } =
    useChannelSocket(activeChannel?.id, {
      onMessage: useCallback((incoming: ChannelMessage) => {
        setMessageState((current) =>
          current.live.some((item) => item.id === incoming.id)
            ? current
            : { ...current, live: [...current.live, incoming] },
        );
      }, []),
    });

  const onlineCount =
    online !== null ? online : activeChannel?.onlineCount ?? 0;

  const sendErrorCode = socketError?.code ?? sendState.code;

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
    if (!activeChannel || !nextCursor) {
      return;
    }

    const result = await loadOlder({
      slug: activeChannel.slug,
      cursor: nextCursor,
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

  return (
    <AppShell>
      <div className="grid min-h-dvh bg-background lg:h-dvh lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto] bg-surface lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsChannelListOpen(true)}
              className="lg:hidden"
              aria-label="Open channel list"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
            {activeChannel ? (
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl",
                  channelColor(activeChannel.type).bg,
                  channelColor(activeChannel.type).text,
                )}
              >
                <Hash className="h-5 w-5" aria-hidden />
              </span>
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-muted text-ink-muted">
                <Hash className="h-5 w-5" aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-ink">
                {activeChannel?.name ?? "Channels"}
              </h1>
              <p className="text-xs text-ink-subtle">
                {onlineCount.toLocaleString()} online
              </p>
            </div>
            <Badge variant="success" className="hidden gap-1 sm:inline-flex">
              <Wifi className="h-3.5 w-3.5" aria-hidden />
              Live
            </Badge>
          </header>

          <div
            ref={scrollContainerRef}
            className="chat-scrollbar min-h-0 overflow-y-auto px-4 py-4"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {hasApiError ? (
                <div className="flex items-start gap-3 rounded-xl border border-warning bg-warning-soft p-3 text-sm text-warning-ink">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <p>
                    Channel data is not reachable right now. Please check the API
                    server and try again.
                  </p>
                </div>
              ) : null}

              {activeChannel && nextCursor ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadOlder}
                    disabled={loadOlderResult.isFetching}
                  >
                    {loadOlderResult.isFetching ? "Loading..." : "Load older messages"}
                  </Button>
                </div>
              ) : null}

              {isChannelLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {hasLoadedChannels && channels.length === 0 ? (
                <EmptyState
                  title="No channels yet"
                  message="Public live rooms will appear here once they are configured."
                />
              ) : null}

              {channelNotFound ? (
                <EmptyState
                  title="Channel unavailable"
                  message="This channel could not be found or is no longer active."
                />
              ) : null}

              {activeChannel && messagesQuery.isLoading ? (
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

              {activeChannel &&
              !messagesQuery.isLoading &&
              visibleMessages.length === 0 ? (
                <EmptyState
                  title="No messages yet"
                  message="Be the first to start the conversation."
                />
              ) : null}

              {visibleMessages.map((item) => (
                <article key={item.id} className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="cursor-pointer rounded-full p-0 shadow-none outline-none focus-visible:ring-0"
                        aria-label={`View @${item.sender.username}'s profile`}
                      >
                        <ShowcaseAvatar
                          src={item.sender.avatarUrl}
                          alt={item.sender.displayName}
                          width={40}
                          height={40}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      sideOffset={8}
                      align="start"
                      className="w-56 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <ShowcaseAvatar
                          src={item.sender.avatarUrl}
                          alt={item.sender.displayName}
                          width={48}
                          height={48}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">
                            {item.sender.displayName}
                          </p>
                          <p className="truncate text-xs text-ink-subtle">
                            @{item.sender.username}
                          </p>
                        </div>
                      </div>
                      {item.sender.role && item.sender.role !== "user" ? (
                        <div className="mt-2 flex items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3 text-brand" />
                          <span className="text-xs font-medium text-ink-subtle">
                            {item.sender.role}
                          </span>
                        </div>
                      ) : null}
                      <DropdownMenuSeparator />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full justify-center bg-brand text-on-brand hover:bg-brand-hover"
                        onClick={(e) => {
                          e.preventDefault();
                          if (item.sender.publicUserId) {
                            void navigate(`/profile/${item.sender.publicUserId}`);
                          }
                        }}
                      >
                        Visit profile
                      </Button>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {item.sender.displayName}
                      </span>
                      {item.sender.role && item.sender.role !== "user" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                          {item.sender.role}
                        </span>
                      ) : null}
                      <time className="text-xs text-ink-subtle">
                        {new Intl.DateTimeFormat("en", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(item.createdAt))}
                      </time>
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <footer className="border-t border-line bg-surface p-3">
            <div className="mx-auto max-w-3xl">
              {!isLoggedIn ? (
                <div className="mb-3 rounded-xl border border-brand-soft bg-brand-soft p-4">
                  <p className="text-sm font-bold text-ink">
                    Login to chat
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">
                    Guests can read public channels. Sending messages, profiles,
                    connections, and private chat unlock after login.
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
                <ComposerStatus
                  status={status}
                  banned={banned}
                  muted={muted}
                  sending={sendState.status === "sending"}
                  errorCode={sendErrorCode}
                  retryAfterMs={sendState.retryAfterMs}
                />
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={500}
                  disabled={!isLoggedIn || banned || muted || status !== "connected"}
                  rows={1}
                  placeholder={
                    !isLoggedIn
                      ? "Login to chat"
                      : banned
                        ? "Your account is banned"
                        : muted
                          ? "Your account is muted"
                          : "Type a message"
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
            </div>
          </footer>
        </section>

        <aside className="hidden overflow-y-auto border-l border-line bg-surface-muted p-4 xl:block">
          <div className="rounded-xl border border-line bg-surface p-4">
            <Info className="mb-3 h-5 w-5 text-ink-subtle" aria-hidden />
            <h2 className="text-sm font-bold text-ink">
              {isLoggedIn ? "Session active" : "Guest access"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {isLoggedIn
                ? "You can read public channel history and manage your profile."
                : "Public read-only channel access is open. Login is required for profile and private features."}
            </p>
            {!isLoggedIn ? (
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <Sheet open={isChannelListOpen} onOpenChange={setIsChannelListOpen}>
        <SheetContent side="left" className="w-[min(22rem,88vw)] p-0">
          <SheetHeader className="border-b border-line p-4">
            <SheetTitle>Channels</SheetTitle>
          </SheetHeader>
          <ChannelList
            activeSlug={activeChannel?.slug ?? ""}
            channels={channels}
            isLoading={channelsQuery.isLoading}
            onSelect={() => setIsChannelListOpen(false)}
            fullHeight
          />
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface-muted p-8 text-center">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
    </div>
  );
}

function ComposerStatus({
  status,
  banned,
  muted,
  sending,
  errorCode,
  retryAfterMs,
}: {
  status: "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
  banned: boolean;
  muted: boolean;
  sending: boolean;
  errorCode?: string;
  retryAfterMs?: number;
}) {
  if (banned) {
    return (
      <div className="mb-3 rounded-xl border border-danger bg-danger-soft p-4">
        <p className="text-sm font-bold text-ink">Your account is banned</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          You can read public channels but cannot send messages.
        </p>
      </div>
    );
  }

  if (muted) {
    return (
      <div className="mb-3 rounded-xl border border-warning bg-warning-soft p-4">
        <p className="text-sm font-bold text-ink">You are muted</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          You can read public channels but cannot send messages right now.
        </p>
      </div>
    );
  }

  if (errorCode === "RATE_LIMITED" || errorCode === "rate_limited") {
    return (
      <div className="mb-3 rounded-xl border border-warning bg-warning-soft p-4">
        <p className="text-sm font-bold text-ink">Slow down</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          You are sending messages too quickly.
          {retryAfterMs ? ` Try again in ${Math.ceil(retryAfterMs / 1000)}s.` : ""}
        </p>
      </div>
    );
  }

  if (sending) {
    return (
      <div className="mb-3 rounded-xl border border-line bg-surface-muted p-4">
        <p className="text-sm font-bold text-ink">Sending...</p>
      </div>
    );
  }

  if (errorCode) {
    return (
      <div className="mb-3 rounded-xl border border-danger bg-danger-soft p-4">
        <p className="text-sm font-bold text-ink">Message not sent</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          {errorMessage(errorCode)}
        </p>
      </div>
    );
  }

  if (status === "disconnected" || status === "reconnecting") {
    return (
      <div className="mb-3 rounded-xl border border-warning bg-warning-soft p-4">
        <p className="text-sm font-bold text-ink">Reconnecting...</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          Live chat is reconnecting. Messages may be delayed.
        </p>
      </div>
    );
  }

  return null;
}

function errorMessage(code: string): string {
  switch (code) {
    case "OFFLINE":
      return "You are offline. Reconnect to send messages.";
    case "AUTH_REQUIRED":
      return "Your session expired. Please log in again.";
    case "CHANNEL_REQUIRED":
    case "CHANNEL_NOT_FOUND":
      return "This channel is unavailable.";
    case "USER_BANNED":
      return "Your account is banned.";
    case "USER_MUTED":
      return "Your account is muted.";
    case "MESSAGE_REQUIRED":
      return "Message cannot be empty.";
    case "MESSAGE_TOO_LONG":
      return "Message must be 500 characters or fewer.";
    case "RATE_LIMITED":
      return "You are sending messages too quickly.";
    case "NO_ACK":
      return "The server did not confirm your message.";
    default:
      return "Something went wrong. Please try again.";
  }
}
