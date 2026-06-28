import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";
import { NotificationAggregator } from "@/modules/notification/notification.interface";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await AuthService.getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unread_only = searchParams.get("unread_only") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const notifications = await NotificationAggregator.getForUser(user.id, {
      unread_only,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error("[Developer Log] GET Notifications Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error.message || "Gagal mengambil daftar notifikasi.",
      },
      { status: 500 }
    );
  }
}
