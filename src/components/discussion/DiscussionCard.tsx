"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingDown, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import AvatarUser from "@/components/ui/avataruser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DiscussionItem, DiscussionUserVote } from "@/modules/discussion/types/discussion";

export interface DiscussionCardProps {
  discussion: DiscussionItem;
  onReplySubmit?: (parentId: string, content: string) => Promise<void> | void;
  onVoteChange?: (discussionId: string, vote: DiscussionUserVote) => void;
}

export default function DiscussionCard({
  discussion,
  onReplySubmit,
  onVoteChange,
}: DiscussionCardProps) {
  const [userVote, setUserVote] = useState<DiscussionUserVote>(discussion.userVote || null);
  const [boostsCount, setBoostsCount] = useState(discussion.boostsCount ?? discussion.count_boosts ?? 0);
  const [reducesCount, setReducesCount] = useState(discussion.reducesCount ?? discussion.count_reduces ?? 0);
  const [repliesCount, setRepliesCount] = useState(discussion.repliesCount ?? discussion.count_replies ?? 0);

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate word count (words, not characters)
  const replyWordCount = replyContent.trim() ? replyContent.trim().split(/\s+/).length : 0;
  const isOverWordLimit = replyWordCount > 200;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReplyContent(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Toggle Boost (AGENTS.md Rule 3.5)
  const handleBoost = () => {
    let nextVote: DiscussionUserVote = "BOOST";
    if (userVote === "BOOST") {
      nextVote = null;
      setBoostsCount((prev) => Math.max(0, prev - 1));
    } else {
      if (userVote === "REDUCE") {
        setReducesCount((prev) => Math.max(0, prev - 1));
      }
      setBoostsCount((prev) => prev + 1);
    }
    setUserVote(nextVote);
    onVoteChange?.(discussion.id, nextVote);
  };

  // Toggle Reduce (AGENTS.md Rule 3.5)
  const handleReduce = () => {
    let nextVote: DiscussionUserVote = "REDUCE";
    if (userVote === "REDUCE") {
      nextVote = null;
      setReducesCount((prev) => Math.max(0, prev - 1));
    } else {
      if (userVote === "BOOST") {
        setBoostsCount((prev) => Math.max(0, prev - 1));
      }
      setReducesCount((prev) => prev + 1);
    }
    setUserVote(nextVote);
    onVoteChange?.(discussion.id, nextVote);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || isOverWordLimit) return;
    setIsSubmittingReply(true);
    try {
      await onReplySubmit?.(discussion.id, replyContent.trim());
      setRepliesCount((prev) => prev + 1);
      setReplyContent("");
      setIsReplying(false);
    } catch (e) {
      console.error("Failed to submit reply:", e);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex flex-col w-full py-4 border-b border-white/10 text-white font-sans">
      {/* HEADER ROW: Avatar + Author Info */}
      <div className="flex items-start gap-3 w-full">
        {/* Avatar */}
        <AvatarUser
          src={discussion.author.avatarUrl || discussion.author.photo_profile || undefined}
          name={discussion.author.name}
          className="w-10 h-10 border border-white/10 flex-shrink-0"
        />

        {/* Info Column */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base text-white tracking-wide">
              {discussion.author.name}
            </span>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-sm text-white/60 font-normal">
              {discussion.author.jobTitle || "Developer"}
            </span>
          </div>
          <span className="text-xs text-white/40 font-normal mt-0.5">
            {discussion.timeAgo || "15 min"}
          </span>
        </div>
      </div>

      {/* DISCUSSION CONTENT */}
      <div className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed font-normal tracking-wide whitespace-pre-line pl-13">
        {discussion.content}
      </div>

      {/* INTERACTIONS BAR (Matching ArtifactInteraction Style) */}
      <div className="flex items-center gap-3 sm:gap-5 mt-3 pl-13 text-xs sm:text-sm font-medium">
        {/* Boost & Reduce Button Group with Sliding Active Pill */}
        <div className="relative inline-flex items-center rounded-full bg-white/5 border border-white/10 p-1 gap-0.5">
          {/* Boost Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBoost}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none",
              userVote === "BOOST" ? "text-emerald-400" : "text-white/70 hover:text-white"
            )}
            title="Boost comment"
          >
            {userVote === "BOOST" && (
              <motion.div
                layoutId={`active-vote-pill-${discussion.id}`}
                className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <Zap
              size={15}
              className={cn(
                "transition-colors",
                userVote === "BOOST" ? "fill-emerald-400 text-emerald-400" : ""
              )}
            />
            <span>{boostsCount}</span>
          </motion.button>

          {/* Divider */}
          <span className="w-px h-3.5 bg-white/10 mx-0.5 z-0" />

          {/* Reduce Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleReduce}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none",
              userVote === "REDUCE" ? "text-rose-400" : "text-white/40 hover:text-white/70"
            )}
            title="Reduce comment"
          >
            {userVote === "REDUCE" && (
              <motion.div
                layoutId={`active-vote-pill-${discussion.id}`}
                className="absolute inset-0 rounded-full bg-rose-500/20 border border-rose-500/30 shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <TrendingDown size={15} />
            <span>{reducesCount}</span>
          </motion.button>
        </div>

        {/* Reply Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsReplying((prev) => !prev)}
          className={cn(
            "flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none px-2 py-1",
            isReplying ? "text-emerald-400" : "text-white/80 hover:text-white"
          )}
          title="Reply to comment"
        >
          <MessageSquare size={16} />
          <span>{repliesCount} Reply</span>
        </motion.button>
      </div>

      {/* EXPANDABLE INLINE REPLY FORM */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 pl-13 pr-2"
          >
            <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <Textarea
                ref={textareaRef}
                rows={1}
                value={replyContent}
                onChange={handleTextareaChange}
                placeholder={`Replying to @${discussion.author.username}...`}
                className="bg-transparent border-none text-white placeholder:text-white/30 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[38px] p-0 overflow-hidden"
              />
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span
                  className={cn(
                    "text-xs font-mono font-normal",
                    isOverWordLimit ? "text-rose-400" : "text-white/40"
                  )}
                >
                  {replyWordCount}/200 words
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsReplying(false)}
                    className="text-xs text-white/60 hover:text-white hover:bg-white/10 h-8 px-3 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmittingReply || !replyContent.trim() || isOverWordLimit}
                    onClick={handleSendReply}
                    className="bg-[#48c75e] hover:bg-[#3db250] text-black font-semibold text-xs h-8 px-4 rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    <span>{isSubmittingReply ? "Sending..." : "Reply"}</span>
                    <Send size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
