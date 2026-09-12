import { useParams } from "react-router-dom";
import { ChatShell } from "@/features/channels/chat-shell";

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();

  return <ChatShell initialSlug={slug} />;
}
