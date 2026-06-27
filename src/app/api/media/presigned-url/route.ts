import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";
import { MediaService } from "@/modules/media/media.interface";

export async function POST(req: Request) {
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
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { filename, fileType, fileSize, artifact_id } = body;

    if (!filename || !fileType) {
      return NextResponse.json(
        { success: false, message: "Filename and fileType are required" },
        { status: 400 }
      );
    }

    const presignedData = await MediaService.getPresignedUploadUrl({
      filename,
      fileType,
      fileSize: fileSize || 0,
      artifact_id,
    });

    return NextResponse.json({
      success: true,
      message: "Presigned URL generated successfully",
      data: presignedData,
    });
  } catch (error: any) {
    console.error("Error in POST /api/media/presigned-url:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
