"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import ArtifactCard from "@/components/artifact/ArtifactCard";
import DiscussionTree from "@/components/discussion/DiscussionTree";
import DiscussionSkeleton from "@/components/discussion/DiscussionSkeleton";
import { DiscussionItem } from "@/modules/discussion/types/discussion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import useCurrentUser from "@/hooks/useCurrentUser";

export interface ArtifactDetailClientProps {
  artifact: any;
  initialDiscussions?: DiscussionItem[];
}

export default function ArtifactDetailClient({
  artifact,
  initialDiscussions,
}: ArtifactDetailClientProps) {
  const { user } = useCurrentUser();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>(initialDiscussions || []);
  const [isLoading, setIsLoading] = useState(!initialDiscussions || initialDiscussions.length === 0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rootTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch discussions on client mount
  useEffect(() => {
    let isMounted = true;
    const fetchDiscussions = async () => {
      if (!artifact?.id) return;
      try {
        const res = await apiClient(`/api/artifact/${artifact.id}/discussion`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setDiscussions(data.data);
        }
      } catch (err) {
        console.error("Failed to load discussions:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDiscussions();
    return () => {
      isMounted = false;
    };
  }, [artifact?.id]);

  // Word count calculation
  const newCommentWordCount = newComment.trim() ? newComment.trim().split(/\s+/).length : 0;
  const isOverWordLimit = newCommentWordCount > 200;

  const handleRootTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);
    if (rootTextareaRef.current) {
      rootTextareaRef.current.style.height = "auto";
      rootTextareaRef.current.style.height = `${rootTextareaRef.current.scrollHeight}px`;
    }
  };

  // 1. CREATE ROOT DISCUSSION (WITH OPTIMISTIC UPDATE & ROLLBACK)
  const handlePostRootComment = async () => {
    if (!newComment.trim() || isOverWordLimit || !artifact?.id) return;

    const commentContent = newComment.trim();
    const tempId = `temp-root-${Date.now()}`;

    // Construct optimistic item
    const optimisticItem: DiscussionItem = {
      id: tempId,
      artifact_id: artifact.id,
      content: commentContent,
      count_boosts: 0,
      count_reduces: 0,
      count_replies: 0,
      boostsCount: 0,
      reducesCount: 0,
      repliesCount: 0,
      userVote: null,
      depth: 1,
      timeAgo: "Just now",
      author: {
        id: user?.id || "usr_current",
        name: user?.name || "You",
        username: user?.username || "you",
        jobTitle: user?.job_title || "Member",
        avatarUrl: user?.photo_profile || null,
        photo_profile: user?.photo_profile || null,
      },
      replies: [],
    };

    // Store previous state for rollback
    const previousDiscussions = [...discussions];

    // Optimistic UI Update: Prepend to top
    setDiscussions((prev) => [optimisticItem, ...prev]);
    setNewComment("");
    if (rootTextareaRef.current) {
      rootTextareaRef.current.style.height = "auto";
    }
    setIsSubmitting(true);

    try {
      const res = await apiClient(`/api/artifact/${artifact.id}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      const apiData = await res.json();

      if (!res.ok || !apiData.success) {
        throw new Error(apiData.message || "Gagal membuat diskusi.");
      }

      // Replace optimistic item with actual server data
      const createdItem: DiscussionItem = apiData.data;
      setDiscussions((prev) =>
        prev.map((item) => (item.id === tempId ? createdItem : item))
      );
      toast.success("Diskusi baru berhasil ditambahkan!");
    } catch (err: any) {
      console.error("[Developer Log] Create Root Discussion Error:", err);
      // ROLLBACK on failure
      setDiscussions(previousDiscussions);
      toast.error(err.message || "Gagal membuat diskusi. Perubahan telah dikembalikan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. CREATE REPLY (WITH OPTIMISTIC UPDATE & ROLLBACK)
  const handleReplySubmit = async (parentId: string, content: string) => {
    if (!content.trim() || !artifact?.id) return;

    const replyContent = content.trim();
    const tempReplyId = `temp-reply-${Date.now()}`;

    const optimisticReply: DiscussionItem = {
      id: tempReplyId,
      artifact_id: artifact.id,
      parent_id: parentId,
      content: replyContent,
      count_boosts: 0,
      count_reduces: 0,
      count_replies: 0,
      boostsCount: 0,
      reducesCount: 0,
      repliesCount: 0,
      userVote: null,
      depth: 2,
      timeAgo: "Just now",
      author: {
        id: user?.id || "usr_current",
        name: user?.name || "You",
        username: user?.username || "you",
        jobTitle: user?.job_title || "Member",
        avatarUrl: user?.photo_profile || null,
        photo_profile: user?.photo_profile || null,
      },
    };

    // Store previous state for rollback
    const previousDiscussions = JSON.parse(JSON.stringify(discussions));

    // Recursive helper to prepend reply to top of parent's replies list
    const addReplyRecursive = (items: DiscussionItem[]): DiscussionItem[] => {
      return items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            repliesCount: (item.repliesCount || 0) + 1,
            replies: [optimisticReply, ...(item.replies || [])],
          };
        }
        if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: addReplyRecursive(item.replies),
          };
        }
        return item;
      });
    };

    // Optimistic UI Update
    setDiscussions((prev) => addReplyRecursive(prev));

    try {
      const res = await apiClient(`/api/artifact/${artifact.id}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parent_id: parentId }),
      });

      const apiData = await res.json();

      if (!res.ok || !apiData.success) {
        throw new Error(apiData.message || "Gagal mengirim balasan.");
      }

      // Replace optimistic reply with actual server data recursively
      const createdReply: DiscussionItem = apiData.data;
      const replaceReplyRecursive = (items: DiscussionItem[]): DiscussionItem[] => {
        return items.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              replies: (item.replies || []).map((r) => (r.id === tempReplyId ? createdReply : r)),
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: replaceReplyRecursive(item.replies),
            };
          }
          return item;
        });
      };

      setDiscussions((prev) => replaceReplyRecursive(prev));
      toast.success("Balasan berhasil dikirim!");
    } catch (err: any) {
      console.error("[Developer Log] Create Reply Error:", err);
      // ROLLBACK on failure
      setDiscussions(previousDiscussions);
      toast.error(err.message || "Gagal mengirim balasan. Perubahan telah dikembalikan.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6">
      {/* Back to Feed Header */}
      <div className="flex items-center justify-between w-full pb-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Artifact Detail Card & Discussion Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-8"
      >
        <ArtifactCard artifact={artifact} />

        {/* DISCUSSION SECTION */}
        <div className="flex flex-col gap-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Discussions</h3>
            <span className="text-base text-white/70 font-mono">|</span>
            <span className="text-base text-white/70 font-mono">{discussions.length}</span>
          </div>

          {/* Root Comment Form */}
          <div className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <Textarea
              ref={rootTextareaRef}
              rows={1}
              value={newComment}
              onChange={handleRootTextareaChange}
              placeholder="Start a discussion or leave feedback on this artifact..."
              className="bg-transparent border-none text-white placeholder:text-white/30 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[38px] p-0 overflow-hidden"
            />
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span
                className={cn(
                  "text-xs font-mono font-normal",
                  isOverWordLimit ? "text-rose-400" : "text-white/40"
                )}
              >
                {newCommentWordCount}/200 words
              </span>
              <Button
                type="button"
                disabled={isSubmitting || !newComment.trim() || isOverWordLimit}
                onClick={handlePostRootComment}
                className="bg-[#48c75e] hover:bg-[#3db250] text-black font-semibold text-xs h-9 px-5 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                <span>{isSubmitting ? "Posting..." : "Post Discussion"}</span>
                <Send size={14} />
              </Button>
            </div>
          </div>

          {/* Discussion Tree List or Skeleton Loader */}
          {isLoading ? (
            <div className="flex flex-col gap-2 w-full">
              <DiscussionSkeleton />
              <DiscussionSkeleton />
              <DiscussionSkeleton />
            </div>
          ) : (
            <DiscussionTree
              discussions={discussions}
              onReplySubmit={handleReplySubmit}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
