import SetupUsernameClient from "./SetupUsernameClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Username | Talas",
  description: "Complete your Talas account setup",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SetupUsernamePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  return <SetupUsernameClient token={resolvedParams.token} />;
}
