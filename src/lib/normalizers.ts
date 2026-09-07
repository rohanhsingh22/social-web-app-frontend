import type {
  AuthSession,
  Channel,
  ChannelMessage,
  ChannelMessagePage,
  CharacterConfig,
  PageInfo,
  Profile,
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
    displayName: asString(
      record.displayName ?? record.display_name ?? profile.displayName ?? profile.display_name,
      "Unknown user",
    ),
    avatarUrl: asOptionalString(record.avatarUrl ?? record.avatar_url ?? profile.avatarUrl ?? profile.avatar_url),
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
    bio: asString(profile.bio, ""),
    dob: asString(profile.dob ?? profile.dateOfBirth ?? profile.date_of_birth, ""),
    ageGroup: asString(profile.ageGroup ?? profile.age_group, ""),
    region: asString(profile.region, ""),
    city: asString(profile.city, ""),
    gender: asString(profile.gender, ""),
    characterConfig: normalizeCharacterConfig(profile.character_config ?? profile.characterConfig),
    primaryLanguage: asString(profile.primaryLanguage ?? profile.primary_language, ""),
    languages: asStringArray(profile.languages),
    isComplete: asBoolean(profile.isComplete ?? profile.is_complete, false),
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
