import { notFound } from "next/navigation";
import { UserAggregator } from "@/modules/user/user.interface";
import { ArtifactAggregator } from "@/modules/artifact/artifact.interface";
import ProfileClient from "./ProfileClient";

export interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const user = await UserAggregator.getByUsername(resolvedParams.username);

  if (!user) {
    return {
      title: "User Not Found | Talas",
    };
  }

  return {
    title: `${user.name} (@${user.username}) | Talas`,
    description: user.bio || `Explore ${user.name}'s artifacts on Talas.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const user = await UserAggregator.getByUsername(resolvedParams.username);

  if (!user) {
    notFound();
  }

  // Fetch authored artifacts for this user
  const feed = await ArtifactAggregator.getFeed({
    author_id: user.id,
    limit: 10,
  });

  return <ProfileClient profileUser={user} artifacts={feed.items} />;
}
