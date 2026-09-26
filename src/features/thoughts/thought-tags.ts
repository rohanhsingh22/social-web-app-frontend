import type { Thought } from "@/types/domain";

export function topHashtags(thoughts: Thought[], limit = 7) {
  const counts = new Map<string, number>();
  for (const thought of thoughts) {
    for (const match of thought.body.matchAll(/#([\p{L}\p{N}_]+)/gu)) {
      const tag = match[1]?.toLowerCase();
      if (tag) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export function engagementScore(thought: Thought) {
  return (
    thought.counts.likes * 2 + thought.counts.shares * 3 + thought.counts.comments
  );
}
