import { ChatShell } from "@/features/channels/chat-shell";

type ChannelPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params;

  return <ChatShell initialSlug={slug} />;
}
