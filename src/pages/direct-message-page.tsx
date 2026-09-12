import { useParams } from "react-router-dom";
import { DirectMessagePage } from "@/features/direct-messages/direct-message-page";

export default function ConversationPage() {
  const { conversationId = "" } = useParams<{ conversationId: string }>();

  return <DirectMessagePage conversationId={conversationId} />;
}
