import { lazy, Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

const CharacterScene = lazy(() =>
  import("@/components/character/character-scene").then((m) => ({
    default: m.CharacterScene,
  })),
);

const characters = [
  { gender: "male" as const, skinColor: "#e0b88a", hairColor: "#1a1a1a", outfitColor: "#3b82f6" },
  { gender: "female" as const, skinColor: "#f5d0a9", hairColor: "#2c1a0e", outfitColor: "#ec4899" },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <Skeleton className="h-64 w-64 rounded-3xl" />
            </div>
          }
        >
          <CharacterScene configs={characters} interactive />
        </Suspense>
      </div>
    </AppShell>
  );
}
