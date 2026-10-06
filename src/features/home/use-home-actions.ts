import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  useAcceptHomeInvitationMutation,
  useAcceptHomeJoinRequestMutation,
  useInviteToHomeMutation,
  useLeaveHomeMutation,
  useRejectHomeInvitationMutation,
  useRejectHomeJoinRequestMutation,
  useRemoveHomeMemberMutation,
  useRequestHomeJoinMutation,
} from "@/features/home/api";

// Stable backend error codes (HOME_FULL, INVITATION_EXPIRED, …) surface as
// `data.message`. Never match on rendered strings — map codes to copy in
// the dialogs (backend spec #88-89).
export function getHomeErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const data =
    "data" in error
      ? (error as { data?: unknown }).data
      : error;

  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    return typeof message === "string" ? message : null;
  }

  return null;
}

export type HomeQueryError = FetchBaseQueryError | undefined;

export function useHomeActions() {
  const [inviteToHome, inviteState] = useInviteToHomeMutation();
  const [acceptInvitation, acceptInvitationState] =
    useAcceptHomeInvitationMutation();
  const [rejectInvitation, rejectInvitationState] =
    useRejectHomeInvitationMutation();
  const [requestJoin, requestJoinState] = useRequestHomeJoinMutation();
  const [acceptJoinRequest, acceptJoinRequestState] =
    useAcceptHomeJoinRequestMutation();
  const [rejectJoinRequest, rejectJoinRequestState] =
    useRejectHomeJoinRequestMutation();
  const [leaveHome, leaveState] = useLeaveHomeMutation();
  const [removeMember, removeMemberState] = useRemoveHomeMemberMutation();

  return {
    inviteToHome,
    inviteState,
    acceptInvitation,
    acceptInvitationState,
    rejectInvitation,
    rejectInvitationState,
    requestJoin,
    requestJoinState,
    acceptJoinRequest,
    acceptJoinRequestState,
    rejectJoinRequest,
    rejectJoinRequestState,
    leaveHome,
    leaveState,
    removeMember,
    removeMemberState,
  };
}
