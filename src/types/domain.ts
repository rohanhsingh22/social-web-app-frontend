export type UserSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role?: "user" | "moderator" | "admin";
  status?: "active" | "muted" | "banned" | "deleted";
};

export type Channel = {
  id: string;
  name: string;
  slug: string;
  type: "language" | "age" | "region" | "general";
  onlineCount: number;
  isDefault?: boolean;
  isActive?: boolean;
};

export type ChannelMessage = {
  id: string;
  channelId: string;
  sender: UserSummary;
  body: string;
  createdAt: string;
  status: "active" | "deleted" | "hidden" | "flagged";
};

export type PageInfo = {
  hasMore: boolean;
  nextCursor: string | null;
};

export type ChannelMessagePage = {
  messages: ChannelMessage[];
  pageInfo: PageInfo;
};

export type DmConversationMember = {
  userId: string;
  isSelf: boolean;
  profile: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    ageGroup: string | null;
    region: string | null;
    primaryLanguage: string | null;
    languages: string[];
  };
};

export type DmConversation = {
  id: string;
  type: "direct";
  createdAt: string;
  updatedAt: string;
  otherUser: {
    userId: string;
    profile: DmConversationMember["profile"];
  };
  latestMessage: DirectMessage | null;
};

export type DirectMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  status: "active" | "deleted" | "hidden" | "flagged";
  createdAt: string;
  sender: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      avatarUrl: string | null;
    } | null;
  };
};

export type DmMessagePage = {
  conversation: {
    id: string;
    type: "direct";
    createdAt: string;
    updatedAt: string;
    members: Array<{
      userId: string;
      isSelf: boolean;
      profile: DmConversationMember["profile"];
    }>;
  };
  messages: DirectMessage[];
  pageInfo: PageInfo;
};

export type ConnectionState =
  | "not_connected"
  | "request_sent"
  | "request_received"
  | "connected"
  | "blocked";

export type ConnectionProfile = {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  ageGroup?: string;
  region?: string;
  primaryLanguage?: string;
  languages: string[];
};

export type ConnectionUser = {
  id: string;
  profile: ConnectionProfile | null;
};

export type ConnectionRequest = {
  id: string;
  status: "pending" | "accepted" | "blocked" | "cancelled";
  requesterId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  otherUser: ConnectionUser;
};

export type Connection = {
  id: string;
  status: "pending" | "accepted" | "blocked" | "cancelled";
  requesterId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  otherUser: ConnectionUser;
};

export type CharacterConfig = {
  gender: "male" | "female";
  skinColor?: string;
  hairColor?: string;
  outfitColor?: string;
};

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  gender: "female",
  skinColor: "#f5d0a9",
  hairColor: "#2c1a0e",
  outfitColor: "#3b82f6",
};

export type Profile = UserSummary & {
  bio?: string;
  dob?: string;
  ageGroup?: string;
  region?: string;
  city?: string;
  gender?: string;
  characterConfig?: CharacterConfig;
  primaryLanguage?: string;
  languages: string[];
  isComplete: boolean;
  publicUserId?: string;
};

export type SearchUserProfile = {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  ageGroup?: string;
  region?: string;
  primaryLanguage?: string;
  languages: string[];
};

export type SearchUserConnection = {
  id: string;
  status: "pending" | "accepted" | "blocked" | "cancelled";
  direction: "sent" | "received" | null;
};

export type SearchUserResult = {
  id: string;
  profile: SearchUserProfile;
  connection: SearchUserConnection | null;
};

export type SearchUsersResponse = {
  query: string;
  users: SearchUserResult[];
};

export type AuthSession = {
  user: UserSummary;
  profile?: Profile;
};
