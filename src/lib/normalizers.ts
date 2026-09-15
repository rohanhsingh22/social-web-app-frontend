import type {
  AuthSession,
  Channel,
  ChannelMessage,
  ChannelMessagePage,
  CharacterConfig,
  DmConversation,
  DmConversationMember,
  DmMessagePage,
  DirectMessage,
  Connection,
  ConnectionRequest,
  ConnectionProfile,
  ConnectionUser,
  Notification,
  NotificationsPage,
  PageInfo,
  Profile,
  ProfilePicture,
  ProfilePictureState,
  SearchUserConnection,
  SearchUsersResponse,
  Thought,
  ThoughtAuthor,
  ThoughtComment,
  ThoughtCommentPage,
  ThoughtPage,
  Toli,
  ToliRef,
  UserSummary,
} from "@/types/domain";
import { DEFAULT_CHARACTER_CONFIG } from "@/types/domain";

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickRecord(value: unknown, keys: string[]): unknown {
  if (!isRecord(value)) {
    return value;
  }

  for (const key of keys) {
    if (key in value) {
      return value[key];
    }
  }

  return value;
}

function pickArray(value: unknown, keys: string[]): unknown[] {
  const candidate = pickRecord(value, keys);

  if (Array.isArray(candidate)) {
    return candidate;
  }

  if (isRecord(candidate)) {
    for (const key of keys) {
      if (Array.isArray(candidate[key])) {
        return candidate[key];
      }
    }

    if (isRecord(candidate.data)) {
      for (const key of keys) {
        if (Array.isArray(candidate.data[key])) {
          return candidate.data[key];
        }
      }
    }

    if (Array.isArray(candidate.items)) {
      return candidate.items;
    }
  }

  return [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown, fallback?: string): string | undefined {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function normalizeUser(value: unknown): UserSummary {
  const record = isRecord(value) ? value : {};
  const profile = isRecord(record.profile) ? record.profile : {};

  return {
    id: asString(record.id ?? record.userId ?? profile.userId, "unknown"),
    username: asString(record.username ?? profile.username, "unknown"),
    publicUserId: asOptionalString(record.publicUserId ?? record.public_user_id ?? profile.publicUserId ?? profile.public_user_id),
    displayName: asString(
      record.displayName ?? record.display_name ?? profile.displayName ?? profile.display_name,
      "Unknown user",
    ),
    avatarUrl: asOptionalString(record.avatarUrl ?? record.avatar_url ?? profile.avatarUrl ?? profile.avatar_url),
    profilePicture: normalizeProfilePicture(
      record.profilePicture ?? record.profile_picture ?? profile,
    ),
    toli: normalizeToliRef(record.toli ?? profile.toli),
    role: asString(record.role, "user") as UserSummary["role"],
    status: asString(record.status, "active") as UserSummary["status"],
  };
}

export function normalizeCharacterConfig(value: unknown): CharacterConfig {
  if (!isRecord(value)) {
    return DEFAULT_CHARACTER_CONFIG;
  }

  const gender = value.gender === "male" || value.gender === "female" ? value.gender : DEFAULT_CHARACTER_CONFIG.gender;

  return {
    gender,
    skinColor: asOptionalString(value.skin_color ?? value.skinColor) ?? DEFAULT_CHARACTER_CONFIG.skinColor,
    hairColor: asOptionalString(value.hair_color ?? value.hairColor) ?? DEFAULT_CHARACTER_CONFIG.hairColor,
    outfitColor: asOptionalString(value.outfit_color ?? value.outfitColor) ?? DEFAULT_CHARACTER_CONFIG.outfitColor,
  };
}

export function normalizeProfile(value: unknown): Profile {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const profile = isRecord(record.profile) ? record.profile : record;
  const user = normalizeUser(profile);

  return {
    ...user,
    username: asString(profile.username ?? user.username, user.username),
    displayName: asString(profile.displayName ?? profile.display_name ?? user.displayName, user.displayName),
    avatarUrl: asOptionalString(profile.avatarUrl ?? profile.avatar_url, user.avatarUrl),
    profilePicture: normalizeProfilePicture(profile),
    toli: normalizeToliRef(profile.toli),
    bio: asString(profile.bio, ""),
    dob: asString(profile.dob ?? profile.dateOfBirth ?? profile.date_of_birth, ""),
    ageGroup: asString(profile.ageGroup ?? profile.age_group, ""),
    region: asString(profile.region, ""),
    city: asString(profile.city, ""),
    gender: asString(profile.gender, ""),
    characterConfig: normalizeCharacterConfig(profile.character_config ?? profile.characterConfig),
    primaryLanguage: asString(profile.primaryLanguage ?? profile.primary_language, ""),
    languages: asStringArray(profile.languages),
    interests: asStringArray(profile.interests),
    isComplete: asBoolean(profile.isComplete ?? profile.is_complete, false),
    publicUserId: asOptionalString(profile.publicUserId ?? profile.public_user_id),
  };
}

export function normalizeToliRef(value: unknown): ToliRef | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id);
  const name = asString(value.name);

  return id && name ? { id, name } : null;
}

export function normalizeProfilePicture(value: unknown): ProfilePicture {
  const root = pickRecord(value, ["data"]);
  const record = isRecord(root) ? root : {};
  const rawSource = record.profilePicture ?? record.profile_picture;
  const source = isRecord(rawSource) ? rawSource : record;
  const type = source.type === "toli" ? "toli" : "provider";

  return {
    type,
    avatarUrl: asOptionalString(source.avatarUrl ?? source.avatar_url) ?? null,
    toliAvatarKey:
      asOptionalString(source.toliAvatarKey ?? source.toli_avatar_key) ?? null,
  };
}

export function normalizeProfilePictureState(
  value: unknown,
): ProfilePictureState {
  const root = pickRecord(value, ["data"]);
  const record = isRecord(root) ? root : {};

  return {
    ...normalizeProfilePicture(record),
    toli: normalizeToliRef(record.toli),
  };
}

export function normalizeAuthSession(value: unknown): AuthSession {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const userSource = record.user ?? record.currentUser ?? record;
  const user = normalizeUser(userSource);
  const profileSource =
    record.profile ??
    (isRecord(userSource) ? (userSource as ApiRecord).profile : undefined);
  const profile = isRecord(profileSource) ? normalizeProfile(profileSource) : undefined;

  return { user, profile };
}

export function normalizeDisplayNameAvailability(value: unknown): {
  available: boolean;
  displayName: string;
} {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};

  return {
    available: asBoolean(record.available, false),
    displayName: asString(record.displayName ?? record.display_name),
  };
}

export function normalizeChannels(value: unknown): Channel[] {
  return pickArray(value, ["channels", "data", "items"]).map(normalizeChannel);
}

export function normalizeChannel(value: unknown): Channel {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, asString(record.slug, "unknown")),
    name: asString(record.name, "Untitled"),
    slug: asString(record.slug, asString(record.id, "unknown")),
    type: asString(record.type, "general") as Channel["type"],
    onlineCount: asNumber(record.onlineCount ?? record.online_count, 0),
    isDefault: asBoolean(record.isDefault ?? record.is_default, false),
    isActive: asBoolean(record.isActive ?? record.is_active, true),
    toli: normalizeToliRef(record.toli),
  };
}

export function normalizeToli(value: unknown): Toli {
  const payload = pickRecord(value, ["data"]);
  const source = isRecord(payload) ? payload : {};
  const record = isRecord(source.toli) ? source.toli : source;

  return {
    id: asString(record.id, "unknown"),
    name: asString(record.name, "Unknown"),
    description: asString(record.description, ""),
    motto: asString(record.motto, ""),
    memberCount: asNumber(record.memberCount ?? record.member_count, 0),
    avatars: asStringArray(record.avatars),
  };
}

export function normalizeTolis(value: unknown): Toli[] {
  return pickArray(value, ["tolis", "data", "items"]).map(normalizeToli);
}

export function normalizeThoughtAuthor(value: unknown): ThoughtAuthor {
  const record = isRecord(value) ? value : {};

  return {
    userId: asString(record.userId ?? record.user_id ?? record.id, "unknown"),
    publicUserId: asOptionalString(
      record.publicUserId ?? record.public_user_id,
    ),
    username: asString(record.username, "unknown"),
    displayName: asString(
      record.displayName ?? record.display_name,
      "Unknown",
    ),
    profilePicture: normalizeProfilePicture(
      record.profilePicture ?? record.profile_picture ?? record,
    ),
    toli: normalizeToliRef(record.toli),
  };
}

function normalizeThoughtCounts(value: unknown): Thought["counts"] {
  const record = isRecord(value) ? value : {};

  return {
    likes: asNumber(record.likes, 0),
    comments: asNumber(record.comments, 0),
    shares: asNumber(record.shares, 0),
  };
}

function normalizeThoughtViewer(value: unknown): Thought["viewer"] {
  const record = isRecord(value) ? value : {};

  return {
    liked: asBoolean(record.liked, false),
    shared: asBoolean(record.shared, false),
    hidden: asBoolean(record.hidden, false),
  };
}

export function normalizeThought(value: unknown): Thought {
  const payload = pickRecord(value, ["data"]);
  const source = isRecord(payload) ? payload : {};
  const record = isRecord(source.thought) ? source.thought : source;

  return {
    id: asString(record.id, "unknown"),
    body: asString(record.body, ""),
    status: (["active", "deleted", "hidden", "flagged"] as const).includes(
      record.status as Thought["status"],
    )
      ? (record.status as Thought["status"])
      : "active",
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    author: normalizeThoughtAuthor(record.author),
    counts: normalizeThoughtCounts(record.counts),
    viewer: normalizeThoughtViewer(record.viewer),
  };
}

export function normalizeThoughtPage(value: unknown): ThoughtPage {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};

  return {
    thoughts: pickArray(record, ["thoughts", "data", "items"]).map(
      normalizeThought,
    ),
    pageInfo: normalizePageInfo(record.pageInfo ?? record.page_info ?? record),
  };
}

export function normalizeThoughtComment(value: unknown): ThoughtComment {
  const payload = pickRecord(value, ["data"]);
  const source = isRecord(payload) ? payload : {};
  const record = isRecord(source.comment) ? source.comment : source;

  return {
    id: asString(record.id, "unknown"),
    body: asString(record.body, ""),
    status: (["active", "deleted", "hidden", "flagged"] as const).includes(
      record.status as ThoughtComment["status"],
    )
      ? (record.status as ThoughtComment["status"])
      : "active",
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    author: normalizeThoughtAuthor(record.author),
  };
}

export function normalizeThoughtCommentPage(
  value: unknown,
): ThoughtCommentPage {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};

  return {
    thoughtId: asString(record.thoughtId ?? record.thought_id, "unknown"),
    comments: pickArray(record, ["comments", "data", "items"]).map(
      normalizeThoughtComment,
    ),
    pageInfo: normalizePageInfo(record.pageInfo ?? record.page_info ?? record),
  };
}

const NOTIFICATION_TYPES = [
  "connection_request",
  "connection_accepted",
  "new_dm",
  "legal_notice",
] as const;

export function normalizeNotification(value: unknown): Notification {
  const payload = pickRecord(value, ["data"]);
  const source = isRecord(payload) ? payload : {};
  const record = isRecord(source.notification) ? source.notification : source;
  const type = asString(record.type, "");

  return {
    id: asString(record.id, "unknown"),
    type: (
      NOTIFICATION_TYPES as readonly string[]
    ).includes(type)
      ? (type as Notification["type"])
      : "legal_notice",
    title: asString(record.title, ""),
    body: asOptionalString(record.body) ?? null,
    metadata: isRecord(record.metadata) ? record.metadata : null,
    readAt: asOptionalString(record.readAt ?? record.read_at) ?? null,
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    expiresAt: asOptionalString(record.expiresAt ?? record.expires_at) ?? null,
  };
}

export function normalizeNotificationsPage(
  value: unknown,
): NotificationsPage {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};

  return {
    notifications: pickArray(record, ["notifications", "data", "items"]).map(
      normalizeNotification,
    ),
    pageInfo: normalizePageInfo(record.pageInfo ?? record.page_info ?? record),
    unreadCount: asNumber(record.unreadCount ?? record.unread_count, 0),
  };
}

export function normalizeChannelMessages(value: unknown): ChannelMessage[] {
  return pickArray(value, ["messages", "data", "items"]).map(normalizeChannelMessage);
}

export function normalizePageInfo(value: unknown): PageInfo {
  const record = isRecord(value) ? value : {};

  if (isRecord(record.pageInfo)) {
    return normalizePageInfo(record.pageInfo);
  }

  const nextCursor = record.nextCursor ?? record.next_cursor;
  const hasMore = record.hasMore ?? record.has_more;

  return {
    hasMore: asBoolean(hasMore, false),
    nextCursor:
      typeof nextCursor === "string" && nextCursor.length > 0 ? nextCursor : null,
  };
}

export function normalizeChannelMessagePage(value: unknown): ChannelMessagePage {
  const record = isRecord(value) ? value : {};

  const messages = normalizeChannelMessages(
    record.messages ?? pickArray(value, ["messages", "data", "items"]),
  );

  return {
    messages,
    pageInfo: normalizePageInfo(record),
  };
}

function parseSearchConnection(value: unknown): SearchUserConnection | null {
  if (!isRecord(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = asString(raw.id, "");

  if (!id) {
    return null;
  }

  return {
    id,
    status: asString(raw.status, "pending") as SearchUserConnection["status"],
    direction:
      (asOptionalString(raw.direction) ??
        null) as SearchUserConnection["direction"],
  };
}

export function normalizeSearchUser(value: unknown) {
  const record: ApiRecord = isRecord(value) ? value : {};
  const profile: ApiRecord = isRecord(record.profile) ? record.profile : {};
  const connection = parseSearchConnection(record.connection);

  return {
    id: asString(record.id, "unknown"),
    profile: {
      username: asString(profile.username, "unknown"),
      displayName: asString(profile.displayName ?? profile.display_name, "Unknown user"),
      avatarUrl: asOptionalString(profile.avatarUrl ?? profile.avatar_url),
      profilePicture: normalizeProfilePicture(
        profile.profilePicture ?? profile.profile_picture ?? profile,
      ),
      toli: normalizeToliRef(profile.toli),
      bio: asString(profile.bio, ""),
      ageGroup: asString(profile.ageGroup ?? profile.age_group, ""),
      region: asString(profile.region, ""),
      primaryLanguage: asString(profile.primaryLanguage ?? profile.primary_language, ""),
      languages: asStringArray(profile.languages),
    },
    connection,
  };
}

function normalizeConnectionProfile(value: unknown): ConnectionProfile {
  const record = isRecord(value) ? value : {};

  return {
    username: asString(record.username, "unknown"),
    displayName: asString(record.displayName ?? record.display_name, "Unknown user"),
    avatarUrl: asOptionalString(record.avatarUrl ?? record.avatar_url),
    profilePicture: normalizeProfilePicture(
      record.profilePicture ?? record.profile_picture ?? record,
    ),
    toli: normalizeToliRef(record.toli),
    bio: asString(record.bio, ""),
    ageGroup: asString(record.ageGroup ?? record.age_group, ""),
    region: asString(record.region, ""),
    primaryLanguage: asString(record.primaryLanguage ?? record.primary_language, ""),
    languages: asStringArray(record.languages),
  };
}

function normalizeConnectionUser(value: unknown): ConnectionUser {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, "unknown"),
    profile: isRecord(record.profile)
      ? normalizeConnectionProfile(record.profile)
      : null,
  };
}

export function normalizeConnection(value: unknown): Connection {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, ""),
    status: asString(record.status, "accepted") as Connection["status"],
    requesterId: asString(record.requesterId ?? record.requester_id, ""),
    receiverId: asString(record.receiverId ?? record.receiver_id, ""),
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    updatedAt: asString(record.updatedAt ?? record.updated_at, ""),
    otherUser: normalizeConnectionUser(record.otherUser ?? record.other_user),
  };
}

export function normalizeConnections(value: unknown): Connection[] {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const connections = pickArray(record, ["connections", "items", "data"]);

  return connections.map(normalizeConnection);
}

export function normalizeConnectionRequest(value: unknown): ConnectionRequest {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, ""),
    status: asString(record.status, "pending") as ConnectionRequest["status"],
    requesterId: asString(record.requesterId ?? record.requester_id, ""),
    receiverId: asString(record.receiverId ?? record.receiver_id, ""),
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    updatedAt: asString(record.updatedAt ?? record.updated_at, ""),
    otherUser: normalizeConnectionUser(record.otherUser ?? record.other_user),
  };
}

export function normalizeConnectionRequests(
  value: unknown,
): ConnectionRequest[] {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const requests = pickArray(record, ["requests", "items", "data"]);

  return requests.map(normalizeConnectionRequest);
}

export function normalizeSearchUsers(value: unknown): SearchUsersResponse {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const users = pickArray(record, ["users", "items"]).map(normalizeSearchUser);

  return {
    query: asString(record.query, ""),
    users,
  };
}

export function normalizeChannelMessage(value: unknown): ChannelMessage {
  const record = isRecord(value) ? value : {};
  const sender = normalizeUser(record.sender ?? record.user ?? record.author);

  return {
    id: asString(record.id, crypto.randomUUID()),
    channelId: asString(record.channelId ?? record.channel_id, ""),
    sender,
    body: asString(record.body ?? record.message ?? record.text, ""),
    createdAt: asString(record.createdAt ?? record.created_at, new Date().toISOString()),
    status: asString(record.status, "active") as ChannelMessage["status"],
  };
}

function normalizeDmProfile(value: unknown): DmConversationMember["profile"] {
  const record = isRecord(value) ? value : {};

  return {
    userId: asString(record.userId ?? record.user_id, ""),
    username: asString(record.username, "unknown"),
    displayName: asString(record.displayName ?? record.display_name, "Unknown user"),
    avatarUrl: asOptionalString(record.avatarUrl ?? record.avatar_url) ?? null,
    profilePicture: normalizeProfilePicture(
      record.profilePicture ?? record.profile_picture ?? record,
    ),
    toli: normalizeToliRef(record.toli),
    bio: asString(record.bio, ""),
    ageGroup: asString(record.ageGroup ?? record.age_group, ""),
    region: asString(record.region, ""),
    primaryLanguage: asString(
      record.primaryLanguage ?? record.primary_language,
      "",
    ),
    languages: asStringArray(record.languages),
  };
}

function normalizeDmMember(value: unknown, viewerId: string): DmConversationMember {
  const record = isRecord(value) ? value : {};
  const profile = isRecord(record.profile) ? record.profile : {};

  return {
    userId: asString(record.userId ?? record.user_id, ""),
    isSelf: asString(record.userId ?? record.user_id, "") === viewerId,
    profile: normalizeDmProfile(profile),
  };
}

function normalizeDirectMessageSender(
  value: unknown,
): DirectMessage["sender"] {
  const record = isRecord(value) ? value : {};
  const profile = isRecord(record.profile) ? record.profile : null;

  return {
    id: asString(record.id ?? record.userId ?? record.user_id, ""),
    profile: profile
      ? {
          username: asString(profile.username, "unknown"),
          displayName: asString(
            profile.displayName ?? profile.display_name,
            "Unknown user",
          ),
          avatarUrl: asOptionalString(
            profile.avatarUrl ?? profile.avatar_url,
          ) ?? null,
          profilePicture: normalizeProfilePicture(
            profile.profilePicture ?? profile.profile_picture ?? profile,
          ),
          toli: normalizeToliRef(profile.toli),
        }
      : null,
  };
}

export function normalizeDirectMessage(value: unknown): DirectMessage {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, ""),
    conversationId: asString(record.conversationId ?? record.conversation_id, ""),
    senderId: asString(record.senderId ?? record.sender_id, ""),
    body: asString(record.body ?? record.text, ""),
    createdAt: asString(
      record.createdAt ?? record.created_at,
      new Date().toISOString(),
    ),
    status: asString(record.status, "active") as DirectMessage["status"],
    sender: normalizeDirectMessageSender(record.sender),
  };
}

export function normalizeDmConversation(
  value: unknown,
  viewerId: string,
): DmConversation {
  const record = isRecord(value) ? value : {};
  const members = Array.isArray(record.members) ? record.members : [];

  const memberList = members
    .map((m) => normalizeDmMember(m, viewerId))
    .filter((m) => m.userId);

  const otherMember = memberList.find((m) => !m.isSelf) ?? memberList[0];

  return {
    id: asString(record.id, ""),
    type: "direct",
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    updatedAt: asString(record.updatedAt ?? record.updated_at, ""),
    otherUser: otherMember
      ? { userId: otherMember.userId, profile: otherMember.profile }
      : { userId: "", profile: normalizeDmProfile({}) },
    latestMessage: record.latestMessage
      ? normalizeDirectMessage(record.latestMessage)
      : record.latest_message
        ? normalizeDirectMessage(record.latest_message)
        : null,
  };
}

export function normalizeDmConversations(
  value: unknown,
  viewerId: string,
): DmConversation[] {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const conversations = pickArray(record, ["conversations", "items", "data"]);

  return conversations.map((c) => normalizeDmConversation(c, viewerId));
}

export function normalizeDmMessagePage(
  value: unknown,
  viewerId: string,
): DmMessagePage {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};

  const members = Array.isArray(record.members) ? record.members : [];
  const memberList = members.map((m) => normalizeDmMember(m, viewerId));

  return {
    conversation: {
      id: asString(record.id, ""),
      type: "direct",
      createdAt: asString(record.createdAt ?? record.created_at, ""),
      updatedAt: asString(record.updatedAt ?? record.updated_at, ""),
      members: memberList,
    },
    messages: pickArray(record, ["messages", "data", "items"]).map(
      normalizeDirectMessage,
    ),
    pageInfo: normalizePageInfo(record),
  };
}
