"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  MessageSquare,
  Bookmark,
  Repeat,
  Share2,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArtifactUserVote } from "@/modules/artifact/types/artifact";

export interface ArtifactInteractionProps {
  initialBoosts?: number;
  initialReduces?: number;
  initialComments?: number;
  initialAmplifies?: number;
  initialIsCollected?: boolean;
  initialIsAmplified?: boolean;
  initialUserVote?: ArtifactUserVote;
  onBoostChange?: (newVote: ArtifactUserVote) => void;
  onCollectionChange?: (isCollected: boolean) => void;
  onAmplifyChange?: (isAmplified: boolean) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
}

export default function ArtifactInteraction({
  initialBoosts = 12,
  initialReduces = 0,
  initialComments = 10,
  initialAmplifies = 0,
  initialIsCollected = false,
  initialIsAmplified = false,
  initialUserVote = null,
  onBoostChange,
  onCollectionChange,
  onAmplifyChange,
  onCommentClick,
  onShareClick,
}: ArtifactInteractionProps) {
  const [userVote, setUserVote] = useState<ArtifactUserVote>(initialUserVote);
  const [boostsCount, setBoostsCount] = useState(initialBoosts);
  const [reducesCount, setReducesCount] = useState(initialReduces);
  const [amplifiesCount, setAmplifiesCount] = useState(initialAmplifies);
  const [isCollected, setIsCollected] = useState(initialIsCollected);
  const [isAmplified, setIsAmplified] = useState(initialIsAmplified);

  // Toggle Boost (Talas MVP Rule 3.5)
  const handleBoost = () => {
    let nextVote: ArtifactUserVote = "BOOST";
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
    onBoostChange?.(nextVote);
  };

  // Toggle Reduce (Talas MVP Rule 3.5)
  const handleReduce = () => {
    let nextVote: ArtifactUserVote = "REDUCE";
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
    onBoostChange?.(nextVote);
  };

  // Toggle Collection Vault (Talas MVP Rule 3.6)
  const handleCollectionToggle = () => {
    const nextState = !isCollected;
    setIsCollected(nextState);
    onCollectionChange?.(nextState);
  };

  // Toggle Amplify
  const handleAmplifyToggle = () => {
    const nextState = !isAmplified;
    setIsAmplified(nextState);
    setAmplifiesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    onAmplifyChange?.(nextState);
  };

  return (
    <div className="flex items-center justify-between w-full pt-4 mt-2 text-sm font-medium">
      {/* LEFT GROUP: Boost, Reduce, Discussion */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Boost & Reduce Button Group with Sliding Active Pill */}
        <div className="relative inline-flex items-center rounded-full bg-white/5 border border-white/10 p-1 gap-0.5">
          {/* Boost Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBoost}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none",
              userVote === "BOOST"
                ? "text-emerald-400"
                : "text-white/70 hover:text-white"
            )}
            title="Boost Artifact"
          >
            {userVote === "BOOST" && (
              <motion.div
                layoutId="active-vote-pill"
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
              "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none",
              userVote === "REDUCE"
                ? "text-rose-400"
                : "text-white/40 hover:text-white/70"
            )}
            title="Reduce Artifact"
          >
            {userVote === "REDUCE" && (
              <motion.div
                layoutId="active-vote-pill"
                className="absolute inset-0 rounded-full bg-rose-500/20 border border-rose-500/30 shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <TrendingDown size={15} />
            <span>{reducesCount}</span>
          </motion.button>
        </div>

        {/* 3. Discussion Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onCommentClick}
          className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors duration-200 cursor-pointer select-none px-2 py-1"
          title="Discussion"
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">{initialComments}</span>
        </motion.button>
      </div>

      {/* RIGHT GROUP: Share, Collect (Bookmark), Amplify (Repost) */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* 1. Share Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onShareClick}
          className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors duration-200 cursor-pointer select-none px-2 py-1"
          title="Share Artifact"
        >
          <Share2 size={18} />
          <span className="hidden xs:inline text-sm">Share</span>
        </motion.button>

        {/* 2. Collect (Bookmark) Button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleCollectionToggle}
          className={cn(
            "flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none px-2 py-1 rounded-lg",
            isCollected
              ? "text-emerald-400"
              : "text-white/80 hover:text-white"
          )}
          title="Collect Artifact"
        >
          <motion.div
            key={isCollected ? "collected" : "not-collected"}
            animate={
              isCollected
                ? { scale: [1, 1.35, 1], rotate: [0, -12, 12, 0] }
                : { scale: 1 }
            }
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Bookmark
              size={18}
              className={cn(
                "transition-colors",
                isCollected ? "fill-emerald-400 text-emerald-400" : ""
              )}
            />
          </motion.div>
          <span className="hidden xs:inline text-sm">Collect</span>
        </motion.button>

        {/* 3. Amplify (Repost) Button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleAmplifyToggle}
          className={cn(
            "flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none px-2 py-1 rounded-lg",
            isAmplified
              ? "text-emerald-400"
              : "text-white/80 hover:text-white"
          )}
          title="Amplify Artifact"
        >
          <motion.div
            key={isAmplified ? "amplified" : "not-amplified"}
            animate={
              isAmplified
                ? { rotate: [0, 180, 360], scale: [1, 1.3, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <Repeat size={18} />
          </motion.div>
          <span className="text-sm font-medium">{amplifiesCount}</span>
          <span className="hidden xs:inline text-sm">Amplify</span>
        </motion.button>
      </div>
    </div>
  );
}
