"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  url?: string;
  alt?: string;
}

export interface ArtifactCarouselProps {
  mediaItems?: MediaItem[];
}

export default function ArtifactCarousel({
  mediaItems = [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ],
}: ArtifactCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse drag state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Handle active dot index calculation on scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPosition = container.scrollLeft;
    const itemWidth = container.clientWidth * 0.45; // Approx card width
    const newIndex = Math.round(scrollPosition / itemWidth);
    setActiveIndex(Math.min(Math.max(newIndex, 0), mediaItems.length - 1));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [mediaItems.length]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Convert standard mouse wheel scroll to horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current && e.deltaY !== 0) {
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="w-full my-4 flex flex-col items-center gap-4 select-none">
      {/* Horizontal Scroll / Drag Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className={cn(
          "w-full flex gap-3 overflow-x-auto scrollbar-none py-1 px-0 no-scrollbar cursor-grab active:cursor-grabbing transition-all",
          isMouseDown ? "snap-none" : "snap-x snap-mandatory"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {mediaItems.map((item, index) => (
          <motion.div
            key={item.id || index}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="snap-start shrink-0 w-[42%] md:w-[44%] aspect-[4/3] rounded-xl bg-white/10 border border-white/5 overflow-hidden relative shadow-md flex items-center justify-center pointer-events-none"
          >
            {item.url ? (
              <Image
                src={item.url}
                alt={item.alt || `Media ${index + 1}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#333333]/40 flex items-center justify-center text-white/20 text-xs font-mono">
                Preview {index + 1}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Indicator Dots */}
      {mediaItems.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {mediaItems.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <motion.div
                key={idx}
                animate={{
                  width: isActive ? 24 : 6,
                  backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-1.5 rounded-full cursor-pointer"
                onClick={() => {
                  if (containerRef.current) {
                    const itemWidth = containerRef.current.clientWidth * 0.45;
                    containerRef.current.scrollTo({
                      left: itemWidth * idx,
                      behavior: "smooth",
                    });
                    setActiveIndex(idx);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
