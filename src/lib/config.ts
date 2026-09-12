export const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
  realtimeUrl:
    import.meta.env.VITE_REALTIME_URL?.replace(/\/$/, "") ??
    "http://localhost:3001",
};
