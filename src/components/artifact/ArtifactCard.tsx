"use client";

import React from "react";
import ArtifactHeader from "./ArtifactHeader";
import ArtifactBody from "./ArtifactBody";
import ArtifactCarousel from "./ArtifactCarousel";
import ArtifactInteraction from "./ArtifactInteraction";
import { ArtifactData } from "@/modules/artifact/artifact.interface";

export interface ArtifactCardProps {
  artifact?: ArtifactData;
}

const defaultMockArtifact: ArtifactData = {
  id: "artifact-1",
  author: {
    name: "Hanna",
    username: "hanna",
    jobTitle: "Fullstack Developer",
    coAuthorsCount: 3,
  },
  guildName: "Showcase",
  timeAgo: "3 hrs",
  title: "Next-Gen Portfolio Website",
  content: `A modern, sleek portfolio website built with React and Tailwind CSS.
Featuring dark mode, smooth animations, and a fully responsive layout.
💡 Tech Stack: React, Tailwind CSS, Framer Motion
📁 GitHub Repo: hanna.git
Excited to share my latest project! Let me know what you think and feel free to drop feedback. Open for collaborations!`,
  mediaItems: [{ id: "1" }, { id: "2" }, { id: "3" }],
  tags: [
    { id: "1", name: "Figma" },
    { id: "2", name: "GitHub" },
  ],
  boostsCount: 12,
  reducesCount: 0,
  commentsCount: 10,
  isCollected: false,
  isAmplified: false,
  userVote: null,
};

export default function ArtifactCard({
  artifact = defaultMockArtifact,
}: ArtifactCardProps) {
  return (
    <div className=" flex flex-col w-full shadow-2xl backdrop-blur-md transition-all duration-300 gap-y-4">
      {/* Sub-component 1: Header */}
      <ArtifactHeader
        author={artifact.author}
        guild={artifact.guild}
        guildName={artifact.guildName}
        timeAgo={artifact.timeAgo}
      />

      {/* Sub-component 2: Body */}
      <ArtifactBody
        title={artifact.title}
        content={artifact.content}
        tags={artifact.tags}
      />

      {/* Sub-component 3: Carousel */}
      <ArtifactCarousel mediaItems={artifact.mediaItems || artifact.media} />

      {/* Sub-component 4: Interaction Bar */}
      <ArtifactInteraction
        initialBoosts={artifact.count_boosts ?? artifact.boostsCount}
        initialReduces={artifact.count_reduces ?? artifact.reducesCount}
        initialComments={artifact.count_comments ?? artifact.commentsCount}
        initialAmplifies={artifact.count_amplifies ?? artifact.amplifiesCount}
        initialIsCollected={artifact.isCollected}
        initialIsAmplified={artifact.isAmplified}
        initialUserVote={artifact.userVote}
      />
    </div>
  );
}
