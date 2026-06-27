"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bookmark, Search, Bell, User, ChevronLeft, ChevronRight, LogOut, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LOGO } from "@/lib/logo-const";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // 1. Clear NextAuth session if active
      await signOut({ redirect: false });

      // 2. Clear custom HttpOnly authentication cookies server-side
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      toast.success("Logged out successfully");

      // 3. Redirect to login page
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
    },
    {
      name: "Create Artifact",
      href: "/artifact/create",
      icon: PlusSquare,
    },
    {
      name: "Collections",
      href: "/collections",
      icon: Bookmark,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
  ];

  const logoSrc = isCollapsed ? LOGO.MAIN.COLOR : LOGO.HORIZONTAL.COLOR_WHITE;

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-olive-950 px-4 py-12 flex flex-col justify-between border-r border-olive-800/30 shrink-0 sticky top-0 h-screen self-start overflow-y-auto group scrollbar-none"
    >
      {/* Small Chevron Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-12 -right-3 bg-olive-900 border border-olive-800/50 hover:bg-olive-800 hover:text-white rounded-full p-1.5 text-white/70 shadow-md transition-all duration-200 hover:scale-110 cursor-pointer z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Section */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-10 w-full flex items-center justify-center p-0 hover:bg-white/5 transition-colors cursor-pointer"
        variant="ghost"
      >
        <motion.div
          key={isCollapsed ? "collapsed" : "expanded"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <Image
            src={logoSrc}
            alt="Talas Logo"
            width={isCollapsed ? 36 : 140}
            height={36}
            priority
            className="object-contain"
          />
        </motion.div>
      </Button>
      <div className="flex flex-col gap-8">

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl text-base font-medium transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "gap-4 py-3 px-4",
                  isActive
                    ? "text-emerald-400 bg-emerald-500/5"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon
                  size={24}
                  strokeWidth={2}
                  className={cn(
                    "transition-colors shrink-0",
                    isActive ? "text-emerald-400" : "text-white"
                  )}
                />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">


        {/* Profile Section */}
        {(() => {
          const profileHref = user?.username ? `/profile/${user.username}` : "/profile";
          const isActive = pathname === profileHref || pathname === "/profile/edit";
          return (
            <Link
              href={profileHref}
              className={cn(
                "border-t border-olive-800/50 pt-4 flex items-center cursor-pointer transition-all duration-200 text-white/80 hover:text-white select-none",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4",
                isActive && "text-emerald-400 font-medium"
              )}
            >
              <User size={24} className={cn("shrink-0", isActive ? "text-emerald-400" : "text-white")} />
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                  >
                    Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })()}

        {/* Logout Section */}
        <div
          onClick={handleLogout}
          className={cn(
            "pt-4 flex items-center cursor-pointer transition-all duration-200 text-white/80 hover:text-rose-400 select-none",
            isCollapsed ? "justify-center p-3" : "gap-3 px-4",
            isLoggingOut && "opacity-50 pointer-events-none"
          )}
        >
          <LogOut size={24} className="shrink-0 transition-colors" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

    </motion.div>
  );
}
