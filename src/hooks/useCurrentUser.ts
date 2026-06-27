"use client";

import { useQuery } from "@tanstack/react-query";
import { UserDetail } from "@/modules/user/types/user";

async function fetchCurrentUser(): Promise<UserDetail | null> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error("Failed to fetch current user");
  }

  const json = await res.json();
  return json.data;
}

export function useCurrentUser() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  return {
    user: data || null,
    isLoading,
    isError,
    refetch,
  };
}

export default useCurrentUser;
