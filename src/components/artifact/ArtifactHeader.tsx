"use client";

import React from "react";
import AvatarUser from "@/components/ui/avataruser";
import { ArtifactAuthorSummary, ArtifactGuildSummary } from "@/modules/artifact/artifact.interface";

export type AuthorProps = ArtifactAuthorSummary;

export interface ArtifactHeaderProps {
  author: AuthorProps;
  guild?: ArtifactGuildSummary | null;
  guildName?: string | null;
  timeAgo: string;
}

export default function ArtifactHeader({
  author,
  guild,
  guildName,
  timeAgo,
}: ArtifactHeaderProps) {
  const authorTitle =
    author.coAuthorsCount && author.coAuthorsCount > 0
      ? `${author.name} and ${author.coAuthorsCount} others`
      : author.name;

  const avatarSrc = author.avatarUrl || author.photo_profile || "";
  const jobTitleText = author.jobTitle || author.job_title || "Fullstack Developer";
  const displayGuildName = guild?.name || guildName;

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        {/* Author Avatar */}
        <AvatarUser src={avatarSrc} name={author.name} className="w-11 h-11" />

        {/* Author Details */}
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-white tracking-wide leading-snug">
            {authorTitle}
          </h3>
          <p className="text-xs text-white/50 font-normal">
            {jobTitleText}
          </p>
        </div>
      </div>

      {/* Guild Tag and TimeAgo */}
      <div className="text-xs text-white/50 font-normal shrink-0">
        {displayGuildName && (
          <>
            <span>{displayGuildName}</span>
            <span className="mx-1.5">|</span>
          </>
        )}
        <span>{timeAgo}</span>
      </div>
    </div>
  );
}
