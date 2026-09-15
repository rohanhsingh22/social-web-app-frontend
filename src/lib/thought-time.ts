export function formatThoughtTime(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();

  if (diffMs < 60_000) {
    return "now";
  }

  if (diffMs < 3_600_000) {
    return `${Math.floor(diffMs / 60_000)}m`;
  }

  if (diffMs < 86_400_000) {
    return `${Math.floor(diffMs / 3_600_000)}h`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
