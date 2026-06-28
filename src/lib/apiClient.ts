let isRefreshing = false;
let refreshSubscribers: Array<(tokenRefreshed: boolean) => void> = [];

function subscribeTokenRefresh(cb: (tokenRefreshed: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

/**
 * Custom fetch wrapper that automatically handles silent token refresh on 401 responses.
 */
export async function apiClient(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let response = await fetch(input, init);

  if (response.status === 401) {
    const inputUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;

    // Skip intercepting login, register, or refresh endpoints to prevent infinite recursion
    if (
      inputUrl.includes("/api/auth/login") ||
      inputUrl.includes("/api/auth/refresh") ||
      inputUrl.includes("/api/auth/register")
    ) {
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          onTokenRefreshed(true);
        } else {
          onTokenRefreshed(false);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } catch (err) {
        console.error("Silent refresh network error:", err);
        onTokenRefreshed(false);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } finally {
        isRefreshing = false;
      }
    }

    const refreshSuccess = await new Promise<boolean>((resolve) => {
      subscribeTokenRefresh((success) => resolve(success));
    });

    if (refreshSuccess) {
      // Re-issue original request seamlessly with fresh token cookie
      response = await fetch(input, init);
    }
  }

  return response;
}
