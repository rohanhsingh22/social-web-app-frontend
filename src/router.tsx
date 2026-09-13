import { Route, Routes } from "react-router-dom";
import AuthCallbackSuccessPage from "@/pages/auth-callback-success-page";
import ChannelPage from "@/pages/channel-page";
import ChatPage from "@/pages/chat-page";
import ConnectionsPage from "@/pages/connections-page";
import DirectMessagePage from "@/pages/direct-message-page";
import HomePage from "@/pages/home-page";
import LoginPage from "@/pages/login-page";
import MessagesPage from "@/pages/messages-page";
import NotFoundPage from "@/pages/not-found-page";
import OnboardingPage from "@/pages/onboarding-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import ThoughtsPage from "@/pages/thoughts-page";
import UserProfilePage from "@/pages/user-profile-page";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/thoughts" element={<ThoughtsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:conversationId" element={<MessagesPage />} />
      <Route path="/channels/:slug" element={<ChannelPage />} />
      <Route path="/auth/callback/success" element={<AuthCallbackSuccessPage />} />
      <Route path="/users/:username" element={<UserProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/connections/:conversationId" element={<DirectMessagePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
