export type UserSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  publicUserId?: string;
  role?: "user" | "moderator" | "admin";
  status?: "active" | "muted" | "banned" | "deleted";
  profilePicture?: ProfilePicture;
  toli?: ToliRef | null;
};

export type Channel = {
  id: string;
  name: string;
  slug: string;
  type: "language" | "age" | "region" | "general" | "toli";
  onlineCount: number;
  isDefault?: boolean;
  isActive?: boolean;
  toli: ToliRef | null;
};

export type Toli = {
  id: string;
  name: string;
  description: string;
  motto: string;
  memberCount: number;
  avatars: string[];
};

export type ThoughtAuthor = {
  userId: string;
  publicUserId?: string;
  username: string;
  displayName: string;
  profilePicture: ProfilePicture;
  toli: ToliRef | null;
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
    profilePicture: ProfilePicture;
    toli: ToliRef | null;
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
      profilePicture: ProfilePicture;
      toli: ToliRef | null;
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
  profilePicture: ProfilePicture;
  toli: ToliRef | null;
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

export type ProfilePicture = {
  type: "provider" | "toli";
  avatarUrl?: string | null;
  toliAvatarKey?: string | null;
};

export type ToliRef = {
  id: string;
  name: string;
};

export type ProfilePictureState = ProfilePicture & {
  toli: ToliRef | null;
};

export type Profile = UserSummary & {
  bio?: string;
  dob?: string;
  ageGroup?: string;
  region?: string;
  city?: string;
  gender?: string;
  characterConfig?: CharacterConfig;
  profilePicture: ProfilePicture;
  toli: ToliRef | null;
  primaryLanguage?: string;
  languages: string[];
  interests: string[];
  isComplete: boolean;
  publicUserId?: string;
};

export type SearchUserProfile = {
  username: string;
  displayName: string;
  avatarUrl?: string;
  profilePicture: ProfilePicture;
  toli: ToliRef | null;
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

export type ThoughtCounts = {
  likes: number;
  comments: number;
  shares: number;
};

export type ThoughtViewerState = {
  liked: boolean;
  shared: boolean;
  hidden: boolean;
};

export type Thought = {
  id: string;
  body: string;
  status: "active" | "deleted" | "hidden" | "flagged";
  createdAt: string;
  author: ThoughtAuthor;
  counts: ThoughtCounts;
  viewer: ThoughtViewerState;
};

export type ThoughtPage = {
  thoughts: Thought[];
  pageInfo: PageInfo;
};

export type ThoughtComment = {
  id: string;
  body: string;
  status: "active" | "deleted" | "hidden" | "flagged";
  createdAt: string;
  author: ThoughtAuthor;
};

export type ThoughtCommentPage = {
  thoughtId: string;
  comments: ThoughtComment[];
  pageInfo: PageInfo;
};

export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "new_dm"
  | "legal_notice";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  expiresAt?: string | null;
};

export type NotificationsPage = {
  notifications: Notification[];
  pageInfo: PageInfo;
  unreadCount: number;
};

export type AuthSession = {
  user: UserSummary;
  profile?: Profile;
};
