import { useParams } from "react-router-dom";
import { PublicProfilePage } from "@/features/profile/public-profile-page";

export default function UserProfilePage() {
  const { username = "" } = useParams<{ username: string }>();

  return <PublicProfilePage username={username} />;
}
