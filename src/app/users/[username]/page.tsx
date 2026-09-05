import { PublicProfilePage } from "@/features/profile/public-profile-page";

type UserPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  return <PublicProfilePage username={username} />;
}
