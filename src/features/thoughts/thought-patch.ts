import type { Thought } from "@/types/domain";

export type ThoughtCardPatch =
  | { type: "like" }
  | { type: "unlike" }
  | { type: "share" }
  | { type: "unshare" }
  | { type: "hide" }
  | { type: "unhide" }
  | { type: "delete" }
  | { type: "edit"; body: string };

// Applies a card action to a locally cached thought (the `older` pages held
// outside RTK Query). Base-query items self-heal through tag invalidation;
// this keeps deep pages consistent without dropping scroll position.
export function applyThoughtPatch(thought: Thought, patch: ThoughtCardPatch): Thought {
  switch (patch.type) {
    case "like":
      return {
        ...thought,
        viewer: { ...thought.viewer, liked: true },
        counts: { ...thought.counts, likes: thought.counts.likes + 1 },
      };
    case "unlike":
      return {
        ...thought,
        viewer: { ...thought.viewer, liked: false },
        counts: {
          ...thought.counts,
          likes: Math.max(0, thought.counts.likes - 1),
        },
      };
    case "share":
      return {
        ...thought,
        viewer: { ...thought.viewer, shared: true },
        counts: { ...thought.counts, shares: thought.counts.shares + 1 },
      };
    case "unshare":
      return {
        ...thought,
        viewer: { ...thought.viewer, shared: false },
        counts: {
          ...thought.counts,
          shares: Math.max(0, thought.counts.shares - 1),
        },
      };
    case "hide":
      return { ...thought, viewer: { ...thought.viewer, hidden: true } };
    case "unhide":
      return { ...thought, viewer: { ...thought.viewer, hidden: false } };
    case "edit":
      return { ...thought, body: patch.body };
    case "delete":
      return thought;
  }
}
