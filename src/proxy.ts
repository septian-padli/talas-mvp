import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET =
	process.env.JWT_SECRET || "buat_string_acak_dan_panjang_untuk_security_jwt";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow static assets, public files, and fonts
	if (
		pathname.startsWith("/logo") ||
		pathname.startsWith("/fonts") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	const accessToken = request.cookies.get("access_token")?.value;
	const refreshToken = request.cookies.get("refresh_token")?.value;
	const tempToken = request.cookies.get("temp_oauth_token")?.value;

	let isSessionValid = false;
	let newAccessToken: string | null = null;
	let newAccessTokenExpiry = 14400;

	// 1. Verify access token
	if (accessToken) {
		try {
			await jose.jwtVerify(accessToken, secret);
			isSessionValid = true;
		} catch (error: any) {
			// If expired, we will attempt to refresh it below
		}
	}

	// 2. If access token is not valid/present, check refresh token
	if (!isSessionValid && refreshToken) {
		try {
			const { payload: refreshPayload } = await jose.jwtVerify(refreshToken, secret);

			// Refresh token is valid! Re-issue new short-lived access token
			isSessionValid = true;
			newAccessTokenExpiry = Number(process.env.AUTH_ACCESS_TOKEN_EXPIRY) || 14400;

			newAccessToken = await new jose.SignJWT({
				sub: refreshPayload.sub,
				email: refreshPayload.email,
				username: refreshPayload.username,
			})
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime(`${newAccessTokenExpiry}s`)
				.sign(secret);
		} catch (error) {
			// Refresh token is also invalid or expired
		}
	}

	// 3. Routing decisions based on session validation
	if (isSessionValid) {
		// Logged in user: Prevent access to login, register, and setup-username pages
		if (
			pathname === "/login" ||
			pathname === "/register" ||
			pathname === "/setup-username"
		) {
			const response = NextResponse.redirect(new URL("/", request.url));
			if (newAccessToken) {
				response.cookies.set("access_token", newAccessToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: newAccessTokenExpiry,
					path: "/",
				});
			}
			return response;
		}

		// Proceed normally to protected routes (like "/", profile, settings, etc.)
		const response = NextResponse.next();
		if (newAccessToken) {
			response.cookies.set("access_token", newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: newAccessTokenExpiry,
				path: "/",
			});
		}
		return response;
	} else {
		// Unauthenticated user: Allow public paths (login, callbacks, registration, verification)
		const publicPaths = [
			"/login",
			"/login/callback",
			"/login/error",
			"/register",
			"/verification",
		];

		// For setup-username page: Only allow if a valid temp token exists
		if (pathname === "/setup-username") {
			const queryToken = request.nextUrl.searchParams.get("token");
			const tokenToVerify = tempToken || queryToken;

			if (tokenToVerify) {
				try {
					const { payload } = await jose.jwtVerify(tokenToVerify, secret);
					if (payload && payload.type === "google_signup_temp") {
						const response = NextResponse.next();
						// Set the cookie if it came from the query parameter
						if (queryToken && !tempToken) {
							response.cookies.set("temp_oauth_token", queryToken, {
								httpOnly: true,
								secure: process.env.NODE_ENV === "production",
								sameSite: "strict",
								maxAge: 600, // 10 minutes
								path: "/",
							});
						}
						return response;
					}
				} catch {
					// Invalid/expired temp token
				}
			}
			// Otherwise force redirect to login
			return NextResponse.redirect(new URL("/login", request.url));
		}

		if (publicPaths.includes(pathname)) {
			return NextResponse.next();
		}

		// Any other internal/main route is guarded -> force redirect to /login
		const response = NextResponse.redirect(new URL("/login", request.url));
		if (accessToken) response.cookies.delete("access_token");
		if (refreshToken) response.cookies.delete("refresh_token");
		return response;
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes, except custom auth endpoints we guard or next-auth)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - background.webp, next.svg, vercel.svg (public assets)
		 * - logo (public assets)
		 * - fonts (fonts directory)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|background.webp|logo|next.svg|vercel.svg|fonts).*)",
	],
};
