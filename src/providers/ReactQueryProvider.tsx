"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    const staleTimeMinutes =
      Number(process.env.NEXT_PUBLIC_QUERY_STALE_TIME_MINUTES) || 10;
    const staleTimeMs = staleTimeMinutes * 60 * 1000;

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: staleTimeMs,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
