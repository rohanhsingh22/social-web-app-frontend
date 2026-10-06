import { useAuthSession } from "@/features/auth/api";
import { useHomeSocket } from "@/features/home/use-home-socket";
import { HomeInvitationDialog } from "@/components/home/home-invitation-dialog";
import { HomeJoinRequestDialog } from "@/components/home/home-join-request-dialog";

// Global Home overlays (spec #85): mounted once in AppShell while logged in,
// so invitations and join requests arrive regardless of the current page.
export function HomeOverlays() {
  const authQuery = useAuthSession();
  const userId = authQuery.data?.user.id;
  const { invitation, joinRequest, dismissInvitation, dismissJoinRequest } =
    useHomeSocket(Boolean(authQuery.data));

  // The fanout reaches both parties; only the recipient gets the popup.
  const myInvitation =
    invitation && userId && invitation.inviteeId === userId
      ? invitation
      : null;
  const myJoinRequest =
    joinRequest && userId && joinRequest.targetMemberId === userId
      ? joinRequest
      : null;

  return (
    <>
      {myInvitation && (
        <HomeInvitationDialog
          invitation={myInvitation}
          onDone={dismissInvitation}
        />
      )}
      {myJoinRequest && (
        <HomeJoinRequestDialog
          joinRequest={myJoinRequest}
          onDone={dismissJoinRequest}
        />
      )}
    </>
  );
}
