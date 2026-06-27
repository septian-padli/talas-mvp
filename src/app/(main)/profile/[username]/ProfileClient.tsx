"use client";

import React, { useState } from "react";
import { UserDetail } from "@/modules/user/types/user";
import { ArtifactData, ArtifactListItem } from "@/modules/artifact/artifact.interface";
import AvatarUser from "@/components/ui/avataruser";
import ArtifactCard from "@/components/artifact/ArtifactCard";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Layers, Edit3, Eye, Check } from "lucide-react";
import { motion } from "framer-motion";
import Divider from "@/components/ui/divider";
import Link from "next/link";

export interface ProfileClientProps {
  profileUser: UserDetail;
  artifacts?: (ArtifactListItem | ArtifactData)[];
}

const defaultMockArtifacts: ArtifactData[] = [
  {
    id: "artifact-1",
    author: {
      name: "Hanna",
      username: "hanna",
      jobTitle: "Frontend Developer",
      coAuthorsCount: 0,
    },
    guildName: "Showcase",
    timeAgo: "2 days ago",
    title: "Next-Gen Portfolio Website",
    content: `A modern, sleek portfolio website built with React and Tailwind CSS.
Featuring dark mode, smooth animations, and a fully responsive layout.
💡 Tech Stack: React, Tailwind CSS, Framer Motion
Excited to share my latest project! Let me know what you think.`,
    mediaItems: [{ id: "1" }, { id: "2" }],
    tags: [
      { id: "1", name: "React" },
      { id: "2", name: "TailwindCSS" },
      { id: "3", name: "Framer Motion" },
    ],
    count_boosts: 18,
    count_reduces: 0,
    count_comments: 5,
    count_amplifies: 2,
    isCollected: false,
    isAmplified: false,
    userVote: null,
  },
  {
    id: "artifact-2",
    author: {
      name: "Hanna",
      username: "hanna",
      jobTitle: "Frontend Developer",
      coAuthorsCount: 0,
    },
    guildName: "Showcase",
    timeAgo: "2 days ago",
    title: "Next-Gen Portfolio Website",
    content: `A modern, sleek portfolio website built with React and Tailwind CSS.
Featuring dark mode, smooth animations, and a fully responsive layout.
💡 Tech Stack: React, Tailwind CSS, Framer Motion
Excited to share my latest project! Let me know what you think.`,
    mediaItems: [{ id: "1" }, { id: "2" }],
    tags: [
      { id: "1", name: "React" },
      { id: "2", name: "TailwindCSS" },
      { id: "3", name: "Framer Motion" },
    ],
    count_boosts: 18,
    count_reduces: 0,
    count_comments: 5,
    count_amplifies: 2,
    isCollected: false,
    isAmplified: false,
    userVote: null,
  },
];

export default function ProfileClient({
  profileUser,
  artifacts = [],
}: ProfileClientProps) {
  const { user: currentUser } = useCurrentUser();
  const isOwnProfile = currentUser?.id === profileUser.id;
  const [isWatching, setIsWatching] = useState(
    profileUser.is_watched_by_me || false
  );
  const [watchersCount, setWatchersCount] = useState(
    profileUser.count_watcher || 0
  );

  const handleWatchToggle = () => {
    if (isWatching) {
      setIsWatching(false);
      setWatchersCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsWatching(true);
      setWatchersCount((prev) => prev + 1);
    }
  };

  const displayArtifacts =
    artifacts.length > 0 ? artifacts : defaultMockArtifacts;


  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-6"
      >
        {/* Top Section: Info & Avatar */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              {profileUser.name}
            </h1>

            <p className="text-sm sm:text-base text-white/70 font-medium mt-1">
              {profileUser.job_title || "-"}
            </p>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal mt-3 max-w-xl">
              {profileUser.bio || "-"}
            </p>
          </div>

          {/* Large Avatar */}
          <AvatarUser
            src={profileUser.photo_profile}
            name={profileUser.name}
            className="w-20 h-20 sm:w-24 sm:h-24 text-2xl border-2 border-white/10 shrink-0 shadow-xl"
          />
        </div>

        {/* Middle Section: Stats, Social Links, & Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Watchers / Watching Stats */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80 font-medium">
            <span>
              <strong className="text-white font-semibold">
                {watchersCount}
              </strong>{" "}
              Watchers
            </span>
            <span className="text-white/20">|</span>
            <span>
              <strong className="text-white font-semibold">
                {profileUser.count_watchlist || 0}
              </strong>{" "}
              Watching
            </span>
          </div>

          {/* Right Group: Social Links & Action Button */}
          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-2 text-white/80">
              {profileUser.linkedin && (
                <a
                  href={
                    profileUser.linkedin.startsWith("http")
                      ? profileUser.linkedin
                      : `https://linkedin.com/in/${profileUser.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center"
                  title="LinkedIn Profile"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                  </svg>
                </a>
              )}
              {profileUser.github && (
                <a
                  href={
                    profileUser.github.startsWith("http")
                      ? profileUser.github
                      : `https://github.com/${profileUser.github}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center"
                  title="GitHub Profile"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Action Button */}
            {isOwnProfile ? (
              <Link href="/profile/edit">
                <Button className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 border border-white/10 transition-all cursor-pointer h-auto">
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleWatchToggle}
                className={
                  isWatching
                    ? "bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 border border-white/10 transition-all cursor-pointer h-auto"
                    : "bg-[#48c75e] hover:bg-[#3db250] text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer h-auto"
                }
              >
                {isWatching ? (
                  <>
                    <Check size={15} />
                    <span>Watching</span>
                  </>
                ) : (
                  <>
                    <Eye size={15} />
                    <span>Watch</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Divider & Artifact Counter Bar */}
        <div className="border-t border-white/10 pt-4 mt-2 flex items-center justify-center gap-2 text-sm text-white/90 font-medium">
          <Layers size={18} className="text-emerald-400" />
          <span>
            {profileUser.count_artifacts || displayArtifacts.length} Artifacts
          </span>
        </div>
      </motion.div>

      {/* Artifacts Mapping Feed */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 space-y-8 w-full mt-2">
        {displayArtifacts.map((artifact, index) => (
          <div key={index}>
            <ArtifactCard key={artifact.id || index} artifact={artifact as any} />
            <Divider />
          </div>
        ))}
      </div>
    </div>
  );
}
