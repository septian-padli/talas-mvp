"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LOGO } from "@/lib/logo-const";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Collections",
      href: "/collections",
      icon: Bookmark,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="bg-olive-900 w-72 px-4 py-12 flex flex-col justify-between border-r border-olive-800/30 shrink-0">
      {/* Logo Talas Link to homepage */}
      <Button className="px-4 h-10" variant={"ghost"}>
        <Image
          src={LOGO.HORIZONTAL.COLOR_WHITE}
          alt="Talas Logo"
          width={160}
          height={40}
          priority
        />
      </Button>

      {/* navigation */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Exact match for Home, prefix match for others
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 py-3 px-4 rounded-xl text-base font-medium transition-all duration-200",
                isActive
                  ? "text-emerald-400 bg-emerald-500/5" // Active: green text/icon + subtle background
                  : "text-white/80 hover:text-white hover:bg-white/5" // Default: white/80 text, white hover
              )}
            >
              <Icon
                size={24}
                strokeWidth={2}
                className={cn(
                  "transition-colors",
                  isActive ? "text-emerald-400" : "text-white"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* user profile / settings */}
      <div className="border-t border-olive-800/50 pt-4 px-4 flex items-center gap-3 text-white/80 hover:text-white cursor-pointer transition-colors">
        <User size={20} className="text-white" />
        <span className="text-sm font-medium">Profile Settings</span>
      </div>
    </div>
  );
}
