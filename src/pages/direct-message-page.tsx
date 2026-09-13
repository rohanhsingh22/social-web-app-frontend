import { Navigate, useParams } from "react-router-dom";

export default function ConversationPage() {
  const { conversationId = "" } = useParams<{ conversationId: string }>();

  if (!conversationId) {
    return <Navigate to="/messages" replace />;
  }

  return <Navigate to={`/messages/${conversationId}`} replace />;
}
