import { Metadata } from "next";
import CreateArtifactClient from "./CreateArtifactClient";

export const metadata: Metadata = {
  title: "Create Artifact | Talas",
  description: "Share your latest software engineering artifact and co-author with collaborators.",
};

export default function CreateArtifactPage() {
  return <CreateArtifactClient />;
}
