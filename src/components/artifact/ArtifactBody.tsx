"use client";

import React from "react";
import { ArtifactTagItem } from "@/modules/artifact/artifact.interface";

export interface ArtifactBodyProps {
  title: string;
  content: string;
  tags?: ArtifactTagItem[] | string[];
}

export default function ArtifactBody({
  title,
  content,
  tags = [],
}: ArtifactBodyProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Artifact Title */}
      <h2 className="text-lg font-bold text-white tracking-wide mb-2 leading-snug">
        {title}
      </h2>

      {/* Content Body */}
      <div className=" text-white/90 leading-relaxed whitespace-pre-line font-normal tracking-wide mb-4">
        {content}
      </div>

      {/* Artifact Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          {tags.map((tag, index) => {
            const tagName = typeof tag === "string" ? tag : tag.name;
            const tagKey = typeof tag === "string" ? index : tag.id || index;
            return (
              <span
                key={tagKey}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 select-none hover:bg-white/10 transition-colors cursor-pointer"
              >
                {tagName}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
