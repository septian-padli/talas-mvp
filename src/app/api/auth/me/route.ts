import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const user = await AuthService.getCurrentUser(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found or session expired", data: null },
        { status: 401 }
      );
    }

    // Exclude password field for security
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: "Authenticated user fetched successfully",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Error in GET /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
