"use client";

import React, { useState } from "react";
import { AtSign, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import AvatarUser from "./ui/avataruser";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function CreatePostCard() {
  const [content, setContent] = useState("");
  const { user } = useCurrentUser();

  const handlePost = () => {
    if (!content.trim()) return;
    // mock post logic
    console.log("Posting content:", content);
    setContent("");
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 w-full shadow-2xl backdrop-blur-md">
      {/* Left: Profile Avatar */}
      <div className="flex items-center gap-4 flex-1">
        <AvatarUser
          className="w-11 h-11"
          src={user?.photo_profile}
          name={user?.name || user?.username || "User"}
        />

        {/* Vertical Divider */}
        <div className="w-[1px] h-7 bg-white/10 self-center" />

        {/* Text Input */}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's going on today?"
          className="bg-transparent text-white placeholder:text-white/35 focus:outline-none w-full text-base font-normal tracking-wide py-2 px-1"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          className="text-white hover:text-emerald-400 hover:scale-105 transition-all duration-200 p-1 cursor-pointer"
          title="Mention someone"
        >
          <AtSign size={22} strokeWidth={1.5} />
        </button>
        <button
          className="text-white hover:text-emerald-400 hover:scale-105 transition-all duration-200 p-1 cursor-pointer"
          title="Add image"
        >
          <ImageIcon size={22} strokeWidth={1.5} />
        </button>

        <Button
          onClick={handlePost}
          disabled={!content.trim()}
          className="bg-[#48c75e] hover:bg-[#3db250] disabled:bg-[#48c75e]/40 disabled:text-white/40 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all duration-200 h-auto cursor-pointer"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
