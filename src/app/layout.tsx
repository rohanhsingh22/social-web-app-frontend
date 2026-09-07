import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Chat",
  description: "Live public channels, connections, and private chat.",
};

const themeInitScript = `(function () {
  try {
    var key = "social-chat-theme";
    var stored = window.localStorage.getItem(key);
    var mode = "system";
    var accent = "rose";

    if (stored) {
      var parsed = JSON.parse(stored);
      if (parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system") {
        mode = parsed.mode;
      }
      if (parsed.accent) {
        accent = parsed.accent;
      }
    }

    var resolved = mode;
    if (mode === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    var root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.setAttribute("data-accent", accent);
  } catch (error) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
