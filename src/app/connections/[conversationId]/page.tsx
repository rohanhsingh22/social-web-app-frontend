import { DirectMessagePage } from "@/features/direct-messages/direct-message-page";

type ConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <DirectMessagePage conversationId={conversationId} />;
}
