import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tempToken = searchParams.get("token");
  const cookieStore = await cookies();

  if (!tempToken) {
    return NextResponse.redirect(new URL("/login/error?error=CallbackError", request.url));
  }

  try {
    const payload = await AuthService.verifyJWT(tempToken);
    if (!payload || payload.type !== "google_signup_temp") {
      return NextResponse.redirect(new URL("/login/error?error=CallbackError", request.url));
    }

    const { email } = payload;
    const dbUser = await AuthService.findUserByEmail(email);

    if (!dbUser) {
      // If user does not exist somehow, redirect to setup-username with the token in query param
      return NextResponse.redirect(
        new URL(`/setup-username?token=${encodeURIComponent(tempToken)}`, request.url)
      );
    }

    // Generate tokens
    const tokens = await AuthService.generateTokens({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
    });

    // To prevent SameSite=Strict cookies from being omitted during a cross-site redirect chain (Google OAuth -> Callback -> Homepage),
    // we return an HTML page that triggers a client-initiated top-level navigation to "/".
    // This allows the browser to send the newly written SameSite=Strict cookies to the homepage without requiring a manual refresh.
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
          <script>
            window.location.href = "/";
          </script>
        </head>
        <body>
          <p>Redirecting to homepage...</p>
        </body>
      </html>
    `;

    const response = new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });

    // Save tokens in cookies
    response.cookies.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokens.accessTokenExpiry,
      path: "/",
    });

    response.cookies.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokens.refreshTokenExpiry,
      path: "/",
    });

    // Delete temp cookie
    response.cookies.delete("temp_oauth_token");

    return response;
  } catch (error) {
    console.error("Error inside login callback route handler:", error);
    return NextResponse.redirect(new URL("/login/error?error=CallbackError", request.url));
  }
}
