import { useState, type FormEvent } from "react";
import { Search, Trash2, MoreVertical } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { useLazySearchUsersQuery } from "@/rtk/users/users-api";
import {
  useConnectionsQuery,
  useReceivedRequestsQuery,
  useSentRequestsQuery,
  useCreateConnectionRequestMutation,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useCancelRequestMutation,
  useRemoveConnectionMutation,
} from "@/rtk/connections/connections-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SenderAvatar } from "@/components/common/sender-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Connection,
  ConnectionRequest,
  SearchUserResult,
} from "@/types/domain";

export function ConnectionsPage() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Login to view connections, send requests, and chat."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold text-ink">Connections</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Manage your connections, requests, and private conversations.
        </p>

        <Tabs defaultValue="requests" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="search">Find someone</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <RequestsTab />
          </TabsContent>

          <TabsContent value="search">
            <FindSomeone />
          </TabsContent>

          <TabsContent value="connections">
            <ConnectionsTab />
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

function RequestsTab() {
  const receivedQuery = useReceivedRequestsQuery();
  const sentQuery = useSentRequestsQuery();

  const isLoading = receivedQuery.isLoading || sentQuery.isLoading;
  const received = receivedQuery.data ?? [];
  const sent = sentQuery.data ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (received.length === 0 && sent.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        message="Incoming and outgoing connection requests will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {received.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-muted">
            Received ({received.length})
          </h2>
          {received.map((request) => (
            <ReceivedRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : null}

      {sent.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-muted">
            Sent ({sent.length})
          </h2>
          {sent.map((request) => (
            <SentRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ConnectionsTab() {
  const connectionsQuery = useConnectionsQuery();

  if (connectionsQuery.isLoading) {
    return (
      <div className="grid gap-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const connections = connectionsQuery.data ?? [];

  if (connections.length === 0) {
    return (
      <EmptyState
        title="No connections yet"
        message="When you accept a connection request, they will appear here."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {connections.map((connection) => (
        <ConnectionCard key={connection.id} connection={connection} />
      ))}
    </div>
  );
}

function ConnectionCard({ connection }: { connection: Connection }) {
  const [remove, removeState] = useRemoveConnectionMutation();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const otherUser = connection.otherUser;
  const profile = otherUser.profile;

  const displayName = profile?.displayName ?? "Unknown user";

  function handleRemove() {
    void remove(connection.id).then(() => {
      if (removeState.isError) return;
      setIsRemoveDialogOpen(false);
    });
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
        {profile ? (
          <SenderAvatar sender={profile} size={44} />
        ) : (
          <SenderAvatar
            sender={{ displayName: "Unknown user", avatarUrl: undefined }}
            size={44}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 truncate font-semibold text-ink">
            {displayName}
            {profile?.toli ? <ToliBadge name={profile.toli.name} /> : null}
          </p>
          <p className="truncate text-sm text-ink-muted">
            @{profile?.username ?? "unknown"}
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          Connected
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => setIsRemoveDialogOpen(true)}
              disabled={removeState.isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{displayName}</strong>?
              This will delete your connection and direct message conversation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={removeState.isLoading}
              onClick={() => setIsRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={removeState.isLoading}
              onClick={handleRemove}
            >
              {removeState.isLoading ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReceivedRequestCard({ request }: { request: ConnectionRequest }) {
  const [accept, acceptState] = useAcceptRequestMutation();
  const [reject, rejectState] = useRejectRequestMutation();
  const otherUser = request.otherUser;
  const profile = otherUser.profile;

  const isPending = acceptState.isLoading || rejectState.isLoading;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
      {profile ? (
        <SenderAvatar sender={profile} size={44} />
      ) : (
        <SenderAvatar
          sender={{ displayName: "Unknown user", avatarUrl: undefined }}
          size={44}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 truncate font-semibold text-ink">
          {profile?.displayName ?? "Unknown user"}
          {profile?.toli ? <ToliBadge name={profile.toli.name} /> : null}
        </p>
        <p className="truncate text-sm text-ink-muted">
          @{profile?.username ?? "unknown"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" disabled={isPending} onClick={() => void accept(request.id)}>
          {acceptState.isLoading ? "Accepting…" : "Accept"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => void reject(request.id)}
        >
          {rejectState.isLoading ? "Rejecting…" : "Reject"}
        </Button>
      </div>
    </div>
  );
}

function SentRequestCard({ request }: { request: ConnectionRequest }) {
  const [cancel, cancelState] = useCancelRequestMutation();
  const otherUser = request.otherUser;
  const profile = otherUser.profile;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
      {profile ? (
        <SenderAvatar sender={profile} size={44} />
      ) : (
        <SenderAvatar
          sender={{ displayName: "Unknown user", avatarUrl: undefined }}
          size={44}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 truncate font-semibold text-ink">
          {profile?.displayName ?? "Unknown user"}
          {profile?.toli ? <ToliBadge name={profile.toli.name} /> : null}
        </p>
        <p className="truncate text-sm text-ink-muted">
          @{profile?.username ?? "unknown"}
        </p>
        <p className="text-xs text-ink-subtle">Pending</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={cancelState.isLoading}
        onClick={() => void cancel(request.id)}
      >
        {cancelState.isLoading ? "Cancelling…" : "Cancel"}
      </Button>
    </div>
  );
}

function FindSomeone() {
  const [rawQuery, setRawQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchUsers, searchResult] = useLazySearchUsersQuery();
  const [createRequest, createState] = useCreateConnectionRequestMutation();

  const hasSearched = submittedQuery !== "";
  const isLoading = searchResult.isLoading || searchResult.isFetching;
  const user = searchResult.data?.users[0] ?? null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      return;
    }
    setSubmittedQuery(trimmed);
    void searchUsers(trimmed);
  }

  function handleConnect(target: SearchUserResult) {
    void createRequest({ receiverUserId: target.id });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden
        />
        <Input
          value={rawQuery}
          onChange={(event) => setRawQuery(event.target.value)}
          placeholder="Enter HiRotoli ID"
          aria-label="HiRotoli ID"
          className="pl-10"
        />
        <Button type="submit" size="sm" className="mt-3" disabled={isLoading}>
          {isLoading ? "Searching…" : "Find"}
        </Button>
      </form>

      <p className="text-xs text-ink-muted">
        Enter the exact HiRotoli ID of the person you want to connect with, for
        example <span className="font-mono">HT-7K4M9Q2X</span>.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : null}

      {!isLoading && hasSearched && !user ? (
        <EmptyState
          title="No user found"
          message="No user found with this HiRotoli ID."
        />
      ) : null}

      {!isLoading && user ? (
        <UserResultCard
          user={user}
          isConnecting={createState.isLoading}
          onConnect={() => handleConnect(user)}
        />
      ) : null}
    </div>
  );
}

function UserResultCard({
  user,
  isConnecting,
  onConnect,
}: {
  user: SearchUserResult;
  isConnecting: boolean;
  onConnect: () => void;
}) {
  const connection = user.connection;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
      <SenderAvatar sender={user.profile} size={44} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 truncate font-semibold text-ink">
          {user.profile.displayName}
          {user.profile.toli ? (
            <ToliBadge name={user.profile.toli.name} />
          ) : null}
        </p>
        <p className="truncate text-sm text-ink-muted">
          @{user.profile.username}
        </p>
        <p className="truncate text-xs text-ink-subtle">{user.id}</p>
      </div>
      {connection?.status === "accepted" ? (
        <Button variant="outline" size="sm" disabled>
          Connected
        </Button>
      ) : connection?.status === "pending" &&
        connection.direction === "sent" ? (
        <Button variant="outline" size="sm" disabled>
          Requested
        </Button>
      ) : connection?.status === "pending" &&
        connection.direction === "received" ? (
        <Button variant="outline" size="sm" disabled>
          Respond
        </Button>
      ) : (
        <Button size="sm" onClick={onConnect} disabled={isConnecting}>
          {isConnecting ? "Sending…" : "Connect"}
        </Button>
      )}
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-line-strong bg-surface-muted p-8 text-center">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
    </div>
  );
}
