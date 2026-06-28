import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";
import { NotificationAggregator } from "@/modules/notification/notification.interface";

export async function GET() {
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

    const count = await NotificationAggregator.getUnreadCount(user.id);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error("[Developer Log] GET Unread Notification Count Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error.message || "Gagal mengambil jumlah notifikasi belum dibaca.",
      },
      { status: 500 }
    );
  }
}
