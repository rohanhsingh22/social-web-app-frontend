import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PersonRow } from "@/components/common/person-row";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeConnectionList } from "@/features/home/use-home";
import {
  getHomeErrorCode,
  useHomeActions,
} from "@/features/home/use-home-actions";
import { homeErrorMessage } from "@/features/home/home-errors";
import type { HomeConnection } from "@/types/domain";

// Connections dialog (spec #84): one row per connection with the Home-aware
// action. The backend stays authoritative — the dialog only hides actions
// the server would reject.
export function HomeConnectionsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { connections, isLoading, isError, refetch } =
    useHomeConnectionList();
  const actions = useHomeActions();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (open) {
      setFailedCode(null);
      setDoneIds(new Set());
    }
  }, [open]);

  async function runAction(userId: string, kind: "invite" | "request") {
    setBusyId(userId);
    setFailedCode(null);
    try {
      if (kind === "invite") {
        await actions.inviteToHome({ inviteeId: userId }).unwrap();
      } else {
        await actions.requestJoin({ targetMemberId: userId }).unwrap();
      }
      setDoneIds((current) => new Set(current).add(userId));
    } catch (error) {
      setFailedCode(getHomeErrorCode(error));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
          <DialogDescription>
            Bring someone into your Home — no rooms, no setup.
          </DialogDescription>
        </DialogHeader>

        {failedCode !== null && (
          <p
            role="alert"
            className="rounded-xl border border-line bg-surface-muted px-3 py-2 text-sm text-ink"
          >
            {homeErrorMessage(failedCode)}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3" aria-label="Loading connections">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
            <span role="status" className="sr-only">
              Loading connections…
            </span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-ink-muted">
              Couldn&apos;t load your connections.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : connections.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No connections yet. Connect with people to bring them Home.
          </p>
        ) : (
          <ul className="max-h-[50dvh] space-y-1 overflow-y-auto">
            {connections.map((connection) => (
              <li key={connection.userId}>
                <ConnectionRow
                  connection={connection}
                  busy={busyId === connection.userId}
                  done={doneIds.has(connection.userId)}
                  onInvite={() => void runAction(connection.userId, "invite")}
                  onRequest={() => void runAction(connection.userId, "request")}
                />
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConnectionRow({
  connection,
  busy,
  done,
  onInvite,
  onRequest,
}: {
  connection: HomeConnection;
  busy: boolean;
  done: boolean;
  onInvite: () => void;
  onRequest: () => void;
}) {
  const online = connection.presence === "online";

  return (
    <div className="flex items-center gap-2 rounded-xl px-1 py-1.5">
      <span
        aria-hidden
        title={online ? "Online" : "Offline"}
        className={
          online
            ? "h-2 w-2 shrink-0 rounded-full bg-green-500"
            : "h-2 w-2 shrink-0 rounded-full bg-ink-subtle"
        }
      />
      <PersonRow
        user={{ displayName: connection.displayName }}
        avatarSize={36}
        className="min-w-0 flex-1"
        secondary={<RowStatus connection={connection} />}
        trailing={
          <RowAction
            connection={connection}
            busy={busy}
            done={done}
            onInvite={onInvite}
            onRequest={onRequest}
          />
        }
      />
      <span className="sr-only">{online ? "Online" : "Offline"}</span>
    </div>
  );
}

function RowStatus({ connection }: { connection: HomeConnection }) {
  if (connection.homeState === "MY_HOME") {
    return <>Already in your Home</>;
  }

  if (connection.homeState === "OTHER_HOME") {
    const count = connection.homeMemberCount ?? 0;
    return (
      <>
        {count} in Home{connection.presence === "offline" ? " · Offline" : ""}
      </>
    );
  }

  return connection.presence === "offline" ? <>Offline</> : null;
}

function RowAction({
  connection,
  busy,
  done,
  onInvite,
  onRequest,
}: {
  connection: HomeConnection;
  busy: boolean;
  done: boolean;
  onInvite: () => void;
  onRequest: () => void;
}) {
  if (connection.homeState === "MY_HOME") {
    return null;
  }

  if (done) {
    return (
      <span className="text-xs font-semibold text-green-600">
        {connection.homeState === "OTHER_HOME" ? "Requested" : "Invited"}
      </span>
    );
  }

  if (connection.presence === "offline") {
    return null;
  }

  const label =
    connection.homeState === "OTHER_HOME"
      ? `Ask to join ${connection.displayName}'s Home`
      : `Invite ${connection.displayName} to your Home`;

  return (
    <Button
      size="icon"
      variant="outline"
      aria-label={label}
      disabled={busy}
      onClick={connection.homeState === "OTHER_HOME" ? onRequest : onInvite}
    >
      <Plus className="h-4 w-4" aria-hidden />
    </Button>
  );
}
