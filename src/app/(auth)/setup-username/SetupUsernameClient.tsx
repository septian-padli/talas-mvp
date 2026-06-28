"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { LOGO } from "@/lib/logo-const";

export default function SetupUsernameClient({ token }: { token?: string }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeToken = token || searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      toast.error("Username can only contain lowercase letters, numbers, and underscores.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/setup-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: trimmedUsername, token: activeToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to set up username.");
      }

      toast.success("Account setup successful!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/background.webp')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <Card className="w-full sm:max-w-md relative z-10 bg-olive-950/90 border-olive-900/50 backdrop-blur-md text-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mb-4 flex justify-center">
            <Image src={LOGO.HORIZONTAL.COLOR_WHITE} alt="Talas Logo" width={200} height={60} style={{ width: "auto", height: "auto" }} priority />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Claim Your Username
          </CardTitle>
          <p className="text-olive-400 text-sm mt-1">
            Choose a unique username to complete your profile setup.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-white text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username_kamu"
                disabled={loading}
                className="bg-olive-900/50 border-olive-800 text-white placeholder:text-olive-400 focus-visible:ring-primary focus-visible:border-primary"
                required
              />
              <p className="text-olive-500 text-xs">
                Allowed: lowercase letters, numbers, and underscores (_). Min 3 characters.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary hover:bg-primary/95 text-white py-2 rounded-md font-medium transition-all"
            >
              {loading ? "Completing setup..." : "Finalize Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
