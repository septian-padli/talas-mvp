"use client";

import React from "react";
import DiscussionCard from "./DiscussionCard";
import { DiscussionItem, DiscussionUserVote } from "@/modules/discussion/types/discussion";

export interface DiscussionTreeProps {
  discussions: DiscussionItem[];
  onReplySubmit?: (parentId: string, content: string) => Promise<void> | void;
  onVoteChange?: (discussionId: string, vote: DiscussionUserVote) => void;
}

export default function DiscussionTree({
  discussions,
  onReplySubmit,
  onVoteChange,
}: DiscussionTreeProps) {
  if (!discussions || discussions.length === 0) {
    return null;
  }

  const renderBranch = (items: DiscussionItem[], currentLevel: number) => {
    return (
      <div className="flex flex-col w-full">
        {items.map((item) => {
          // Rule 3.4: Hard-capped at Level 3. Level 3 replies render flush at Level 3
          const nextLevel = Math.min(3, currentLevel + 1);
          const isNested = currentLevel > 1;

          return (
            <div
              key={item.id}
              className={
                isNested
                  ? "pl-3 sm:pl-6 border-l border-white/10 ml-2 sm:ml-4 mt-2"
                  : "w-full"
              }
            >
              <DiscussionCard
                discussion={item}
                onReplySubmit={onReplySubmit}
                onVoteChange={onVoteChange}
              />

              {/* Render nested replies recursively */}
              {item.replies && item.replies.length > 0 && (
                <div className="w-full">
                  {renderBranch(item.replies, nextLevel)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return <div className="flex flex-col w-full">{renderBranch(discussions, 1)}</div>;
}
