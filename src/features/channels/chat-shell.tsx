"use client";

import clsx from "clsx";
import Link from "next/link";
import {
  AlertCircle,
  Hash,
  Info,
  Menu,
  SendHorizonal,
  ShieldCheck,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";
import { FacebookLoginButton } from "@/components/auth/facebook-login-button";
import { Avatar } from "@/components/common/avatar";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import {
  useChannel,
  useChannelMessages,
  useChannels,
  useDefaultChannel,
} from "@/features/channels/api";
import type { Channel } from "@/types/domain";

export function ChatShell({ initialSlug }: { initialSlug?: string }) {
  const [message, setMessage] = useState("");
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const authQuery = useAuthSession();
  const channelsQuery = useChannels();
  const defaultChannelQuery = useDefaultChannel();
  const channelQuery = useChannel(initialSlug);

  const channels = channelsQuery.data ?? [];
  const activeChannel =
    initialSlug
      ? channelQuery.data ?? channels.find((channel) => channel.slug === initialSlug)
      : defaultChannelQuery.data ??
        channels.find((channel) => channel.isDefault) ??
        channels[0];
  const messagesQuery = useChannelMessages(activeChannel?.slug);
  const visibleMessages = messagesQuery.data ?? [];

  const isLoggedIn = Boolean(authQuery.data);
  const isValidMessage = message.trim().length > 0 && message.trim().length <= 500;
  const hasApiError =
    channelsQuery.isError ||
    defaultChannelQuery.isError ||
    channelQuery.isError ||
    messagesQuery.isError;
  const isChannelLoading =
    channelsQuery.isLoading ||
    (!initialSlug && defaultChannelQuery.isLoading) ||
    (Boolean(initialSlug) && channelQuery.isLoading);
  const hasLoadedChannels = channelsQuery.isSuccess && !isChannelLoading;
  const channelNotFound =
    Boolean(initialSlug) &&
    !isChannelLoading &&
    !channelQuery.isError &&
    !activeChannel;

  return (
    <AppShell>
      <div className="grid min-h-dvh bg-slate-100 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <ChannelList
            activeSlug={activeChannel?.slug ?? ""}
            channels={channels}
            isLoading={channelsQuery.isLoading}
          />
        </aside>

        <section className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto] bg-white lg:min-h-dvh">
          <header className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
            <button
              type="button"
              onClick={() => setIsChannelListOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 lg:hidden"
              aria-label="Open channel list"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-700">
              <Hash className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-slate-950">
                {activeChannel?.name ?? "Channels"}
              </h1>
              <p className="text-xs text-slate-500">
                {(activeChannel?.onlineCount ?? 0).toLocaleString()} online
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex">
              <Wifi className="h-4 w-4" aria-hidden />
              Live
            </div>
          </header>

          <div className="chat-scrollbar overflow-y-auto px-4 py-4">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {hasApiError ? (
                <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <p>
                    Channel data is not reachable right now. Please check the API
                    server and try again.
                  </p>
                </div>
              ) : null}

              {isChannelLoading ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading channels...
                </div>
              ) : null}

              {hasLoadedChannels && channels.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No public channels are available yet.
                </div>
              ) : null}

              {channelNotFound ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  This channel is unavailable.
                </div>
              ) : null}

              {activeChannel && messagesQuery.isLoading ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading recent messages...
                </div>
              ) : null}

              {activeChannel && !messagesQuery.isLoading && visibleMessages.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No messages yet.
                </div>
              ) : null}

              {visibleMessages.map((item) => (
                <article key={item.id} className="flex gap-3">
                  <Avatar user={item.sender} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/users/${item.sender.username}`}
                        className="text-sm font-semibold text-slate-950 hover:underline"
                      >
                        {item.sender.displayName}
                      </Link>
                      {item.sender.role && item.sender.role !== "user" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                          {item.sender.role}
                        </span>
                      ) : null}
                      <time className="text-xs text-slate-500">
                        {new Intl.DateTimeFormat("en", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(item.createdAt))}
                      </time>
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <footer className="border-t border-slate-200 bg-white p-3">
            <div className="mx-auto max-w-3xl">
              {!isLoggedIn ? (
                <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-950">
                    Login with Facebook to chat
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    Guests can read public channels. Sending messages, profiles,
                    connections, and private chat unlock after login.
                  </p>
                </div>
              ) : (
                <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-950">
                    Message sending is unavailable
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Public channel history is loaded over HTTP. Sending requires
                    the realtime message endpoint.
                  </p>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onFocus={() => setMessage("")}
                  maxLength={500}
                  disabled={!isLoggedIn}
                  rows={1}
                  placeholder={
                    isLoggedIn ? "Message sending unavailable" : "Login with Facebook to chat"
                  }
                  className="min-h-11 flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500"
                />
                <button
                  type="button"
                  disabled={!isLoggedIn || !isValidMessage}
                  className="grid h-11 w-11 place-items-center rounded-md bg-slate-300 text-white disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <SendHorizonal className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </footer>
        </section>

        <aside className="hidden border-l border-slate-200 bg-slate-50 p-4 xl:block">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Info className="mb-3 h-5 w-5 text-slate-500" aria-hidden />
            <h2 className="text-sm font-semibold text-slate-950">
              {isLoggedIn ? "Session active" : "Guest access"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isLoggedIn
                ? "You can read public channel history and manage your profile."
                : "Public read-only channel access is open. Facebook login is required for profile and private features."}
            </p>
            {!isLoggedIn ? (
              <div className="mt-4">
                <FacebookLoginButton />
              </div>
            ) : null}
          </div>
        </aside>

        {isChannelListOpen ? (
          <div className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden">
            <aside className="h-full w-[min(22rem,88vw)] border-r border-slate-200 bg-white shadow-xl">
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
                <h2 className="text-base font-semibold text-slate-950">Channels</h2>
                <button
                  type="button"
                  onClick={() => setIsChannelListOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700"
                  aria-label="Close channel list"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <ChannelList
                activeSlug={activeChannel?.slug ?? ""}
                channels={channels}
                isLoading={channelsQuery.isLoading}
                onSelect={() => setIsChannelListOpen(false)}
              />
            </aside>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function ChannelList({
  activeSlug,
  channels,
  isLoading,
  onSelect,
}: {
  activeSlug: string;
  channels: Channel[];
  isLoading: boolean;
  onSelect?: () => void;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-base font-semibold text-slate-950">Channels</h2>
        <p className="mt-1 text-xs text-slate-500">Public live rooms</p>
      </div>
      <div className="chat-scrollbar flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
            Loading channels...
          </div>
        ) : null}

        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={channel.isDefault ? "/" : `/channels/${channel.slug}`}
            onClick={onSelect}
            className={clsx(
              "mb-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm transition hover:bg-slate-100",
              activeSlug === channel.slug && "bg-slate-100",
            )}
          >
            <Hash className="h-4 w-4 text-slate-500" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
              {channel.name}
            </span>
            <span className="text-xs text-slate-500">{channel.onlineCount}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
