import type { AuthSession, Channel, ChannelMessage, Profile, UserSummary } from "@/types/domain";

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
    displayName: asString(
      record.displayName ?? record.display_name ?? profile.displayName ?? profile.display_name,
      "Unknown user",
    ),
    avatarUrl: asOptionalString(record.avatarUrl ?? record.avatar_url ?? profile.avatarUrl ?? profile.avatar_url),
    role: asString(record.role, "user") as UserSummary["role"],
    status: asString(record.status, "active") as UserSummary["status"],
  };
}

export function normalizeProfile(value: unknown): Profile {
  const record = isRecord(value) ? value : {};
  const user = normalizeUser(record);

  return {
    ...user,
    username: asString(record.username ?? user.username, user.username),
    displayName: asString(record.displayName ?? record.display_name ?? user.displayName, user.displayName),
    avatarUrl: asOptionalString(record.avatarUrl ?? record.avatar_url, user.avatarUrl),
    bio: asString(record.bio, ""),
    ageGroup: asString(record.ageGroup ?? record.age_group, ""),
    region: asString(record.region, ""),
    city: asString(record.city, ""),
    gender: asString(record.gender, ""),
    primaryLanguage: asString(record.primaryLanguage ?? record.primary_language, ""),
    languages: asStringArray(record.languages),
    isComplete: asBoolean(record.isComplete ?? record.is_complete, false),
  };
}

export function normalizeAuthSession(value: unknown): AuthSession {
  const payload = pickRecord(value, ["data"]);
  const record = isRecord(payload) ? payload : {};
  const userSource = record.user ?? record.currentUser ?? record;
  const profileSource = record.profile;
  const user = normalizeUser(userSource);
  const profile = isRecord(profileSource) ? normalizeProfile(profileSource) : undefined;

  return { user, profile };
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
  };
}

export function normalizeChannelMessages(value: unknown): ChannelMessage[] {
  return pickArray(value, ["messages", "data", "items"]).map(normalizeChannelMessage);
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
