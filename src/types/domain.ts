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

export type ConnectionState =
  | "not_connected"
  | "request_sent"
  | "request_received"
  | "connected"
  | "blocked";

export type Connection = {
  id: string;
  user: UserSummary;
  state: ConnectionState;
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
};

export type AuthSession = {
  user: UserSummary;
  profile?: Profile;
};
