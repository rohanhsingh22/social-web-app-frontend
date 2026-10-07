import { baseApi } from "@/rtk/base-api";
import type {
  HomeThemeLayer,
  HomeWorldTheme,
} from "@/components/home/home-world-types";

export type CharacterDefinitionDto = {
  id: string;
  name: string;
  assetId: string;
  rigId: string;
  defaultLoadoutId: string;
  unlock: { type: "free" } | { type: "event_coins"; amount: number };
};

export type MyCharacterDto = {
  definition: CharacterDefinitionDto;
  loadout: Record<string, unknown> & { characterId: string; accessoryIds: string[] };
};

export type CharacterSelection = {
  character: MyCharacterDto;
  ownedCharacterIds: string[];
  inventory: Array<{ id: string; category: string }>;
  eventCoins: number;
};

function pickRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function unwrapData(value: unknown): Record<string, unknown> {
  const root = pickRecord(value);
  const data = root.data;
  return pickRecord(data ?? value);
}

export const characterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    characters: builder.query<CharacterDefinitionDto[], void>({
      query: () => "/characters",
      transformResponse: (response: unknown) => {
        const data = unwrapData(response);
        const list = data.characters;
        return Array.isArray(list) ? (list as CharacterDefinitionDto[]) : [];
      },
      providesTags: ["Characters"],
    }),
    myCharacter: builder.query<CharacterSelection | null, void>({
      query: () => "/characters/me",
      transformResponse: (response: unknown) => {
        const data = unwrapData(response);
        if (!data.character) {
          return null;
        }
        return {
          character: data.character as MyCharacterDto,
          ownedCharacterIds: Array.isArray(data.ownedCharacterIds)
            ? (data.ownedCharacterIds as string[])
            : [],
          inventory: Array.isArray(data.inventory)
            ? (data.inventory as CharacterSelection["inventory"])
            : [],
          eventCoins:
            typeof data.eventCoins === "number" ? data.eventCoins : 0,
        };
      },
      providesTags: ["Characters"],
    }),
    saveCharacter: builder.mutation<
      MyCharacterDto,
      { characterId: string; loadout?: Record<string, unknown> }
    >({
      query: (input) => ({
        url: "/characters/me",
        method: "PUT",
        body: input,
      }),
      transformResponse: (response: unknown) => {
        const data = unwrapData(response);
        return data.character as MyCharacterDto;
      },
      invalidatesTags: ["Characters", "Home", "HomeConnections", "Profile"],
    }),
    unlockCharacter: builder.mutation<unknown, string>({
      query: (characterId) => ({
        url: "/characters/me/unlock",
        method: "POST",
        body: { characterId },
      }),
      invalidatesTags: ["Characters"],
    }),
    homeWorld: builder.query<
      { defaultTheme: HomeWorldTheme; activeLayers: HomeThemeLayer[]; theme: HomeWorldTheme },
      void
    >({
      query: () => "/home/world",
      transformResponse: (response: unknown) => {
        const data = unwrapData(response);
        return data as unknown as {
          defaultTheme: HomeWorldTheme;
          activeLayers: HomeThemeLayer[];
          theme: HomeWorldTheme;
        };
      },
      providesTags: ["HomeWorld"],
    }),
  }),
});

export const {
  useCharactersQuery,
  useMyCharacterQuery,
  useSaveCharacterMutation,
  useUnlockCharacterMutation,
  useHomeWorldQuery,
} = characterApi;
