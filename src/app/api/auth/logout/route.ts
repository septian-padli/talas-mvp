import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear session cookies
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("temp_oauth_token");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error: any) {
    console.error("Error in logout handler:", error);
    return NextResponse.json(
      { success: false, message: "Failed to logout." },
      { status: 500 }
    );
  }
}
