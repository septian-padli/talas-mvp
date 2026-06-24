import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, token } = body;
    const cookieStore = await cookies();
    const tempToken = token || cookieStore.get("temp_oauth_token")?.value;

    if (!tempToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Session expired or missing." },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifyJWT(tempToken);
    if (!payload || payload.type !== "google_signup_temp") {
      return NextResponse.json(
        { success: false, message: "Unauthorized or invalid session." },
        { status: 401 }
      );
    }

    const { email, name } = payload;
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Invalid payload details." },
        { status: 400 }
      );
    }
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { success: false, message: "Username is required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { success: false, message: "Username can only contain lowercase letters, numbers, and underscores." },
        { status: 400 }
      );
    }

    // Check username existence
    const usernameTaken = await AuthService.checkUsernameExists(cleanUsername);
    if (usernameTaken) {
      return NextResponse.json(
        { success: false, message: "Username is already taken." },
        { status: 400 }
      );
    }

    // Double check email existence (concurrency edge case)
    const emailTaken = await AuthService.findUserByEmail(email);
    if (emailTaken) {
      return NextResponse.json(
        { success: false, message: "User with this email is already registered." },
        { status: 400 }
      );
    }

    // Create user
    const newUser = await AuthService.createUserFromGoogle({
      email,
      name,
      username: cleanUsername,
    });

    // Generate tokens
    const tokens = await AuthService.generateTokens({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    // Save tokens in cookies
    cookieStore.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokens.accessTokenExpiry,
      path: "/",
    });

    cookieStore.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokens.refreshTokenExpiry,
      path: "/",
    });

    // Delete temp cookie
    cookieStore.delete("temp_oauth_token");

    return NextResponse.json({
      success: true,
      message: "Username setup successful.",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/auth/setup-username POST handler:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred during setup." },
      { status: 500 }
    );
  }
}
