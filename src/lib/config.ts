export const config = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
  realtimeUrl:
    process.env.NEXT_PUBLIC_REALTIME_URL?.replace(/\/$/, "") ??
    "http://localhost:3001",
};
