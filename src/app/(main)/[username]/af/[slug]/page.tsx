import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArtifactAggregator } from "@/modules/artifact/artifact.interface";
import ArtifactDetailClient from "./ArtifactDetailClient";

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const artifact = await ArtifactAggregator.getBySlug(slug);

  if (!artifact) {
    return {
      title: "Artifact Not Found | Talas",
    };
  }

  const authorName = artifact.author?.name || username;
  const pageTitle = `${artifact.title} by ${authorName} | Talas`;
  const descriptionSnippet =
    artifact.content?.substring(0, 160).replace(/\n/g, " ") ||
    `Read ${artifact.title} on Talas platform.`;

  const ogImage = (artifact as any).mediaItems?.[0]?.url || artifact.media?.[0]?.url || undefined;

  return {
    title: pageTitle,
    description: descriptionSnippet,
    openGraph: {
      title: pageTitle,
      description: descriptionSnippet,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description: descriptionSnippet,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ArtifactDetailPage({ params }: PageProps) {
  const { username, slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const artifact = await ArtifactAggregator.getBySlug(slug, token);

  if (!artifact || artifact.author?.username !== username) {
    notFound();
  }

  return <ArtifactDetailClient artifact={artifact} />;
}
